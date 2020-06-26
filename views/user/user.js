"use strict";
const { ipcRenderer, dialog } = require("electron");

const pTitle = document.querySelector('.title');
const btnTake = document.querySelector('.takeQuiz');
const btnView = document.querySelector('.viewQuiz');
const logout = document.querySelector('.logout');

const date = new Date();

pTitle.innerText = `Today: "${date.getDay()}-${date.getMonth()}-${date.getFullYear()}" Welcome exam online, Let's take quiz to success!!! `;
btnTake.addEventListener('click',(e) => {
    e.preventDefault();
    ipcRenderer.send('open-examsoftware');
})

logout.addEventListener('click', (e) => {
    e.preventDefault();
    ipcRenderer.send('comeback-login');
});

btnView.addEventListener('click', (e) => {
    e.preventDefault();
    ipcRenderer.send('view-quiz');
})