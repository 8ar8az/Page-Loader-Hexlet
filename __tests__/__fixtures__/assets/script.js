/* eslint-disable */

const helloDiv = document.createElement('div');
helloDiv.classList.add('hello');
helloDiv.textContent = "Привет миру из приветственного div'a!";

document.body.children[0].after(helloDiv);
