const word = document.getElementById('word');
const clueText = document.getElementById('clueText');
const wrong = document.getElementById('wrong-letter');
const message = document.getElementById('message');
const roundScoreEl = document.getElementById('roundScore');
const stepProgressEl = document.getElementById('stepProgress');
const play = document.getElementById('play');
const viewSummary = document.getElementById('viewSummary');
const roundProgressEl = document.getElementById('roundProgress');
const leaderboardSection = document.getElementById('leaderboardSection');
const afterSummary = document.getElementById('afterSummary');
const newGameFromSummary = document.getElementById('newGameFromSummary');
const notification = document.getElementById('not');
const savePanel = document.getElementById('savePanel');
const saveScoreBtn = document.getElementById('saveScore');
const saveFeedback = document.getElementById('saveFeedback');
const leaderboardList = document.getElementById('leaderboardList');
const playerDisplayName = document.getElementById('playerDisplayName');
const nameGate = document.getElementById('nameGate');
const nameGateInput = document.getElementById('nameGateInput');
const nameGateStart = document.getElementById('nameGateStart');
const gameScreen = document.getElementById('gameScreen');
const wordNavPrev = document.getElementById('wordNavPrev');
const wordNavNext = document.getElementById('wordNavNext');
const roundInline = document.getElementById('roundInline');
const retryRow = document.getElementById('retryRow');
const btnRetry = document.getElementById('btnRetry');
const btnSaveLoss = document.getElementById('btnSaveLoss');
const winner = document.querySelector('.won');

const figure = document.querySelectorAll('.figure');

const words = [
  { word: 'მხედარი', clue: 'ჭადრაკი' },
  { word: 'კურდღელი', clue: 'Looney Toons' },
  { word: 'პარლამენტი', clue: '5 ნოემბერი' },
  { word: 'გილიოტინა', clue: 'ლუი XVI' },
  { word: 'დრაკულა', clue: 'რუმინეთი' },
  { word: 'მიკროფონი', clue: 'სცენა' },
  { word: 'ჯალათი', clue: 'ყველაზე შესამჩნევი სიტყვა' },
  { word: 'პარტიზანი', clue: 'დისკო' },
  { word: 'ჯეირანი', clue: 'ქურციკი' },
  { word: 'ლივერპული', clue: 'ბითლზი' },
  { word: 'მწვრთნელი', clue: 'ფეოლა' },
  { word: 'ტელევიზორი', clue: 'ანტენა' },
  { word: 'სათამაშო', clue: 'რევოლუციამდელი ბავშვი' },
  { word: 'ჩირაღდანი', clue: 'ცეცხლი' },
  { word: 'შეჰერაზადი', clue: '1001 ღამე' },
];

const TOP_N = 10;
const STORAGE_SCORES = 'hangman-scores';
const STORAGE_NAME = 'hangman-player-name';
const WORDSET_ID = 'default';
const ANONYMOUS = 'უცნობი';

const btnNewSession = 'ახალი თამაში';

let wordQueue = [];
let currentIndex = 0;
let selectedWord = null;
let correct = [];
let incorrect = [];
let roundActive = false;

const solvedIndices = new Set();

function maxMistakes() {
  return figure.length;
}

/** Consecutive words solved from index 0 (Millionaire-style ladder). */
function consecutiveSolvedCount() {
  let i = 0;
  while (i < wordQueue.length && solvedIndices.has(i)) {
    i += 1;
  }
  return i;
}

function updateStepLabel() {
  if (!stepProgressEl || !wordQueue.length) return;
  const n = consecutiveSolvedCount();
  const m = wordQueue.length;
  stepProgressEl.textContent = `${n} / ${m}`;
}

function updateRoundProgress() {
  if (!roundProgressEl || !wordQueue.length) return;
  roundProgressEl.textContent = `${currentIndex + 1}/${wordQueue.length}`;
}

function updateNavButtons() {
  const n = wordQueue.length;
  const atLast = n > 0 && currentIndex >= n - 1;
  const currentSolved = solvedIndices.has(currentIndex);

  if (wordNavPrev) {
    wordNavPrev.disabled = currentIndex <= 0;
  }
  if (wordNavNext) {
    wordNavNext.disabled = !currentSolved || atLast;
  }
}

function clearInlineStatus() {
  if (roundInline) {
    roundInline.textContent = '';
    roundInline.hidden = true;
  }
  if (retryRow) retryRow.hidden = true;
}

function getStoredName() {
  try {
    return String(localStorage.getItem(STORAGE_NAME) || '').trim();
  } catch {
    return '';
  }
}

function setStoredName(name) {
  try {
    localStorage.setItem(STORAGE_NAME, name);
  } catch {
    /* ignore */
  }
}

function updatePlayerDisplay() {
  if (playerDisplayName) {
    playerDisplayName.textContent = getStoredName() || ANONYMOUS;
  }
}

