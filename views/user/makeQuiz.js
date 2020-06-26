"use strict";
const { ipcRenderer, dialog } = require("electron");

const displayQuestion = document.querySelector(".displayQuestion");
const displayAnswer = document.querySelector(".answers");
const buttonQuestion = document.querySelector(".buttonQuestion");
const pTimer = document.querySelector(".timeDown");
const cbFinishTest = document.querySelector('#finishTest');
const btnFinish = document.querySelector('#finish');
const Minute_Default = 60;
const Second_Default = 60;
const nowDate = new Date();
let duration = 0;
let newQuizzes = []

ipcRenderer.send("get-all-quiz");
ipcRenderer.on("list-quiz", (_, quizzes) => {
  let Total_Time = quizzes.length * Second_Default;
  let hour = parseInt(Total_Time / (Minute_Default * Second_Default));
  let minute = (Total_Time % (Minute_Default * Second_Default)) / Second_Default;
  let second = (Total_Time % (Minute_Default * Second_Default)) % Second_Default;
  duration = Total_Time / Second_Default;

  const time = setInterval(() => {
    Total_Time -= 1;
    pTimer.textContent = `${hour}:${minute}:${second}`;
    second -= 1;
    if (second <= 0) {
      minute -= 1;
      second = Second_Default;
    }
    if (minute <= 0 && hour != 0) {
      hour -= 1;
      minute = Minute_Default;
    }
    if (Total_Time < Second_Default) {
      pTimer.textContent = `0:00:00`;
    }
    if (Total_Time < 0) {
      pTimer.textContent = `0:00:00`;
      const date = `${nowDate.getDate()}/${nowDate.getMonth() + 1}/${nowDate.getFullYear()}`;
      ipcRenderer.send("finish-test", date);
      clearInterval(time);
    }
  }, 100);

  for (let i = 0; i < quizzes.length; i++) {
    generateBtnQuestion(i + 1, quizzes[i]);
    newQuizzes.push(quizzes[i]);
  }
});


const createQuizFrame = (quiz) => {
  displayQuestion.innerHTML = "";
  displayAnswer.innerHTML = "";
  const divQuestion = document.createElement("div");
  const question = document.createElement("textarea");
  question.setAttribute("class", "textareaQuestion");
  question.readOnly = true;
  question.value = `Question: ${quiz.question}`;
  divQuestion.appendChild(question);
  displayQuestion.appendChild(divQuestion);

  const lblAns = document.createElement("label");
  lblAns.setAttribute("class", "lblAns");
  lblAns.textContent = "Choose the correct answer below: ";
  displayAnswer.appendChild(lblAns);

  for (let i = 0; i < quiz.answer.length; i++) {
    quiz.userChoices = quiz.userChoices || [];
    
    // console.log(quizzes.userChoices);
    const currentAnswer = quiz.answer[i];
    const answerElement = document.createElement("div");
    answerElement.setAttribute("class", "answerEl");

    const inputEl = document.createElement("input");
    inputEl.setAttribute("type", "checkbox");
    inputEl.setAttribute("id", i);
    inputEl.setAttribute("class", "cbCorrect");
    inputEl.checked = quiz.userChoices.some(
      (choice) => choice === currentAnswer
    );

    const inputAns = document.createElement("inputAns");
    inputAns.innerText = currentAnswer;
    inputEl.addEventListener("change", (e) => {
      const inputCheckeds = [...document.querySelectorAll("input:checked")].map(itemAns => itemAns.id);
      document.querySelector(`#_${quiz._id}`).style.backgroundColor =
      inputCheckeds.length > 0 ? "green" : "red";
        quiz.choices = inputCheckeds;
      if (e.target.checked) {
        quiz.userChoices.push(currentAnswer);
      } else {
        quiz.userChoices = quiz.userChoices.filter(
          (choice) => choice !== currentAnswer
        );
      } 
    });
    answerElement.appendChild(inputEl);
    answerElement.appendChild(inputAns);
    displayAnswer.appendChild(answerElement);
  }
};

//* generate button question
const generateBtnQuestion = (i, quiz) => {
  const btnQuiz = document.createElement("button");
  btnQuiz.textContent = i;
  btnQuiz.setAttribute("id", `_${quiz._id}`);
  btnQuiz.setAttribute("class", "btnQues");
  btnQuiz.addEventListener("click", (e) => {
    e.preventDefault();
    createQuizFrame(quiz);
    if(cbFinishTest.checked){
      btnFinish.disabled = false;
      const checkBoxes = document.querySelectorAll('.answers input[type=checkbox]');
      for(const checkbox of checkBoxes){
        checkbox.disabled = true;
      }
    }else{
      btnFinish.disabled = true;
      const checkBoxes = document.querySelectorAll('.answers input[type=checkbox]');
      for(const checkbox of checkBoxes){
        checkbox.disabled = false;
      }
    }
  });
  buttonQuestion.appendChild(btnQuiz);
  if (i === 1) {
    btnQuiz.click();
  }
};
//* check event checkbox 
cbFinishTest.addEventListener('change',(e) => {
  e.preventDefault();
    if(cbFinishTest.checked){
      btnFinish.disabled = false;
      const checkBoxes = document.querySelectorAll('.answers input[type=checkbox]');
      for(const checkbox of checkBoxes){
        checkbox.disabled = true;
      }
      // ipcRenderer.send('newQuizzes', newQuizzes);
      
    }else{
      btnFinish.disabled = true;
      const checkBoxes = document.querySelectorAll('.answers input[type=checkbox]');
      for(const checkbox of checkBoxes){
        checkbox.disabled = false;
      }
    }
});

const dateTest = nowDate.getDate() + '-' + nowDate.getMonth() + '-' + nowDate.getFullYear();
const timeTest = nowDate.getHours() + ':' + nowDate.getMinutes() + ':' + nowDate.getSeconds();

btnFinish.addEventListener('click', (event) => {
  ipcRenderer.send('exam-online-screen',{newQuizzes: newQuizzes, date: dateTest, time: timeTest});
})