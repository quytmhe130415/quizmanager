"use strict";
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs-extra");
const Datastore = require("nedb");
//* db Account...!
const db = new Datastore({ filename: "./database/Account.db" });
db.loadDatabase();
//* db quizzes...!
const dbQuizzes = new Datastore({ filename: "./database/quiz_nature.db" });
dbQuizzes.loadDatabase();
//* db result ...!
const dbResult= new Datastore({ filename: "./database/resultTest.db" });
dbResult.loadDatabase();

let nameUser;
const { Result } = require('../quizmanager/model/result.js');
let mainWindow = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // mainWindow.setMenu(null);
  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile("./views/login/login.html");
  //! show admin or user!
  ipcMain.on("show-admin-user", async (_, account) => {
    const accounts = await getAccount(account.name, account.pass);
    if (accounts.length === 0) {
      dialog.showMessageBox({
        title: "Message",
        message: "Account does not exist!",
      });
    } else {
      const acc = accounts[0];
      if (acc.type === 1) {
        mainWindow.loadFile("../quizmanager/views/admin/admins.html");
      } else {
        mainWindow.loadFile("../quizmanager/views/user/user.html");
        nameUser = acc.name;
      }
    }
  });
  //! logout tab
  ipcMain.on("logout-tab", async () => {
    mainWindow.loadFile("../quizmanager/views/login/login.html");
  });

  //! get quizzes
  ipcMain.on("get-quizzes", async (event) => {
    const quizzes = await getQuiz();
    event.reply("create-quiz", quizzes);
  });

  //! send list quiz for user.js to display
  ipcMain.on("get-all-quiz", async (e) => {
    const quizzes = await getQuiz();
    e.reply("list-quiz", quizzes);
  });

  //! update quiz
  ipcMain.on("update-quiz", async (_, dataQuiz) => {
    const myQuiz = dataQuiz.quiz;
    const _id = dataQuiz._id;
    if (updateQuiz(myQuiz, _id)) {
      dialog.showMessageBox({
        title: "Message",
        message: "Update Sucessfull!!!",
      });
    } else {
      dialog.showMessageBox({
        title: "Message",
        message: "Update Fail!!!",
      });
    }
  });

  //! delete quiz
  ipcMain.on("delete-quiz", async (_, idQuiz) => {
    const _id = idQuiz;
    if (deleteQuiz(_id)) {
      dialog.showMessageBox({
        title: "Message",
        message: "Delete Successfull!!!",
      });
    } else {
      dialog.showMessageBox({
        title: "Message",
        message: "Delete Fail!!!",
      });
    }
  });
  //! exit program
  ipcMain.on("exit-program", (_) => {
    mainCreate.close();
    mainWindow.loadFile("../quizmanager/views/login/login.html");

  });
  //*  function filter account
  function getAccount(username, password) {
    return new Promise((resolve, reject) => {
      db.find({ name: username, pass: password }, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(data);
      });
    });
  }
  //* function update quiz 
  function updateQuiz(quiz, _id) {
    let checkUpdate = true;
    console.log(quiz);
    dbQuizzes.update({ _id: _id }, quiz, {}, function (err) {
      if (err) {
        console.log(err);
        checkUpdate = false;
      } else {
        checkUpdate = true;
        console.log("Update success!!!");
      }
    });
    return checkUpdate;
  }
  //* function delete quiz
  function deleteQuiz(_id) {
    let checkDelete = true;
    dbQuizzes.remove({ _id: _id }, {}, function (err, numberRemoved) {
      if (err) {
        console.log(err);
        checkDelete = false;
      } else {
        checkDelete = true;
        console.log(`Remove success with ${numberRemoved} record!!!`);
      }
    });
    return checkDelete;
  }
};
let mainCreate = null;
//! add new quiz
ipcMain.on("open-create", async (_) => {
  mainCreate = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    height: 700,
    width: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainCreate.loadFile("../quizmanager/views/admin/addQuiz.html");
  const showMessageDialog = (type, message) => {
    dialog
      .showMessageBox({ type, message })
      .catch(console.error);
  }

  ipcMain.on("add-newQuiz", (event, quiz) => {
    if (!quiz.question) {
      showMessageDialog('error', "Question can't be blank!");
      return;
    }
    
    if (!quiz.answer.length) {
      showMessageDialog('error', "Answers can't be blank!");
      return;
    } 

    if (!quiz.correct.length) {
      showMessageDialog('error', "Checkbox correct answer can't blank!!!!!!");
      return;
    }
    if (addQuiz(quiz)) {
      dialog.showMessageBox({
        title: "Message",
        message: "Add quiz Successfull!!!",
      });
    } else {
      dialog.showMessageBox({
        title: "Message",
        message: "Add quiz Fail!!!",
      });
    }
  });
  ipcMain.on("undo-list", () => {
    mainWindow.loadFile("../quizmanager/views/admin/admins.html");
    mainCreate.close();
  });
  //* function insert quiz
  function addQuiz(quiz) {
    let checkAddQuiz = true;
    dbQuizzes.insert(quiz, (err) => {
      checkAddQuiz = !!err
      if (err) {
        console.log(err);
      } else {
        console.log("Insert success!!!");
      }
    });
    return checkAddQuiz;
  }
});

