// Pour Lou — enveloppe, questions (seul « oui » marche), mini-jeu du bouquet, 3 cadeaux, lettre.
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const rand = (a, b) => a + Math.random() * (b - a);
const HEART = new Path2D('M12 21s-7.5-4.6-10-9.3C.2 8 2 4 6 4c2.3 0 3.8 1.3 6 3.6C14.2 5.3 15.7 4 18 4c4 0 5.8 4 4 7.7C19.5 16.4 12 21 12 21z');
const INK = '#4a3434';

/* ---------- le chat (dessiné ici, une humeur par visage) ---------- */
const FACES = {
    neutral: `<ellipse cx="50" cy="62" rx="5" ry="6.5" fill="${INK}"/><ellipse cx="90" cy="62" rx="5" ry="6.5" fill="${INK}"/><circle cx="52" cy="59" r="1.8" fill="#fff"/><circle cx="92" cy="59" r="1.8" fill="#fff"/><path d="M62 72q4 5 8 0q4 5 8 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    happy: `<path d="M42 64q8-11 16 0M82 64q8-11 16 0" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/><path d="M62 71q8 10 16 0z" fill="#e8798f" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`,
    sad: `<ellipse cx="50" cy="63" rx="5" ry="6.5" fill="${INK}"/><ellipse cx="90" cy="63" rx="5" ry="6.5" fill="${INK}"/><circle cx="52" cy="60" r="1.8" fill="#fff"/><circle cx="92" cy="60" r="1.8" fill="#fff"/><path d="M40 52l14-5M100 52l-14-5M63 77q7-7 14 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
    cry: `<path d="M42 62q8 6 16 0M82 62q8 6 16 0M40 52l14-5M100 52l-14-5M63 78q7-8 14 0" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/><path class="tear" d="M47 68q-4 7 0 9q4-2 0-9z" fill="#8fc8f0"/><path class="tear" d="M93 68q-4 7 0 9q4-2 0-9z" fill="#8fc8f0"/>`,
    love: `<path d="M50 70s-8-5-8-10.5c0-3.5 4-5 8-1 4-4 8-2.5 8 1C58 65 50 70 50 70zM90 70s-8-5-8-10.5c0-3.5 4-5 8-1 4-4 8-2.5 8 1C98 65 90 70 90 70z" fill="#e8798f" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M62 75q4 5 8 0q4 5 8 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
};
const cat = (mood) => `<svg viewBox="0 0 140 112" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 44L18 10q2-5 7-2l22 16q23-6 46 0l22-16q5-3 7 2l-6 34q16 22 8 44q-12 22-54 22T16 88q-8-22 8-44z" fill="#fff" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M26 18l13 9-11 7zM114 18l-13 9 11 7z" fill="#f7cdd4"/>
  <ellipse cx="36" cy="78" rx="9" ry="5" fill="#f7b6c3"/><ellipse cx="104" cy="78" rx="9" ry="5" fill="#f7b6c3"/>
  <path d="M10 70h14M12 78l13-3M130 70h-14M128 78l-13-3" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
  ${FACES[mood]}</svg>`;
function setMood(el, mood) { if (el.dataset.drawn !== mood) { el.innerHTML = cat(mood); el.dataset.drawn = mood; } el.dataset.mood = mood; }
$$('.cat-slot').forEach((el) => setMood(el, el.dataset.mood));

function popHearts(el, n = 6) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
        const h = document.createElement('span');
        h.className = 'pop-heart';
        h.innerHTML = '<svg viewBox="0 0 24 24"><use href="#heart"/></svg>';
        h.style.left = r.left + r.width / 2 + rand(-40, 30) + 'px';
        h.style.top = r.top + r.height / 3 + 'px';
        h.style.setProperty('--dx', rand(-70, 70) + 'px'); h.style.setProperty('--r', rand(-30, 30) + 'deg');
        h.style.animationDelay = i * 60 + 'ms';
        document.body.append(h); setTimeout(() => h.remove(), 1600);
    }
}

/* ---------- petits sons doux, générés ---------- */
let ac;
function pling(freq, when = 0, dur = .35, vol = .05) {
    try {
        ac ||= new AudioContext();
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + when;
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur);
    } catch { /* pas de son, pas grave */ }
}
const melody = (notes, step = .12) => notes.forEach((f, i) => pling(f, i * step));

/* ---------- pétales qui tombent ---------- */
const petals = (() => {
    const c = $('#petals'), x = c.getContext('2d');
    const cols = ['#f7cdd4', '#efa3b3', '#fbe3e8', '#e8798f'];
    let w, h, list = [], extra = 0;
    const make = (top) => ({ x: rand(0, w), y: top ? rand(-60, -10) : rand(0, h), s: rand(5, 10), v: rand(.4, 1.1), a: rand(0, 6.3), va: rand(-.03, .03), d: rand(0, 6.3), col: cols[Math.floor(rand(0, 4))] });
    const resize = () => { w = c.width = innerWidth; h = c.height = innerHeight; list = Array.from({ length: Math.min(36, w / 30) }, () => make(false)); };
    resize(); addEventListener('resize', resize);
    (function loop(t) {
        x.clearRect(0, 0, w, h);
        if (extra > 0 && Math.random() < .5) { list.push(make(true)); extra--; }
        for (const p of list) {
            p.y += p.v; p.x += Math.sin(t / 1400 + p.d) * .6; p.a += p.va;
            if (p.y > h + 20) Object.assign(p, make(true));
            x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = .75; x.fillStyle = p.col;
            x.beginPath(); x.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.3); x.fill(); x.restore();
        }
        requestAnimationFrame(loop);
    })(0);
    return { more: (n) => (extra += n) };
})();

/* ---------- navigation, montée comme un film : fondu au noir + carton de chapitre ---------- */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const CHAPTERS = {
    's-intro': ['Chapitre I', 'L\'enveloppe'], 's-quiz': ['Chapitre II', 'Les questions'], 's-game': ['Chapitre III', 'Le bouquet'],
    's-win': ['Chapitre IV', 'Les cadeaux'], 's-letter': ['Épilogue', 'La lettre'],
};
const seen = new Set();
const ENTER = {
    's-quiz': () => ask(0), 's-win': burst, 'g-flowers': drawBouquet,
    's-title': () => $('#s-title').classList.add('play'),
    's-credits': () => setTimeout(() => $('#replay').classList.add('on'), 30000),
};
function swap(id) {
    if ($('#g-music').classList.contains('is-active') && id !== 'g-music') stopMusic();
    $('.screen.is-active')?.classList.remove('is-active');
    $('#' + id).classList.add('is-active');
}
async function go(id) {
    const chapter = CHAPTERS[id] && !seen.has(id) && CHAPTERS[id];
    const cine = $('#' + id).classList.contains('cine');
    if (chapter || cine) {
        seen.add(id);
        document.body.classList.add('letterbox');
        $('#blackout').classList.add('on');
        await wait(1000);
        swap(id);
        if (chapter) {
            $('.card-num').textContent = chapter[0]; $('.card-title').textContent = chapter[1];
            $('#card').classList.add('on'); melody([392, 523, 659], .35);
            await wait(2800);
            $('#card').classList.remove('on');
            await wait(800);
        }
        if (!cine) document.body.classList.remove('letterbox');
        $('#blackout').classList.remove('on');
    } else {
        document.body.classList.remove('letterbox');
        swap(id); pling(880, 0, .2, .03);
    }
    ENTER[id]?.();
}

/* ---------- générique d'ouverture ---------- */
let titled = false;
const toTitle = () => { if (!titled) { titled = true; go('s-title'); } };
(async () => {
    document.body.classList.add('letterbox');
    await wait(600);
    for (const step of $$('#s-boot .boot-step')) {
        if (titled) return;
        step.classList.add('on'); await wait(3400);
        step.classList.remove('on'); await wait(1300);
    }
    toTitle();
})();
$('#skip').addEventListener('click', toTitle);
$('#press').addEventListener('click', () => { melody([523, 659, 784, 1047], .18); petals.more(40); go('s-intro'); });
$('#to-credits').addEventListener('click', () => go('s-credits'));
$$('[data-next]').forEach((b) => b.addEventListener('click', () => go(b.dataset.next)));
$('#replay').addEventListener('click', () => location.reload());

/* ---------- enveloppe ---------- */
$('#seal').addEventListener('click', () => {
    $('#envelope').classList.add('open');
    $('#intro-hint').hidden = true;
    setMood($('.env-cat'), 'happy');
    melody([659, 784, 988, 1319]);
    petals.more(50);
    setTimeout(() => { $('#to-quiz').hidden = false; }, 1700);
});
$('#to-quiz').addEventListener('click', () => go('s-quiz'));

/* ---------- questions ---------- */
const QUESTIONS = [
    ['Est-ce que tu sais que tu es la plus jolie ?', 'Bonne réponse.'],
    ['Est-ce que tu veux bien sourire, juste un peu, pour moi ?', 'Ce sourire, là.'],
    ['Est-ce que tu sais que je suis là pour toi, quoi qu\'il arrive ?', 'Toujours. Retiens-le.'],
    ['Est-ce que tu m\'aimes un peu ? Beaucoup ?', 'Je le savais.'],
    ['Est-ce que tu veux un bouquet de fleurs ?', 'Alors il va falloir le cueillir...'],
];
const SAD = ['Tu es sûre ?', 'Réfléchis bien...', 'Le chat est triste.', 'Non, ce bouton n\'existe pas vraiment.'];
let qi = 0, flees = 0;
const yes = $('#yes'), no = $('#no'), qcat = $('#quiz-cat');

function type(text) {
    $('#q-text').innerHTML = '<span>' + Array.from(text, (ch, i) => ch === ' ' ? ' ' : `<span class="c" style="animation-delay:${i * 28}ms">${ch}</span>`).join('') + '</span>';
    $('#q-text').setAttribute('aria-label', text);
}
function resetNo() { no.hidden = false; no.classList.remove('free'); no.style.left = no.style.top = ''; }
function ask(i) {
    qi = i; flees = 0; resetNo(); yes.style.scale = 1;
    setMood(qcat, 'neutral');
    $('#q-count').textContent = `question ${i + 1} sur ${QUESTIONS.length}`;
    $('#q-hint').textContent = '';
    type(QUESTIONS[i][0]);
}
function flee(px, py) {
    const r = no.getBoundingClientRect();
    if (!no.classList.contains('free')) {      // détaché sur place avant de bouger, sinon il saute
        no.style.left = r.left + 'px'; no.style.top = r.top + 'px'; no.classList.add('free'); no.offsetWidth;
    }
    let x, y, tries = 0;
    do { x = rand(16, innerWidth - r.width - 16); y = rand(16, innerHeight - r.height - 16); }
    while (Math.hypot(x + r.width / 2 - px, y + r.height / 2 - py) < 220 && ++tries < 30);
    no.style.left = x + 'px'; no.style.top = y + 'px';
    setMood(qcat, 'sad');
    $('#q-hint').textContent = SAD[flees % SAD.length];
    yes.style.scale = Math.min(1.7, 1 + ++flees * .1);   // plus elle hésite, plus le « oui » grossit
    pling(rand(300, 420), 0, .15, .03);
}
no.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') flee(e.clientX, e.clientY); });
no.addEventListener('click', () => {            // elle a réussi à cliquer : on recommence la question, sans le bouton
    no.hidden = true; no.classList.remove('free');
    setMood(qcat, 'cry');
    pling(220, 0, .5, .05); pling(196, .2, .6, .05);
    type(QUESTIONS[qi][0]);
    $('#q-hint').textContent = 'Mauvaise réponse. On recommence.';
    yes.focus();
});
yes.addEventListener('click', () => {
    setMood(qcat, 'love'); popHearts(qcat, 8);
    $('#q-hint').textContent = QUESTIONS[qi][1];
    melody([784, 988, 1175], .09);
    yes.disabled = true; no.hidden = true;
    setTimeout(() => { yes.disabled = false; qi + 1 < QUESTIONS.length ? ask(qi + 1) : go('s-game'); }, 1500);
});

/* ---------- mini-jeu : le chat cueille des fleurs ---------- */
const GOAL = 12;
$$('.goal').forEach((e) => (e.textContent = GOAL));
$('#slots').innerHTML = '<svg viewBox="0 0 24 24"><use href="#flower"/></svg>'.repeat(GOAL);

function drawFlower(x, px, py, r, kind) {
    x.save(); x.translate(px, py);
    if (kind === 0) {                 // marguerite
        x.fillStyle = '#fff'; x.strokeStyle = INK; x.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) { x.save(); x.rotate(i * Math.PI / 4); x.beginPath(); x.ellipse(0, -r * .7, r * .32, r * .55, 0, 0, 6.3); x.fill(); x.stroke(); x.restore(); }
        x.fillStyle = '#ffd36b'; x.beginPath(); x.arc(0, 0, r * .38, 0, 6.3); x.fill(); x.stroke();
    } else if (kind === 1) {          // fleur rose
        x.fillStyle = '#efa3b3'; x.strokeStyle = INK; x.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) { const a = i * 1.2566; x.beginPath(); x.arc(Math.cos(a) * r * .55, Math.sin(a) * r * .55, r * .45, 0, 6.3); x.fill(); x.stroke(); }
        x.fillStyle = '#ffe08a'; x.beginPath(); x.arc(0, 0, r * .3, 0, 6.3); x.fill(); x.stroke();
    } else {                          // rose
        x.fillStyle = '#d8405a'; x.strokeStyle = INK; x.lineWidth = 1.5;
        x.beginPath(); x.arc(0, 0, r * .8, 0, 6.3); x.fill(); x.stroke();
        x.strokeStyle = '#8c1a2e'; x.lineWidth = 2;
        x.beginPath(); x.arc(0, 0, r * .5, .4, 5.2); x.stroke(); x.beginPath(); x.arc(r * .05, 0, r * .25, 2, 6.8); x.stroke();
    }
    x.restore();
}
function drawCloud(x, px, py, t) {
    x.fillStyle = '#b8b3c4'; x.strokeStyle = INK; x.lineWidth = 2;
    x.beginPath(); x.arc(px - 14, py + 2, 12, Math.PI * .5, Math.PI * 1.5); x.arc(px, py - 6, 15, Math.PI, 0); x.arc(px + 15, py + 2, 12, Math.PI * 1.5, Math.PI * .5); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#8fc8f0';
    for (let i = 0; i < 3; i++) { const dy = (t / 6 + i * 9) % 18; x.beginPath(); x.ellipse(px - 12 + i * 12, py + 20 + dy, 2, 4, 0, 0, 6.3); x.fill(); }
}

(() => {
    const c = $('#game'), x = c.getContext('2d'), W = c.width, H = c.height;
    const catImg = new Image(); catImg.src = 'data:image/svg+xml,' + encodeURIComponent(cat('happy'));
    const sadImg = new Image(); sadImg.src = 'data:image/svg+xml,' + encodeURIComponent(cat('sad'));
    const P = { x: W / 2, tx: W / 2, w: 96 };
    let items, score, running = false, last, spawnIn, sadUntil = 0, keys = {};

    const toX = (e) => { const r = c.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
    c.addEventListener('pointermove', (e) => (P.tx = toX(e)));
    c.addEventListener('pointerdown', (e) => (P.tx = toX(e)));
    addEventListener('keydown', (e) => (keys[e.key] = true));
    addEventListener('keyup', (e) => (keys[e.key] = false));

    function drawPlayer(t) {
        const bx = P.x - P.w / 2, by = H - 46;
        x.drawImage(t < sadUntil ? sadImg : catImg, P.x - 50, by - 66, 100, 80);
        x.fillStyle = '#d9a877'; x.strokeStyle = INK; x.lineWidth = 2.5;           // panier
        x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + P.w, by); x.lineTo(bx + P.w - 10, by + 34); x.lineTo(bx + 10, by + 34); x.closePath(); x.fill(); x.stroke();
        x.strokeStyle = '#a97b4f'; x.lineWidth = 2;
        for (let i = 1; i < 3; i++) { x.beginPath(); x.moveTo(bx + 4, by + i * 11); x.lineTo(bx + P.w - 4, by + i * 11); x.stroke(); }
        x.fillStyle = '#e8798f'; x.fillRect(bx - 4, by - 5, P.w + 8, 7); x.strokeStyle = INK; x.strokeRect(bx - 4, by - 5, P.w + 8, 7);
    }

    function frame(t) {
        if (!running) return;
        const dt = Math.min(40, t - (last || t)); last = t;
        if (keys.ArrowLeft) P.tx = P.x - 34;
        if (keys.ArrowRight) P.tx = P.x + 34;
        P.x += (Math.max(P.w / 2, Math.min(W - P.w / 2, P.tx)) - P.x) * .22;

        if ((spawnIn -= dt) <= 0) {
            spawnIn = rand(520, 820) - score * 15;
            items.push({ x: rand(40, W - 40), y: -24, v: rand(1.8, 2.8) + score * .1, bad: Math.random() < .27, kind: Math.floor(rand(0, 3)), r: rand(18, 23), wob: rand(0, 6) });
        }
        x.clearRect(0, 0, W, H);
        for (const it of items) {
            it.y += it.v * dt / 16; it.x += Math.sin(t / 380 + it.wob) * .5;
            if (it.y > H - 58 && it.y < H - 26 && Math.abs(it.x - P.x) < P.w / 2 + 8) {
                it.dead = true;
                if (it.bad) {
                    score = Math.max(0, score - 1); sadUntil = t + 900; pling(196, 0, .4, .05);
                    c.parentNode.classList.remove('shake'); c.offsetWidth; c.parentNode.classList.add('shake');
                } else { score++; pling(660 + score * 40, 0, .25, .05); }
                $$('#slots svg').forEach((s, i) => s.classList.toggle('on', i < score));
            }
            if (it.y > H + 30) it.dead = true;
            if (!it.dead) it.bad ? drawCloud(x, it.x, it.y, t) : drawFlower(x, it.x, it.y, it.r, it.kind);
        }
        items = items.filter((i) => !i.dead);
        drawPlayer(t);
        if (score >= GOAL) { running = false; setTimeout(() => go('s-win'), 500); return; }
        requestAnimationFrame(frame);
    }

    $('#play').addEventListener('click', () => {
        $('#play').hidden = true;
        items = []; score = 0; spawnIn = 300; last = 0; running = true;
        requestAnimationFrame(frame);
    });
})();

/* ---------- victoire : explosion de cœurs et de pétales ---------- */
function burst() {
    const c = $('#burst'), x = c.getContext('2d');
    const w = (c.width = innerWidth), h = (c.height = innerHeight);
    const cols = ['#e8798f', '#f7cdd4', '#b8233c', '#efa3b3', '#a9bf98'];
    const parts = [];
    const wave = (cx, cy, n) => { for (let i = 0; i < n; i++) { const a = rand(0, 6.3), sp = rand(3, 12); parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, s: rand(.7, 1.6), col: cols[i % 5], life: rand(90, 170), rot: rand(-.4, .4), heart: i % 3 !== 0 }); } };
    if (!burst.done) {                   // la grosse explosion seulement la première fois
        burst.done = true;
        wave(w / 2, h * .4, 150);
        [[.2, .3], [.8, .3], [.5, .15], [.25, .7], [.75, .7]].forEach(([fx, fy], i) => setTimeout(() => { wave(w * fx, h * fy, 60); pling(784 + i * 90, 0, .3, .04); }, 450 + i * 380));
        melody([523, 659, 784, 1047, 1319], .11);
    }
    (function loop() {
        x.clearRect(0, 0, w, h);
        if (Math.random() < .2) parts.push({ x: rand(0, w), y: -20, vx: rand(-.4, .4), vy: rand(.8, 1.8), g: .008, s: rand(.6, 1.2), col: cols[parts.length % 5], life: 700, rot: rand(-.4, .4), heart: true });
        for (const p of parts) {
            p.vx *= .985; p.vy = p.vy * .985 + (p.g ?? .15); p.x += p.vx; p.y += p.vy; p.life--;
            x.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
            x.save(); x.translate(p.x, p.y); x.rotate(p.rot); x.scale(p.s, p.s); x.fillStyle = p.col;
            if (p.heart) { x.translate(-12, -12); x.fill(HEART); } else { x.beginPath(); x.ellipse(0, 0, 8, 4.5, 0, 0, 6.3); x.fill(); }
            x.restore();
        }
        x.globalAlpha = 1;
        for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0 || parts[i].y > h + 40) parts.splice(i, 1);
        if ($('#s-win').classList.contains('is-active')) requestAnimationFrame(loop); else x.clearRect(0, 0, w, h);
    })();
}

/* ---------- cadeaux ---------- */
const opened = new Set();
$$('.gift').forEach((g) => g.addEventListener('click', () => {
    opened.add(g.dataset.gift); g.classList.add('opened');
    if (opened.size === 3) { $('#to-letter').disabled = false; $('#to-letter').textContent = 'Lire ma lettre'; }
    go(g.dataset.gift);
}));
$('#to-letter').addEventListener('click', () => { petals.more(80); go('s-letter'); });

function flowerSVG(kind, r) {
    if (kind === 0) return Array.from({ length: 8 }, (_, i) => `<ellipse cx="0" cy="${-r * .7}" rx="${r * .32}" ry="${r * .55}" transform="rotate(${i * 45})" fill="#fff" stroke="${INK}" stroke-width="2"/>`).join('') + `<circle r="${r * .38}" fill="#ffd36b" stroke="${INK}" stroke-width="2"/>`;
    if (kind === 1) return Array.from({ length: 5 }, (_, i) => `<circle cx="${Math.cos(i * 1.2566) * r * .55}" cy="${Math.sin(i * 1.2566) * r * .55}" r="${r * .45}" fill="#efa3b3" stroke="${INK}" stroke-width="2"/>`).join('') + `<circle r="${r * .3}" fill="#ffe08a" stroke="${INK}" stroke-width="2"/>`;
    return `<circle r="${r * .85}" fill="#d8405a" stroke="${INK}" stroke-width="2"/><path d="M${r * .5} 0A${r * .5} ${r * .5} 0 1 1 ${-r * .2} ${-r * .45}M${-r * .25} ${r * .1}A${r * .25} ${r * .25} 0 1 0 ${r * .2} ${-r * .1}" fill="none" stroke="#8c1a2e" stroke-width="2.4" stroke-linecap="round"/>`;
}
function drawBouquet() {
    const heads = [[150, 70, 2], [100, 100, 1], [200, 98, 2], [62, 150, 0], [238, 150, 0], [125, 150, 2], [178, 148, 1], [92, 196, 1], [208, 196, 2], [150, 118, 0]];
    let svg = '';
    heads.forEach(([hx, hy], i) => {
        const x0 = 150 + (hx - 150) * .12, cx = (hx + 150) / 2, cy = (hy + 262) / 2 + 20;
        svg += `<path class="stem" style="animation-delay:${i * .12}s" d="M${x0} 262Q${cx} ${cy} ${hx} ${hy}"/>`;
        if (i % 2) {                     // feuille posée au milieu de la tige (point t = 0,5 de la courbe)
            const lx = .25 * x0 + .5 * cx + .25 * hx + (hx < 150 ? -9 : 9), ly = .25 * 262 + .5 * cy + .25 * hy;
            svg += `<ellipse class="leaf" style="animation-delay:${.8 + i * .12}s" cx="${lx}" cy="${ly}" rx="11" ry="5.5" fill="#a9bf98" stroke="${INK}" stroke-width="2"/>`;
        }
    });
    heads.forEach(([hx, hy, k], i) => { svg += `<g class="bloom" style="animation-delay:${1 + i * .12}s" transform="translate(${hx} ${hy})">${flowerSVG(k, 24)}</g>`; });
    svg += `<path d="M104 250h92q-4 14 6 30 22 36-4 66-18 14-48 14t-48-14q-26-30-4-66 10-16 6-30z" fill="#b8233c" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M128 300q-10 20 0 40" fill="none" stroke="#e8798f" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
    $('#bouquet').innerHTML = `<svg viewBox="0 0 300 360">${svg}</svg>`;    // réécrit = les animations repartent
    melody([523, 659, 784], .2);
}

