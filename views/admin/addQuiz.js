const { ipcRenderer } = require("electron");

const select = document.querySelector("#typeQuiz");
const divMain = document.querySelector(".mainCreate");
const btnCreate = document.querySelector(".createAns");
const btnList = document.querySelector("#comeback");
const btnExit = document.querySelector("#exit");
const btnSave = document.querySelector(".save");
const btnReset = document.querySelector("#reset");
const { Quiz } = require("../../model/quiz");

//* check selected tinh sau!!!
select.addEventListener("change", (e) => {
    e.preventDefault();
});
//* undo list quizzes
btnList.addEventListener("click", (e) => {
    e.preventDefault();
    ipcRenderer.send("undo-list");
});
//* exit program!!!
btnExit.addEventListener("click", (e) => {
    e.preventDefault();
    ipcRenderer.send("exit-program");
});
//* create question
btnCreate.addEventListener("click", (e) => {
    e.preventDefault();
    const divAns = document.createElement("div");
    divAns.setAttribute("class", `divAns`);
    const label = document.createElement("label");
    const checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.setAttribute("class", "cbAns");
    const removeQuiz = document.createElement("img");
    removeQuiz.setAttribute("src", "../admin/remove.png");
    removeQuiz.setAttribute("class", "imgRemove");
    label.setAttribute("class", "lblAns");
    label.innerText = "Answer";
    const inputAnswer = document.createElement("input");
    inputAnswer.setAttribute("type", "text");
    inputAnswer.setAttribute("class", "inputAns");
    inputAnswer.required = true;
    
    divAns.appendChild(label);
    divAns.appendChild(inputAnswer);
    divAns.appendChild(checkBox);
    divAns.appendChild(removeQuiz);
    divMain.appendChild(divAns);
    //* remove answer
    removeQuiz.addEventListener("click", (e) => {
        e.preventDefault();
        divAns.remove();
    });
});
//* add event button save
btnSave.addEventListener("click", (e) => {
    e.preventDefault();
    const question = document.querySelector(".txt-question").value;
    const answerInputs = document.querySelectorAll(".inputAns");
    const answers = [];
    for (const itemAns of answerInputs) {
        answers.push(itemAns.value);
    }
    const checkBoxes = document.querySelectorAll(".cbAns");
    const correct = [];
    for (let i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            correct.push(i);
        }
    }
    // console.log('a');
    const quiz = new Quiz(question, answers, correct, Date.now());
    ipcRenderer.send("add-newQuiz", quiz);
});
//* event click reset
btnReset.addEventListener("click", (e) => {
    e.preventDefault();
    //* reset question
    document.querySelector(".txt-question").value = "";
    const answers = document.querySelectorAll(".inputAns");
    //* reset input answer
    for (const item of answers) {
        item.value = "";
    }
    const checkBoxes = document.querySelectorAll(".cbAns");
    for (const itemCb of checkBoxes) {
        if (itemCb.checked === true) {
            itemCb.checked = false;
        }
    }
});