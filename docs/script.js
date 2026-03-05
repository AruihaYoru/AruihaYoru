document.addEventListener("DOMContentLoaded", () => {
    // 1. Theme Toggle Logic
    const toggle = document.querySelector('.theme-toggle');
    const body = document.body;
    let isDark = false;

    if (toggle) {
        toggle.addEventListener('click', () => {
            isDark = !isDark;
            body.setAttribute('data-theme', isDark ? 'dark' : 'light');
            toggle.innerText = isDark ? 'Lumina' : 'Obscura';

            // Adjust background for manual toggle if needed
            if (isDark) {
                body.style.background = '#020203';
                body.style.color = '#fcfcfc';
                body.style.setProperty('--accent', '#d4af37');
            } else {
                body.style.background = '#ffffff';
                body.style.color = '#0a0a0a';
                body.style.setProperty('--accent', 'var(--accent-light)');
            }
        });
    }

    // 2. Scroll Progress & Dynamic Transitions
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

        // Dynamic accent and text color adjustment - Sharp switch at 50%
        if (scrollPercent >= 50 && !isDark) {
            body.style.background = '#020203';
            body.style.color = '#fcfcfc';
            body.style.setProperty('--accent', '#d4af37');
        } else if (scrollPercent < 50 && !isDark) {
            body.style.background = '#ffffff';
            body.style.color = '#0a0a0a';
            body.style.setProperty('--accent', 'var(--accent-light)');
        }

        // Parallax for Hero with Skew preserve
        const heroH1 = document.querySelector('.hero-main h1');
        if (heroH1) {
            const shift = window.scrollY * 0.18;
            heroH1.style.transform = `translateY(${shift}px) skewY(-6deg) rotate(-2deg)`;
        }
    });

    // 3. Reveal Animations (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 4. Dynamic Data Injection (Client Stats)
    const updateStats = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const { ip } = await res.json();
            const details = await (await fetch(`https://ipapi.co/${ip}/json/`)).json();

            const stats = {
                'IP Address': ip,
                'Node Location': `${details.city}, ${details.country_name}`,
                'Browser': navigator.userAgent.split(' ')[0],
                'Timezone': details.timezone
            };

            const items = document.querySelectorAll('.status-list li');
            items.forEach(li => {
                const label = li.querySelector('span').innerText.replace(': ', '');
                if (stats[label]) {
                    li.innerHTML = `<span>${label}: </span>${stats[label]}`;
                }
            });
        } catch (e) {
            console.log("Archive access restricted.");
        }
    };

    updateStats();

    // 5. Name Slider (AruihaYoru Variants)
    const nameEl = document.getElementById('aruiha-name');
    const names = [
        "或いは夜",
        "AruihaYoru",
        "Or Night",
        "Ou la Nuit",
        "O la Noche",
        "Oder Nacht"
    ];
    let nameIdx = 0;

    if (nameEl) {
        setInterval(() => {
            nameEl.style.opacity = '0';
            nameEl.style.transform = 'translateY(1rem)';

            setTimeout(() => {
                nameIdx = (nameIdx + 1) % names.length;
                nameEl.innerText = names[nameIdx];
                nameEl.style.transform = 'translateY(-1rem)';

                setTimeout(() => {
                    nameEl.style.opacity = '1';
                    nameEl.style.transform = 'translateY(0)';
                }, 50);
            }, 500);
        }, 3000);
    }

    // 6. Ambient Background Elements
    const phrases = ["MEMENTO MORI", "AMOR FATI", "NON DUCOR DUCO", "ARS LONGA"];
    const canvas = document.querySelector('.canvas');
    phrases.forEach((text, i) => {
        const emblem = document.createElement('div');
        emblem.className = 'latin-float';
        emblem.style.cssText = `
            position: absolute;
            font-family: var(--font-mono) !important;
            font-size: 0.55rem;
            letter-spacing: 0.6em;
            opacity: 0.08;
            top: ${30 + i * 40}vh;
            left: ${10 + Math.random() * 70}vw;
            pointer-events: none;
            z-index: 1;
            transform: rotate(-90deg);
        `;
        emblem.innerText = text;
        canvas.appendChild(emblem);
    });
});
