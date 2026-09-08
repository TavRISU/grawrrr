// LAYER 4 — Floating Underwater Bubbles Canvas System
const canvas = document.getElementById('ocean-canvas');
const ctx = canvas.getContext('2d');
let bubbles = [];
let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBubbles();
}

class Bubble {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 80;
        // Varying sizes
        this.radius = Math.random() * 4.5 + 1.2;
        // Varying speeds
        this.speed = Math.random() * 1.2 + 0.4;
        // Varying opacity
        this.alpha = Math.random() * 0.45 + 0.15;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
    }
    update() {
        if (prefersReducedMotion) return;
        this.y -= this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.4;

        if (this.y < -20) {
            this.reset();
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${this.alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha + 0.25})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
    }
}

function initBubbles() {
    bubbles = [];
    // Responsive bubble density: lower count on smaller screens
    let count = window.innerWidth < 640 ? 18 : (window.innerWidth < 1024 ? 30 : 45);
    if (prefersReducedMotion) count = 8; // minimal static bubbles if reduced motion

    for (let i = 0; i < count; i++) {
        bubbles.push(new Bubble());
    }
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(b => {
        b.update();
        b.draw();
    });
    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animateCanvas();

// Mobile Menu Navigation Toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Gallery Filtering Functionality
const filterBtns = document.querySelectorAll('.gallery-filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
            b.classList.remove('bg-gura-cyan', 'text-ocean-950');
            b.classList.add('glass-card', 'text-slate-300');
        });
        btn.classList.add('bg-gura-cyan', 'text-ocean-950');
        btn.classList.remove('glass-card', 'text-slate-300');

        const filter = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Lightbox Modal
function openLightbox(title, desc, imgSrc) {
    const titleEl = document.getElementById('lightbox-title');
    const descEl = document.getElementById('lightbox-desc');
    const imgEl = document.getElementById('lightbox-img');
    const modalEl = document.getElementById('lightbox-modal');

    if (titleEl && descEl && imgEl && modalEl) {
        titleEl.innerText = title;
        descEl.innerText = desc;
        imgEl.src = imgSrc;
        modalEl.classList.remove('hidden');
    }
}

function closeLightbox() {
    const modalEl = document.getElementById('lightbox-modal');
    if (modalEl) {
        modalEl.classList.add('hidden');
    }
}

const lightboxModal = document.getElementById('lightbox-modal');
if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox-modal') {
            closeLightbox();
        }
    });
}

// Interactive Web Audio API Synthesizer Music Player
let audioCtx = null;
let isPlaying = false;
let currentTrackIndex = 0;
let playbackTimer = null;
let currentSeconds = 0;

const tracks = [
    {
        title: "REFLECT (Synth Edition)",
        artist: "Gawr Gura • Hololive EN",
        cover: "https://placehold.co/400x400/0a1733/00f2fe?text=REFLECT+Album",
        freqs: [261.63, 329.63, 392.00, 523.25]
    },
    {
        title: "DINO LESSON (Theme Synth)",
        artist: "Gawr Gura • Original Track",
        cover: "https://placehold.co/400x400/0a1733/ffd166?text=DINO+LESSON",
        freqs: [293.66, 369.99, 440.00, 587.33]
    },
    {
        title: "SHINKAI Ocean Melody",
        artist: "Gawr Gura • Atlantis Instrumental",
        cover: "https://placehold.co/400x400/0a1733/4facfe?text=SHINKAI+Ocean",
        freqs: [220.00, 277.18, 329.63, 440.00]
    }
];

const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const playerCover = document.getElementById('player-cover');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const eqBars = document.querySelectorAll('.eq-bar');

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
}

function playSynthBeep(freq) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch(e) {}
}

function animateEqualizer() {
    if (!isPlaying) {
        eqBars.forEach(b => b.style.height = '6px');
        return;
    }
    eqBars.forEach(b => {
        const h = Math.floor(Math.random() * 28) + 6;
        b.style.height = `${h}px`;
    });
}

function togglePlay() {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    isPlaying = !isPlaying;

    if (isPlaying) {
        if (playIcon) {
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        }
        
        playbackTimer = setInterval(() => {
            currentSeconds++;
            if (currentSeconds > 90) currentSeconds = 0;
            
            const percent = (currentSeconds / 90) * 100;
            if (progressBar) progressBar.style.width = `${percent}%`;
            
            const min = Math.floor(currentSeconds / 60);
            const sec = currentSeconds % 60;
            if (currentTimeEl) currentTimeEl.innerText = `${min}:${sec < 10 ? '0' : ''}${sec}`;

            const freqs = tracks[currentTrackIndex].freqs;
            const randomFreq = freqs[Math.floor(Math.random() * freqs.length)];
            playSynthBeep(randomFreq);

            animateEqualizer();
        }, 1000);

    } else {
        if (playIcon) {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        }
        clearInterval(playbackTimer);
        animateEqualizer();
    }
}