/* ---------- cassette : lecture directe des morceaux (lecteur Deezer intégré) ---------- */
// YouTube est exclu : les labels bloquent l'intégration de ces 4 titres. Deezer : morceau entier si connecté, sinon extrait de 30 s.
function stopMusic() {
    $('#player').innerHTML = ''; $('#player').hidden = true;
    $('#cassette').classList.remove('playing');
    $$('.track').forEach((t) => t.classList.remove('on'));
}
$$('.track').forEach((t) => t.addEventListener('click', () => {
    if (t.classList.contains('on')) return stopMusic();      // re-clic = stop
    stopMusic();
    t.classList.add('on'); $('#cassette').classList.add('playing');
    $('#player').hidden = false;
    $('#player').innerHTML = `<iframe src="https://widget.deezer.com/widget/light/track/${t.dataset.dz}?autoplay=true" title="${t.firstChild.textContent.trim()}" allow="encrypted-media; autoplay; clipboard-write"></iframe>`;
}));

/* ---------- jouer avec le chat : clic = câlin + miaou, caresser (glisser dessus) = chat content, sans son ---------- */
function meow() { try { ac ||= new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = 'triangle'; o.frequency.setValueAtTime(620, t); o.frequency.linearRampToValueAtTime(980, t + .12); o.frequency.exponentialRampToValueAtTime(520, t + .45);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t + .04); g.gain.exponentialRampToValueAtTime(.0001, t + .5);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + .5); } catch { /* pas de son */ } }

