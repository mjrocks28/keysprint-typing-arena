const QUOTES_BY_DIFFICULTY = {
    easy: [
        "Stay hungry, stay foolish.",
        "Just keep swimming.",
        "May the Force be with you.",
        "Winter is coming.",
        "To infinity and beyond!",
        "Why so serious?",
        "I am inevitable.",
        "Hakuna Matata.",
        "I'll be back.",
        "You got this.",
        // more
        "Just do it.",
        "Keep moving forward.",
        "Believe you can.",
        "You are enough.",
        "Never give up.",
        "Think different.",
        "Stronger together.",
        "Dream big.",
        "Seize the day.",
        "Make it happen."
    ],
    medium: [
        "The quick brown fox jumps over the lazy dog",
        "Simplicity is the soul of efficiency.",
        "First, solve the problem. Then, write the code.",
        "Talk is cheap. Show me the code.",
        "Quality is not an act, it is a habit.",
        "Action is the foundational key to all success.",
        "The secret of getting ahead is getting started.",
        "Success is the sum of small efforts repeated day in and day out.",
        "What we know is a drop, what we don't know is an ocean.",
        "Learning never exhausts the mind.",
        // more
        "Do or do not. There is no try.",
        "Not all those who wander are lost.",
        "With great power comes great responsibility.",
        "I find your lack of faith disturbing.",
        "Elementary, my dear Watson.",
        "Fortune favors the bold.",
        "Adventure is out there.",
        "Imagination is more important than knowledge.",
        "Life is what happens when you're busy making other plans.",
        "The only limit is your mind."
    ],
    hard: [
        "Programs must be written for people to read, and only incidentally for machines to execute.",
        "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
        "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
        "A good programmer is someone who looks both ways before crossing a one-way street.",
        "Before software can be reusable it first has to be usable.",
        "Premature optimization is the root of all evil.",
        "The function of good software is to make the complex appear simple.",
        "Experience is the name everyone gives to their mistakes.",
        "The best code is no code at all.",
        "Simplicity is prerequisite for reliability.",
        // more
        "Controlling complexity is the essence of computer programming.",
        "Testing leads to failure, and failure leads to understanding.",
        "The most effective debugging tool is still careful thought.",
        "Optimize for readability; machines will cope.",
        "If it hurts, do it more often.",
        "In theory, theory and practice are the same; in practice, they are not.",
        "There are only two hard things in Computer Science: cache invalidation and naming things.",
        "The purpose of abstraction is to create a new semantic level.",
        "Weeks of coding can save you hours of planning.",
        "Make it work, then make it right, then make it fast."
    ],
    warrior: [
        "Supercalifragilisticexpialidocious words bewilder and bamboozle conscientious keyboard warriors daily.",
        "Pseudopseudohypoparathyroidism perplexes pneumonoultramicroscopicsilicovolcanoconiosis enthusiasts.",
        "Floccinaucinihilipilification of antidisestablishmentarianism is an onomatopoetic tongue twister.",
        "Bewitching syzygy juxtaposes quixotic zephyrs with rhombic dodecahedra and chrysanthemum phyllotaxis.",
        "The ineffable labyrinthine idiosyncrasies of sesquipedalian perspicacity tantalize indefatigable typists.",
        "A waxy sphinx box jig vexed the lazy dwarf; pack my box with five dozen liquor jugs, quickly!",
        "Sphinx of black quartz, judge my vow, while the jayhawk extols quirky rhythmic buzzwords.",
        "Crazy Fredericka bought many very exquisite opal jewels; jackdaws love my big sphinx of quartz.",
        "The sixth sick sheik's sixth sheep's sick, amidst bewildering rhythms and zephyr-like whizbangs.",
        "Sympathizing, unscrupulous, mischievous onlookers scrutinize unequivocally the incommunicable oeuvre.",
        // more
        "How quickly daft jumping zebras vex.",
        "The five boxing wizards jump quickly.",
        "Glib jocks quiz nymph to vex dwarf.",
        "Cwm fjord bank glyphs vext quiz.",
        "Woven silk pyjamas exchanged for blue quartz.",
        "Grumpy wizards make toxic brew for the evil queen and jack.",
        "Honorificabilitudinitatibus appears in Shakespeare's play.",
        "Hydrochlorofluorocarbons photolithographically crystallize zeolites.",
        "Thyroparathyroidectomized patients exhibit extraordinary electrophysiology.",
        "Unquestionably, subdermatoglyphic rhythms synchronize with xylophone jazz."
    ]
};