function scoreSortValue(r) {
  if (typeof r.stepsPassed === 'number') return r.stepsPassed;
  if (typeof r.totalScore === 'number') return r.totalScore;
  return 0;
}

function loadScores() {
  try {
    const raw = localStorage.getItem(STORAGE_SCORES);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveScores(list) {
  try {
    localStorage.setItem(STORAGE_SCORES, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function sortScores(list) {
  return list.slice().sort((a, b) => {
    const da = scoreSortValue(b) - scoreSortValue(a);
    if (da !== 0) return da;
    return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
  });
}

function mergeAndKeepTop(record) {
  const list = loadScores();
  list.push(record);
  return sortScores(list).slice(0, TOP_N);
}

function renderLeaderboard() {
  if (!leaderboardList) return;
  const list = sortScores(loadScores());
  if (list.length === 0) {
    leaderboardList.innerHTML = '<li class="leaderboardEmpty">ჯერ არაფერია შენახული.</li>';
    return;
  }
  leaderboardList.innerHTML = list
    .map((r) => {
      const date = r.dateISO ? new Date(r.dateISO).toLocaleString() : '';
      const steps = scoreSortValue(r);
      const total =
        typeof r.totalWords === 'number'
          ? r.totalWords
          : (typeof r.roundsPlayed === 'number' ? r.roundsPlayed : words.length);
      return `<li><strong>${escapeHtml(r.name)}</strong> — ${steps} / ${total} ტური${date ? ` · ${escapeHtml(date)}` : ''}</li>`;
    })
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {number} [stepsPassed] defaults to current ladder
 * @param {number} [totalWords] defaults to wordQueue.length
 */
function trySaveScore(stepsPassed, totalWords) {
  const name = getStoredName() || ANONYMOUS;
  if (name !== ANONYMOUS) {
    setStoredName(name);
  }
  updatePlayerDisplay();

  const total = totalWords != null ? totalWords : wordQueue.length;
  const steps = stepsPassed != null ? stepsPassed : consecutiveSolvedCount();

  const record = {
    name,
    stepsPassed: steps,
    totalWords: total,
    dateISO: new Date().toISOString(),
    wordsetId: WORDSET_ID,
  };

  const next = mergeAndKeepTop(record);
  saveScores(next);
  renderLeaderboard();
  if (saveFeedback) {
    saveFeedback.textContent = 'შენახულია.';
  }
}

function startNewGame() {
  wordQueue = words.map((w) => ({ ...w }));
  currentIndex = 0;
  solvedIndices.clear();
  updateStepLabel();
  if (viewSummary) viewSummary.hidden = true;
  if (afterSummary) afterSummary.hidden = true;
  loadWord(0);
}

function applySolvedDisplay() {
  if (!selectedWord) return;
  const letters = selectedWord.word.split('');
  const uniq = [...new Set(letters)];
  correct = uniq.filter((L) => L !== ' ');
  incorrect = [];
  figure.forEach((el) => {
    el.style.display = 'none';
  });
  showWord();
  wrong.innerHTML = '';
  roundActive = false;
  updateNavButtons();
}

function loadWord(index) {
  currentIndex = index;
  selectedWord = wordQueue[currentIndex];
  clearInlineStatus();
  roundScoreEl.textContent = '';
  if (savePanel) savePanel.hidden = true;
  if (saveFeedback) saveFeedback.textContent = '';
  if (viewSummary) viewSummary.hidden = true;
  if (afterSummary) afterSummary.hidden = true;
  winner.style.visibility = 'hidden';
  if (play) play.textContent = btnNewSession;

  if (solvedIndices.has(currentIndex)) {
    applySolvedDisplay();
  } else {
    correct = [];
    incorrect = [];
    roundActive = true;
    showWord();
    wrongLetter();
  }

  updateRoundProgress();
  updateStepLabel();
  updateNavButtons();
}

function showEndSessionPanel() {
  roundActive = false;
  const m = wordQueue.length;
  message.innerText = 'გილოცავთ! ყველა საფეხური გაიარეთ!';
  roundScoreEl.textContent = `გავლილი ნაბიჯი: ${m} / ${m}`;
  if (savePanel) {
    savePanel.hidden = false;
    if (saveFeedback) saveFeedback.textContent = '';
  }
  if (viewSummary) viewSummary.hidden = false;
  if (play) play.textContent = btnNewSession;
  winner.style.visibility = 'visible';
}

function handleWinRound() {
  if (solvedIndices.has(currentIndex)) {
    return;
  }
  roundActive = false;
  solvedIndices.add(currentIndex);
  updateStepLabel();

  const isLast = currentIndex >= wordQueue.length - 1;

  if (isLast) {
    if (roundInline) {
      roundInline.hidden = true;
    }
    showEndSessionPanel();
  } else {
    if (roundInline) {
      roundInline.hidden = false;
      const n = consecutiveSolvedCount();
      const m = wordQueue.length;
      roundInline.textContent = `გილოცავთ! ნაბიჯი ${n} / ${m} — „შემდეგი“ ხელმისაწვდომია.`;
    }
  }

  updateNavButtons();
}

function handleLoseRound() {
  roundActive = false;
  if (roundInline) {
    roundInline.hidden = false;
    const n = consecutiveSolvedCount();
    const m = wordQueue.length;
    roundInline.textContent = `სამწუხაროდ, ტური ჩაგაგდოთ. ნაბიჯი: ${n} / ${m} — სცადეთ ისევ ან შეინახეთ ნაბიჯი.`;
  }
  if (retryRow) retryRow.hidden = false;
  updateNavButtons();
}

function showWord() {
  if (!selectedWord) return;
  word.innerHTML = `
    ${selectedWord.word
      .split('')
      .map(
        (letter) => `
          <span class="letter">
            ${correct.includes(letter) ? letter : ''}
          </span>
        `
      )
      .join('')}
  `;

  clueText.innerText = selectedWord.clue;

  const inner = word.innerText.replace(/\n/g, '');

  if (inner === selectedWord.word) {
    handleWinRound();
  }
}

function wrongLetter() {
  wrong.innerHTML = `
        ${incorrect.length > 0 ? '<p>არასწორია :</p>' : ''}
        ${incorrect.map((letter) => `<span>${letter}</span>`)}
    `;

  figure.forEach((parts, index) => {
    const error = incorrect.length;
    if (index < error) {
      parts.style.display = 'block';
    } else {
      parts.style.display = 'none';
    }
  });
  if (incorrect.length === figure.length) {
    handleLoseRound();
  }
}

function showNot() {
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

window.addEventListener('keydown', (e) => {
  if (!roundActive) return;
  if (e.keyCode < 65 || e.keyCode > 90) return;

  const keyLetter = e.key;

  if (selectedWord.word.includes(keyLetter)) {
    if (!correct.includes(keyLetter)) {
      correct.push(keyLetter);
      showWord();
    } else {
      showNot();
    }
  } else {
    if (!incorrect.includes(keyLetter)) {
      incorrect.push(keyLetter);
      wrongLetter();
    } else {
      showNot();
    }
  }
});

if (wordNavPrev) {
  wordNavPrev.addEventListener('click', () => {
    if (currentIndex <= 0) return;
    clearInlineStatus();
    loadWord(currentIndex - 1);
  });
}

if (wordNavNext) {
  wordNavNext.addEventListener('click', () => {
    if (!solvedIndices.has(currentIndex) || currentIndex >= wordQueue.length - 1) return;
    clearInlineStatus();
    loadWord(currentIndex + 1);
  });
}

if (btnRetry) {
  btnRetry.addEventListener('click', () => {
    if (solvedIndices.has(currentIndex)) return;
    clearInlineStatus();
    correct = [];
    incorrect = [];
    roundActive = true;
    showWord();
    wrongLetter();
  });
}

if (btnSaveLoss) {
  btnSaveLoss.addEventListener('click', () => {
    trySaveScore(consecutiveSolvedCount(), wordQueue.length);
    if (roundInline) {
      roundInline.textContent = `${roundInline.textContent} · ცხრილში შენახულია.`;
    }
  });
}

play.addEventListener('click', () => {
  startNewGame();
});

if (viewSummary) {
  viewSummary.addEventListener('click', () => {
    winner.style.visibility = 'hidden';
    if (afterSummary) afterSummary.hidden = false;
    if (leaderboardSection) {
      window.requestAnimationFrame(() => {
        leaderboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        leaderboardSection.classList.add('leaderboardFlash');
        window.setTimeout(() => {
          leaderboardSection.classList.remove('leaderboardFlash');
        }, 1200);
      });
    }
  });
}

if (newGameFromSummary) {
  newGameFromSummary.addEventListener('click', () => {
    startNewGame();
  });
}

if (saveScoreBtn) {
  saveScoreBtn.addEventListener('click', () => {
    trySaveScore(wordQueue.length, wordQueue.length);
  });
}

function beginFromNameGate() {
  const n = (nameGateInput && nameGateInput.value) ? nameGateInput.value.trim() : '';
  if (!n) {
    if (nameGateInput) nameGateInput.focus();
    return;
  }
  setStoredName(n);
  updatePlayerDisplay();
  if (nameGate) nameGate.style.display = 'none';
  if (gameScreen) gameScreen.hidden = false;
  startNewGame();
}

if (nameGateStart) {
  nameGateStart.addEventListener('click', beginFromNameGate);
}
if (nameGateInput) {
  nameGateInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      beginFromNameGate();
    }
  });
}

function initPlayerNameUI() {
  updatePlayerDisplay();
  if (nameGateInput) {
    nameGateInput.value = getStoredName();
  }
}

renderLeaderboard();
initPlayerNameUI();

if (nameGate) nameGate.style.display = 'flex';
if (gameScreen) gameScreen.hidden = true;
if (nameGateInput) {
  setTimeout(() => nameGateInput.focus(), 0);
}
