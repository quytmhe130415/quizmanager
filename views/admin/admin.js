"use strict";
const { ipcRenderer, dialog } = require("electron");

const divCreater = document.querySelector(".create");
const logout = document.querySelector("#logout");
const imgCreate = document.querySelector("#icCreate");
const { Quiz } = require("../../model/quiz");

//* Quit manager
logout.addEventListener("click", (e) => {
  e.preventDefault();
  ipcRenderer.send("logout-tab");
});
//* Send message get quizzes
ipcRenderer.send("get-quizzes");

//* Create element Q&A ...!
ipcRenderer.on("create-quiz", (_, quizzes) => {
  createQuiz(quizzes);
});
//* Send message to create quiz
imgCreate.addEventListener("click", (e) => {
  e.preventDefault();
  ipcRenderer.send("open-create");
});
//* create element quiz...!
async function createQuiz(quizzes) {
  let count = 1;
  const arrAns = ["A", "B", "C", "D"];
  for (let item of quizzes) {
    // console.log(item);
    const divDisplay = document.createElement("div");
    divDisplay.setAttribute("id", item._id);
    divDisplay.setAttribute("class", "divDisplay");
    const divQuestion = document.createElement("div");
    divQuestion.setAttribute("class", "divQues");
    const textQues = document.createElement("textarea");
    textQues.setAttribute("class", "txtQues");
    textQues.textContent = `${count}. ${item.question}`;
    textQues.disabled = true;
    divQuestion.appendChild(textQues);
    divDisplay.appendChild(divQuestion);
    //* answer
    const lstAnswer = item.answer;
    const corectAnswers = item.correct;
    const divAnswer = document.createElement("div");

    divAnswer.setAttribute("class", "divAns");
    let i = 0;
    for (const answer of lstAnswer) {
      const divAns = document.createElement("div");
      const ansInput = document.createElement("input");
      ansInput.setAttribute("type", "text");
      ansInput.setAttribute("class", "ansInput");
      ansInput.value = `${answer}`;
      ansInput.disabled = true;
      //*create label
      const labelABCD = document.createElement("label");
      labelABCD.innerText = `${arrAns[i]}`;
      labelABCD.setAttribute("class", "lblAns");
      //* create checkbox
      const checkBox = document.createElement("input");
      checkBox.setAttribute("type", "checkbox");
      checkBox.setAttribute("class", "cbAns");
      checkBox.setAttribute("id", i);
      //* appenchild 
      divAns.appendChild(labelABCD);
      divAns.appendChild(ansInput);
      divAns.appendChild(checkBox);
      divAnswer.appendChild(divAns);

      for (let i of corectAnswers) {
        if (i == checkBox.id) {
          checkBox.checked = true;
          checkBox.disabled = true;
        } else {
          checkBox.checked = false;
          checkBox.disabled = true;
        }
      }
      i++;
    }
    //* create element icon
    const iconEdit = document.createElement("i");
    const iconDelete = document.createElement("i");
    const iconSave = document.createElement("i");
    iconEdit.setAttribute("class", "fas fa-edit");
    iconEdit.setAttribute("id", "icEdit"); //`id-${count}`
    //* click to edit
    iconEdit.addEventListener("click", (e) => {
      e.preventDefault();
      const inputEdits = divDisplay.querySelectorAll(`input`);
      divDisplay.querySelector("textarea").disabled = false;
      for (const input of inputEdits) {
        input.disabled = false;
      }
    });
    //* click to save
    iconSave.addEventListener("click", (e) => {
      e.preventDefault();
      //* get all input answer!!!
      const inputEdits = divDisplay.querySelectorAll(`input`);
      divDisplay.querySelector("textarea").disabled = true;
      const txtQues = divDisplay.querySelector("textarea").value;
      const arrText = txtQues.split(".");
      const question = arrText[1]; // set atribute for quiz
      for (const input of inputEdits) {
        input.disabled = true;
      }
      const inputAnswer = divDisplay.querySelectorAll('input[type="text"]');
      const answers = [];
      for (const itemAns of inputAnswer) {
        answers.push(itemAns.value);
      }
      const lstCheckBox = divDisplay.querySelectorAll('input[type="checkbox"]');
      const corrects = [];
      for (const cb of lstCheckBox) {
        if (cb.checked == true) {
          corrects.push(cb.id);
        }
      }
      const newQuiz = new Quiz(question, answers, corrects, item.time);
      //! send message update ne!!!
      ipcRenderer.send("update-quiz", { quiz: newQuiz, _id: item._id });
    });
    iconSave.setAttribute("class", "fas fa-save");
    iconSave.setAttribute("id", "icSave");
    iconDelete.setAttribute("class", "fas fa-trash-alt");
    iconDelete.setAttribute("id", "icDelete");
    //* add event for delete
    iconDelete.addEventListener("click", (e) => {
      e.preventDefault();
      const idQuiz = item._id;
      ipcRenderer.send("delete-quiz", idQuiz);
      divDisplay.remove();
    });
    //* appenchild
    divDisplay.appendChild(divAnswer);
    divDisplay.appendChild(iconEdit);
    divDisplay.appendChild(iconSave);
    divDisplay.appendChild(iconDelete);
    divCreater.appendChild(divDisplay);
    count++;
  }
}
