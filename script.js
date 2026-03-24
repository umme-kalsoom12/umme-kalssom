const ALL_QUESTIONS = [
  { q: "Which method selects an element by ID in JavaScript?", opts: ["querySelector()", "getElementById()", "getElementByClass()", "selectById()"], ans: 1 },
  { q: "Which HTML attribute is used to link CSS?", opts: ["href", "src", "rel", "link"], ans: 0 },
  { q: "Which method removes the last element of an array?", opts: ["shift()", "pop()", "splice()", "delete()"], ans: 1 },
  { q: "Which JS array method adds element to end?", opts: ["push()", "append()", "add()", "insert()"], ans: 0 },
  { q: "Which CSS property changes text color?", opts: ["font-color", "text-color", "color", "foreground"], ans: 2 },
  { q: "What does CSS stand for?", opts: ["Cascading Style Sheets", "Creative Style Syntax", "Computer Style System", "Colorful Styling Sheet"], ans: 0 },
  { q: "Which JS keyword declares a block-scoped variable?", opts: ["const", "let", "var", "all of these"], ans: 1 },
  { q: "Which Bootstrap class makes a full-width container?", opts: ["container", "container-xl", "container-fluid", "row"], ans: 2 },
  { q: "What is the correct HTML tag for the largest heading?", opts: ["&lt;h6&gt;", "&lt;head&gt;", "&lt;heading&gt;", "&lt;h1&gt;"], ans: 3 },
  { q: "Which event fires when a user clicks an element?", opts: ["onhover", "onclick", "onpress", "ontap"], ans: 1 },
];

const TIMER_SECS = 20;
const SEG_COLORS = ['#5b7fff', '#2ecc85', '#ffc553', '#ff7b4d', '#c77dff'];

let questions   = [];
let current     = 0;
let score       = 0;
let userAnswers = [];
let timer       = null;
let timeLeft    = TIMER_SECS;
let answered    = false;

// ─── HELPERS ───────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickQuestions() {
  questions   = shuffle(ALL_QUESTIONS).slice(0, 5);
  userAnswers = new Array(5).fill(null);
}

function buildSegBar(active) {
  let html = '<div class="seg-bar">';
  for (let i = 0; i < 5; i++) {
    let cls   = 'seg';
    let style = '';
    if (i < active) {
      const correct = userAnswers[i] !== null && userAnswers[i] === questions[i].ans;
      if (correct) style = `background:${SEG_COLORS[i]}`;
      else         cls  += ' incorrect';
    } else if (i === active) {
      style = `background:${SEG_COLORS[i]};animation:pulse 1.2s infinite`;
    }
    html += `<div class="${cls}" style="${style}"></div>`;
  }
  return html + '</div>';
}

// ─── SCREENS ───────────────────────────────────────────
function renderStart() {
  document.getElementById('app').innerHTML = `
    <div class="start-screen">
      <div class="start-icon">🧠</div>
      <div class="start-title">WebTech Quiz</div>
      <div class="start-sub">
        Test your HTML, CSS, JavaScript &amp; Bootstrap knowledge
        with randomised questions and a live countdown.
      </div>
      <div class="start-meta">
        <div class="meta-chip">📋 <span>5</span> Questions</div>
        <div class="meta-chip">⏱️ <span>${TIMER_SECS}s</span> per question</div>
        <div class="meta-chip">📊 Multi-color progress</div>
      </div>
      <button class="btn-start" onclick="startQuiz()">Start Quiz →</button>
    </div>`;
}

function startQuiz() {
  pickQuestions();
  current = 0;
  score   = 0;
  userAnswers.fill(null);
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  timeLeft = TIMER_SECS;
  clearInterval(timer);

  const q       = questions[current];
  const letters = ['A', 'B', 'C', 'D'];

  document.getElementById('app').innerHTML = `
    ${buildSegBar(current)}
    <div class="q-header">
      <div class="q-label">Question ${current + 1} / 5</div>
      <div class="timer" id="timerEl">⏱ ${timeLeft}s</div>
    </div>
    <div class="q-text">${q.q}</div>
    <div class="options">
      ${q.opts.map((o, i) => `
        <div class="opt" id="opt${i}" onclick="selectOpt(${i})">
          <div class="opt-letter">${letters[i]}</div>
          ${o}
          <span class="opt-icon" id="icon${i}"></span>
        </div>`).join('')}
    </div>
    <div class="feedback" id="feedback"></div>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <button class="btn-prev" id="prevBtn" onclick="prevQ()"
        ${current === 0 ? 'style="visibility:hidden"' : ''}>
        ← Previous
      </button>
      <button class="btn-next" id="nextBtn" onclick="nextQ()" disabled>
        ${current === 4 ? 'See Results' : 'Next'} →
      </button>
    </div>`;

  
  if (userAnswers[current] !== null || userAnswers[current] === null && current < current) {
    
  }

 
  const prevAnswer = userAnswers[current];
  if (prevAnswer !== null) {
    answered = true;
    showAnswerState(current, prevAnswer);
    document.getElementById('nextBtn').disabled = false;
  } else {
    // timer sirf tab chalao jab answer na diya ho
    timer = setInterval(() => {
      timeLeft--;
      const el = document.getElementById('timerEl');
      if (!el) { clearInterval(timer); return; }
      el.textContent = `⏱ ${timeLeft}s`;
      el.className   = 'timer' +
        (timeLeft <= 5 ? ' danger' : timeLeft <= 10 ? ' warn' : '');
      if (timeLeft <= 0) { clearInterval(timer); autoSkip(); }
    }, 1000);
  }
}

