document.addEventListener('DOMContentLoaded', () => {

    // --- ASYNCHRONOUS DATA FETCHING ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Could not fetch data from ${url}:`, error);
            return null;
        }
    }

    // --- INITIALIZE THE SITE ---
    async function initializeSite() {
        // Fetch all data concurrently
        const [projects, timelineEvents, config, skills, experiences] = await Promise.all([
            fetchData('data/projects.json'),
            fetchData('data/timeline.json'),
            fetchData('data/config.json'),
            fetchData('data/skills.json'),
            fetchData('data/experiences.json')
        ]);

        // Render content if data is available. Provide a fallback for experiences
        // so the timeline still shows when fetch fails (common when opening
        // pages via file:// without a local server).
    if (projects) renderProjects(projects);
    if (timelineEvents) renderTimeline(timelineEvents);
    if (config) updateStaticContent(config);
    if (skills) renderSkills(skills);

    console.debug('initializeSite: fetched data', { projects, timelineEvents, config, skills, experiences });

    const fallbackExperiences = [
            {
                "role": "Summer Assistant",
                "company": "Family Day Daycare",
                "date": "Jun 2025 — Aug 2025",
                "points": [
                "Supported educators with daily classroom routines, supervision, and safe transitions.",
                "Assisted with planning and running age-appropriate activities (literacy, art, outdoor play).",
                "Maintained a clean, organized environment and followed health/safety procedures.",
                "Built strong communication skills by collaborating with staff and engaging with children."
                ],
                "skills": ["JavaScript", "React", "Node.js"]
            },
            {
                "role": "Co-founder SkilledStack",
                "company": "SkilledStack",
                "date": "Sep 2024 — Present",
                "points": [
                "Built and launched modern websites for local clients using HTML/CSS/JavaScript.",
                "Handled client communication, requirements gathering, and weekly progress updates.",
                "Improved site performance, mobile responsiveness, and accessibility across pages.",
                "Managed hosting, deployments, and quick iteration based on client feedback."
                ],
                "skills": ["HTML", "CSS", "JavaScript"]
            },
            {
                "role": "TryHackMe Student",
                "company": "TryHackMe",
                "date": "Sep 2025 — Present",
                "points": [
                "Completed hands-on cybersecurity labs focused on networking, Linux, and web security.",
                "Practiced recon, vulnerability basics, and safe testing methodologies in guided rooms.",
                "Documented learnings and created small scripts/tools to automate simple tasks.",
                "Built consistency through weekly training and skill progression."
                ],
                "skills": ["Accessibility", "Cyber Security", "WordPress"]
            },
            {
                "role": "Hack Club Flagship",
                "company": "TryHackMe",
                "date": "60 hour Challenge",
                "points": [
                "Built a project from scratch during a 60-hour challenge with rapid iteration.",
                "Designed the UI, structured components cleanly, and shipped a working MVP.",
                "Focused on clean code, responsiveness, and small visual polish improvements.",
                "Tracked progress, solved bugs fast, and pushed updates consistently."
                ],
                "skills": ["JavaScript", "CSS", "HTML"]
            }
        ];

    if (!experiences) console.warn('experiences.json not found or failed to load; using fallback data for timeline.');
    const experiencesData = experiences || window.__FALLBACK_EXPERIENCES || fallbackExperiences;
    if (experiencesData) renderExperiences(experiencesData);

        // Initialize all interactive elements
        initializeInteractiveElements();
    }

    // --- RENDER DYNAMIC CONTENT ---

    // ADD THIS ENTIRE NEW FUNCTION to main.js
        function renderExperiences(experiences) {
        const containers = document.querySelectorAll('.experience-timeline-container');
        if (!containers.length) return;

        const safeExperiences = Array.isArray(experiences) ? experiences : [];

        containers.forEach(container => {
            const limit = Number.parseInt(container.dataset.limit || '0', 10);
            const items = (limit > 0) ? safeExperiences.slice(0, limit) : safeExperiences;

            if (!items.length) {
            container.innerHTML = `<p style="color: var(--ink-light); text-align:center;">No experiences found.</p>`;
            return;
            }

            container.innerHTML = items.map(exp => {
            const points = Array.isArray(exp.points) ? exp.points : [];
            const skills = Array.isArray(exp.skills) ? exp.skills : [];

            return `
                <div class="experience-card">
                <h3 class="experience-role">${exp.role ?? ''}</h3>
                <p class="experience-company">${exp.company ?? ''}</p>
                <p class="experience-date">${exp.date ?? ''}</p>

                ${points.length ? `
                    <ul class="experience-points">
                    ${points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                ` : ''}

                ${skills.length ? `
                    <div class="project-tags">
                    ${skills.map(skill => `<span>${skill}</span>`).join('')}
                    </div>
                ` : ''}
                </div>
            `;
            }).join('');
        });
        }

    function renderProjects(projects) {
        // This new selector is more robust and finds the project grid on any page.
        const container = document.querySelector('#projects .grid-2, #project-grid .grid-2');
        if (!container) return; // If it's not on the current page, do nothing.

        container.innerHTML = projects.map(p => `
            <div class="project-card">
                <img src="${p.cover}" alt="${p.title}">
                <div class="project-card-content">
                    <h3>${p.title}</h3>
                    <p>${p.summary}</p>
                    <div class="project-tags">${p.stack.map(t => `<span>${t}</span>`).join('')}</div>
                    <a href="${p.link}" class="btn btn-outline">Case Study</a>
                </div>
            </div>
        `).join('');
    }

    function renderSkills(skills) {
        const marqueeContainers = document.querySelectorAll('.skills-marquee');
        if (!marqueeContainers.length) return;

        const skillColors = ['#9F9CF3', '#A7F3D0', '#FECACA', '#FDE68A', '#BFDBFE'];
        let colorIndex = 0;

        const skillChipsHTML = skills.map(skill => {
            const color = skillColors[colorIndex % skillColors.length];
            colorIndex++;
            return `
                <div class="skill-chip" style="background-color: ${color}; color: #0F1226;">
                    <span>${skill.name}</span>
                    <span class="skill-level">${skill.level}%</span>
                </div>
            `;
        }).join('');

        marqueeContainers.forEach(container => {
            container.innerHTML = skillChipsHTML;
        });
    }

    function renderTimeline(timelineEvents) {
        const container = document.querySelector('.timeline-container');
        if (!container) return;
        timelineEvents.forEach((event, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.style.transitionDelay = `${index * 0.15}s`;
            item.innerHTML = `
                <div class="timeline-date">${event.date}</div>
                <h3 class="timeline-title">${event.title}</h3>
                <p>${event.description}</p>
            `;
            container.appendChild(item);
        });
    }
    
    // --- UPDATE STATIC CONTENT ---
    function updateStaticContent(config) {
        // Example: Update resume link if it exists
        const resumeLink = document.querySelector('a[href="#"]'); // A more specific selector is better
        if (resumeLink && config.resumeUrl) {
            resumeLink.href = config.resumeUrl;
        }
    }

    // --- INITIALIZE INTERACTIVE ELEMENTS (All the old code goes here) ---
    function initializeInteractiveElements() {
        lucide.createIcons();


        const fixSafariAnimation = () => {
            const marquee = document.querySelector('.skills-marquee-container');
            if (!marquee) return;

            // 1. Temporarily remove the animation from the element's style
            marquee.style.animation = 'none';

            // 2. Trigger a "reflow". This is the magic step.
            // Accessing offsetHeight makes the browser recalculate the element's layout.
            void marquee.offsetHeight;

            // 3. Add the animation back. The browser now sees it as a "new" change.
            marquee.style.animation = '';
        };
        // We run this after a tiny delay to make sure the page is fully ready.
        setTimeout(fixSafariAnimation, 100);
        

        // --- STATS COUNTER ANIMATION ---
        const animateStatNumbers = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = +el.getAttribute('data-target');
                    let current = 0;
                    const increment = target / 100;

                    const updateCount = () => {
                        current += increment;
                        if (current < target) {
                            el.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCount);
                        } else {
                            el.innerText = target;
                        }
                    };
                    requestAnimationFrame(updateCount);
                    observer.unobserve(el);
                }
            });
        };
        const statObserver = new IntersectionObserver(animateStatNumbers, { threshold: 0.5 });
        document.querySelectorAll('.stat-number').forEach(num => statObserver.observe(num));


        // Navbar scroll logic...
        const navbar = document.getElementById('navbar');
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
            if (lastScrollY < window.scrollY && window.scrollY > 100) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            lastScrollY = window.scrollY;
        });

        // Theme toggle logic...
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;
        // Only toggle the `dark` class. Default (no class) is dark mode now.
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                html.classList.toggle('dark');
            });
        }

        // Mobile menu logic...
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuToggle && mobileMenu) mobileMenuToggle.addEventListener('click', () => mobileMenu.classList.add('visible'));
    if (mobileMenuClose && mobileMenu) mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('visible'));

        // ADD THIS NEW SNIPPET for the resume modal
        const resumeBtn = document.getElementById('resume-cta-btn');
        const modalOverlay = document.getElementById('resume-modal-overlay');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        const openModal = () => {
            modalOverlay.classList.add('visible');
            document.body.classList.add('modal-open');
        };

        const closeModal = () => {
            modalOverlay.classList.remove('visible');
            document.body.classList.remove('modal-open');
        };

        if (resumeBtn) {
            resumeBtn.addEventListener('click', openModal);
        }
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeModal);
        }
        if (modalOverlay) {
            // Close modal when clicking on the background overlay itself
            modalOverlay.addEventListener('click', (event) => {
                if (event.target === modalOverlay) {
                    closeModal();
                }
            });
            // Close modal with the Escape key
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && modalOverlay.classList.contains('visible')) {
                    closeModal();
                }
            });
        }
        // END of new snippet

        // Intersection Observer for scroll animations...
        const animatedElements = document.querySelectorAll('.animated-section, .timeline-container');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        animatedElements.forEach(el => observer.observe(el));

        // Parallax scrolling logic...
        const heroContent = document.querySelector('#hero .container');
        const background = document.getElementById('animated-background');
        window.addEventListener('scroll', () => {
            const offset = window.pageYOffset;
            if(heroContent) {
                heroContent.style.transform = `translateY(${offset * 0.4}px)`;
                heroContent.style.opacity = 1 - offset / 600;
            }
            background.style.transform = `translateY(${offset * 0.5}px)`;
        });
    }

    // --- START THE APP ---
    initializeSite();
});