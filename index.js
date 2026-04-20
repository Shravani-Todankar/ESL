
/* ==========================================================
   TOAST NOTIFICATION
   ========================================================== */
function showToast(type, title, msg) {
    const toast = document.getElementById('enpToast');
    document.getElementById('enpToastIcon').className = 'enp-toast-icon ' + type;
    document.getElementById('enpToastIcon').innerHTML = type === 'success' ? '✓' : '✕';
    document.getElementById('enpToastTitle').textContent = title;
    document.getElementById('enpToastMsg').textContent = msg;
    toast.classList.add('active');
}
function closeToast() { document.getElementById('enpToast').classList.remove('active'); }

/* ==========================================================
   LOAD HEADER AND FOOTER
   ========================================================== */
// Load Header
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;

        // Animate header entrance after it's loaded
        const mainNav = document.querySelector('.en-main-nav');
        if (mainNav && typeof gsap !== 'undefined') {
            gsap.to(mainNav, { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
        }

        // Initialize header JS (innerHTML doesn't execute <script> tags)
        const nav = document.getElementById('mainNav');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.getElementById('navLinks');

        // Scroll effect
        window.addEventListener('scroll', () => {
            if (nav) {
                if (window.scrollY > 50) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', function (e) {
                e.stopPropagation();
                this.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
        }

        // Mobile dropdown toggle
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 968) {
                    e.preventDefault();
                    e.stopPropagation();
                    const parent = toggle.closest('.dropdown-parent');
                    document.querySelectorAll('.dropdown-parent').forEach(p => {
                        if (p !== parent) p.classList.remove('dropdown-active');
                    });
                    parent.classList.toggle('dropdown-active');
                }
            });
        });

        // Close menu on nav link click
        document.querySelectorAll('.nav-link:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 968 && mobileMenuToggle && navLinks) {
                    mobileMenuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            });
        });

        // Close menu on dropdown item click
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 968 && mobileMenuToggle && navLinks) {
                    mobileMenuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.querySelectorAll('.dropdown-parent').forEach(p => p.classList.remove('dropdown-active'));
                }
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 968 && nav && !nav.contains(e.target) && navLinks && mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.querySelectorAll('.dropdown-parent').forEach(p => p.classList.remove('dropdown-active'));
            }
        });
    })
    .catch(error => console.error('Error loading header:', error));

