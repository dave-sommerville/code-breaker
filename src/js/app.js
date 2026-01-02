'use strict';
/*
Today's Lesson is on 

~*~*~*TECHNICAL DEBT*~*~*~ 

So this is a game that I first created around a year ago. When I built it, I wasn't entirely sure of how to handle the events dynamically, so I had AI create a very monolithic structure for the arrow buttons and selectors. I cleaned it up with JS utilities and understood how it was functioning (and it was indeed... functioning), but then called it good enough. 

Now coming back to it, with new knowledge of CSS effects and JS I can apply to it and... WHAT A PAIN
I just want to make it a little fancier, but how to do that without bloating the code horribly!

After a few hours of staring blankly at my screen (followed by a chilly bus ride obsessing over it), I have decided to refactor this baby. 

Firstly, I'm gonna get all OOP on it. I see the player and guesses as objects now. This will make the code much cleaner, modular, and durable. 

I will also make it so that the first guess displayed after the collect guess button is coded into the html. This will allow me to select it much more delebriately. The subsequent guesses can be populated dynamically with a triggered function. 
I thought I'd try to maintain the old code to show the difference between the two approaches. I will likely clean up the notes in later commits though. 

I'm fully aware that I'm probably going to overkill it with design now, but I'd sooner do that than return to the project next year and be unable to expand on functionality again. 

*/
import {
  select, 
  selectAll, 
  listen, 
  create, 
  getRandomNumber, 
  addClass, 
  removeClass,
  getDate
} from './utils.js';
import { containsProfanity } from './profanity-filter.js';
import { Game } from './game.js';
import { Guess } from './guess.js';
/*------------------------------------------------>
  Element Selectors 
<------------------------------------------------*/
/* -- Intro Screen -- */
const nameScrn = select('.name-scrn');
const nameInput = select('.name-input');
const nameButton = select('.name-btn');
const nameError = select('.name-error');
/* -- Screen Sizing -- */

const gameArea = select('.game-area');
const titleImage = select('.title');
const main = select('main');
/* -- Game Area -- */

const gridContainer = select('.grid-container');
const collectButton = select('.collect-values-button');
const checkboxContainer = select('.checkbox-container');
const timer = select('.timer');
const newGame = select('.new-game');
/* -- Results Modal -- */

const resultsModal = select('.game-results');
const resultMain = select('h2');
const boldText = select('h3');
const codeDisplay = select('.mastercode');
/* -- Control Box -- */

const buttonBox = select('.rules');
const rulesButton = select('.info');
const rulesButtonTwo = select('.info-main');
const rulesButtonThree = select('.info-intro');
const rulesModal = select('.game-rules');
const scoresList = select('.high-scores-list');
const scoresWrapper = select('.scores-wrapper')
const viewScores = select('.scores-btn');
const viewScoresTwo = select('.scores-btn-intro');
const muteButton = select('.mute');
const muteIcon = select('.mute-icon');
const quitButton = select('.quit');
/* -- Audio -- */

const guessSound = select('.sound-effect');
guessSound.load();
const bgMusic = select('.background-music');
const winnerSound = select('.winner-sound');
const loserSound = select('.loser-sound');

/*------------------------------------------------>
  Initial Declarations
<------------------------------------------------*/
const randomCharacters = [
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "~",
  "?",
  "A",
  "B",
  "C",
  "0",
  "1",
  "2",
];
let startTime = new Date();  
let timerInterval; 
let formattedTime = '';
let elapsedTime = 0;

const transitionDurationMs = 500;
let playerName = '';
let isEasyMode = true;
let masterCode;



/*------------------------------------------------>
  Previous Guess Info 
<------------------------------------------------*/
/*
function populateWithSpans(valuesArray) {
  gridContainer.innerHTML = ""; 
  valuesArray.forEach((value) => {
    const span = create("span");
    span.textContent = value;
    span.classList.add("box");
    gridContainer.appendChild(span);
  });
}
  */


/*
function updateCheckboxColors(redTokens, whiteTokens) {
  const checkboxContainer = select('.checkbox-container');
  const checkboxGroup = create('div');
  checkboxGroup.classList.add('checkbox-group');
  
  for (let i = 0; i < 4; i++) {
    const checkbox = create('div');
    checkbox.classList.add('checkboxes');
    checkboxGroup.appendChild(checkbox);
  }
  checkboxContainer.appendChild(checkboxGroup);
  const currentCheckboxes = selectAll('.checkboxes', checkboxGroup);
  
  let index = 0;
  for (; index < redTokens; index++) {
    currentCheckboxes[index].classList.add('red');
  }
  for (let i = 0; i < whiteTokens; i++, index++) {
    currentCheckboxes[index].classList.add('white');
  }
}
*/

