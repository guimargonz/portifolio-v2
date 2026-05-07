document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL VARIABLES ---
    let allProjects = [];
    const loadedTranslations = {}; // Cache for loaded language files

    // --- DATA FETCHING ---
    async function fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return response.json();
    }

    // --- RENDER FUNCTIONS ---
    function renderProfile(profile) {
        document.getElementById('hero-name').textContent = profile.name;
    }

    // *** NEW FUNCTION ***
    // Renders the skills into the skills grid
    function renderSkills(skills) {
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = ''; // Clear existing skills

        const skillsHTML = skills.map(skill => `<span>${skill}</span>`).join('');
        skillsContainer.innerHTML = skillsHTML;
    }

    function renderProjects(projects, translations) {
        const frontendGrid = document.getElementById('frontend-grid');
        const backendGrid = document.getElementById('backend-grid');

        frontendGrid.innerHTML = '';
        backendGrid.innerHTML = '';

        projects.forEach(project => {
            const linksHTML = `
                ${project.links.demo ? `<a href="${project.links.demo}" target="_blank" rel="noopener noreferrer" class="project-link">Live Demo</a>` : ''}
                ${project.links.code ? `<a href="${project.links.code}" target="_blank" rel="noopener noreferrer" class="project-link">View Code</a>` : ''}
            `;

            const cardHTML = `
                <div class="project-card">
                    <div class="project-image">
                        <img src="${project.image}" alt="${translations[project.title_key] || project.title_key}">
                    </div>
                    <div class="project-info">
                        <h3 class="project-title">${translations[project.title_key] || project.title_key}</h3>
                        <p class="project-description">${translations[project.description_key] || project.description_key}</p>
                        <div class="project-tags">
                            ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                        <div class="project-links">
                            ${linksHTML}
                        </div>
                    </div>
                </div>
            `;

            if (project.category === 'frontend') {
                frontendGrid.innerHTML += cardHTML;
            } else if (project.category === 'backend') {
                backendGrid.innerHTML += cardHTML;
            }
        });
    }

    // --- LANGUAGE AND TRANSLATION ---
    async function setLanguage(lang) {
        if (!loadedTranslations[lang]) {
            loadedTranslations[lang] = await fetchJSON(`data/translations/${lang}.json`);
        }
        const translations = loadedTranslations[lang];

        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        renderProjects(allProjects, translations);

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
    }

    // --- INITIALIZATION ---
    async function initialize() {
        try {
            const [profileData, projectsData] = await Promise.all([
                fetchJSON('data/profile.json'),
                fetchJSON('data/projects.json')
            ]);

            allProjects = projectsData;
            renderProfile(profileData);
            // *** CALL THE NEW FUNCTION ***
            renderSkills(profileData.skills); // Render the skills from the profile data

            document.querySelectorAll('.lang-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const selectedLang = button.getAttribute('data-lang');
                    setLanguage(selectedLang);
                    localStorage.setItem('preferredLanguage', selectedLang);
                });
            });

            const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
            await setLanguage(preferredLanguage);

            document.querySelectorAll('.nav-link, .cta-button[href^="#"]').forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
                });
            });

        } catch (error) {
            console.error('Initialization failed:', error);
        }
    }

    initialize();
});