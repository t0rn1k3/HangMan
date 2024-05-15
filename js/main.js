const word = document.getElementById('word');
const clueText = document.getElementById('clueText')
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


const selectedWord = words[Math.floor(Math.random() * words.length)];

let correct = [];
let incorrect = [];



function ShowWord() {
    word.innerHTML = `
    ${selectedWord.word
      .split('')
      .map(
        letter => `
          <span class="letter">
 
           ${correct.includes(letter) ? letter : ''}
          </span>
        `
      )
      .join('')}
  `;

  clueText.innerText = selectedWord.clue;

  let inner = word.innerText.replace(/\n/g, '');
  console.log(inner)

  if (inner === selectedWord.word) {
    message.innerText = 'გილოცავთ! თქვენ გაიმარჯვეთ';
    winner.style.visibility = "visible";
  }
}

  
function WrongLetter() {
    wrong.innerHTML = `
        ${incorrect.length > 0 ? '<p>არასწორია :</p>' : ''}
        ${incorrect.map(letter => `<span>${letter}</span>`)}
    `;

    figure.forEach((parts, index) => {

        let error = incorrect.length;

        if (index < error) {
            parts.style.display = "block";
        }else {
            parts.style.display = 'none';
        }
    })
    if (incorrect.length === figure.length) {
        message.innerText = 'სამწუხაროდ, თქვენ ჩამოგახრჩვეს 😕';
        winner.style.visibility = 'visible';
    }
}

function ShowNot() {
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

window.addEventListener('keydown', e => {
    if (e.keyCode >= 65 && e.keyCode <= 90) {
      let letter = e.key;
  
      if (selectedWord.word.includes(letter)) {
        if (!correct.includes(letter)) {
          correct.push(letter);
  
          ShowWord();
        } else {
          ShowNot();
        }
      } else {
        if (!incorrect.includes(letter)) {
          incorrect.push(letter);
  
          WrongLetter();
        } else {
          ShowNot();
        }
      }
    }
  });


  play.addEventListener('click', () => {
        
        location.reload();
  })

ShowWord();