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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ====== HTML ESCAPE (XSS prevention in email body) ======
function esc(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
      <h2 style="color:#3d2549;font-size:1.3rem;margin:0;">${esc(title)}</h2>
    </div>

    <!-- Content -->
    <div style="padding:30px;">
      <span style="display:inline-block;background:#e5a93e;color:#fff;padding:3px 10px;border-radius:50px;font-size:12px;font-weight:700;margin-bottom:12px;">${esc(badge)}</span>
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
    <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f0ecf5;font-weight:700;color:#3d2549;width:40%;background:#f9f5ff;">${esc(label)}</td>
    <td style="padding:12px 16px;font-size:14px;border-bottom:1px solid #f0ecf5;color:#555;">${esc(value)}</td>
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
    content += '<span style="font-size:14px;color:#6c32a8;font-weight:600;">' + esc(fileName) + '</span>';
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
  var template = labInquiryTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send email' }); });
});

// Partner Inquiry
app.post('/api/partner-inquiry', function (req, res) {
  var template = partnerInquiryTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send email' }); });
});

// Impact Programs
app.post('/api/impact-inquiry', function (req, res) {
  var template = impactTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send email' }); });
});

// Training Academy
app.post('/api/training-inquiry', function (req, res) {
  var template = trainingTemplate(req.body);
  sendEmail(INBOX.general, template.subject, template.html)
    .then(function () { res.json({ success: true, message: 'Inquiry sent successfully' }); })
    .catch(function (err) { console.error(err); res.status(500).json({ success: false, message: 'Failed to send email' }); });
});

// Hiring / Apply (with file upload)
// Wrap multer so file-validation / size errors return JSON instead of HTML
function applyUpload(req, res, next) {
  upload.single('cv')(req, res, function (err) {
    if (err) {
      var msg = 'File upload failed';
      if (err.code === 'LIMIT_FILE_SIZE') msg = 'File too large (max 5 MB)';
      else if (err.message) msg = err.message;
      return res.status(400).json({ success: false, message: msg });
    }
    next();
  });
}

app.post('/api/apply', applyUpload, function (req, res) {
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

// ====== GLOBAL ERROR HANDLER ======
// Catches anything unhandled (e.g. multer errors outside the wrapped route,
// JSON parse errors). Returns clean JSON so the frontend's res.json() never breaks.
app.use(function (err, req, res, next) {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: 'Server error' });
});

// ====== START SERVER ======
app.listen(PORT, function () {
  console.log('ENpower Email API running on port ' + PORT);
});