let timeLeft;
let totalTime;
let timer, currentQuote = "";
let currentPool = QUOTES_BY_DIFFICULTY.medium.slice();
let wordsTypedCount = 0;
let testRunning = false;

const quoteElement = document.getElementById("quote");
const inputElement = document.getElementById("input");
const timeElement = document.getElementById("time");
const wpmElement = document.getElementById("wpm");
const wordsTypedElement = document.getElementById("wordsTyped");
const startBtn = document.getElementById("startBtn");
const popup = document.getElementById("popup");
const finalWords = document.getElementById("finalWords");
const finalWPM = document.getElementById("finalWPM");
const restartBtn = document.getElementById("restartBtn");
const closePopupBtn = document.getElementById("closePopupBtn");
const timeLimitSelect = document.getElementById("timeLimit");
const difficultySelect = document.getElementById("difficulty");
const progressFill = document.getElementById("progressFill");
const timerBarEl = document.getElementById("timerBar");
const bestWPMEl = document.getElementById("bestWPM");
const bestWordsEl = document.getElementById("bestWords");
const bestTimeEl = document.getElementById("bestTime");
const recentListEl = document.getElementById("recentList");
const bgCanvas = document.getElementById("bgCanvas");

const STORAGE_KEY = 'typing_scores_v2';

function loadScores() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveScores(scores) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch {}
}

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
}

function updateScoreboardUI() {
    const scores = loadScores();
    if (scores.length === 0) {
        if (bestWPMEl) bestWPMEl.textContent = '0';
        if (bestWordsEl) bestWordsEl.textContent = '0';
        if (bestTimeEl) bestTimeEl.textContent = '0';
        if (recentListEl) recentListEl.innerHTML = '';
        return;
    }
    const best = scores.reduce((acc, s) => (s.wpm > acc.wpm ? s : acc), scores[0]);
    if (bestWPMEl) bestWPMEl.textContent = String(best.wpm);
    if (bestWordsEl) bestWordsEl.textContent = String(best.words);
    if (bestTimeEl) bestTimeEl.textContent = String(best.time);

    // Per-difficulty bests
    const bestByDiff = scores.reduce((acc, s) => {
        const key = s.difficulty || 'medium';
        if (!acc[key] || s.wpm > acc[key].wpm) acc[key] = s;
        return acc;
    }, {});

    const diffMap = {
        easy: { w: document.getElementById('bestEasyWPM'), words: document.getElementById('bestEasyWords'), t: document.getElementById('bestEasyTime') },
        medium: { w: document.getElementById('bestMediumWPM'), words: document.getElementById('bestMediumWords'), t: document.getElementById('bestMediumTime') },
        hard: { w: document.getElementById('bestHardWPM'), words: document.getElementById('bestHardWords'), t: document.getElementById('bestHardTime') },
        warrior: { w: document.getElementById('bestWarriorWPM'), words: document.getElementById('bestWarriorWords'), t: document.getElementById('bestWarriorTime') }
    };
    for (const key of Object.keys(diffMap)) {
        const bestS = bestByDiff[key];
        const els = diffMap[key];
        if (els.w) els.w.textContent = String(bestS ? bestS.wpm : 0);
        if (els.words) els.words.textContent = String(bestS ? bestS.words : 0);
        if (els.t) els.t.textContent = String(bestS ? bestS.time : 0);
    }

    if (recentListEl) {
        const items = scores
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .map(s => `
                <li>
                    <span>${s.wpm} WPM • ${s.words} words • ${s.time}s • ${s.difficulty || 'medium'} • ${s.timeLimit || '?'}s</span>
                    <span class="meta">${formatDate(s.timestamp)}</span>
                </li>
            `)
            .join("");
        recentListEl.innerHTML = items;
    }
}