const SAYS = ['miaou', 'ronron...', 'encore !', 'je t\'aime aussi', 'tu sens bon', 'gratouille ici', 'mrrrp', 'reste avec moi'];
const buddy = document.createElement('div');
buddy.className = 'buddy';
buddy.innerHTML = '<p class="bubble"></p><div class="cat-slot" data-mood="neutral" role="button" aria-label="Le chat, caresse-le"></div>';
document.body.append(buddy);
setMood(buddy.querySelector('.cat-slot'), 'neutral');
let bubbleTimer;
function say(text) {
    const b = buddy.querySelector('.bubble');
    b.textContent = text; b.classList.add('on');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => b.classList.remove('on'), 1800);
}
setTimeout(() => say('caresse-moi'), 30000);

function pet(c, mood = 'love') {
    const back = c._back ?? c.dataset.mood;   // humeur à remettre après (ex. le chat triste des questions)
    c._back = back;
    setMood(c, mood);
    c.classList.remove('boop'); c.offsetWidth; c.classList.add('boop');
    clearTimeout(c._t);
    c._t = setTimeout(() => { if (c.dataset.mood === mood) setMood(c, back); c._back = undefined; }, 1400);
}
document.addEventListener('click', (e) => {
    const c = e.target.closest('.cat-slot');
    if (!c) return;
    pet(c); popHearts(c, 5); meow();
    if (c.closest('.buddy')) say(SAYS[Math.floor(rand(0, SAYS.length))]);
});
let stroke = 0;
document.addEventListener('pointermove', (e) => {
    const c = e.target.closest?.('.cat-slot');
    if (!c) { stroke = 0; return; }
    stroke += Math.abs(e.movementX) + Math.abs(e.movementY);
    if (stroke > 260) {                         // assez caressé
        stroke = 0; pet(c, 'happy'); popHearts(c, 2);
        if (c.closest('.buddy')) say('ronron...');
    }
});
