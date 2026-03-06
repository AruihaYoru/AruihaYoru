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
        "或いは夜", // 日本語
        "AruihaYoru", // ローマ字表記
        "Or Night", // 英語
		"Aut Nox", // ラテン語
		"クンネ ネコンカ", // アイヌ語（あんま詳しくないんであってるかは知らん）
        "Ou la Nuit", // フランス語
        "もしは、よさり", // 雅語
        "O la Noche", // スペイン語
        "いなれば晩", // 薩摩方言
        "Oder Nacht", // ドイツ語
        "ありくいぬよぅ", // 琉球方言
        "أو ليل" // アラビア語
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
    const phrases = ["MEMENTO MORI", "AMOR FATI", "NON DUCOR DUCO", "ARS LONGA", "SIC ITUR AD ASTRA", "VIVERE EST COGITARE", "UMBRA ET IMAGO", "ET IN ARCADIA EGO"];
    const canvas = document.querySelector('.canvas');
    phrases.forEach((text, i) => {
        const emblem = document.createElement('div');
        emblem.className = 'latin-float';
        emblem.style.cssText = `
            position: absolute;
            font-family: var(--font-mono) !important;
            font-size: 0.55rem;
            letter-spacing: 0.6em;
            opacity: 0.01;
            top: ${Math.random() * 90}vh;
            left: ${10 + Math.random() * 70}vw;
            pointer-events: none;
            z-index: 1;
            transform: rotate(-90deg);
        `;
        emblem.innerText = text;
        canvas.appendChild(emblem);
    });
	
	// 7. clicker sound
	let tickerCtx;
	let tickerGain;
	let tickerInterval;
	let noiseBuffer;
	const tickerSlider = document.getElementById('ticker-volume');

	const createNoiseBuffer = (ctx) => {
		const bufferSize = ctx.sampleRate * 0.02;
		const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}
		return buffer;
	};

	const initTicker = () => {
		if (tickerCtx) {
			if (tickerCtx.state === 'suspended') {
				tickerCtx.resume();
			}
			return;
		}

		tickerCtx = new (window.AudioContext || window.webkitAudioContext)();
		tickerGain = tickerCtx.createGain();
		tickerGain.connect(tickerCtx.destination);

		const initialVolume = tickerSlider ? parseFloat(tickerSlider.value) : 0.2;
		tickerGain.gain.value = initialVolume * 5.0;

		noiseBuffer = createNoiseBuffer(tickerCtx);

		tickerInterval = setInterval(() => {
			if (tickerCtx.state === 'suspended') tickerCtx.resume();

			const now = tickerCtx.currentTime;
			const noise = tickerCtx.createBufferSource();
			noise.buffer = noiseBuffer;

			const filter = tickerCtx.createBiquadFilter();
			filter.type = 'bandpass';
			filter.frequency.setValueAtTime(2500, now);
			filter.Q.setValueAtTime(1, now);

			const envelope = tickerCtx.createGain();
			noise.connect(filter);
			filter.connect(envelope);
			envelope.connect(tickerGain);

			envelope.gain.setValueAtTime(0.5, now);
			envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

			noise.start(now);
			noise.stop(now + 0.02);
		}, 1000);

		if (tickerCtx.state === 'suspended') {
			console.warn('Autoplay blocked. Waiting for user interaction.');
		} else {
			console.log('Autoplay started successfully.');
		}
	};

	initTicker();

	if (tickerSlider) {
		tickerSlider.value = 0.2;
		tickerSlider.addEventListener('input', (e) => {
			initTicker();
			if (tickerGain) {
				tickerGain.gain.setTargetAtTime(parseFloat(e.target.value) * 5.0, tickerCtx.currentTime, 0.01);
			}
		});
	}

	document.addEventListener('click', () => {
		initTicker();
	}, { once: true });
	
	
	
    // 8. Dynamic Background Text Sizing
    const BG_CONFIG = {
        text: "MIYABI",
        font: "'impact', sans-serif",
        weight: "1000",
        baseSize: 100
    };

    const canvasBg = document.getElementById('background-text');

    const updateBgLayout = () => {
        if (!canvasBg) return;

        const ctx = canvasBg.getContext('2d');
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile = width < 900;

        const dpr = window.devicePixelRatio || 1;

        canvasBg.width = width * dpr;
        canvasBg.height = height * dpr;

        canvasBg.style.width = `${width}px`;
        canvasBg.style.height = `${height}px`;

        ctx.scale(dpr, dpr);

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#d4af37';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        ctx.font = `normal ${BG_CONFIG.weight} ${BG_CONFIG.baseSize}px ${BG_CONFIG.font}`;

        ctx.save();
        ctx.translate(width / 2, height / 2);

        const metrics = ctx.measureText(BG_CONFIG.text);
        const textWidth = metrics.width;

        const textHeight = BG_CONFIG.baseSize * 0.7;

        if (isMobile) {
            ctx.rotate(Math.PI / 2);
            ctx.scale(height / textWidth, width / textHeight);
        } else {
            ctx.scale(width / textWidth, height / textHeight);
        }

        ctx.fillText(BG_CONFIG.text, 0, 0);
        ctx.restore();
    };

    window.addEventListener('resize', updateBgLayout);

    const observerTheme = new MutationObserver(updateBgLayout);
    observerTheme.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'style'] });

    if (document.fonts) {
        document.fonts.load(`${BG_CONFIG.weight} 100px ${BG_CONFIG.font}`).then(() => {
            updateBgLayout();
        }).catch(err => {
            console.error("Font loading failed:", err);
            updateBgLayout();
        });
    } else {
        updateBgLayout();
    }

    // 9. Firebase Integration (Counter & Guestbook)
    const firebaseConfig = {
        apiKey: "AIzaSyDo2SgQbOLvyOgpqKa0cFuBxLTMrfZhqqQ",
        authDomain: "my-portfolio-counter-42d3c.firebaseapp.com",
        projectId: "my-portfolio-counter-42d3c",
        storageBucket: "my-portfolio-counter-42d3c.firebasestorage.app",
        messagingSenderId: "653888609053",
        appId: "1:653888609053:web:f3aafa1cadc24eec8cdff4",
        measurementId: "G-DSBKJGPGYG"
    };

    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();

        // Authentication & Observer
        auth.onAuthStateChanged(user => {
            if (user) {
                setupGuestbook(db, user);
            } else {
                auth.signInAnonymously().catch(e => {
                    console.error("Auth restriction:", e);
                    setupGuestbook(db, null);
                });
            }
        });

        // Visitor Counter
        const setupVisitorCounter = () => {
            const countRef = db.collection('site').doc('counter');
            const visitorCountElement = document.getElementById('visitor-count');
            const visitedKey = 'aruihayoru-portfolio-visited';

            countRef.onSnapshot(doc => {
                const count = doc.exists ? (doc.data().count || 0) : 0;
                if (visitorCountElement) visitorCountElement.textContent = count.toLocaleString();
            }, e => console.log("System log: restricted."));

            if (!localStorage.getItem(visitedKey)) {
                db.runTransaction(transaction => {
                    return transaction.get(countRef).then(doc => {
                        const newCount = doc.exists ? (doc.data().count || 0) + 1 : 1;
                        transaction.set(countRef, { count: newCount }, { merge: true });
                    });
                }).then(() => {
                    localStorage.setItem(visitedKey, 'true');
                }).catch(e => console.log("System log: update failed."));
            }
        };

        // Guestbook Display & Interaction
        const setupGuestbook = (db, currentUser) => {
            const signaturesRef = db.collection('signatures').orderBy('createdAt', 'desc');
            const listContainer = document.getElementById('signature-list');
            const nameInput = document.getElementById('signature-name');
            const submitBtn = document.getElementById('submit-signature');

            const VISIBLE_COUNT_PC = 6;
            const VISIBLE_COUNT_MOBILE = 3;

            if (submitBtn && nameInput) {
                // Remove old event for clean setup
                const newBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newBtn, submitBtn);

                newBtn.addEventListener('click', () => {
                    if (!currentUser) return;
                    const name = nameInput.value.trim();
                    if (!name) return;

                    newBtn.disabled = true;
                    newBtn.textContent = 'Recording...';

                    db.collection('signatures').add({
                        name: name,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        uid: currentUser.uid
                    }).then(() => {
                        nameInput.value = '';
                    }).finally(() => {
                        newBtn.disabled = false;
                        newBtn.textContent = '署名する';
                    });
                });
            }

            signaturesRef.onSnapshot(snapshot => {
                if (!listContainer) return;
                listContainer.innerHTML = '';

                if (snapshot.empty) {
                    listContainer.innerHTML = '<p style="text-align: center; opacity: 0.5;">No fragments found.</p>';
                    return;
                }

                const grid = document.createElement('div');
                grid.id = 'signature-grid';
                const items = [];

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString('ja-JP') : '';

                    const item = document.createElement('div');
                    item.className = 'signature-item';
                    item.innerHTML = `
                        <div class="content">
                            <span class="name">${data.name}</span>
                            <span class="date">${date}</span>
                        </div>
                        <div class="actions"></div>
                    `;

                    if (currentUser && currentUser.uid === data.uid) {
                        const actions = item.querySelector('.actions');
                        const editBtn = document.createElement('button');
                        editBtn.textContent = 'EDIT';
                        editBtn.onclick = () => {
                            const newName = prompt("Edit your fragment:", data.name);
                            if (newName && newName.trim()) {
                                db.collection('signatures').doc(doc.id).update({ name: newName.trim() });
                            }
                        };
                        const delBtn = document.createElement('button');
                        delBtn.textContent = 'ERASE';
                        delBtn.onclick = () => {
                            if (confirm("Erase this remains?")) {
                                db.collection('signatures').doc(doc.id).delete();
                            }
                        };
                        actions.appendChild(editBtn);
                        actions.appendChild(delBtn);
                    }

                    grid.appendChild(item);
                    items.push(item);
                });

                listContainer.appendChild(grid);

                // Pagination/Toggle
                let isExpanded = false; // Always start collapsed
                const threshold = window.innerWidth < 900 ? VISIBLE_COUNT_MOBILE : VISIBLE_COUNT_PC;

                if (items.length > threshold) {
                    const toggle = document.createElement('button');
                    toggle.id = 'toggle-signatures-btn';
                    listContainer.appendChild(toggle);

                    const updateView = () => {
                        const count = window.innerWidth < 900 ? VISIBLE_COUNT_MOBILE : VISIBLE_COUNT_PC;
                        items.forEach((item, i) => {
                            item.classList.toggle('is-hidden', i >= count && !isExpanded);
                        });
                        toggle.textContent = isExpanded ? 'Show Less' : 'Recover More Fragments';
                    };

                    toggle.onclick = () => {
                        isExpanded = !isExpanded;
                        updateView();
                    };
                    updateView();
                }
            });
        };

        setupVisitorCounter();
    }

});
