const express = require("express");
const User = require('./models/user');
const Message = require('./models/message')

const routes = express.Router()

const rooms = ['News', 'Sports', 'Misc']

function checkAuth(req, res, next) {
  if(req.session.username) {
    next();
  } else {
    return res.redirect('/logout')
  }
}

routes.get('/login', (req, res) => {
  if(req.session.username) {
    return res.redirect('/');
  }

  return res.sendFile('/pages/login.html', { root: __dirname });
});

routes.post("/login", async (req, res) => {
  try {

    const { username, password } = req.body;
    let user = null;

    if (!password || !(username || password)) {
      return res.status(400).sendFile('/pages/login.html', { root: __dirname });
    } else if(username) {
      user = await User.findOne({ username });
    }

    if (user && password == user.password) {
      req.session.username = username
      res.cookie('username', username);

      return res.status(200).redirect('/');
    } 
    return res.status(400).sendFile('/pages/login.html', { root: __dirname });

  } catch (err) {
    return res.status(500).sendFile('/pages/login.html', { root: __dirname });
  }
});

routes.get('/logout', (req, res) => {
  req.session.destroy();
  return res.clearCookie('username').redirect('/login');
});

routes.get('/register', (req, res) => {
  if(req.session.username) {
    return res.redirect('/');
  }
  
  return res.sendFile('/pages/register.html', { root: __dirname });
});

routes.post("/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
  
    return res.redirect('/login');
  } catch (err) {
      return res.status(500).sendFile('/pages/register.html', { root: __dirname });
  }
});

routes.get('/', checkAuth, (req, res) => {
  return res.sendFile('/pages/index.html', { root: __dirname })
});

routes.get('/chat', checkAuth, (req, res) => {
  if(!req.query.room || !rooms.includes(req.query.room)) {
    return res.redirect('/');
  }

  return res.sendFile('/pages/chat.html', { root: __dirname });
});

routes.get('/messages', checkAuth, (req, res) => {
  Message.find({ room: req.query.room },(err, messages)=> {
    res.send(messages);
  })
})

module.exports = routes