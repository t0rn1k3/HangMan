const word = document.getElementById('word');
const clueText = document.getElementById('clueText');
const wrong = document.getElementById('wrong-letter');
const won = document.getElementById('won');
const message = document.getElementById('message');
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

let wordQueue = [];
let currentIndex = 0;
let selectedWord = null;
let correct = [];
let incorrect = [];
let roundActive = false;

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
  loadWord(0);
}

function loadWord(index) {
  currentIndex = index;
  selectedWord = wordQueue[currentIndex];
  correct = [];
  incorrect = [];
  roundActive = true;
  won.style.visibility = 'hidden';
  play.textContent = btnNew;
  showWord();
  wrongLetter();
}

function showRoundEnd(didWin) {
  roundActive = false;
  if (didWin) {
    message.innerText = 'გილოცავთ! თქვენ გაიმარჯვეთ';
  } else {
    message.innerText = 'სამწუხაროდ, თქვენ ჩამოგახრჩვეს 😕';
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
  if (winner.style.visibility === 'visible' && play.textContent === btnNext) {
    loadWord(currentIndex + 1);
    return;
  }
  if (winner.style.visibility === 'visible' && play.textContent === btnNew) {
    startNewGame();
    return;
  }
  startNewGame();
});

startNewGame();
