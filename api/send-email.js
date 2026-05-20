const express = require('express');
const cors = require('cors');
const multer = require('multer');
const https = require('https');

const app = express();
const PORT = 3001;

// ====== ZEPTO MAIL CONFIG ======
const ZEPTO_API_TOKEN = process.env.ZEPTO_API_KEY || 'Zoho-enczapikey PHtE6r1eQeu/2m56phQJ5fXqE8H1MNgt+r5uLAARs40WDKdQFk0GrtovmmTi+R1+B/QRFaTPndhqt7rJ5+zWLG+4MWcaWGqyqK3sx/VYSPOZsbq6x00at1kTcEbeUIPpcdJt3CPXuNbZNA==';
const FROM_EMAIL = 'noreply@enpower-school.com';
const FROM_NAME = 'ENpower';

// Where form emails go
// general = 6 forms (Lab, Partner, Impact, Training) via Zepto Mail
// hiring = Apply form (will be configured separately)
const INBOX = {
  general: 'info@enlearning.in',
  hiring: 'recruiter@enlearning.in'
};

// ====== MIDDLEWARE ======
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== ANTI-SPAM VALIDATION ======
var DISPOSABLE_DOMAINS = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwaway.email', 'yopmail.com', 'trashmail.com', 'fakeinbox.com'];
var BAD_LOCALS = ['test', 'admin', 'spam', 'abc', 'xyz'];
var SPAM_NAME_TOKENS = ['test', 'asdf', 'qwerty', 'abcd'];

// Rate limit state (in-memory)
var ipHits = new Map();   // ip -> [timestamps]
var emailHits = new Map(); // email -> lastTimestamp
var IP_WINDOW_MS = 60 * 60 * 1000;       // 1 hour
var IP_MAX = 3;
var EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

function cleanupRateLimits(now) {
  ipHits.forEach(function (arr, ip) {
    var kept = arr.filter(function (t) { return now - t < IP_WINDOW_MS; });
    if (kept.length === 0) ipHits.delete(ip);
    else ipHits.set(ip, kept);
  });
  emailHits.forEach(function (t, em) {
    if (now - t > EMAIL_WINDOW_MS) emailHits.delete(em);
  });
}

