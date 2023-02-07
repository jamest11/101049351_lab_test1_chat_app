const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const routes = require('./routes');
const Message = require('./models/message')

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http)

app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_KEY,
  saveUninitialized:true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  resave: false
}));

app.use(express.urlencoded({ extended: true })); 
app.use(express.static('static'));

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'ChatApp'
}).then(() => {
  console.log('Successfully connected to the database mongoDB Atlas Server');    
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});

app.use(routes);

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('message', (data) => {
    const message = new Message({ from_user: data.username, room: data.room, message: data.message });
    message.save((err) => {
      if(err) {
        console.log(err);
      }
    });

    io.to(data.room).emit('message', data);
  });

  socket.on('typing-start', (data) => {
    io.to(data.room).emit('typing-start', data);
  });

  socket.on('typing-stop', (data) => {
    io.to(data.room).emit('typing-stop', data);
  });

  socket.on('disconnect', () => {
    io.emit('typing-stop', { id: socket.id })
  });

});

http.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});