function recordResult(result) {
    const scores = loadScores();
    scores.push({ ...result, timestamp: Date.now() });
    // Limit stored results to last 100
    const trimmed = scores
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 100);
    saveScores(trimmed);
    updateScoreboardUI();
}

function startTest() {
    totalTime = parseInt(timeLimitSelect.value);
    timeLeft = totalTime;
    wordsTypedCount = 0;
    wpmElement.textContent = 0;
    wordsTypedElement.textContent = 0;
    popup.classList.add("hidden");

    inputElement.value = "";
    inputElement.disabled = false;
    inputElement.focus();

    // Reset timer UI
    if (timeElement) timeElement.textContent = timeLeft;
    if (progressFill) progressFill.style.transform = 'scaleX(1)';
    if (timerBarEl) {
        timerBarEl.classList.remove('warn', 'danger');
        timerBarEl.classList.add('ok');
    }

    loadNewQuote();

    clearInterval(timer);
    timer = setInterval(updateTime, 1000);

    // Disable start while running
    testRunning = true;
    startBtn.disabled = true;
}

function updateTime() {
    timeLeft--;
    timeElement.textContent = timeLeft;

    // Update progress bar
    if (totalTime > 0) {
        const ratio = Math.max(0, timeLeft / totalTime);
        if (progressFill) progressFill.style.transform = `scaleX(${ratio})`;
        if (timerBarEl) {
            timerBarEl.classList.remove('ok', 'warn', 'danger');
            if (ratio > 0.5) timerBarEl.classList.add('ok');
            else if (ratio > 0.2) timerBarEl.classList.add('warn');
            else timerBarEl.classList.add('danger');
        }
    }

    const elapsed = totalTime - timeLeft;
    const wpm = Math.floor((wordsTypedCount / elapsed) * 60);
    if (elapsed > 0) wpmElement.textContent = wpm;

    if (timeLeft <= 0) {
        clearInterval(timer);
        inputElement.disabled = true;
        // stop danger shake when finished
        if (timerBarEl) timerBarEl.classList.remove('ok', 'warn', 'danger');
        showPopup();
        testRunning = false;
        startBtn.disabled = false;
    }
}

