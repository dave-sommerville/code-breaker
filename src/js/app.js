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
  getDate,
  isAlphaNum
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
const rulesButton = select('.info');
const rulesModal = select('.game-rules');
const scoresList = select('.high-scores-list');
const scoresWrapper = select('.scores-wrapper')
const viewScores = select('.scores-btn');
const muteButton = select('.mute');
const muteIcon = select('.mute-icon');
const quitButton = select('.quit');
/* -- Audio -- */
const guessSound = select('.sound-effect');
guessSound.load();
const bgMusic = select('.background-music');
const winnerSound = select('.winner-sound');
const loserSound = select('.loser-sound');

const SCORE_KEYS = {
  easy: 'easyModeScores',
  hard: 'hardModeScores'
};

function getScoreKey(game) {
  return game.isEasyMode ? SCORE_KEYS.easy : SCORE_KEYS.hard;
}


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
let timerInterval = null; 
let elapsedTime = 0;
let playerName = '';
let isEasyMode = true;
let selectorMax = 4;
/*------------------------------------------------>
  Gameplay mechanics
<------------------------------------------------*/
function launchNewGame() {
  playerName = nameInput.value.trim();
  if(playerName.length <= 0) {
    nameError.textContent = 'Please enter a name';
  } else if(playerName.length > 6) {
    nameError.textContent = '6 letters max';
  } else if (!isAlphaNum(playerName)) {
    nameError.textContent = 'No special characters';
  } else if(containsProfanity(playerName)) {
    nameError.textContent = 'No Profanity please';
    nameInput.value = '';
  } else {
    nameError.textContent = '';
    addClass(gameArea, "expanded");
    addClass(nameScrn, "retracted");
    addClass(titleImage, "in-play");
    addClass(rulesButton, "hidden");
    addClass(viewScores, "hidden");
    removeClass(muteButton, "hidden");
    removeClass(quitButton, "hidden");
    startGamePlay(playerName);
    // bgMusic.muted = false;
    //   if (muteIcon.classList.contains("fa-volume-off")) {
    //     muteIcon.classList.toggle("fa-volume-off");
    //     muteIcon.classList.toggle("fa-volume-xmark");
    //   }
    // bgMusic.currentTime = 0;  
    // bgMusic.play();
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
  resetTimer();
}

function displayGameOverModal() {
    resultsModal.showModal();
    bgMusic.muted = true;
    resultMain.innerText = 'Game Over!';
    boldText.innerText = 'You\'ve used all your guesses.';
    codeDisplay.innerText = 'The code was: ' + masterCode.join(', ');
}

/*-------------------------------------------------------------------------->
  TIMER
<--------------------------------------------------------------------------*/
function updateTimerDisplay() {
  // .padStart(4, '0') is the modern way to do your decimelTracker logic
  const formattedTime = String(elapsedTime).padStart(4, '0');
  timer.innerText = formattedTime;
  return formattedTime;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    elapsedTime++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopTimer();
  elapsedTime = 0;
  updateTimerDisplay();
  addClass(timer, "hidden");
}

function pauseTimer(ms) {
  stopTimer(); 
  setTimeout(() => {
    // Only resume if the game isn't over
    if (!currentGame.isGameOver) {
      startTimer();
    }
  }, ms);
}
/*-------------------------------------------------------------------------->
  SCORE MANAGEMENT 
<--------------------------------------------------------------------------*/
function saveScoresToLocalStorage(scores, listName) {
  const topScores = scores.slice(0, 10);
  const scoresJSON = JSON.stringify(topScores);
  localStorage.setItem(listName, scoresJSON);
}

function loadScoresFromLocalStorage(listName) {
  const scoresJSON = localStorage.getItem(listName); 
  if (scoresJSON) {
    return JSON.parse(scoresJSON);
  }
  return [];
}

function calculateScoreObj(game){
  const date = getDate();
  const newScore = {
    name: game.name,
    date: date,
    time: elapsedTime,
    guesses: game.guessCount
  };
  return newScore;
}
function calculateScore(game) {
  let newScore = calculateScoreObj(game);
  let scoresList = loadScoresFromLocalStorage(getScoreKey(currentGame));
    scoresList.push(newScore);
    scoresList.sort((a, b) => a.guesses - b.guesses);
    if (scoresList.length > 10) {
      scoresList = scoresList.slice(0, 10);
    }
    saveScoresToLocalStorage(scoresList, getScoreKey(currentGame));
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

function setupNumberSpinner(upArrow, downArrow, display) {
  if (isEasyMode) {
    selectorMax = 4;
  } else {
    selectorMax = 6;
  }
  listen('click', upArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === selectorMax ? 1 : current + 1;
  });

  listen('click', downArrow, () => {
    let current = parseInt(display.textContent);
    display.textContent = current === 1 ? selectorMax : current - 1;
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

const topGuessDisplay = select('.top-guess-display');
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
  removeClass(topGuessDisplay, "hidden");
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
  gridContainer.innerHTML = '';
  checkboxContainer.innerHTML = '';
  // From 2 to intentionally skip the latest guess 
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

function startGamePlay() {  
  currentGame = new Game(playerName, isEasyMode);
  console.log(currentGame.masterCode);
  if (!currentGame.isEasyMode) {
    selectorMax = 6;
  } else {
    selectorMax = 4;
  }
  startTimer();
}

listen('click', collectButton, () => {
  nameError.textContent = '';
  addClass(topGuessDisplay, "hidden");
  const guess = collectValues();
  if (currentGame.containsDuplicateGuess(guess)) {
    nameError.textContent = 'You already guessed that, try again';
    return; 
  }
  pauseTimer(1000);
  guessSound.play();
  currentGame.submitGuess(guess);
  const latestGuess = currentGame.guesses[currentGame.guesses.length - 1];
  updateLatestGuessDisplay(latestGuess);
  createGuessDisplays(currentGame);
  if(currentGame.isGameOver) {
    if (currentGame.isGameWon) {
      calculateScore(currentGame);
      alert("You Win!");
      resetGame();
    } else {
      alert("You Lose!");
      resetGame();
    }
  }
});

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



listen('click', rulesModal, function(ev) {
  const rect = this.getBoundingClientRect();
  if (ev.clientY < rect.top || ev.clientY > rect.bottom || 
    ev.clientX < rect.left || ev.clientX > rect.right) {
      rulesModal.close();
  }
});

listen('click', viewScores, () => {
  scoresWrapper.showModal();
    const topScores = loadScoresFromLocalStorage(getScoreKey(currentGame));
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
