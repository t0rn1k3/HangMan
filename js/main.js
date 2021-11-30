let word = document.getElementById('word');
let wrong = document.getElementById('wrong-letter');
let won = document.getElementById('won');
let message = document.getElementById('message');
let play = document.getElementById('play');
let notification = document.getElementById('not');
let winner = document.querySelector('.won')

let figure = document.querySelectorAll('.figure');

let words = ['მაღაზია', 'ბიბლიოთეკა', 'ნაყინი', 'კატასტროფა', 'შანდალი', 'პანკრეასი', 'არასრულწლოვანი', 'დენთი', 'პარაკლისი', 'შვეიცარი', 'პარალელეპიპედი', 'არმია', 'ტრანკვილიზატორი', 'ტალახი', 'ძეხვი', 'მანდარინი', 'გალაქტიკა', 'ტორტი', 'პარაშუტი', 'ფერი', 'კალამი', 'წუმპე', 'ჯოხი', 'ჭადრაკი', 'პირანია', 'ჯალათი', 'ფერია', 'გონჯი', 'მხედარი']


let selectedWord = words[Math.floor(Math.random() * words.length)];

let correct = [];
let incorrect = [];



function ShowWord() {
    word.innerHTML = `
    ${selectedWord
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

  let inner = word.innerText.replace(/\n/g, '');

  if (inner == selectedWord) {
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
  
      if (selectedWord.includes(letter)) {
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