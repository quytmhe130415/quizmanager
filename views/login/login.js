"use strict";
const { ipcRenderer, dialog } = require("electron");
const btnSubmit = document.querySelector("#submit");
const register = document.querySelector("#register");

//* click to submit
btnSubmit.addEventListener("click", async(e) => {
    e.preventDefault();
    const name = document.querySelector("#uname").value;
    const pass = document.querySelector("#pass").value;
    ipcRenderer.send("show-admin-user", { name: name, pass: pass });
});
//* click to dky
register.addEventListener("click", (e) => {
    e.preventDefault();
    ipcRenderer.send("show-register");
});