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

export function getDate() {
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }

  return new Date().toLocaleDateString('en-ca', options);
}