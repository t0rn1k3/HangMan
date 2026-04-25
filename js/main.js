const word = document.getElementById('word');
const clueText = document.getElementById('clueText');
const wrong = document.getElementById('wrong-letter');
const message = document.getElementById('message');
const roundScoreEl = document.getElementById('roundScore');
const sessionScoreEl = document.getElementById('sessionScore');
const play = document.getElementById('play');
const notification = document.getElementById('not');
const savePanel = document.getElementById('savePanel');
const playerNameInput = document.getElementById('playerName');
const saveScoreBtn = document.getElementById('saveScore');
const saveFeedback = document.getElementById('saveFeedback');
const leaderboardList = document.getElementById('leaderboardList');
const winner = document.querySelector('.won')

const figure = document.querySelectorAll('.figure');

const words = [
  {
    word : "მხედარი",
    clue : "ჭადრაკი"
  },
  {
    word : "კურდღელი",
    clue : "Looney Toons"
  },
  {
    word : "პარლამენტი",
    clue : "5 ნოემბერი"
  },
  {
    word : "გილიოტინა",
    clue : "ლუი XVI"
  },
  {
    word : "დრაკულა",
    clue : "რუმინეთი"
  },
  {
    word : "მიკროფონი",
    clue : "სცენა"
  },
  {
    word : "ჯალათი",
    clue : "ყველაზე შესამჩნევი სიტყვა"
  },
  {
    word : "პარტიზანი",
    clue : "დისკო"
  },
  {
    word : "ჯეირანი",
    clue : "ქურციკი"
  },
  {
    word : "ლივერპული",
    clue : "ბითლზი"
  },
  {
    word : "მწვრთნელი",
    clue : "ფეოლა"
  },
  {
    word : "ტელევიზორი",
    clue : "ანტენა"
  },
  {
    word : "სათამაშო",
    clue : "რევოლუციამდელი ბავშვი"
  },
  {
    word : "ჩირაღდანი",
    clue : "ცეცხლი"
  },
  {
    word : "შეჰერაზადი",
    clue : "1001 ღამე"
  },
]


/** Top entries kept in localStorage after sort */
const TOP_N = 10;
const STORAGE_SCORES = 'hangman-scores';
const STORAGE_NAME = 'hangman-player-name';
const WORDSET_ID = 'default';
const ANONYMOUS = 'უცნობი';

const btnNext = 'შემდეგი სიტყვა';
const btnNew = 'ითამაშეთ ახლიდან';

/** 1 per win, plus a bonus: maxMistakes − wrongCount (more „lives” left = higher bonus) */
const BASE_WIN = 1;
/** Set to 1 to subtract this many points from the session on a lost round. 0 = no penalty. */
const LOSS_PENALTY = 0;

let wordQueue = [];
let currentIndex = 0;
let selectedWord = null;
let correct = [];
let incorrect = [];
let roundActive = false;
let sessionScore = 0;
/** Words finished this session (each showRoundEnd), reset in startNewGame */
let sessionRoundsCompleted = 0;
let winStreak = 0;
let bestStreak = 0;

function maxMistakes() {
  return figure.length;
}

function updateSessionLabel() {
  sessionScoreEl.textContent = String(sessionScore);
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
    /* ignore quota / private mode */
  }
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
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
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
      const streak = typeof r.bestStreak === 'number' ? r.bestStreak : 0;
      const rounds = typeof r.roundsPlayed === 'number' ? r.roundsPlayed : 0;
      return `<li><strong>${escapeHtml(r.name)}</strong> — ${r.totalScore} ქულა · ${rounds} ტური · სერია ${streak}${date ? ` · ${escapeHtml(date)}` : ''}</li>`;
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

function sessionEndSaveSnapshot() {
  return {
    totalScore: sessionScore,
    roundsPlayed: sessionRoundsCompleted,
    bestStreak,
    dateISO: new Date().toISOString(),
    wordsetId: WORDSET_ID,
  };
}

function trySaveScore() {
  const raw = playerNameInput && playerNameInput.value ? playerNameInput.value.trim() : '';
  const name = raw || ANONYMOUS;
  if (playerNameInput && raw) setStoredName(raw);

  const snap = sessionEndSaveSnapshot();
  const record = {
    name,
    totalScore: snap.totalScore,
    roundsPlayed: snap.roundsPlayed,
    bestStreak: snap.bestStreak,
    dateISO: snap.dateISO,
    wordsetId: snap.wordsetId,
  };

  const next = mergeAndKeepTop(record);
  saveScores(next);
  renderLeaderboard();
  if (saveFeedback) {
    saveFeedback.textContent = 'შენახულია.';
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startNewGame() {
  wordQueue = shuffle(words);
  currentIndex = 0;
  sessionScore = 0;
  sessionRoundsCompleted = 0;
  winStreak = 0;
  bestStreak = 0;
  updateSessionLabel();
  loadWord(0);
}

function loadWord(index) {
  currentIndex = index;
  selectedWord = wordQueue[currentIndex];
  correct = [];
  incorrect = [];
  roundActive = true;
  roundScoreEl.textContent = '';
  if (savePanel) savePanel.hidden = true;
  if (saveFeedback) saveFeedback.textContent = '';
  winner.style.visibility = 'hidden';
  play.textContent = btnNew;
  showWord();
  wrongLetter();
}

function showRoundEnd(didWin) {
  roundActive = false;
  sessionRoundsCompleted += 1;
  if (didWin) {
    winStreak += 1;
    bestStreak = Math.max(bestStreak, winStreak);
    const bonus = Math.max(0, maxMistakes() - incorrect.length);
    const roundPts = BASE_WIN + bonus;
    sessionScore += roundPts;
    updateSessionLabel();
    message.innerText = 'გილოცავთ! თქვენ გაიმარჯვეთ';
    roundScoreEl.textContent =
      bonus > 0
        ? `ამ ტურში: +${roundPts} (ბაზა ${BASE_WIN} + ბონუსი ${bonus}) — ყველა: ${sessionScore}`
        : `ამ ტურში: +${roundPts} — ყველა: ${sessionScore}`;
  } else {
    winStreak = 0;
    if (LOSS_PENALTY > 0) {
      sessionScore = Math.max(0, sessionScore - LOSS_PENALTY);
      updateSessionLabel();
    }
    message.innerText = 'სამწუხაროდ, თქვენ ჩამოგახრჩვეს 😕';
    roundScoreEl.textContent =
      LOSS_PENALTY > 0
        ? `წაგება: −${LOSS_PENALTY} — ყველა: ${sessionScore}`
        : `ამ ტურში: 0 — ყველა: ${sessionScore}`;
  }
  const hasNext = currentIndex < wordQueue.length - 1;
  play.textContent = hasNext ? btnNext : btnNew;
  if (savePanel) {
    savePanel.hidden = hasNext;
    if (!hasNext) {
      if (saveFeedback) saveFeedback.textContent = '';
      if (playerNameInput) playerNameInput.value = getStoredName();
    }
  }
  winner.style.visibility = 'visible';
}

function showWord() {
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
    showRoundEnd(true);
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
    showRoundEnd(false);
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

play.addEventListener('click', () => {
  if (play.textContent === btnNext) {
    loadWord(currentIndex + 1);
  } else {
    startNewGame();
  }
});

if (saveScoreBtn) {
  saveScoreBtn.addEventListener('click', trySaveScore);
}

if (playerNameInput) {
  playerNameInput.addEventListener('change', () => {
    const v = playerNameInput.value.trim();
    if (v) setStoredName(v);
  });
}

renderLeaderboard();
startNewGame();