// function checkWinCondition(redTokens, codeLength) {
//   if (redTokens === codeLength) {
//     resultsModal.showModal();
//     addClass(buttonBox, "hidden");
//     addClass(timer, "hidden");
//     bgMusic.muted = true;
//     resultMain.innerText = 'Congratulations!';
//     boldText.innerText = 'You guessed correctly';
//     codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
//     clearInterval(timerInterval);  
//     calculateScore();
//     winnerSound.play();
//   }
// }

/*------------------------------------------------>
  Gameplay mechanics
<------------------------------------------------*/
// gotta move 

function isValid(inputString) {
    // Standard pattern for letters and numbers
    let pattern = /^[a-zA-Z0-9-]+$/;

    return pattern.test(inputString);
}
// ^^

// This should be mostly complete
function launchNewGame() {
  playerName = nameInput.value.trim();
  if(playerName.length > 6) {
    nameError.textContent = '6 letters max';
  } else if (!isValid(playerName)) {
    nameError.textContent = 'No special characters';
  } else if(containsProfanity(playerName)) {
    nameError.textContent = 'No Profanity please';
    nameInput.value = '';
  } else {
    nameError.textContent = '';
    addClass(gameArea, "expanded");
    addClass(nameScrn, "retracted");
    addClass(titleImage, "in-play");
    startGamePlay(playerName);
    bgMusic.muted = false;
      if (muteIcon.classList.contains("fa-volume-off")) {
        muteIcon.classList.toggle("fa-volume-off");
        muteIcon.classList.toggle("fa-volume-xmark");
      }
    bgMusic.currentTime = 0;  
    bgMusic.play();
    removeClass(buttonBox, "hidden");
    removeClass(timer, "hidden");
    nameInput.value = '';
  }
}
// This will change!!!!
function resetGame() {
  playerName = '';
  removeClass(gameArea, "expanded");
  removeClass(nameScrn, "retracted");
  removeClass(titleImage, "in-play");
  gridContainer.innerHTML = ""; 
  checkboxContainer.innerHTML = ""; 

}



function displayGameOverModal() {
    resultsModal.showModal();
    addClass(buttonBox, "hidden");
    addClass(timer, "hidden");
    bgMusic.muted = true;
    resultMain.innerText = 'Game Over!';
    boldText.innerText = 'You\'ve used all your guesses.';
    codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
}



/*-------------------------------------------------------------------------->
  TIMER
<--------------------------------------------------------------------------*/
// Timer needs fixing, but is hopefully mostly complete
function decimelTracker() {
  if (elapsedTime < 10) {
    formattedTime = `000${elapsedTime}`
  } else if (elapsedTime >= 10 && elapsedTime < 100) {
    formattedTime = `00${elapsedTime}`
  } else if (elapsedTime >= 100 && elapsedTime < 1000) {
    formattedTime = `0${elapsedTime}`
  } else {
    formattedTime = `${elapsedTime}`
  }
  return formattedTime;
}

function updateTimer() {
  decimelTracker();

  if (elapsedTime <= 0) {
    timer.innerText = '0000';
  } else {
    timer.innerText = formattedTime;
  }
  return formattedTime;
}

function startTimer() {
  startTime = new Date() - elapsedTime * 1000;  
  timer.innerText = formattedTime || '0000'; 

  timerInterval = setInterval(() => {

    elapsedTime = Math.floor((new Date() - startTime) / 1000);
    updateTimer();  
  }, 1000);  
}
function pauseAndResumeTimer(pauseDuration) {
  clearInterval(timerInterval);
  setTimeout(() => {
    startTimer();
  }, pauseDuration)
}



/*-------------------------------------------------------------------------->
  SCORE MANAGEMENT 
<--------------------------------------------------------------------------*/
// Hoping to maintain most of the score management functions
function saveScoresToLocalStorage(scores) {
  const topScores = scores.slice(0, 10);
  const scoresJSON = JSON.stringify(topScores);
  localStorage.setItem('codeBreakerScores', scoresJSON); // Updated key
}

function loadScoresFromLocalStorage() {
  const scoresJSON = localStorage.getItem('codeBreakerScores'); // Updated key
  if (scoresJSON) {
    return JSON.parse(scoresJSON);
  }
  return [];
}

function calculateScore() {
  const date = getDate();
  const time = updateTimer();
  const newScore = {
    name: playerName,
    date: date,
    time: time,
    guesses: guessCount,
  };

  let existingScores = loadScoresFromLocalStorage();

  existingScores.push(newScore);
  existingScores.sort((a, b) => a.guesses - b.guesses);

  if (existingScores.length > 10) {
    existingScores = existingScores.slice(0, 10);
  }
  saveScoresToLocalStorage(existingScores);
}

