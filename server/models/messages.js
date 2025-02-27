const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  recieved: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  content: {type: String, trim: true,},
  chat: {type: mongoose.Schema.Types.ObjectId, ref: "Chat"},
}, {timestamps:true});

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;

// text: String,
// file: String,