// Load Footer
fetch('footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;

        // Initialize Back to Top Button after footer is loaded
        const backToTopButton = document.getElementById('backToTop');
        if (backToTopButton) {
            // Show/hide button based on scroll position
            window.addEventListener('scroll', function () {
                if (window.pageYOffset > 300) {
                    backToTopButton.classList.add('show');
                } else {
                    backToTopButton.classList.remove('show');
                }
            });

            // Scroll to top when button is clicked
            backToTopButton.addEventListener('click', function () {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        var cbanner = document.getElementById('cookieBanner');
        if (cbanner && !localStorage.getItem('cookie_consent')) {
            cbanner.classList.add('show');
            document.getElementById('cookieAccept').addEventListener('click', function () {
                localStorage.setItem('cookie_consent', 'accepted');
                cbanner.classList.remove('show');
            });
            document.getElementById('cookieReject').addEventListener('click', function () {
                localStorage.setItem('cookie_consent', 'rejected');
                cbanner.classList.remove('show');
            });
        }
    })
    .catch(error => console.error('Error loading footer:', error));

/* ==========================================================
   PARTNER FORM POPUP
   ========================================================== */
document.addEventListener('DOMContentLoaded', function () {
    const connectBtn = document.getElementById('connectBtn');
    const popup = document.getElementById('partnerFormPopup');
    const closeBtn = document.getElementById('closePopupBtn');
    const partnerForm = document.getElementById('partnerForm');
    const representSelect = document.getElementById('partnerRepresent');
    const schoolRoleGroup = document.getElementById('schoolRoleGroup');
    const designationGroup = document.getElementById('designationGroup');
    const schoolRoleSelect = document.getElementById('schoolRole');
    const designationInput = document.getElementById('designation');

    // Open popup
    if (connectBtn) {
        connectBtn.addEventListener('click', function (e) {
            e.preventDefault();
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close popup
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            popup.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close popup when clicking outside
    popup.addEventListener('click', function (e) {
        if (e.target === popup) {
            popup.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close popup on ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            popup.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle conditional fields based on "I represent" selection
    if (representSelect) {
        representSelect.addEventListener('change', function () {
            const value = this.value;

            // Reset fields
            schoolRoleGroup.style.display = 'none';
            designationGroup.style.display = 'none';
            schoolRoleSelect.removeAttribute('required');
            designationInput.removeAttribute('required');

            if (value === 'school') {
                schoolRoleGroup.style.display = 'flex';
                schoolRoleSelect.setAttribute('required', 'required');
            } else if (value === 'institute' || value === 'organization' || value === 'foundation') {
                designationGroup.style.display = 'flex';
                designationInput.setAttribute('required', 'required');
            }
        });
    }

    // Validation functions
    function clearError(field, errorId) {
        field.classList.remove('error');
        document.getElementById(errorId).classList.remove('show');
    }

    function showError(field, errorId) {
        field.classList.add('error');
        document.getElementById(errorId).classList.add('show');
    }

    function validateName(value) {
        return value.trim().length >= 2;
    }

    function validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    function validatePhone(value) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(value.replace(/\s+/g, ''));
    }

    // Real-time validation on blur
    const nameInput = document.getElementById('partnerName');
    const emailInput = document.getElementById('partnerEmail');
    const contactInput = document.getElementById('partnerContact');

    // Prevent numbers in Name field
    if (nameInput) {
        nameInput.addEventListener('keypress', function (e) {
            const char = String.fromCharCode(e.which);
            if (!/[A-Za-z\s]/.test(char)) {
                e.preventDefault();
            }
        });
        nameInput.addEventListener('blur', function () {
            if (!validateName(this.value)) {
                showError(this, 'nameError');
            } else {
                clearError(this, 'nameError');
            }
        });
        nameInput.addEventListener('input', function () {
            // Remove any numbers that might have been pasted
            this.value = this.value.replace(/[^A-Za-z\s]/g, '');
            if (this.classList.contains('error')) {
                clearError(this, 'nameError');
            }
        });
    }

    // Prevent numbers in Designation field
    if (designationInput) {
        designationInput.addEventListener('keypress', function (e) {
            const char = String.fromCharCode(e.which);
            if (!/[A-Za-z\s]/.test(char)) {
                e.preventDefault();
            }
        });
        designationInput.addEventListener('input', function () {
            // Remove any numbers that might have been pasted
            this.value = this.value.replace(/[^A-Za-z\s]/g, '');
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            if (!validateEmail(this.value)) {
                showError(this, 'emailError');
            } else {
                clearError(this, 'emailError');
            }
        });
        emailInput.addEventListener('input', function () {
            if (this.classList.contains('error')) {
                clearError(this, 'emailError');
            }
        });
    }

    // Only allow numbers in Contact field
    if (contactInput) {
        contactInput.addEventListener('keypress', function (e) {
            const char = String.fromCharCode(e.which);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        });
        contactInput.addEventListener('input', function () {
            // Remove any non-numeric characters that might have been pasted
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.classList.contains('error')) {
                clearError(this, 'contactError');
            }
        });
        contactInput.addEventListener('blur', function () {
            if (!validatePhone(this.value)) {
                showError(this, 'contactError');
            } else {
                clearError(this, 'contactError');
            }
        });
    }

    // Handle form submission with validation
    if (partnerForm) {
        partnerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Clear all previous errors
            document.querySelectorAll('.error-message').forEach(msg => msg.classList.remove('show'));
            document.querySelectorAll('input, select').forEach(field => field.classList.remove('error'));

            let isValid = true;

            // Validate Name
            if (!validateName(nameInput.value)) {
                showError(nameInput, 'nameError');
                isValid = false;
            }

            // Validate "I represent"
            if (!representSelect.value) {
                showError(representSelect, 'representError');
                isValid = false;
            }

            // Validate School Role (if visible)
            if (schoolRoleGroup.style.display === 'flex' && !schoolRoleSelect.value) {
                showError(schoolRoleSelect, 'schoolRoleError');
                isValid = false;
            }

            // Validate Designation (if visible)
            if (designationGroup.style.display === 'flex' && !designationInput.value.trim()) {
                showError(designationInput, 'designationError');
                isValid = false;
            }

            // Validate Email
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'emailError');
                isValid = false;
            }

            // Validate Contact Number
            if (!validatePhone(contactInput.value)) {
                showError(contactInput, 'contactError');
                isValid = false;
            }

            // If form is valid, submit via EmailJS
            if (isValid) {
                const btn = partnerForm.querySelector('.form-submit-btn');
                btn.disabled = true;
                btn.textContent = 'Sending...';

                const name = nameInput.value;
                const represent = representSelect.options[representSelect.selectedIndex].text;
                const role = schoolRoleSelect.selectedIndex > 0 ? schoolRoleSelect.options[schoolRoleSelect.selectedIndex].text : 'N/A';
                const desig = designationInput.value || 'N/A';
                const email = emailInput.value;
                const contact = contactInput.value;

                emailjs.init('ZrIVKL_1zb380bnLM');
                emailjs.send('service_2u7kfbl', 'template_022e9es', {
                    subject: 'New Partner Inquiry from ' + name + ' - Homepage',
                    header: 'New partner inquiry received from Homepage:',
                    content: 'Name: ' + name + '\nI Represent: ' + represent + '\nRole: ' + role + '\nDesignation: ' + desig + '\nEmail: ' + email + '\nContact: ' + contact
                }).then(function () {
                    showToast('success', 'Thank You!', 'Your inquiry has been submitted successfully. We will get back to you soon.');
                    partnerForm.reset();
                    popup.classList.remove('active');
                    document.body.style.overflow = '';
                    schoolRoleGroup.style.display = 'none';
                    designationGroup.style.display = 'none';
                    btn.disabled = false;
                    btn.textContent = 'Submit';
                }, function (error) {
                    showToast('error', 'Oops!', 'Something went wrong. Please try again.');
                    console.error('EmailJS Error:', error);
                    btn.disabled = false;
                    btn.textContent = 'Submit';
                });
            }
        });
    }
});

/* ==========================================================
   INTERACTIVE LINE CANVAS — Solid wavy lines
   ========================================================== */
(function () {
    const canvas = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let mouseX = -1000, mouseY = -1000;
    let scrollY = 0;
    const WAVE_COUNT = 24; // More lines for the mesh look
    const INFLUENCE_RADIUS = 250;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    document.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });

    const waves = [];
    // Create "ribbons" of lines
    for (let i = 0; i < WAVE_COUNT; i++) {
        const group = Math.floor(i / 8);
        waves.push({
            y: 0.3 + group * 0.2 + (Math.random() * 0.05), // Grouped vertically
            amplitude: 40 + Math.random() * 50, // Larger, more sweeping waves
            frequency: 0.001 + Math.random() * 0.001, // Gentler frequency
            speed: 0.0002 + Math.random() * 0.0003,
            phase: i * 0.2, // Offset phases to create the mesh effect
            opacity: 0.08 + Math.random() * 0.05,
            thickness: 0.5 + Math.random() * 0.5 // Hair-thin lines
        });
    }

    let time = 0;

    function draw() {
        ctx.clearRect(0, 0, width, height);
        const parallaxOffset = scrollY * 0.1;

        for (let w = 0; w < waves.length; w++) {
            const wave = waves[w];
            const baseY = wave.y * height + parallaxOffset;

            // Soft purple/pink palette to match the image
            ctx.beginPath();
            ctx.strokeStyle = `rgba(180, 120, 220, ${wave.opacity})`;
            ctx.lineWidth = wave.thickness;

            const step = 6;
            for (let x = -10; x <= width + 10; x += step) {
                // Complex sine combination for fluid ribbon motion
                let y = baseY + Math.sin(x * wave.frequency + time * wave.speed * 1000 + wave.phase) * wave.amplitude;
                y += Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 500) * (wave.amplitude * 0.3);

                const dx = x - mouseX;
                const dy = y - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < INFLUENCE_RADIUS) {
                    const influence = 1 - dist / INFLUENCE_RADIUS;
                    const smoothInfluence = influence * influence * (3 - 2 * influence);
                    const pushStrength = 40 * smoothInfluence;
                    const angle = Math.atan2(dy, dx);
                    y += Math.sin(angle) * pushStrength;
                }

                if (x === -10) { ctx.moveTo(x, y); }
                else { ctx.lineTo(x, y); }
            }
            ctx.stroke();
        }

        time = performance.now() / 1000;
        requestAnimationFrame(draw);
    }

    draw();
})();

