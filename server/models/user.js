const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {type:String, unique:true},
    password: String,
    email: String,
    isAdmin: { type: Boolean, required: true, default: false},

}, {timestamps: true});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;