function validName(v) {
  if (!v || typeof v !== 'string') return false;
  var s = v.trim();
  if (s.length < 2 || s.length > 50) return false;
  if (!/^[a-zA-Z .']{2,50}$/.test(s)) return false;
  if (/http|www|\d/i.test(s)) return false;
  if (/(.)\1{3,}/i.test(s)) return false;
  var lower = s.toLowerCase();
  for (var i = 0; i < SPAM_NAME_TOKENS.length; i++) {
    if (lower.indexOf(SPAM_NAME_TOKENS[i]) !== -1) return false;
  }
  return true;
}

function validEmailFormat(v) {
  if (!v || typeof v !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function emailSilentReject(v) {
  var s = v.trim().toLowerCase();
  var parts = s.split('@');
  if (parts.length !== 2) return false;
  var local = parts[0];
  var domain = parts[1];
  if (DISPOSABLE_DOMAINS.indexOf(domain) !== -1) return true;
  if (BAD_LOCALS.indexOf(local) !== -1) return true;
  return false;
}

function validPhone(v) {
  if (!v) return false;
  var digits = String(v).replace(/\D/g, '');
  if (digits.length !== 10) return false;
  if (!/^[6-9]/.test(digits)) return false;
  if (digits === '1234567890' || digits === '9876543210') return false;
  if (/^(\d)\1{9}$/.test(digits)) return false;
  if (/(\d)\1{5,}/.test(digits)) return false;
  return true;
}

function freeTextSpam(v) {
  if (!v || typeof v !== 'string') return false;
  var s = v.trim();
  if (/https?:\/\/|www\.|\.com|\.in/i.test(s)) return true;
  if (/[^a-zA-Z0-9\s]{4,}/.test(s)) return true;
  if (s.length > 10 && s === s.toUpperCase() && /[A-Z]/.test(s)) return true;
  return false;
}

function validateSubmission(req, required, opts) {
  opts = opts || {};
  var body = req.body || {};
  var now = Date.now();
  cleanupRateLimits(now);

  // 1. Honeypot
  if (body.website_url) {
    return { valid: false, silent: true, reason: 'honeypot' };
  }

  // 2. Required fields
  for (var i = 0; i < required.length; i++) {
    var k = required[i];
    if (!body[k] || String(body[k]).trim() === '') {
      return { valid: false, silent: false, reason: 'missing:' + k, message: 'Please fill in all required fields.' };
    }
  }

  // requireAnyOf (conditional fields)
  if (opts.requireAnyOf && opts.requireAnyOf.length) {
    var any = false;
    for (var j = 0; j < opts.requireAnyOf.length; j++) {
      var f = opts.requireAnyOf[j];
      if (body[f] && String(body[f]).trim() !== '' && body[f] !== 'N/A') { any = true; break; }
    }
    if (!any) {
      return { valid: false, silent: false, reason: 'missing:anyOf', message: 'Please fill in all required fields.' };
    }
  }

  // 3. Name
  if (body.name !== undefined) {
    if (!validName(body.name)) {
      return { valid: false, silent: true, reason: 'bad_name' };
    }
  }

  // 4. Email
  var emailField = body.email;
  if (emailField !== undefined) {
    if (!validEmailFormat(emailField)) {
      return { valid: false, silent: false, reason: 'bad_email_format', message: 'Please enter a valid email address.' };
    }
    if (emailSilentReject(emailField)) {
      return { valid: false, silent: true, reason: 'disposable_email' };
    }
  }

  // 5. Phone (contact or phone field)
  var phoneVal = body.contact !== undefined ? body.contact : body.phone;
  if (phoneVal !== undefined && phoneVal !== '') {
    if (!validPhone(phoneVal)) {
      // distinguish format vs spam-pattern
      var digits = String(phoneVal).replace(/\D/g, '');
      if (digits.length !== 10) {
        return { valid: false, silent: false, reason: 'bad_phone_format', message: 'Please enter a valid 10-digit phone number.' };
      }
      return { valid: false, silent: true, reason: 'spam_phone' };
    }
  }

  // 6. Free-text fields
  var freeFields = ['designation', 'message', 'school', 'organisation', 'organization', 'represent', 'role', 'interest', 'iam'];
  for (var k2 = 0; k2 < freeFields.length; k2++) {
    var fv = body[freeFields[k2]];
    if (fv && freeTextSpam(fv)) {
      return { valid: false, silent: true, reason: 'spam_text:' + freeFields[k2] };
    }
  }

  // 7. Rate limit
  var ip = req.ip || req.connection.remoteAddress || 'unknown';
  var ipArr = ipHits.get(ip) || [];
  if (ipArr.length >= IP_MAX) {
    return { valid: false, silent: true, reason: 'rate_limit_ip' };
  }
  if (emailField) {
    var emKey = String(emailField).trim().toLowerCase();
    if (emailHits.has(emKey)) {
      return { valid: false, silent: true, reason: 'rate_limit_email' };
    }
  }

  return {
    valid: true,
    track: function () {
      ipArr.push(now);
      ipHits.set(ip, ipArr);
      if (emailField) emailHits.set(String(emailField).trim().toLowerCase(), now);
    }
  };
}

function logSpam(req, reason) {
  try {
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      ip: req.ip,
      reason: reason,
      endpoint: req.path,
      payload: req.body
    }));
  } catch (e) { /* ignore */ }
}

// Multer for file upload (hiring form CV)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    var allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX files allowed'));
    }
  }
});