/* ==========================================================
   GSAP ANIMATIONS
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const checkGSAP = setInterval(() => {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            clearInterval(checkGSAP);
            initAnimations();
        }
    }, 50);

    function initAnimations() {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Nav entrance
        tl.to('.en-main-nav', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });

        // Heading lines stagger
        tl.to('.heading-line', {
            opacity: 1, y: 0, duration: 0.9, stagger: 0.15
        }, '-=0.4');

        // Capsules scale in
        tl.to('.capsule', {
            opacity: 1, scale: 1, duration: 0.7, stagger: 0.12,
            ease: 'back.out(1.4)'
        }, '-=0.6');



        // Bottom section
        tl.to('.hero-bottom', { opacity: 1, y: 0, duration: 0.7 }, '-=0.3');

        // Scroll indicator
        tl.to('#scrollIndicator', { opacity: 0.6, duration: 0.6 }, '-=0.2');

        // Floating animation for capsules
        document.querySelectorAll('.capsule').forEach((capsule) => {
            const offset = parseFloat(capsule.dataset.floatOffset) || 0;
            gsap.to(capsule, {
                y: -8, duration: 2.2 + offset * 0.3,
                repeat: -1, yoyo: true, ease: 'sine.inOut', delay: offset
            });
        });


        // Gentle sway on rocket
        gsap.to('.rocket-deco', {
            y: -10, rotation: 3, duration: 3,
            repeat: -1, yoyo: true, ease: 'sine.inOut'
        });

        // Stories Section Horizontal GSAP Scroll Animation
        const storiesSection = document.querySelector('.stories-section');
        const storiesScroll = document.getElementById('stories-scroll');
        const storyCards = gsap.utils.toArray('.story-card');
        const heading = document.getElementById('stories-heading');

        console.log('Stories Debug:', {
            storiesSection: !!storiesSection,
            storiesScroll: !!storiesScroll,
            storyCardsCount: storyCards.length
        });

        if (storiesSection && storiesScroll && storyCards.length > 0) {
            // Calculate total scroll width
            const getScrollWidth = () => {
                let width = heading ? heading.offsetWidth + 32 : 0; // Account for heading
                storyCards.forEach(card => {
                    width += card.offsetWidth + 32; // + gap
                });
                return width;
            };

            // Calculate max scroll distance to show all cards
            const getMaxScroll = () => {
                const totalWidth = getScrollWidth();
                const padding = Math.max(window.innerWidth * 0.05, (window.innerWidth - 1200) / 2); // Match CSS padding-left
                return totalWidth - window.innerWidth + padding * 2;
            };

            // GSAP Horizontal Scroll
            const storiesTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: storiesSection,
                    start: window.innerWidth <= 768 ? "center center" : "top top",
                    end: () => `+=${getMaxScroll()}`, // Exact scroll length - no extra spacing
                    pin: true,
                    pinSpacing: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });

            storiesTimeline.to(storiesScroll, {
                x: () => -getMaxScroll(),
                ease: "none",
                duration: 1
            });

            console.log('Stories horizontal scroll initialized. Max scroll:', getMaxScroll());

            // Navigation Buttons (manual overrides)
            const storyPrev = document.getElementById('story-prev');
            const storyNext = document.getElementById('story-next');

            if (storyPrev && storyNext) {
                let currentScroll = 0;
                const cardWidth = (storyCards[0] ? storyCards[0].offsetWidth : 400) + 32;

                storyNext.addEventListener('click', () => {
                    currentScroll -= cardWidth;
                    const maxScroll = -getMaxScroll();
                    currentScroll = Math.max(currentScroll, maxScroll);
                    gsap.to(storiesScroll, { x: currentScroll, duration: 0.5, ease: "power2.out" });
                });

                storyPrev.addEventListener('click', () => {
                    currentScroll += cardWidth;
                    currentScroll = Math.min(currentScroll, 0);
                    gsap.to(storiesScroll, { x: currentScroll, duration: 0.5, ease: "power2.out" });
                });
            }
        }

        // --- Impact Section ScrollTrigger ---

        // Grid Background Animation - Initialize with proper states
        gsap.set(".impact-grid-line", { opacity: 0, clearProps: "all" });
        gsap.set(".impact-grid-line", { opacity: 0 });
        gsap.set(".impact-grid-line-h", { scaleX: 0, transformOrigin: "center" });
        gsap.set(".impact-grid-line-v", { scaleY: 0, transformOrigin: "center" });

        // Create timeline for grid animation
        const impactGridTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#impact-scroll-container",
                start: "top 80%",
                end: "top 20%",
                toggleActions: "play none none none",
                once: true
            }
        });

        // Add animations to timeline
        impactGridTl.to(".impact-grid-line", {
            opacity: 1,
            duration: 1,
            stagger: 0.15
        })
            .to(".impact-grid-line-h", {
                scaleX: 1,
                duration: 1
            }, "<")
            .to(".impact-grid-line-v", {
                scaleY: 1,
                duration: 1
            }, "<");

        // Heading Reveal Animation
        gsap.to(".impact-title-line", {
            scrollTrigger: {
                trigger: "#impact-scroll-container",
                start: "top 30%", // Triggers exactly when user reaches the section
                once: true        // Play only once, no reverse, no flicker
            },
            y: "0%",
            duration: 1,
            stagger: 0.2, // Seamless staggered reveal
            ease: "power4.out"
        });

        gsap.from(".impact-reveal-element", {
            scrollTrigger: {
                trigger: "#impact-scroll-container",
                start: "top 30%",
                once: true
            },
            opacity: 0,
            y: 20,
            duration: 1,
            delay: 0.4,
            ease: "power2.out"
        });

        // ===== ENHANCED NETWORK ANIMATION =====
        const networkNodes = gsap.utils.toArray('.network-node');
        const networkLines = gsap.utils.toArray('.network-line');
        const nodeGlows = gsap.utils.toArray('.node-glow');
        const sparkles = gsap.utils.toArray('.sparkles > g');

        // Enhanced milestone structure with node associations
        const milestones = [
            {
                id: 1,
                lines: ['#line-1', '#line-2'],
                nodes: ['#node-1', '#node-9'],
                sparkle: '#sparkle-1',
                text: '#milestone-1',
                progress: 0.15,
                label: 'Innovation Begins'
            },
            {
                id: 2,
                lines: ['#line-3', '#line-12'],
                nodes: ['#node-3', '#node-5'],
                sparkle: '#sparkle-2',
                text: '#milestone-2',
                progress: 0.35,
                label: 'Ideas Connect'
            },
            {
                id: 3,
                lines: ['#line-4', '#line-5', '#line-11'],
                nodes: ['#node-2', '#node-4', '#node-6'],
                sparkle: '#sparkle-3',
                text: '#milestone-3',
                progress: 0.60,
                label: 'Growth Unlocked'
            },
            {
                id: 4,
                lines: ['#line-6', '#line-7'],
                nodes: ['#node-4', '#node-8'],
                sparkle: '#sparkle-4',
                text: '#milestone-4',
                progress: 0.70,
                label: 'Future Ready'
            }
        ];

        // Initial setup
        gsap.set(networkLines, { strokeDashoffset: 200, opacity: 0 });
        gsap.set(networkNodes, { scale: 0, opacity: 0, transformOrigin: 'center' });
        gsap.set(nodeGlows, { scale: 0, opacity: 0, transformOrigin: 'center' });

        // Progressive milestone-based animations with reverse support
        milestones.forEach((milestone, index) => {
            ScrollTrigger.create({
                trigger: "#impact-scroll-container",
                start: `top+=${milestone.progress * 100}% top`,
                end: `top+=${(milestone.progress + 0.15) * 100}% top`,
                onEnter: () => {
                    // 1. Draw lines with smooth animation
                    milestone.lines.forEach((lineSelector, i) => {
                        gsap.to(lineSelector, {
                            strokeDashoffset: 0,
                            opacity: 0.35,
                            duration: 0.6,
                            ease: "power2.out"
                        });
                    });

                    // 2. Animate connected nodes with scale entrance
                    milestone.nodes.forEach((nodeSelector, i) => {
                        const nodeGroup = document.querySelector(nodeSelector);
                        if (!nodeGroup) return;

                        const node = nodeGroup.querySelector('.network-node');

                        gsap.to(node, {
                            scale: 1,
                            opacity: 1,
                            duration: 0.5,
                            ease: "back.out(1.7)"
                        });
                    });

                    // 3. Activate sparkle near milestone
                    gsap.to(milestone.sparkle, {
                        opacity: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });

                    // 4. Show milestone text
                    gsap.to(milestone.text, {
                        opacity: 1,
                        y: -5,
                        duration: 0.5,
                        ease: "back.out(1.5)"
                    });

                    // 5. Glow pulse effect
                    const relatedGlows = nodeGlows.slice(index, index + 1);
                    relatedGlows.forEach(glow => {
                        gsap.to(glow, {
                            scale: 1.2,
                            opacity: 0.12,
                            duration: 0.6,
                            ease: "power2.out"
                        });
                    });
                },
                onLeaveBack: () => {
                    // REVERSE: Hide lines
                    milestone.lines.forEach((lineSelector, i) => {
                        gsap.to(lineSelector, {
                            strokeDashoffset: 200,
                            opacity: 0,
                            duration: 0.5,
                            ease: "power2.in"
                        });
                    });

                    // REVERSE: Hide nodes
                    milestone.nodes.forEach((nodeSelector, i) => {
                        const nodeGroup = document.querySelector(nodeSelector);
                        if (!nodeGroup) return;

                        const node = nodeGroup.querySelector('.network-node');

                        gsap.to(node, {
                            scale: 0,
                            opacity: 0,
                            duration: 0.4,
                            ease: "back.in(1.7)"
                        });
                    });

                    // REVERSE: Hide sparkle
                    gsap.to(milestone.sparkle, {
                        opacity: 0,
                        duration: 0.3,
                        ease: "power2.in"
                    });

                    // REVERSE: Hide milestone text
                    gsap.to(milestone.text, {
                        opacity: 0,
                        y: 0,
                        duration: 0.4,
                        ease: "power2.in"
                    });

                    // REVERSE: Hide glow
                    const relatedGlows = nodeGlows.slice(index, index + 1);
                    relatedGlows.forEach(glow => {
                        gsap.to(glow, {
                            scale: 0,
                            opacity: 0,
                            duration: 0.5,
                            ease: "power2.in"
                        });
                    });
                }
            });
        });

        // Remaining lines (not part of milestones) - animate subtly
        const remainingLines = ['#line-8', '#line-9', '#line-10', '#line-13', '#line-14'];
        remainingLines.forEach((lineSelector, i) => {
            gsap.to(lineSelector, {
                scrollTrigger: {
                    trigger: "#impact-scroll-container",
                    start: "top 20%",
                    once: true
                },
                strokeDashoffset: 0,
                opacity: 0.12,
                duration: 1.8,
                delay: 1 + i * 0.25,
                ease: "power2.inOut"
            });
        });

        // Remaining nodes (not in milestones) - animate after milestone nodes
        const remainingNodes = ['#node-7', '#node-10', '#node-11', '#node-12', '#node-13'];
        remainingNodes.forEach((nodeSelector, i) => {
            const nodeGroup = document.querySelector(nodeSelector);
            if (!nodeGroup) return;

            const node = nodeGroup.querySelector('.network-node');

            gsap.to(node, {
                scrollTrigger: {
                    trigger: "#impact-scroll-container",
                    start: "top 20%",
                    once: true
                },
                scale: 1,
                opacity: 0.8,
                duration: 0.8,
                delay: 1.5 + i * 0.15,
                ease: "back.out(1.7)"
            });
        });

        // Continuous floating animation for ALL node groups
        for (let i = 1; i <= 13; i++) {
            const nodeGroup = document.querySelector(`#node-${i}`);
            if (!nodeGroup) continue;

            const duration = 3.5 + Math.random() * 2; // 3.5-5.5 seconds
            const xOffset = (Math.random() - 0.5) * 10;
            const yOffset = (Math.random() - 0.5) * 10;

            // Floating position animation only
            gsap.to(nodeGroup, {
                x: xOffset,
                y: yOffset,
                duration: duration,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.15
            });
        }

        // Continuous sparkle twinkle for remaining sparkles
        const remainingSparkles = ['#sparkle-5'];
        remainingSparkles.forEach((sparkleSelector, i) => {
            gsap.to(sparkleSelector, {
                scrollTrigger: {
                    trigger: "#impact-scroll-container",
                    start: "top 20%",
                    once: true
                },
                opacity: 0.7,
                duration: 0.5,
                delay: 2 + i * 0.2,
                ease: "power2.out"
            });

            // Continuous twinkle (opacity only, no scale)
            gsap.to(sparkleSelector, {
                opacity: 0.2,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 2.5
            });
        });



        const mainTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#impact-scroll-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
            }
        });

        // Calculate heights for rolling animations based on CSS values
        const numberHeight = window.innerWidth >= 768 ? 150 : 100;
        const labelHeight = 48; // 3rem

        // Define Scenes
        const scenes = [
            { index: 0, label: "States" },
            { index: 1, label: "Schools" },
            { index: 2, label: "Students" },
            { index: 3, label: "Coaches" }
        ];

        // Initial State Setup
        gsap.set(".description-item", { opacity: 0, y: 20 });
        gsap.set(".description-item:nth-child(1)", { opacity: 1, y: 0 });
        gsap.set(".progress-dot:nth-child(1) .progress-fill", { width: "100%" });

        // Scene transitions
        scenes.forEach((scene, i) => {
            if (i === 0) return; // Skip first scene transition as it's the start

            // Roll Numbers
            mainTl.to("#number-roller", {
                y: -numberHeight * i,
                duration: 1,
                ease: "power2.inOut"
            }, i);

            // Roll Labels
            mainTl.to("#label-roller", {
                y: -labelHeight * i,
                duration: 1,
                ease: "power2.inOut"
            }, i);

            // Transition Descriptions
            mainTl.to(".description-item:nth-child(" + i + ")", {
                opacity: 0,
                y: -20,
                duration: 0.5
            }, i);
            mainTl.to(".description-item:nth-child(" + (i + 1) + ")", {
                opacity: 1,
                y: 0,
                duration: 0.5
            }, i + 0.5);

            // Update Progress Dots
            mainTl.to(`.progress-dot:nth-child(${i + 1}) .progress-fill`, {
                width: "100%",
                duration: 1
            }, i);

        });

        // --- Training & Certificates - JavaScript REMOVED ---

        // --- Architecture Scroll Section Animation ---
        // Set z-index for architecture scroll images
        document.querySelectorAll(".arch-scroll__right .img-wrapper").forEach((element) => {
            const order = element.getAttribute("data-index");
            if (order !== null) {
                element.style.zIndex = order;
            }
        });

        // Mobile layout handler for architecture scroll
        function handleArchScrollMobileLayout() {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            const leftItems = gsap.utils.toArray(".arch-scroll__left .arch-scroll__info");
            const rightItems = gsap.utils.toArray(".arch-scroll__right .img-wrapper");

            if (isMobile) {
                leftItems.forEach((item, i) => {
                    item.style.order = i * 2;
                });
                rightItems.forEach((item, i) => {
                    item.style.order = i * 2 + 1;
                });
            } else {
                leftItems.forEach((item) => {
                    item.style.order = "";
                });
                rightItems.forEach((item) => {
                    item.style.order = "";
                });
            }
        }

        let archScrollResizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(archScrollResizeTimeout);
            archScrollResizeTimeout = setTimeout(handleArchScrollMobileLayout, 100);
        });
        handleArchScrollMobileLayout();

        const archScrollImgs = gsap.utils.toArray(".arch-scroll__right .img-wrapper img");
        const archScrollBgColors = ["#EDF9FF", "#FFECF2", "#FFE8DB"];

        if (archScrollImgs.length) {
            console.log("Architecture Scroll: Found", archScrollImgs.length, "images");

            const archScrollContainer = document.getElementById("architecture-scroll-section");
            const archScrollSection = document.getElementById("arch-scroll-main");

            console.log("Container found:", archScrollContainer);
            console.log("Section found:", archScrollSection);

            // Wait for all ScrollTriggers to be created and refresh
            setTimeout(() => {
                ScrollTrigger.refresh(true);

                setTimeout(() => {
                    ScrollTrigger.matchMedia({
                        "(min-width: 769px)": function () {
                            console.log("Architecture Scroll: Desktop mode activated");

                            const archScrollRect = archScrollSection.getBoundingClientRect();
                            const scrollY = window.scrollY || window.pageYOffset;
                            const sectionTopPosition = archScrollRect.top + scrollY;

                            console.log("Section top position:", sectionTopPosition);
                            console.log("Current scroll position:", scrollY);

                            // First, pin the right side using ID
                            ScrollTrigger.create({
                                trigger: "#arch-scroll-main",
                                start: "top top",
                                end: "bottom bottom",
                                pin: ".arch-scroll__right",
                                pinSpacing: false,
                                markers: false,
                                id: "architecture-scroll-pin-unique",
                                invalidateOnRefresh: true,
                                onEnter: () => console.log("Architecture Pin activated!"),
                                onLeave: () => console.log("Architecture Pin deactivated!"),
                                onEnterBack: () => console.log("Architecture Pin re-activated!"),
                                onLeaveBack: () => console.log("Architecture Pin left backwards!")
                            });

                            // Set initial states
                            gsap.set(archScrollImgs, {
                                clipPath: "inset(0)",
                                objectPosition: "0px 50%"
                            });

                            // Create individual ScrollTriggers for each image based on left content
                            const archScrollLeftItems = gsap.utils.toArray(".arch-scroll__left .arch-scroll__info");

                            console.log("Left items found:", archScrollLeftItems.length);

                            archScrollLeftItems.forEach((item, index) => {
                                if (index < archScrollImgs.length - 1) {
                                    gsap.timeline({
                                        scrollTrigger: {
                                            trigger: item,
                                            start: "top center",
                                            end: "bottom center",
                                            scrub: 1,
                                            markers: false,
                                            id: "architecture-img-transition-" + index
                                        }
                                    })
                                        .to(archScrollImgs[index], {
                                            clipPath: "inset(0% 0% 100% 0%)",
                                            objectPosition: "0px 60%",
                                            ease: "none"
                                        });
                                }
                            });
                        },
                        "(max-width: 768px)": function () {
                            gsap.set(archScrollImgs, {
                                objectPosition: "0px 60%"
                            });

                            archScrollImgs.forEach((image, index) => {
                                gsap.timeline({
                                    scrollTrigger: {
                                        trigger: image,
                                        start: "top-=70% top+=50%",
                                        end: "bottom+=200% bottom",
                                        scrub: true
                                    }
                                })
                                    .to(image, {
                                        objectPosition: "0px 30%",
                                        duration: 5,
                                        ease: "none"
                                    });
                            });
                        }
                    });
                }, 300); // Additional delay after refresh
            }, 1000); // Wait for other ScrollTriggers
        }

        // --- Cinematic Series Interactive Carousel ---
        const track = document.getElementById('cardsTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const currentSlideEl = document.getElementById('currentSlide');
        const progressFill = document.getElementById('progressFill');
        const modal = document.getElementById('videoModal');
        const videoFrame = document.getElementById('videoFrame');
        const modalClose = document.getElementById('modalClose');

        if (track && prevBtn && nextBtn) {
            let cinematicIndex = 0;
            const totalCinematicSlides = 5;
            const getCardWidth = () => {
                const card = document.querySelector('.video-card');
                return card ? card.offsetWidth + 24 : 324; // card width + gap
            };

            function updateCinematicCarousel() {
                const width = getCardWidth();
                track.style.transform = `translateX(-${cinematicIndex * width}px)`;
                currentSlideEl.textContent = String(cinematicIndex + 1).padStart(2, '0');
                progressFill.style.width = `${((cinematicIndex + 1) / totalCinematicSlides) * 100}%`;
            }

            prevBtn.addEventListener('click', () => {
                cinematicIndex = cinematicIndex > 0 ? cinematicIndex - 1 : totalCinematicSlides - 1;
                updateCinematicCarousel();
            });

            nextBtn.addEventListener('click', () => {
                cinematicIndex = cinematicIndex < totalCinematicSlides - 1 ? cinematicIndex + 1 : 0;
                updateCinematicCarousel();
            });

            // Play buttons open modal
            document.querySelectorAll('.play-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const card = btn.closest('.video-card');
                    const videoUrl = card.dataset.video;
                    videoFrame.src = videoUrl + '?autoplay=1';
                    modal.classList.add('active');
                });
            });

            // Card click also opens modal
            document.querySelectorAll('.video-card').forEach(card => {
                card.addEventListener('click', () => {
                    const videoUrl = card.dataset.video;
                    videoFrame.src = videoUrl + '?autoplay=1';
                    modal.classList.add('active');
                });
            });

            // Close modal
            function closeCinematicModal() {
                modal.classList.remove('active');
                videoFrame.src = '';
            }

            if (modalClose) {
                modalClose.addEventListener('click', closeCinematicModal);
            }

            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeCinematicModal();
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeCinematicModal();
                if (e.key === 'ArrowLeft') { cinematicIndex = cinematicIndex > 0 ? cinematicIndex - 1 : totalCinematicSlides - 1; updateCinematicCarousel(); }
                if (e.key === 'ArrowRight') { cinematicIndex = cinematicIndex < totalCinematicSlides - 1 ? cinematicIndex + 1 : 0; updateCinematicCarousel(); }
            });

            // Re-calculate on resize
            window.addEventListener('resize', updateCinematicCarousel);

            // Auto-scroll — only starts when section is visible
            let autoScrollInterval = null;

            function startAutoScroll() {
                if (autoScrollInterval) return;
                autoScrollInterval = setInterval(() => {
                    if (cinematicIndex < totalCinematicSlides - 1) {
                        cinematicIndex++;
                    } else {
                        cinematicIndex = 0;
                    }
                    updateCinematicCarousel();
                }, 3000);
            }

            function stopAutoScroll() {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }

            // Reset to first slide and start auto-scroll when section enters viewport
            const cinematicSection = document.getElementById('cinematic-series');
            if (cinematicSection) {
                const cinematicObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            cinematicIndex = 0;
                            updateCinematicCarousel();
                            startAutoScroll();
                        } else {
                            stopAutoScroll();
                        }
                    });
                }, { threshold: 0.3 });
                cinematicObserver.observe(cinematicSection);
            }

            // Pause auto-scroll on hover
            const carouselContainer = document.querySelector('.right-carousel');
            if (carouselContainer) {
                carouselContainer.addEventListener('mouseenter', () => {
                    stopAutoScroll();
                });

                carouselContainer.addEventListener('mouseleave', () => {
                    startAutoScroll();
                });
            }

            // Pause auto-scroll when user clicks prev/next
            const resetAutoScroll = () => {
                clearInterval(autoScrollInterval);
                autoScrollInterval = setInterval(() => {
                    if (cinematicIndex < totalCinematicSlides - 1) {
                        cinematicIndex++;
                    } else {
                        cinematicIndex = 0;
                    }
                    updateCinematicCarousel();
                }, 3000);
            };

            prevBtn.addEventListener('click', resetAutoScroll);
            nextBtn.addEventListener('click', resetAutoScroll);
        }

        // --- Impact Programs Section ScrollTrigger ---
        // Animation removed as per user request

        // Slide-in animation for cards
        const ipCards = gsap.utils.toArray('.ip-slide-in-card');

        console.log('Impact Programs: Found', ipCards.length, 'cards');

        // Animate cards one by one
        ipCards.forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none none",
                    markers: false,
                    once: true,
                    onEnter: () => console.log(`Card ${index + 1} animated!`)
                },
                opacity: 0,
                y: 50,
                duration: 0.6,
                delay: index * 0.1,
                ease: "power2.out"
            });
        });

        // 3D Hover tilt for Impact Program cards
        document.querySelectorAll('.ip-program-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const dx = (e.clientX - rect.left) - rect.width / 2;
                const dy = (e.clientY - rect.top) - rect.height / 2;
                gsap.to(card, {
                    rotateY: dx / 10,
                    rotateX: -dy / 10,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
        });

        // --- Impact Programs Slideshow ---
        const ipSlides = document.querySelectorAll('.ip-slide');
        if (ipSlides.length > 0) {
            let ipCurrent = 0;
            setInterval(() => {
                ipSlides[ipCurrent].classList.remove('active');
                ipCurrent = (ipCurrent + 1) % ipSlides.length;
                ipSlides[ipCurrent].classList.add('active');
            }, 3000);
        }

        // --- New Counter Animation (GSAP) ---
        const counterNumbers = document.querySelectorAll('.new-counter-number');
        counterNumbers.forEach(number => {
            const targetValue = parseInt(number.getAttribute('data-target'));
            const counterObj = { value: 0 };

            gsap.to(counterObj, {
                value: targetValue,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: number,
                    start: "top 90%",
                    once: true
                },
                onUpdate: function () {
                    number.innerText = Math.ceil(counterObj.value).toLocaleString();
                }
            });
        });

        // --- Dynamic CTA Arrow Logic ---
        const card = document.getElementById('card');
        const glowBorder = document.getElementById('glowBorder');
        const arrowPath = document.getElementById('arrow-path');
        const connectBtn = document.getElementById('connectBtn');

        if (card && glowBorder && arrowPath && connectBtn) {
            let mouse = { x: 0, y: 0 };
            let smooth = { x: 0, y: 0 };
            let rafId = null;
            let isInside = false;

            function getBtnInfo() {
                const cardR = card.getBoundingClientRect();
                const btnR = connectBtn.getBoundingClientRect();
                return {
                    cx: btnR.left + btnR.width / 2 - cardR.left,
                    cy: btnR.top + btnR.height / 2 - cardR.top,
                    w: btnR.width,
                    h: btnR.height
                };
            }

            function getBtnEdgePoint(mx, my, btn) {
                const dx = mx - btn.cx;
                const dy = my - btn.cy;
                const rx = btn.w / 2 + 14;
                const ry = btn.h / 2 + 14;
                const t = Math.min(rx / Math.abs(dx || 0.001), ry / Math.abs(dy || 0.001));
                const clampT = Math.min(t, 1);
                return {
                    x: btn.cx + dx * clampT,
                    y: btn.cy + dy * clampT
                };
            }

            function buildCurvedPath(mx, my, ex, ey) {
                const dx = ex - mx;
                const dy = ey - my;
                const dist = Math.hypot(dx, dy) || 1;
                const px = -dy / dist;
                const py = dx / dist;
                const bend = Math.abs(dy) * 0.45;
                const cp1x = mx + dx * 0.33 + px * bend;
                const cp1y = my + dy * 0.33 + py * bend;
                const cp2x = ex - dx * 0.20 + px * bend * 0.15;
                const cp2y = ey - dy * 0.20 + py * bend * 0.15;
                return `M ${mx.toFixed(1)} ${my.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
            }

            function lerp(a, b, t) { return a + (b - a) * t; }

            function ctaTick() {
                if (!isInside) return;
                smooth.x = lerp(smooth.x, mouse.x, 0.10);
                smooth.y = lerp(smooth.y, mouse.y, 0.10);
                const btn = getBtnInfo();
                const edge = getBtnEdgePoint(smooth.x, smooth.y, btn);
                arrowPath.setAttribute('d', buildCurvedPath(smooth.x, smooth.y, edge.x, edge.y));
                rafId = requestAnimationFrame(ctaTick);
            }

            card.addEventListener('mouseenter', (e) => {
                isInside = true;
                const rect = card.getBoundingClientRect();
                smooth.x = mouse.x = e.clientX - rect.left;
                smooth.y = mouse.y = e.clientY - rect.top;
                arrowPath.style.opacity = '1';
                cancelAnimationFrame(rafId);
                ctaTick();
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
                glowBorder.style.setProperty('--mx', mouse.x + 'px');
                glowBorder.style.setProperty('--my', mouse.y + 'px');
            });

            card.addEventListener('mouseleave', () => {
                isInside = false;
                arrowPath.style.opacity = '0';
                glowBorder.style.setProperty('--mx', '-9999px');
                glowBorder.style.setProperty('--my', '-9999px');
                cancelAnimationFrame(rafId);
            });
        }

        // Refresh ScrollTrigger after all animations are initialized
        ScrollTrigger.refresh();

    } // This closes the initAnimations function
}); // This closes the DOMContentLoaded event listener


/* ==========================================================
   ENGAGEMENTS CARDS - TAP TO FLIP (MOBILE)
   ========================================================== */
