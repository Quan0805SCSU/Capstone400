const express = require('express');

const { signup, login, chat, UserContext, Contact } = require('../controllers/auth.js');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/chat', chat)


module.exports = router;