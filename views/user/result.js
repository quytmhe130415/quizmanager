"use strict";
const { ipcRenderer, dialog } = require("electron");

const tableResult = document.querySelector('#result'); 
const undo = document.querySelector('#undo');

ipcRenderer.send('infor-user');
ipcRenderer.on('total-correct', (event, resultUsers) => {
    console.log('==========');
    console.log(resultUsers);
    for(const resultEl of resultUsers){
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        const tdDate = document.createElement('td');
        const tdTime = document.createElement('td');
        const tdNumCorrect = document.createElement('td');
        const totalQues = document.createElement('td');

        tdName.innerText = resultEl.name;
        tdDate.innerText = resultEl.date;
        tdTime.innerText = resultEl.time;
        tdNumCorrect.innerText = resultEl.correct;
        totalQues.innerText =  resultEl.totalQues;

        tr.appendChild(tdName);
        tr.appendChild(tdDate);
        tr.appendChild(tdTime);
        tr.appendChild(tdNumCorrect);
        tr.appendChild(totalQues);
        tableResult.appendChild(tr);
    }
});

undo.addEventListener('click', (e) => {
    e.preventDefault();
    ipcRenderer.send('undo');
})