//! screen exam online
let examOnline = null;
ipcMain.on("open-examsoftware", async (_) => {
  examOnline = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    height: 800,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  examOnline.loadFile("../quizmanager/views/user/makeQuiz.html");
  examOnline.setMenu(null);
  examOnline.setAlwaysOnTop(true, "floating");
  examOnline.setFullScreen(true);
});


ipcMain.on("comeback-login", (e) => {
  mainWindow.loadFile("../quizmanager/views/login/login.html");
});

//* windown main
ipcMain.on('exam-online-screen', async (event, inforTest) => {
  const newQuizzes = inforTest.newQuizzes;
  const dateTest = inforTest.date;
  const timeTest = inforTest.time;
  const quizzes = await getQuiz();
  let countCorrect = 0;
  const totalQues =  parseInt(quizzes.length); //total number question
  for(const oldQuiz of quizzes){
    for(const newQuiz of newQuizzes){
      if(oldQuiz._id === newQuiz._id && newQuiz.choices){         
        const convertChoice = newQuiz.choices.map(item => parseInt(item));
        if(JSON.stringify(oldQuiz.correct) === JSON.stringify(convertChoice)){
          countCorrect++;
        }
      }
    }
  }
  const resultUser = new Result(nameUser,dateTest,timeTest,countCorrect,totalQues)
  addResult(resultUser);
  examOnline.close();
});
//! check mark
ipcMain.on('view-quiz', (_) => {
  mainWindow.loadFile("../quizmanager/views/user/result.html");
});

ipcMain.on('infor-user', async(event) => {
  const resultUsers = await getResult();
  console.log(resultUsers);
  event.reply('total-correct', resultUsers);
 });

//* undo windown main
ipcMain.on('undo', (_) => {
  mainWindow.loadFile("../quizmanager/views/user/user.html");
});

//* function getAll quizzes
function getQuiz() {
  return new Promise((res, reject) => {
    dbQuizzes
      .find({})
      .sort({ time: 1 })
      .exec(function (err, data) {
        if (err) {
          reject(err);
        }
        res(data);
      });
  });
}

//* function insert result
function addResult(result) {
  dbResult.insert(result, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Insert success!!!");
    }
  });
}

//* function getAll record result
function getResult() {
  return new Promise((res, reject) => {
    dbResult
      .find({})
      .sort({ date: -1,
        time: -1 })
      .exec(function (err, data) {
        console.log(data);
        if (err) {
          reject(err);
        }
        res(data);
      });
  });
}

app.whenReady().then(() => {
  createWindow();
});
