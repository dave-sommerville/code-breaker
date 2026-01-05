'use strict';

/*------------------------------------------------>
Utility Functions
<------------------------------------------------*/

export function select(selector, scope = document) {
  return scope.querySelector(selector);
}

export function selectAll(selector, scope = document) {
  return scope.querySelectorAll(selector);
}

export function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

export function create(element) {
  return document.createElement(element);
}

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function addClass(element, customClass) {
  element.classList.add(customClass);
  return element;
}

export function removeClass(element, customClass) {
  if(element.classList.contains(customClass)) {
    element.classList.remove(customClass);
    return element;
  }
}

export function getDate() {
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }

  return new Date().toLocaleDateString('en-ca', options);
}
export function isAlphaNum(inputString) {
    // Standard pattern for letters and numbers
    let pattern = /^[a-zA-Z0-9-]+$/;

    return pattern.test(inputString);
}
export function randomDigit() {
  Math.floor(Math.random() * 10);
}
export function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
export async function typeText(element, text, speed = 60) {
  element.textContent = "";
  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    await new Promise(resolve => setTimeout(resolve, speed));
  }
}