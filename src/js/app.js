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

function updateCheckboxColors(redTokens, whiteTokens) {
  const checkboxes = document.querySelectorAll('.checkboxes');
  let index = 0;

  // Set red tokens (e.g., red background)
  for (; index < redTokens; index++) {
    checkboxes[index].style.backgroundColor = 'red';
  }

  // Set white tokens (e.g., white background)
  for (let i = 0; i < whiteTokens; i++, index++) {
    checkboxes[index].style.backgroundColor = 'white';
  }

  // Set remaining checkboxes to default (gray)
  for (; index < checkboxes.length; index++) {
    checkboxes[index].style.backgroundColor = 'gray';
  }
}

// Get the token counts
// const { redTokens, whiteTokens } = countTokens(arr1, arr2);

// Update the checkbox colors
updateCheckboxColors(redTokens, whiteTokens);

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

const collectButton = document.querySelector('.collect-values-button');

listen('click', collectButton, () => {
  const values = []; 

  selectAll('.number-selector').forEach(selector => {
    const display = selector.querySelector('.number-display');
    values.push(parseInt(display.textContent)); // Push the current number to the array
  });

  console.log(values); 
});