function loadNewQuote() {
    if (!currentPool || currentPool.length === 0) {
        const diff = difficultySelect ? difficultySelect.value : 'medium';
        currentPool = QUOTES_BY_DIFFICULTY[diff].slice();
    }
    // remove chosen quote from pool to avoid duplicates in the same session
    const idx = Math.floor(Math.random() * currentPool.length);
    currentQuote = currentPool.splice(idx, 1)[0];
    quoteElement.innerHTML = currentQuote
        .split("")
        .map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`)
        .join("");
    inputElement.value = "";
}

inputElement.addEventListener("input", () => {
    const arrayQuote = quoteElement.querySelectorAll("span");
    const arrayValue = inputElement.value.split("");

    let correct = true;
    arrayQuote.forEach((charSpan, index) => {
        const typedChar = arrayValue[index];
        if (typedChar == null) {
            charSpan.classList.remove("correct", "incorrect");
            correct = false;
        } else {
            const expectedChar = charSpan.textContent === '\u00A0' ? ' ' : charSpan.textContent;
            const actualChar = typedChar === '\u00A0' ? ' ' : typedChar;
            if (actualChar === expectedChar) {
                charSpan.classList.add("correct");
                charSpan.classList.remove("incorrect");
            } else {
                charSpan.classList.add("incorrect");
                charSpan.classList.remove("correct");
                correct = false;
            }
        }
    });

    if (correct && arrayValue.length === arrayQuote.length) {
        wordsTypedCount += currentQuote.split(/\s+/).length;
        wordsTypedElement.textContent = wordsTypedCount;
        loadNewQuote();
    }
});

function showPopup() {
    finalWords.textContent = wordsTypedCount;
    finalWPM.textContent = wpmElement.textContent;
    popup.classList.remove("hidden");

    // Record result
    const elapsed = totalTime;
    const finalWpm = Number(wpmElement.textContent) || 0;
    const diff = difficultySelect ? difficultySelect.value : 'medium';
    recordResult({ wpm: finalWpm, words: wordsTypedCount, time: elapsed, difficulty: diff, timeLimit: totalTime });

    // Confetti burst
    if (typeof confetti === 'function') {
        const duration = 1200;
        const end = Date.now() + duration;
        const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 3000 }; // match popup z-index

        (function frame() {
            confetti({ ...defaults, particleCount: 24, origin: { x: 0.2, y: 0.2 } });
            confetti({ ...defaults, particleCount: 24, origin: { x: 0.8, y: 0.2 } });
            confetti({ ...defaults, particleCount: 20, origin: { x: 0.5, y: 0.1 } });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    }
}

startBtn.addEventListener("click", startTest);
restartBtn.addEventListener("click", startTest);
if (closePopupBtn) {
    closePopupBtn.addEventListener("click", () => popup.classList.add("hidden"));
}

// Close when clicking outside the dialog content
popup.addEventListener("click", (e) => {
    if (e.target === popup) {
        popup.classList.add("hidden");
    }
});

// Close with Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !popup.classList.contains("hidden")) {
        popup.classList.add("hidden");
    }
    // Global Enter shortcuts
    if (e.key === 'Enter') {
        if (!popup.classList.contains('hidden')) {
            // popup is open → trigger Play Again
            restartBtn.click();
        } else if (!testRunning) {
            // no test running → trigger Start Typing
            startBtn.click();
        }
    }
});

// Initialize scoreboard on load
updateScoreboardUI();

// Update quote pool when difficulty changes
if (difficultySelect) {
    difficultySelect.addEventListener('change', () => {
        currentPool = QUOTES_BY_DIFFICULTY[difficultySelect.value].slice();
    });
}

// Mouse trail background animation
(() => {
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    let width = bgCanvas.width = window.innerWidth;
    let height = bgCanvas.height = window.innerHeight;
    const particles = [];
    const maxParticles = 120;

    function onResize() {
        width = bgCanvas.width = window.innerWidth;
        height = bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);

    function addParticle(x, y) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 1.6,
            vy: (Math.random() - 0.5) * 1.6,
            life: 1,
            size: 2 + Math.random() * 3,
            hue: 180 + Math.random() * 140
        });
        if (particles.length > maxParticles) particles.shift();
    }

    let lastX = null, lastY = null;
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        // Interpolate along the segment for smooth trail when moving fast
        if (lastX !== null && lastY !== null) {
            const dx = x - lastX;
            const dy = y - lastY;
            const steps = Math.max(1, Math.hypot(dx, dy) / 12);
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                addParticle(lastX + dx * t, lastY + dy * t);
            }
        }
        addParticle(x, y);
        lastX = x; lastY = y;
    });

    function tick() {
        ctx.clearRect(0, 0, width, height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.01; // slight gravity
            p.life *= 0.975;
            if (p.life < 0.04) { particles.splice(i, 1); continue; }

            const alpha = Math.max(0, Math.min(1, p.life));
            ctx.beginPath();
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.2);
            grad.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${alpha})`);
            grad.addColorStop(1, `hsla(${p.hue}, 100%, 65%, 0)`);
            ctx.fillStyle = grad;
            ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(tick);
    }
    tick();
})();
