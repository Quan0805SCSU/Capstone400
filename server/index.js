const express = require('express');
const mongoose = require('mongoose');
const socket = require("socket.io");
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require("./models/user");
const Chat = require("./models/chat");
const Message = require('./models/messages')
const asyncHandler = require("express-async-handler");

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, jwtSecret);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});


mongoose.connect(process.env.MONGO_URL,  {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=> {
  console.log("DB connection successful");
})
.catch((err)=> {
  console.log(err.message);
});


const app = express();
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const server = app.listen(4040, () => {
  console.log(`Server started on port 4040`)});

app.get('/test', (req,res) => {
  res.json('test ok');
});

app.get('/profile', (req,res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json('no token');
  }
});

// REGISTER ENDPOINT
app.post('/register', async (req,res) => {
  const {username,password,email} = req.body;
  try {
    console.log
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    
    const userExists = await User.findOne({ username });
    if (userExists) {
      res.status(201).json({status: false});
      return;
    }

    const createdUser = await User.create({
      username:username,
      password:hashedPassword,
      email:email
    });

    // jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
    //   if (err) throw err;
    //   res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
    //     status: true,
    //     id: createdUser._id,
    //     token: generateToken(createdUser._id)
    //   });
    // });

    token = jwt.sign({userId:createdUser._id,username}, jwtSecret);
    res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
      status: true,
      id: createdUser._id,
      token: token
    });

  } catch(err) {
    if (err) throw err;
    res.status(500).json('error');
  }
});

// LOGIN ENDPOINT
app.post('/login', async (req,res) => {
  const {username, password} = req.body;
  const foundUser = await User.findOne({username});
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      // jwt.sign({userId:foundUser._id,username}, jwtSecret, {}, (err, token) => {
      //   res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
      //     status: true,
      //     id: foundUser._id,
      //     token: generateToken(createdUser._id)
      //   });
      // });
      token = jwt.sign({userId:foundUser._id,username}, jwtSecret)
      res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
        status: true,
        id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        isAdmin: foundUser.isAdmin,
        token: token
      });
      
    }
    else{
      res.status(201).json({status: false});
    }
  }
  else{
    res.status(201).json({status: false, msg: "User doesn't exist"});
  }
});

// FORGOT PASSWORD ENDPOINT
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // User not found
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    // Construct reset link
    const resetLink = `http://example.com/reset-password?token=${resetToken}`;

    // Send email with reset link
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset',
      html: `Click <a href="${resetLink}">here</a> to reset your password.`
    });
    
    // Respond with success message
    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// LOGOUT ENDPOINT
app.post('/logout', (req,res) => {
  res.cookie('token', '', {sameSite:'none', secure:true}).status(201).json({status: true});
});

app.get('/getAllUsers', protect, async (req,res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({
    _id: { $ne: req.user._id },
  });
  res.send(users);
})

app.get('/chat', protect, (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
})

app.post('/chat', protect, asyncHandler(async (req, res) => {
  const { userId } = req.body;
  //console.log("in server ",  userId)
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }
  
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");
  
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    
    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
}))

app.post('/group', protect, async (req, res) =>{
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Incomplete information" });
  }

  var updatedUsers = [];
  var arrOfPromise = []

  await req.body.users.forEach(async (user) => {
    arrOfPromise.push(User.findOne({username: user}))
  });

  updatedUsers = await Promise.all(arrOfPromise)

  if (req.body.users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  //console.log(req.user);

  updatedUsers.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: updatedUsers,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
})

app.get('/getgroups', protect, async (req, res) => {
  try {
    //const allGroups = await Chat.where("isGroupChat").equals(true);
    const allGroups = await Chat.find({isGroupChat :{$eq : true}})
    res.status(200).send(allGroups);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
})

app.get('/getmessages/:chatId', async (req, res) =>{
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username")
      .populate("recieved")
      .populate("chat");
    //console.log('->',messages);
    //const recipient = await User.findOne({username});
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
})

app.post('/sendmessage', protect, async (req, res) =>{
  const { content, chatId, recieverId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  
  const recipient = await User.findOne({recieverId});
  
  var newMessage = {
    sender: req.user._id,
    received: recieverId,
    content: content,
    chat: chatId,
  };
  
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "username");
    message = await message.populate("recieved", "username");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    //res.json({message: message, reciever: recipient.username, sender: req.user.username});
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
})


app.post('/deletechat', protect, async (req, res) =>{
  const chat_id = req.body;
  console.log(chat_id);

  const findChat = await Chat.findOne({chat_id});

  try{
    await Message.deleteMany({chat: findChat._id});

    await Chat.deleteOne({_id: findChat._id});

    res.status(201).json({success: "Chat Deleted"});
  }catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
  
})


async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject('no token');
    }
  });

}