document.addEventListener('DOMContentLoaded', function () {
    const engCards = document.querySelectorAll('.eng-card');
    if (engCards.length === 0) return;

    engCards.forEach(card => {
        card.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                engCards.forEach(c => {
                    if (c !== card) c.classList.remove('flipped');
                });
                card.classList.toggle('flipped');
            }
        });
    });
});

/* ==========================================================
   HIRING FORM — Apply Now popup validation
   ========================================================== */
(function () {
    function initHiringForm() {
        const form = document.getElementById('hi-apply-form');
        if (!form) {
            console.warn('[hiring-form] #hi-apply-form NOT found in DOM');
            return;
        }
        console.log('[hiring-form] handler attached');

        const nameInput = document.getElementById('hi-apply-name');
        const emailInput = document.getElementById('hi-apply-email');
        const cvInput = document.getElementById('hi-apply-cv');
        const cvText = document.getElementById('hi-apply-cv-text');
        const cvArea = form.querySelector('.hi-file-upload-area');
        const toggle = document.getElementById('hi-apply-modal-toggle');

        const nameError = document.getElementById('hi-apply-name-error');
        const emailError = document.getElementById('hi-apply-email-error');
        const cvError = document.getElementById('hi-apply-cv-error');

        const NAME_RE = /^[A-Za-z\s]{2,60}$/;
        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        const ALLOWED_EXT = ['pdf', 'doc', 'docx'];
        const DEFAULT_CV_TEXT = 'Drop your PDF/DOC here or click to browse (max 5MB)';

        function setError(el, errEl, msg) {
            errEl.textContent = msg;
            errEl.classList.add('show');
            el.classList.add('hi-invalid');
        }

        function clearError(el, errEl) {
            errEl.textContent = '';
            errEl.classList.remove('show');
            el.classList.remove('hi-invalid');
        }

        function validateName() {
            const v = nameInput.value.trim();
            if (!v) { setError(nameInput, nameError, 'Full name is required'); return false; }
            if (!NAME_RE.test(v)) { setError(nameInput, nameError, 'Only letters and spaces (2-60 characters)'); return false; }
            clearError(nameInput, nameError);
            return true;
        }

        function validateEmail() {
            const v = emailInput.value.trim();
            if (!v) { setError(emailInput, emailError, 'Email is required'); return false; }
            if (!EMAIL_RE.test(v)) { setError(emailInput, emailError, 'Please enter a valid email address'); return false; }
            clearError(emailInput, emailError);
            return true;
        }

        function validateCv() {
            const file = cvInput.files && cvInput.files[0];
            if (!file) { setError(cvArea, cvError, 'Please upload your CV'); return false; }
            const ext = (file.name.split('.').pop() || '').toLowerCase();
            if (!ALLOWED_EXT.includes(ext)) { setError(cvArea, cvError, 'Only PDF, DOC or DOCX allowed'); return false; }
            if (file.size > MAX_FILE_SIZE) { setError(cvArea, cvError, 'File too large. Maximum size is 5 MB'); return false; }
            clearError(cvArea, cvError);
            return true;
        }

        nameInput.addEventListener('blur', validateName);
        nameInput.addEventListener('input', function () {
            nameInput.value = nameInput.value.replace(/[^A-Za-z\s]/g, '');
            if (nameError.classList.contains('show')) validateName();
        });

        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', function () {
            if (emailError.classList.contains('show')) validateEmail();
        });

        cvInput.addEventListener('change', function () {
            const file = cvInput.files && cvInput.files[0];
            if (file) {
                cvText.textContent = file.name;
                cvText.classList.add('hi-file-selected');
            } else {
                cvText.textContent = DEFAULT_CV_TEXT;
                cvText.classList.remove('hi-file-selected');
            }
            validateCv();
        });

        function resetForm() {
            form.reset();
            cvText.textContent = DEFAULT_CV_TEXT;
            cvText.classList.remove('hi-file-selected');
            [
                [nameInput, nameError],
                [emailInput, emailError],
                [cvArea, cvError]
            ].forEach(function (pair) { clearError(pair[0], pair[1]); });
        }

        const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/403aa04c4759d1a8a00def2ee2aaf35b';
        const submitBtn = form.querySelector('.hi-btn-submit');
        const submitBtnDefaultText = submitBtn ? submitBtn.textContent.trim() : 'Submit Application';

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log('[hiring-form] submit fired');
            const checks = [validateName(), validateEmail(), validateCv()];
            console.log('[hiring-form] validation results:', checks);
            if (!checks.every(Boolean)) {
                console.warn('[hiring-form] validation failed — aborting');
                const firstInvalid = form.querySelector('.hi-invalid');
                if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            const formData = new FormData(form);
            formData.append('_subject', 'New Job Application — ENpower Careers');
            formData.append('_template', 'table');
            formData.append('_captcha', 'false');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            try {
                console.log('[hiring-form] posting to FormSubmit...');
                const res = await fetch(FORMSUBMIT_ENDPOINT, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json().catch(function () { return {}; });
                console.log('[hiring-form] FormSubmit response:', res.status, data);

                if (res.ok) {
                    if (typeof showToast === 'function') {
                        showToast('success', 'Application Received', 'Thanks for applying! Our team will get back to you soon.');
                    }
                    resetForm();
                    if (toggle) toggle.checked = false;
                } else {
                    if (typeof showToast === 'function') {
                        showToast('error', 'Submission Failed', (data && data.message) || 'Something went wrong. Please try again.');
                    }
                }
            } catch (err) {
                console.error('[hiring-form] network error:', err);
                if (typeof showToast === 'function') {
                    showToast('error', 'Network Error', 'Please check your connection and try again.');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtnDefaultText;
                }
            }
        });

        if (toggle) {
            toggle.addEventListener('change', function () {
                if (!toggle.checked) resetForm();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHiringForm);
    } else {
        initHiringForm();
    }
})();

