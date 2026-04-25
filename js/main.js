const word = document.getElementById('word');
const clueText = document.getElementById('clueText');
const wrong = document.getElementById('wrong-letter');
const message = document.getElementById('message');
const roundScoreEl = document.getElementById('roundScore');
const stepProgressEl = document.getElementById('stepProgress');
const play = document.getElementById('play');
const roundProgressEl = document.getElementById('roundProgress');
const notification = document.getElementById('not');
const wordNavPrev = document.getElementById('wordNavPrev');
const wordNavNext = document.getElementById('wordNavNext');
const roundInline = document.getElementById('roundInline');
const retryRow = document.getElementById('retryRow');
const btnRetry = document.getElementById('btnRetry');
const winner = document.querySelector('.won');

const figure = document.querySelectorAll('.figure');

const words = [
  { word: 'ჯავასკრიპტი', clue: 'ის, რაც არ იცი' },
  { word: 'ჭვიშტარი', clue: 'მჭადი' },
  { word: 'შარავანდედი', clue: 'გვირგვინი' },
  { word: 'ნინტენდო', clue: 'Wario Land 4' },
  { word: 'თანამგზავრი', clue: 'მთვარე' },
  { word: 'ნოსფერატუ', clue: 'გრაფი ორლოკი' },
  { word: 'სვეტიცხოველი', clue: 'ფარსმან სპარსი' },
  { word: 'ბროწეული', clue: 'ფარაჯანოვი' },
  { word: 'ფარისეველი', clue: 'სტუდენტი, რომელიც ამბობს რომ კოდი AI ს გარეშე დაწერა' },
  { word: 'დარტანიანი', clue: '🧔🏻‍♂️🧔🏻‍♂️🧔🏻‍♂️  + 👨🏻 ' },
  { word: 'მაკულატურა', clue: 'გოგრა და თაფლის კურდღელი' },
  { word: 'ტიურინგი', clue: 'ენიგმა' },
];

const btnNewSession = 'ახალი თამაში';

let wordQueue = [];
let currentIndex = 0;
let selectedWord = null;
let correct = [];
let incorrect = [];
let roundActive = false;

const solvedIndices = new Set();

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

function startNewGame() {
  wordQueue = words.map((w) => ({ ...w }));
  currentIndex = 0;
  solvedIndices.clear();
  updateStepLabel();
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
  message.innerText = 'გილოცავთ! ყველა დონე გაიარეთ!';
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
      roundInline.textContent = `გილოცავთ! გადადით შემდეგ დონეზე .`;
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
    roundInline.textContent = `სამწუხაროდ, აზრზე არ ხართ! სცადეთ ისევ.`;
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

play.addEventListener('click', () => {
  startNewGame();
});

startNewGame();