function loadTrack(index) {
    currentTrackIndex = index;
    if (songTitle) songTitle.innerText = tracks[index].title;
    if (artistName) artistName.innerText = tracks[index].artist;
    if (playerCover) playerCover.src = tracks[index].cover;
    currentSeconds = 0;
    if (progressBar) progressBar.style.width = '0%';
    if (currentTimeEl) currentTimeEl.innerText = '0:00';
    
    if (isPlaying) {
        clearInterval(playbackTimer);
        isPlaying = false;
        togglePlay();
    }
}

if (playBtn) playBtn.addEventListener('click', togglePlay);

const prevBtn = document.getElementById('prev-btn');
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        let nextIndex = currentTrackIndex - 1;
        if (nextIndex < 0) nextIndex = tracks.length - 1;
        loadTrack(nextIndex);
    });
}

const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        let nextIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(nextIndex);
    });
}

// Interactive Message Editor Functionality
let isEditingMsg = false;
function toggleEditMessage() {
    const displayDiv = document.getElementById('message-display');
    const editorDiv = document.getElementById('message-editor');
    const btnText = document.getElementById('edit-btn-text');
    const msgParagraph = document.getElementById('msg-text-paragraph');
    const customInput = document.getElementById('custom-msg-input');

    if (!displayDiv || !editorDiv || !btnText || !msgParagraph || !customInput) return;

    isEditingMsg = !isEditingMsg;

    if (isEditingMsg) {
        displayDiv.classList.add('hidden');
        editorDiv.classList.remove('hidden');
        btnText.innerText = "Simpan Pesan";
    } else {
        msgParagraph.innerText = `"${customInput.value.trim() || 'Thank you Gawr Gura!'}"`;
        editorDiv.classList.add('hidden');
        displayDiv.classList.remove('hidden');
        btnText.innerText = "Edit Pesan";
    }
}

// RANDOM IMAGE DOODLE SYSTEM
const DOODLE_CONFIG = {
    basePath: 'assets/img/doodles/',
    doodleFiles: [
        'gura-doodle-01.png',
        'gura-doodle-02.png',
        'gura-doodle-03.png',
        'gura-doodle-04.png',
        'gura-doodle-05.png',
        'gura-doodle-06.png',
        'gura-doodle-07.png',
        'gura-doodle-08.png'
    ],
    // Embedded high quality SVG Data URIs for instant preview/fallback if PNG doesn't exist locally
    fallbacks: [
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="%230f234d" stroke="%2300f2fe" stroke-width="3"/><text x="50" y="65" font-size="45" font-family="Fredoka,sans-serif" font-weight="bold" fill="%2300f2fe" text-anchor="middle">a</text></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 15 L80 85 L50 70 L20 85 Z" fill="%2300f2fe" stroke="%23ffffff" stroke-width="2"/><text x="50" y="55" font-size="18" font-family="sans-serif" font-weight="bold" fill="%230a1733" text-anchor="middle">SHARK</text></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 50 Q50 10 80 50 Q50 90 20 50 Z" fill="%231e489c" stroke="%2300f2fe" stroke-width="3"/><circle cx="40" cy="45" r="5" fill="%23ffffff"/><circle cx="40" cy="45" r="2" fill="%23000000"/><polygon points="60,45 75,50 60,55" fill="%23ffffff"/></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" fill="%23ffd166" stroke="%23ffffff" stroke-width="2"/></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="50" rx="15" fill="%230a1733" stroke="%234facfe" stroke-width="3"/><text x="50" y="58" font-size="28" font-family="sans-serif" font-weight="bold" fill="%23ff6b8b" text-anchor="middle">GAWR</text></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M30 80 C20 50 20 30 50 20 C80 30 80 50 70 80 Z" fill="%2300f2fe" opacity="0.8" stroke="%23ffffff" stroke-width="2"/><circle cx="40" cy="40" r="4" fill="%23000"/><circle cx="60" cy="40" r="4" fill="%23000"/><path d="M42 55 Q50 62 58 55" stroke="%23000" stroke-width="3" fill="none"/></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,10 65,40 98,40 72,60 82,90 50,70 18,90 28,60 2,40 35,40" fill="%2300f2fe" stroke="%23ffffff" stroke-width="2"/></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="%23ff6b8b" stroke="%23ffffff" stroke-width="3"/><text x="50" y="62" font-size="32" font-family="Fredoka,sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">🔱</text></svg>`
    ]
};

class GuraDoodleSystem {
    constructor() {
        this.container = document.getElementById('doodle-container');
        this.doodleElements = [];
        this.activeSectionId = 'home';
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!this.container) return;