function populateScoreList(scores) {
  scoresList.innerHTML = ''; 
  scores.forEach((score, index) => {
    const li = createScoreListItem(score);
    li.style.animationDelay = `${index * 0.2}s`; 
    li.classList.add('li-animation'); 
    scoresList.appendChild(li);
  });
}

function createScoreListItem(score) {
  const li = create('li');

  const details = `
      <span>${score.name}</span> |
      <span>${score.date}</span> | 
      <span>${score.guesses}</span> |
      <span>${score.time}</span> 
      sec
  `;
  li.innerHTML = details;
  return li; 
}

/*-------------------------------------------------------------------------->
  Event Listeners
<--------------------------------------------------------------------------*/
/*  -- Gameplay --  */

resultMain.innerText = 'CODE BREAKER';
boldText.innerText = 'Can you guess my code?';

function setupNumberSpinner(upArrow, downArrow, display, min = 1, max = 6) {
  listen('click', upArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === max ? min : current + 1;
  });

  listen('click', downArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === min ? max : current - 1;
  });
}

setupNumberSpinner(
  select('.arrow.up.one'),
  select('.arrow.down.one'),
  select('.number-display.one')
);

setupNumberSpinner(
  select('.arrow.up.two'),
  select('.arrow.down.two'),
  select('.number-display.two')
);
setupNumberSpinner(
  select('.arrow.up.three'),
  select('.arrow.down.three'),
  select('.number-display.three')
);

setupNumberSpinner(
  select('.arrow.up.four'),
  select('.arrow.down.four'),
  select('.number-display.four')
);

function collectValues() {
  const numDisOne = select('.number-display.one');
  const numDisTwo = select('.number-display.two');
  const numDisThree = select('.number-display.three');
  const numDisFour = select('.number-display.four');

  let num0 = parseInt(numDisOne.textContent, 10);
  let num1 = parseInt(numDisTwo.textContent, 10);
  let num2 = parseInt(numDisThree.textContent, 10);
  let num3 = parseInt(numDisFour.textContent, 10);
  const numArr = [num0, num1, num2, num3];
  return numArr;
}



/*
selectAll('.number-selector').forEach(selector => {
  const display = selector.querySelector('.number-display');
  const upArrow = selector.querySelector('.arrow.up');
  const downArrow = selector.querySelector('.arrow.down');

  listen('click', upArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === 6 ? 1 : current + 1;
  });

  listen('click', downArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === 1 ? 6 : current - 1;
  });
});
*/

const topGuessOne = select('.top-0');
const topGuessTwo = select('.top-1');
const topGuessThree = select('.top-2');
const topGuessFour = select('.top-3');
const topCheckOne = select('.box-0');
const topCheckTwo = select('.box-1');
const topCheckThree = select('.box-2');
const topCheckFour = select('.box-3');

function updateLatestGuessDisplay(guess) {
  // Update the numbers
  const topDisplays = [topGuessOne, topGuessTwo, topGuessThree, topGuessFour];
  guess.digits.forEach((digit, i) => {
    topDisplays[i].textContent = digit;
  });

  // Update the feedback (checkmarks/tokens)
  const topChecks = [topCheckOne, topCheckTwo, topCheckThree, topCheckFour];
  // Reset colors first
  topChecks.forEach(check => check.classList.remove('red', 'white'));
  
  let checkIndex = 0;
  for (let i = 0; i < guess.redTokens; i++) {
    topChecks[checkIndex++].classList.add('red');
  }
  for (let i = 0; i < guess.whiteTokens; i++) {
    topChecks[checkIndex++].classList.add('white');
  }
}

function createGuessDisplays(game) {
  // 1. Clear the containers ONCE before the loop starts
  gridContainer.innerHTML = '';
  checkboxContainer.innerHTML = '';

  // 2. We want everything EXCEPT the last element (the most recent)
  // If the latest is at the end, we loop from (length - 2) down to 0
  if (game.guesses.length >= 2) {
    for (let i = game.guesses.length - 2; i >= 0; i--) {
      createGuessElement(game.guesses[i]);
    }
  }
}
function createGuessElement(guess) {
  let valuesArray = guess.digits;
  let redTokens = guess.redTokens;
  let whiteTokens = guess.whiteTokens;
  valuesArray.forEach((value) => {
    const span = create("span");
    span.textContent = value;
    span.classList.add("box");
    gridContainer.appendChild(span);
  });
  const checkboxGroup = create('div');
  checkboxGroup.classList.add('checkbox-group');
  
  for (let i = 0; i < 4; i++) {
    const checkbox = create('div');
    checkbox.classList.add('checkboxes');
    checkboxGroup.appendChild(checkbox);
  }
  checkboxContainer.appendChild(checkboxGroup);
  const currentCheckboxes = selectAll('.checkboxes', checkboxGroup);
  
  let index = 0;
  for (; index < redTokens; index++) {
    currentCheckboxes[index].classList.add('red');
  }
  for (let i = 0; i < whiteTokens; i++, index++) {
    currentCheckboxes[index].classList.add('white');
  }

}
function animateGuess() {

}
let currentGame;

