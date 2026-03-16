
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

            // If form is valid, submit
            if (isValid) {
                // Get form data
                const formData = {
                    name: nameInput.value,
                    represent: representSelect.value,
                    schoolRole: schoolRoleSelect.value || '',
                    designation: designationInput.value || '',
                    email: emailInput.value,
                    contact: contactInput.value
                };

                // Here you can add your form submission logic
                console.log('Form submitted:', formData);

                // Show success message
                alert('Thank you for your interest! We will get back to you soon.');

                // Reset form and close popup
                partnerForm.reset();
                popup.classList.remove('active');
                document.body.style.overflow = '';

                // Hide conditional fields
                schoolRoleGroup.style.display = 'none';
                designationGroup.style.display = 'none';
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
                    start: "top top",
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
                const cardWidth = 400 + 32;

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
                if (cinematicIndex > 0) {
                    cinematicIndex--;
                    updateCinematicCarousel();
                }
            });

            nextBtn.addEventListener('click', () => {
                if (cinematicIndex < totalCinematicSlides - 1) {
                    cinematicIndex++;
                    updateCinematicCarousel();
                }
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
                if (e.key === 'ArrowLeft') { if (cinematicIndex > 0) { cinematicIndex--; updateCinematicCarousel(); } }
                if (e.key === 'ArrowRight') { if (cinematicIndex < totalCinematicSlides - 1) { cinematicIndex++; updateCinematicCarousel(); } }
            });

            // Re-calculate on resize
            window.addEventListener('resize', updateCinematicCarousel);

            // Auto-scroll carousel every 3 seconds
            let autoScrollInterval = setInterval(() => {
                if (cinematicIndex < totalCinematicSlides - 1) {
                    cinematicIndex++;
                } else {
                    cinematicIndex = 0; // Loop back to first slide
                }
                updateCinematicCarousel();
            }, 3000);

            // Pause auto-scroll on hover
            const carouselContainer = document.querySelector('.right-carousel');
            if (carouselContainer) {
                carouselContainer.addEventListener('mouseenter', () => {
                    clearInterval(autoScrollInterval);
                });

                carouselContainer.addEventListener('mouseleave', () => {
                    autoScrollInterval = setInterval(() => {
                        if (cinematicIndex < totalCinematicSlides - 1) {
                            cinematicIndex++;
                        } else {
                            cinematicIndex = 0;
                        }
                        updateCinematicCarousel();
                    }, 3000);
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


// ===== ENPOWER PHILOSOPHY CARD ANIMATION =====
// Run after page fully loaded so all ScrollTrigger pins are computed
window.addEventListener('load', function () {
    // Small delay to let GSAP finish computing all pinSpacing from stories section
    setTimeout(initEnpowerPhilosophy, 300);
});

function initEnpowerPhilosophy() {
    const section = document.querySelector('.enpower-section');
    const progressFill = document.querySelector('.enpower-progress-fill');
    const leftEls = document.querySelectorAll(
        '.enpower-left-content .tag, .enpower-left-content h2, .enpower-left-content .desc, .enpower-left-content .cta-btn, .enpower-scroll-progress'
    );

    if (!section || !progressFill) return;

    // --- Left content: fade-in when section enters viewport ---
    gsap.set(leftEls, { opacity: 0, y: 24 });
    ScrollTrigger.create({
        trigger: section,
        start: 'top 75%',
        once: true,
        onEnter: () => gsap.to(leftEls, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: 'power3.out' })
    });

    // --- Radial Scroll Visualization ---
    const ICON_GIFS = [
        'assets/donut-icon/self-exploration.svg',
        'assets/donut-icon/foundation-literacy.svg',
        'assets/donut-icon/tech-of-the-future.svg',
        'assets/donut-icon/human-skills.svg',
        'assets/donut-icon/future-competency.svg'
    ];

    const SEG_DATA = [
        {
            label: "Self Exploration", color: "#632b7d", num: "01", heading: "Self Exploration", tag: "01",
            bullets: ["Self-discovery, Interest & Values", "Personality Development & Communication", "Connecting to the World"]
        },
        {
            label: "Foundational Literacy", color: "#a33d97", num: "02", heading: "Foundational Literacy", tag: "02",
            bullets: ["Digital, Media & Data Literacy", "Financial & Economic Literacy", "Environmental & Sustainability Literacy"]
        },
        {
            label: "Tech Of The Future", color: "#facc48", num: "03", heading: "Tech Of The Future", tag: "03",
            bullets: ["Smart Systems, IoT", "AI, Coding, ML, Robotics", "Design, Emerging Tech"]
        },
        {
            label: "Human Skills", color: "#9a69ad", num: "04", heading: "Human Skills", tag: "04",
            bullets: ["Critical Thinking & Problem Solving", "Creativity & Innovation", "Collaboration", "Emotional Intelligence (SEL)"]
        },
        {
            label: "Future Competencies", color: "#411e5a", num: "05", heading: "Future Competencies", tag: "05",
            bullets: ["Design Thinking", "Entrepreneurial Mindset", "Global Citizenship & Cross-cultural Awareness", "Readiness for the 'Future of Work'"]
        },
    ];

    const CX = 260, CY = 260;
    const INNER = 96, OUTER = 226;
    const GAP = 2;
    const EACH = (360 - GAP * SEG_DATA.length) / SEG_DATA.length;
    const OFFSET = -90;

    function pt(r, deg) {
        const a = deg * Math.PI / 180;
        return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    }

    function arc(s, e, ri, ro) {
        const [x1, y1] = pt(ro, s), [x2, y2] = pt(ro, e), [x3, y3] = pt(ri, e), [x4, y4] = pt(ri, s);
        const lg = e - s > 180 ? 1 : 0;
        return `M${x1} ${y1} A${ro} ${ro} 0 ${lg} 1 ${x2} ${y2} L${x3} ${y3} A${ri} ${ri} 0 ${lg} 0 ${x4} ${y4}Z`;
    }

    const segGroup = document.getElementById('enpowerSegGroup');

    SEG_DATA.forEach((seg, i) => {
        const s = OFFSET + i * (EACH + GAP), e = s + EACH, mid = (s + e) / 2;

        const bgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        bgPath.setAttribute("d", arc(s, e, INNER, OUTER));
        bgPath.setAttribute("fill", seg.color);
        bgPath.setAttribute("opacity", "0.2");
        segGroup.appendChild(bgPath);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", arc(s, e, INNER, OUTER));
        path.setAttribute("fill", seg.color);
        path.setAttribute("opacity", "1");
        path.setAttribute("class", "enpower-seg-arc");
        path.setAttribute("data-i", i);
        segGroup.appendChild(path);

        const [tx, ty] = pt(OUTER + 34, mid);
        const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lbl.setAttribute("x", tx); lbl.setAttribute("y", ty);
        lbl.setAttribute("fill", seg.color);
        lbl.setAttribute("class", "enpower-seg-label");
        lbl.setAttribute("text-anchor", "middle");
        lbl.setAttribute("dominant-baseline", "middle");
        lbl.setAttribute("opacity", "0.1");
        lbl.setAttribute("data-i", i);
        lbl.textContent = seg.label;
        segGroup.appendChild(lbl);

        const midR = (INNER + OUTER) / 2;
        const [ix, iy] = pt(midR, mid);
        const iconSize = 65;
        const foreignObj = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        foreignObj.setAttribute("x", ix - iconSize / 2);
        foreignObj.setAttribute("y", iy - iconSize / 2);
        foreignObj.setAttribute("width", iconSize);
        foreignObj.setAttribute("height", iconSize);
        foreignObj.setAttribute("opacity", "0.1");
        foreignObj.setAttribute("class", "enpower-seg-icon");
        foreignObj.setAttribute("data-i", i);
        foreignObj.innerHTML = `<img src="${ICON_GIFS[i]}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />`;
        segGroup.appendChild(foreignObj);
    });

    function cardPos(idx) {
        const s = OFFSET + idx * (EACH + GAP), mid = s + EACH / 2;

        const cardW = 185, cardH = 150;
        const containerW = 500, containerH = 500;

        // Calculate position at arc outer edge
        const angleRad = mid * Math.PI / 180;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        // Position card outside arcs but ensure it stays away from center
        // Center is at 260,260 with radius ~88px
        // We need cards to be outside center + some margin
        const centerRadius = 100; // Safe distance from center (88px + margin)
        const cardPlacementRadius = Math.max(OUTER + 10, centerRadius + Math.max(cardW, cardH) / 2);

        const [arcX, arcY] = pt(cardPlacementRadius, mid);

        let left, top;
        const offset = 8;

        // Position card based on quadrant
        if (cos > 0) {
            left = arcX + offset;
        } else {
            left = arcX - cardW - offset;
        }

        if (sin > 0) {
            top = arcY + offset;
        } else {
            top = arcY - cardH - offset;
        }

        // Constrain within container, but prioritize staying away from center
        const edgePadding = 5;
        left = Math.max(edgePadding, Math.min(left, containerW - cardW - edgePadding));
        top = Math.max(edgePadding, Math.min(top, containerH - cardH - edgePadding));

        // Final check: ensure card doesn't overlap with center circle
        // If card is too close to center, push it to container edge
        const cardCenterX = left + cardW / 2;
        const cardCenterY = top + cardH / 2;
        const distFromCenter = Math.sqrt(Math.pow(cardCenterX - CX, 2) + Math.pow(cardCenterY - CY, 2));

        if (distFromCenter < centerRadius + Math.max(cardW, cardH) / 2) {
            // Push card to appropriate edge based on angle
            if (Math.abs(cos) > Math.abs(sin)) {
                // Horizontal positioning dominates
                if (cos > 0) {
                    left = containerW - cardW - edgePadding;
                } else {
                    left = edgePadding;
                }
            } else {
                // Vertical positioning dominates
                if (sin > 0) {
                    top = containerH - cardH - edgePadding;
                } else {
                    top = edgePadding;
                }
            }
        }

        return { left, top };
    }

    let enpowerCurrent = -1;
    const infoCard = document.getElementById('enpowerInfoCard');
    const ctNum = document.getElementById('enpowerCtNum');

    function activateEnpowerSegment(idx) {
        if (idx === enpowerCurrent) return;
        enpowerCurrent = idx;

        segGroup.querySelectorAll('.enpower-seg-arc').forEach((a, i) => {
            a.style.opacity = i === idx ? '1' : i < idx ? '0.65' : '0.95';
            a.style.filter = i === idx ? `drop-shadow(0 3px 12px ${SEG_DATA[i].color}55)` : 'none';
        });
        segGroup.querySelectorAll('.enpower-seg-label').forEach((l, i) => {
            l.setAttribute('opacity', i === idx ? '1' : i < idx ? '0.45' : '0.18');
            l.setAttribute('font-weight', i === idx ? '700' : '600');
        });
        segGroup.querySelectorAll('.enpower-seg-icon').forEach((ic, i) => {
            ic.setAttribute('opacity', i === idx ? '1' : i < idx ? '0.5' : '0.3');
            ic.style.transition = 'opacity 0.55s ease';
        });

        if (idx >= 0 && idx < SEG_DATA.length) {
            const seg = SEG_DATA[idx];
            ctNum.textContent = `Skill Pillar #${seg.num}`;
            ctNum.style.fill = seg.color;

            const pos = cardPos(idx);
            infoCard.style.setProperty('--card-color', seg.color);
            infoCard.style.left = pos.left + 'px';
            infoCard.style.top = pos.top + 'px';
            infoCard.innerHTML = `
                        <div class="enpower-card-tag">${seg.tag}</div>
                        <h4>${seg.heading}</h4>
                        <ul>${seg.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
            infoCard.classList.add('visible');
        } else {
            infoCard.classList.remove('visible');
            ctNum.textContent = 'Skill Pillar';
            ctNum.style.fill = '#1a1a2e';
        }
    }

    // --- Pin section and animate radial on scroll ---
    const N = SEG_DATA.length;
    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + (window.innerHeight * 1.5),
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(progressFill, { width: (progress * 100) + '%' });

            if (progress < 0) {
                activateEnpowerSegment(-1);
                return;
            }
            const idx = Math.min(Math.floor(progress / (1 / N)), N - 1);
            activateEnpowerSegment(idx);
        }
    });

    ScrollTrigger.refresh();
}

