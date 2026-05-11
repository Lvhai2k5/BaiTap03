const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

const User = mongoose.model('user', userSchema);

module.exports = User;