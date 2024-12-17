'use strict';
/*------------------------------------------------>

<------------------------------------------------*/

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function selectAll(selector, scope = document) {
  return scope.querySelectorAll(selector);
}

function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

function addClass(element, customClass) {
  element.classList.add(customClass);
  return element;
}

function removeClass(element, customClass) {
  element.classList.remove(customClass);
  return element;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*------------------------------------------------>
Master mind 
<------------------------------------------------*/
const arr1 = [2, 2, 2, 2];
const arr2 = [1, 2, 3, 2];

function countTokens(arr1, arr2) {
  let redTokens = 0;
  let whiteTokens = 0;
  const arr2Copy = [...arr2];

  arr1.forEach((num, index) => {
    if (num === arr2[index]) {
      redTokens++;
      arr2Copy[index] = null; 
    } else if (arr2Copy.includes(num)) {
      whiteTokens++;
      arr2Copy[arr2Copy.indexOf(num)] = null; 
    }
  });

  return { redTokens, whiteTokens };
}

const { redTokens, whiteTokens } = countTokens(arr1, arr2);
console.log(redTokens, whiteTokens);

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

// Button to collect the selected values
const collectButton = document.querySelector('.collect-values-button');

// Event listener for the button
listen('click', collectButton, () => {
  const values = []; // Initialize an array to store the values

  // Loop through each number selector
  selectAll('.number-selector').forEach(selector => {
    const display = selector.querySelector('.number-display');
    values.push(parseInt(display.textContent)); // Push the current number to the array
  });

  console.log(values); // Log the array for verification or further use
});

const gridData = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
  [21, 22, 23, 24],
  [25, 26, 27, 28],
  [29, 30, 31, 32],
];

// Select the grid container
const gridContainer = document.getElementById('grid-container');

// Apply styles to the grid container
gridContainer.style.display = 'grid';
gridContainer.style.gridTemplateRows = `repeat(${gridData.length}, auto)`;
gridContainer.style.gridTemplateColumns = `repeat(4, 1fr)`;
gridContainer.style.gap = '10px';

// Generate the grid
gridData.forEach(row => {
  row.forEach(cell => {
    const cellElement = document.createElement('div');
    cellElement.textContent = cell;
    cellElement.style.border = '1px solid black';
    cellElement.style.padding = '10px';
    cellElement.style.textAlign = 'center';
    gridContainer.appendChild(cellElement);
  });
});