// ====== EMAIL TEMPLATES ======
function emailWrapper(title, badge, content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f0f8;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#efdeff 0%,#fffce3 100%);padding:30px;text-align:center;">
      <h2 style="color:#3d2549;font-size:1.3rem;margin:0;">${title}</h2>
    </div>

    <!-- Content -->
    <div style="padding:30px;">
      <span style="display:inline-block;background:#e5a93e;color:#fff;padding:3px 10px;border-radius:50px;font-size:12px;font-weight:700;margin-bottom:12px;">${badge}</span>
      ${content}
    </div>

    <!-- Footer -->
    <div style="background:#f9f5ff;padding:20px 30px;text-align:center;border-top:1px solid #e8e0f0;">
      <p style="color:#999;font-size:12px;margin:0;">ENpower by Enlearning Skill Development Limited<br>enpower-school.com</p>
    </div>
  </div>
</body>
</html>`;
}

function tableRow(label, value) {
  return `<tr>
    <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f0ecf5;font-weight:700;color:#3d2549;width:40%;background:#f9f5ff;">${label}</td>
    <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f0ecf5;color:#555;">${value}</td>
  </tr>`;
}

function buildTable(rows) {
  var html = '<p style="color:#555;font-size:14px;margin-bottom:20px;line-height:1.6;">You have received a new inquiry from the ENpower website.</p>';
  html += '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">';
  rows.forEach(function (r) {
    html += tableRow(r[0], r[1]);
  });
  html += '</table>';
  return html;
}

// Template 1: Lab Inquiry (FSL, CSL, TIL)
function labInquiryTemplate(data) {
  var labName = data.lab || 'Lab';
  var content = buildTable([
    ['Name', data.name],
    ['School / Institute', data.school],
    ['Designation', data.designation],
    ['Email', data.email],
    ['Contact Number', data.contact]
  ]);
  return {
    subject: 'New ' + labName + ' Inquiry — ENpower',
    html: emailWrapper('New Lab Inquiry — ' + labName, 'Lab Inquiry', content)
  };
}

// Template 2: Partner Inquiry (Index)
function partnerInquiryTemplate(data) {
  var rows = [
    ['Name', data.name],
    ['I Represent', data.represent]
  ];
  if (data.iam && data.iam !== 'N/A') rows.push(['I am a', data.iam]);
  if (data.designation && data.designation !== 'N/A') rows.push(['Designation', data.designation]);
  rows.push(['Email', data.email]);
  rows.push(['Contact Number', data.contact]);

  return {
    subject: 'New Partner Inquiry — ENpower',
    html: emailWrapper('New Partner Inquiry', 'Partner Inquiry', buildTable(rows))
  };
}

// Template 3: Impact Programs
function impactTemplate(data) {
  var content = buildTable([
    ['Name', data.name],
    ['Email', data.email],
    ['Organisation / Foundation', data.organisation],
    ['Designation', data.designation],
    ['Contact Number', data.contact]
  ]);
  return {
    subject: 'New Impact Programs Inquiry — ENpower',
    html: emailWrapper('New Impact Programs Inquiry', 'Impact Programs', content)
  };
}

// Template 4: Training Academy
function trainingTemplate(data) {
  var content = buildTable([
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Role', data.role],
    ['Interest', data.interest],
    ['Message', data.message || '—']
  ]);
  return {
    subject: 'New Training Academy Inquiry — ENpower',
    html: emailWrapper('New Training Academy Inquiry', 'Training Academy', content)
  };
}

// Template 5: Hiring / Apply
function hiringTemplate(data, fileName) {
  var content = buildTable([
    ['Name', data.name],
    ['Email', data.email]
  ]);
  if (fileName) {
    content += '<div style="background:#f9f5ff;border:1px dashed #d4c6e8;border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:10px;">';
    content += '<span style="font-size:1.4rem;">&#128206;</span>';
    content += '<span style="font-size:14px;color:#6c32a8;font-weight:600;">' + fileName + '</span>';
    content += '</div>';
  }
  return {
    subject: 'New Job Application — ENpower',
    html: emailWrapper('New Job Application', 'Hiring', content)
  };
}

// ====== ZEPTO MAIL API CALL ======
function sendEmail(to, subject, htmlBody, attachments) {
  return new Promise(function (resolve, reject) {
    var payload = {
      from: { address: FROM_EMAIL, name: FROM_NAME },
      to: [{ email_address: { address: to, name: 'ENpower Team' } }],
      subject: subject,
      htmlbody: htmlBody
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments;
    }

    var postData = JSON.stringify(payload);

    var options = {
      hostname: 'api.zeptomail.in',
      port: 443,
      path: '/v1.1/email',
      method: 'POST',
      headers: {
        'Authorization': ZEPTO_API_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    var req = https.request(options, function (res) {
      var body = '';
      res.on('data', function (chunk) { body += chunk; });
      res.on('end', function () {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error('Zepto Mail error: ' + res.statusCode + ' — ' + body));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ====== API ROUTES ======

// Lab Inquiry (FSL, CSL, TIL)
app.post('/api/lab-inquiry', function (req, res) {
  var check = validateSubmission(req, ['name', 'school', 'designation', 'email', 'contact']);
  if (!check.valid) {
    logSpam(req, check.reason);
    if (check.silent) return res.json({ success: true, message: 'Inquiry sent successfully' });
    return res.status(400).json({ success: false, message: check.message });
  }
  check.track();
  var template = labInquiryTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send email' }); });
});

// Partner Inquiry
app.post('/api/partner-inquiry', function (req, res) {
  var check = validateSubmission(req, ['name', 'represent', 'email', 'contact'], { requireAnyOf: ['iam', 'designation'] });
  if (!check.valid) {
    logSpam(req, check.reason);
    if (check.silent) return res.json({ success: true, message: 'Inquiry sent successfully' });
    return res.status(400).json({ success: false, message: check.message });
  }
  check.track();
  var template = partnerInquiryTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send email' }); });
});

// Impact Programs
app.post('/api/impact-inquiry', function (req, res) {
  // frontend sends "organisation"
  var check = validateSubmission(req, ['name', 'email', 'organisation', 'designation', 'contact']);
  if (!check.valid) {
    logSpam(req, check.reason);
    if (check.silent) return res.json({ success: true, message: 'Inquiry sent successfully' });
    return res.status(400).json({ success: false, message: check.message });
  }
  check.track();
  var template = impactTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send email' }); });
});

// Training Academy
app.post('/api/training-inquiry', function (req, res) {
  var check = validateSubmission(req, ['name', 'email', 'phone', 'role', 'interest']);
  if (!check.valid) {
    logSpam(req, check.reason);
    if (check.silent) return res.json({ success: true, message: 'Inquiry sent successfully' });
    return res.status(400).json({ success: false, message: check.message });
  }
  check.track();
  var template = trainingTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send email' }); });
});

// Hiring / Apply (with file upload)
app.post('/api/apply', upload.single('cv'), function (req, res) {
  var check = validateSubmission(req, ['name', 'email']);
  if (!check.valid) {
    logSpam(req, check.reason);
    if (check.silent) return res.json({ success: true, message: 'Application sent successfully' });
    return res.status(400).json({ success: false, message: check.message });
  }
  check.track();

  var attachments = [];
  var fileName = '';

  if (req.file) {
    fileName = req.file.originalname;
    attachments.push({
      name: req.file.originalname,
      content: req.file.buffer.toString('base64'),
      mime_type: req.file.mimetype
    });
  }

  var template = hiringTemplate(req.body, fileName);
  sendEmail(INBOX.hiring, template.subject, template.html, attachments)
    .then(function () { res.json({ success: true, message: 'Application sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send application' }); });
});

// Health check
app.get('/api/health', function (req, res) {
  res.json({ status: 'ok', service: 'ENpower Email API' });
});

// ====== START SERVER ======
app.listen(PORT, function () {
  console.log('ENpower Email API running on port ' + PORT);
});

// === Test cases (manual curl examples) ===
// Valid:     curl -X POST localhost:3001/api/lab-inquiry -H 'Content-Type: application/json' -d '{"lab":"FSL","name":"Shravani","school":"DPS","designation":"Principal","email":"s@dps.edu","contact":"9876543211"}'
// Honeypot:  ...include "website_url":"http://spam.com" — expect 200 success, no email sent (check PM2 logs)
// Bad email: ...email:"test@mailinator.com" — expect 200 success silently
// Bad phone: ...contact:"1234567890" — expect 200 success silently
// Junk name: ...name:"asdfasdf" — expect 200 success silently
// Format:    ...contact:"abc" — expect 400 with message (visible to legit user mistake)
