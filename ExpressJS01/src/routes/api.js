const express = require('express');
const { createUser, handleLogin, getUser,
    getAccount, sendResetPasswordEmail, resetPassword
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();



routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
})

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/forgot-password", sendResetPasswordEmail);
routerAPI.post("/reset-password", resetPassword);
routerAPI.use(auth);
routerAPI.get("/user", getUser);
routerAPI.get("/account", delay, getAccount);

module.exports = routerAPI; //export default