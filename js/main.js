const word = document.getElementById('word');
const clueText = document.getElementById('clueText');
const wrong = document.getElementById('wrong-letter');
const message = document.getElementById('message');
const roundScoreEl = document.getElementById('roundScore');
const sessionScoreEl = document.getElementById('sessionScore');
const play = document.getElementById('play');
const notification = document.getElementById('not');
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

function maxMistakes() {
  return figure.length;
}

function updateSessionLabel() {
  sessionScoreEl.textContent = String(sessionScore);
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
  winner.style.visibility = 'hidden';
  play.textContent = btnNew;
  showWord();
  wrongLetter();
}

function showRoundEnd(didWin) {
  roundActive = false;
  if (didWin) {
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

startNewGame();