        this.init();
    }

    getDensityCount() {
        const width = window.innerWidth;
        if (width >= 1024) {
            return Math.floor(Math.random() * 3) + 7; // 7 to 9 on desktop
        } else if (width >= 640) {
            return Math.floor(Math.random() * 3) + 4; // 4 to 6 on tablet
        } else {
            return Math.floor(Math.random() * 3) + 2; // 2 to 4 on mobile
        }
    }

    // Safe zones positioning: Keeps doodles in peripheral gutters & empty spaces
    generateSafePosition(index, total) {
        const width = window.innerWidth;
        const isLeftMargin = (index % 2 === 0);
        
        let minX, maxX;
        if (width >= 1024) {
            minX = isLeftMargin ? 1 : 84;
            maxX = isLeftMargin ? 16 : 98;
        } else if (width >= 640) {
            minX = isLeftMargin ? 1 : 88;
            maxX = isLeftMargin ? 12 : 98;
        } else {
            minX = isLeftMargin ? 1 : 89;
            maxX = isLeftMargin ? 10 : 98;
        }

        const segmentHeight = 85 / total;
        const minY = 8 + (index * segmentHeight);
        const maxY = Math.min(88, minY + segmentHeight - 2);

        const posX = (Math.random() * (maxX - minX) + minX).toFixed(1);
        const posY = (Math.random() * (maxY - minY) + minY).toFixed(1);

        return { x: posX, y: posY };
    }

    createDoodleElement(index) {
        const img = document.createElement('img');
        img.className = 'gura-doodle-sticker';
        
        const doodleFileName = DOODLE_CONFIG.doodleFiles[index % DOODLE_CONFIG.doodleFiles.length];
        const primarySrc = `${DOODLE_CONFIG.basePath}${doodleFileName}`;
        const fallbackSrc = DOODLE_CONFIG.fallbacks[index % DOODLE_CONFIG.fallbacks.length];

        img.src = primarySrc;
        img.alt = 'Gawr Gura Doodle Sticker';
        img.setAttribute('aria-hidden', 'true');

        // Graceful fallback if file does not exist in local assets directory
        img.onerror = () => {
            img.onerror = null;
            img.src = fallbackSrc;
        };

        this.container.appendChild(img);
        return img;
    }

    applyRandomStyles(img, posIndex, totalCount) {
        const pos = this.generateSafePosition(posIndex, totalCount);
        
        const isMobile = window.innerWidth < 640;
        const minSize = isMobile ? 45 : 70;
        const maxSize = isMobile ? 75 : 125;
        const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

        const angle = (Math.random() * 50 - 25).toFixed(1);
        const opacity = (Math.random() * 0.33 + 0.55).toFixed(2);

        img.style.width = `${size}px`;
        img.style.height = 'auto';
        img.style.left = `${pos.x}%`;
        img.style.top = `${pos.y}%`;
        img.style.opacity = '0';
        img.style.setProperty('--doodle-angle', `${angle}deg`);

        img.classList.remove('animate-doodle-float-1', 'animate-doodle-float-2');
        if (!this.isReducedMotion) {
            const animClass = (posIndex % 2 === 0) ? 'animate-doodle-float-1' : 'animate-doodle-float-2';
            img.classList.add(animClass);
        }

        setTimeout(() => {
            img.style.transform = `translate(0, 0) rotate(${angle}deg)`;
            img.style.opacity = opacity;
        }, 50 + posIndex * 60);
    }

    renderDoodles() {
        const targetCount = this.getDensityCount();

        while (this.doodleElements.length > targetCount) {
            const oldImg = this.doodleElements.pop();
            oldImg.style.opacity = '0';
            setTimeout(() => oldImg.remove(), 700);
        }

        while (this.doodleElements.length < targetCount) {
            const img = this.createDoodleElement(this.doodleElements.length);
            this.doodleElements.push(img);
        }

        this.doodleElements.forEach((img, idx) => {
            img.style.opacity = '0';
            setTimeout(() => {
                this.applyRandomStyles(img, idx, targetCount);
            }, 250);
        });
    }

    setupSectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0.25
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const newSectionId = entry.target.id;
                    if (newSectionId !== this.activeSectionId) {
                        this.activeSectionId = newSectionId;
                        this.renderDoodles();
                    }
                }
            });
        }, observerOptions);

        sections.forEach(sec => observer.observe(sec));
    }

    init() {
        this.renderDoodles();
        this.setupSectionObserver();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.renderDoodles();
            }, 300);
        });
    }
}

window.addEventListener('DOMContentLoaded', function () {
    console.log("Layered Background Gawr Gura Prototype Ready!");
    // Initialize Random Gura Doodle Sticker System
    new GuraDoodleSystem();
});