// ─── ANSWER STATE SHOW (reuse for prev button) ─────────

function showAnswerState(idx, ua) {
  const q       = questions[idx];
  const correct = q.ans;

  for (let j = 0; j < 4; j++) {
    const optEl  = document.getElementById('opt'  + j);
    if (!optEl) continue;
    optEl.classList.add('locked');
    if (j === ua) {
      optEl.classList.add('selected-ans');
    }
  }
}

// ─── SELECT OPTION ─────────────────────────────────────
function selectOpt(i) {
  if (answered) return;
  answered = true;
  clearInterval(timer);
  userAnswers[current] = i;

  if (i === questions[current].ans) score++;

  showAnswerState(current, i);
  document.getElementById('nextBtn').disabled = false;
}

// ─── AUTO SKIP (timer runs out) ────────────────────────
function autoSkip() {
  if (answered) return;
  answered = true;
  userAnswers[current] = null;
  showAnswerState(current, null);
  document.getElementById('nextBtn').disabled = false;
}

// ─── NEXT ──────────────────────────────────────────────
function nextQ() {
  clearInterval(timer);
  current++;
  if (current < 5) renderQuestion();
  else             renderResults();
}

// ─── PREVIOUS ──────────────────────────────────────────
function prevQ() {
  clearInterval(timer);
  current--;
  renderQuestion();
}

// ─── RESULTS ───────────────────────────────────────────
function renderResults() {
  // score dobara calculate karo (previous button ki wajah se)
  score = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] !== null && userAnswers[i] === q.ans) score++;
  });

  const pct       = Math.round((score / 5) * 100);
  const grade     = score >= 4 ? '🏆 Excellent!' : score >= 3 ? '👍 Good Job' : score >= 2 ? '📚 Keep Practicing' : '💡 Study More';
  const ringColor = score >= 4 ? '#2ecc85' : score >= 3 ? '#5b7fff' : score >= 2 ? '#ffc553' : '#ff4d6d';

  const rows = questions.map((q, i) => {
    const ua     = userAnswers[i];
    const ok     = ua !== null && ua === q.ans;
    const status = ua === null ? 'skipped' : ok ? 'correct' : 'incorrect';
    const label  = status.charAt(0).toUpperCase() + status.slice(1);
    return `<tr class="${status}-row">
      <td style="color:var(--text-muted);font-family:'Space Mono',monospace;font-size:12px">${i + 1}</td>
      <td>${q.q}</td>
      <td style="color:var(--text-muted)">${ua !== null ? q.opts[ua] : 'Not Answered'}</td>
      <td style="color:var(--correct)">${q.opts[q.ans]}</td>
      <td><span class="badge ${status}">${label}</span></td>
    </tr>`;
  }).join('');

  document.getElementById('app').innerHTML = `
    <div class="results-header">
      <div class="score-ring"
           style="background:conic-gradient(${ringColor} ${pct * 3.6}deg, var(--surface2) 0)">
        <div class="score-ring-inner"></div>
        <div class="score-num">${score}/5</div>
      </div>
      <div class="results-title">${grade}</div>
      <div class="results-sub">You scored ${score} out of 5 — ${pct}%</div>
    </div>
    <table class="results-table">
      <thead>
        <tr>
          <th>#</th><th>Question</th><th>Your Answer</th>
          <th>Correct Answer</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="results-actions">
      <button class="btn-pdf"   onclick="downloadPDF()">⬇ Download PDF Report</button>
      <button class="btn-retry" onclick="startQuiz()">🔄 Try Again</button>
    </div>`;
}

// ─── PDF DOWNLOAD ──────────────────────────────────────
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(91, 127, 255);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Quiz Result', 15, 17);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Score: ${score} / 5`, 155, 17);

  doc.setTextColor(30, 30, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Score: ${score}/5   (${Math.round(score / 5 * 100)}%)`, 15, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 130);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 48);

  doc.autoTable({
    startY: 54,
    head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Status']],
    body: questions.map((q, i) => {
      const ua = userAnswers[i];
      const ok = ua !== null && ua === q.ans;
      return [
        i + 1,
        q.q.length > 42 ? q.q.slice(0, 42) + '…' : q.q,
        ua !== null ? q.opts[ua] : 'Not Answered',
        q.opts[q.ans],
        ua === null ? 'Skipped' : ok ? 'Correct' : 'Incorrect'
      ];
    }),
    styles:       { fontSize: 9, cellPadding: 4 },
    headStyles:   { fillColor: [91, 127, 255], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 10 }, 4: { cellWidth: 24 } },
    didDrawCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const v = data.cell.raw;
        if      (v === 'Correct')   doc.setTextColor(46, 204, 133);
        else if (v === 'Incorrect') doc.setTextColor(255, 77, 109);
        else                        doc.setTextColor(255, 197, 83);
        doc.setFontSize(9);
        doc.text(v, data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1);
        doc.setTextColor(0);
        data.cell.text = [];
      }
    }
  });

  doc.save('Quiz_Result.pdf');
}

// ─── THEME TOGGLE ──────────────────────────────────────
document.getElementById('themeBtn').addEventListener('click', () => {
  const html   = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isDark ? '🌙 Dark' : '☀️ Light';
});

// ─── INIT ──────────────────────────────────────────────
renderStart();