// NEED TO CHANGE THE MECHANICS!!
function startGamePlay() {  
  currentGame = new Game(playerName, isEasyMode);
  console.log(currentGame)
  console.log(currentGame.masterCode);
  startTimer();
}

listen('click', collectButton, () => {
  console.log("Collected")
  const guess = collectValues();
  if (currentGame.containsDuplicateGuess(guess)) {
    alert("You have already guessed this combination! Try a new one.");
    return; 
  }
  guessSound.play();
  currentGame.submitGuess(guess);
  const latestGuess = currentGame.guesses[currentGame.guesses.length - 1];
  updateLatestGuessDisplay(latestGuess);
  createGuessDisplays(currentGame);
  if(currentGame.isGameOver) {
    if (currentGame.isGameWon) {
      alert("You Win!");
      // Add Scores
      resetGame();
    } else {
      alert("You Lose!");
      resetGame();
    }
  }
});

/*
listen('click', collectButton, () => {
  guessSound.play();
  const playerGuess = [];
  selectAll('.number-selector').forEach(selector => {
    const display = selector.querySelector('.number-display');
    playerGuess.push(parseInt(display.textContent));
  });


  //WILL NEED A DUPLICATE CHECKING METHOD IN THE 
  //GUESS GLASS WITH A PRIVATE FIELD TRACKING THE GAME STATE
  const isDuplicate = guessHistory.some(pastGuess => {
    return pastGuess.every((value, index) => value === playerGuess[index]);
  });

  if (isDuplicate) {
    alert("You have already guessed this combination! Try a new one.");
    return; 
  }


  // Hoping to not impact the  timer functions too greatly
  pauseAndResumeTimer();
  
  // lIKELY NOT NEEDED, BUT MAY ADD AN ANIMATION HERE
  main.classList.add("animation");
  setTimeout(()=>{
      main.classList.remove("animation");
  }, 1000);
  
  const { redTokens, whiteTokens } = countTokens(masterCode, playerGuess);
  // Tokens will be moved into the object
  // The Checkbox colors will get populated by the object status
  updateCheckboxColors(redTokens, whiteTokens);
  guessHistory.push([...playerGuess]);
  const reversedHistory = guessHistory.slice().reverse();
  // This will be renamed and the function changed
  populateWithSpans(reversedHistory.flat());
  // This will be in the player object
  guessCount++;
  checkWinCondition(redTokens, masterCode.length);
  
  if (guessCount >= maxGuesses) {
    loserSound.play();
    timer.innerText = '0000'; 
    displayGameOverModal();
  }
});
*/
listen('click', newGame, ()=> {
  resultsModal.close();
  resetGame();
});

listen('click', nameButton, ()=>{
  launchNewGame();
});

listen('keydown', nameInput, (event) => {
  // Check if the key pressed is the 'Enter' key
  if (event.key === 'Enter') {
    // Prevent the default action (which might be submitting a form and refreshing the page)
    event.preventDefault();
    launchNewGame();
  }
});

/*  -- Modals --  */

listen('click', rulesButton, () => {
  rulesModal.showModal();
});
listen('click', rulesButtonTwo, () => {
  rulesModal.showModal();
});
listen('click', rulesButtonThree, () => {
  rulesModal.showModal();
});

listen('click', rulesModal, function(ev) {
  const rect = this.getBoundingClientRect();
  if (ev.clientY < rect.top || ev.clientY > rect.bottom || 
    ev.clientX < rect.left || ev.clientX > rect.right) {
      rulesModal.close();
  }
});

listen('click', viewScores, () => {
  scoresWrapper.showModal();
    const topScores = loadScoresFromLocalStorage();
  populateScoreList(topScores);
});

listen('click', viewScoresTwo, () => {
  scoresWrapper.showModal();
    const topScores = loadScoresFromLocalStorage();
  populateScoreList(topScores);
});

listen('click', scoresWrapper, function(ev) {
  const rect = this.getBoundingClientRect();
  if (ev.clientY < rect.top || ev.clientY > rect.bottom || 
    ev.clientX < rect.left || ev.clientX > rect.right) {
      scoresWrapper.close();
  }
});

/*  -- Other --  */

listen('click', quitButton, () => {
  displayGameOverModal();
});

listen('click', muteButton, () => {
  bgMusic.muted = !bgMusic.muted; 
  muteIcon.classList.toggle("fa-volume-off");
  muteIcon.classList.toggle("fa-volume-xmark");
});
