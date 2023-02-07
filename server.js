const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http)

const rooms = ['News', 'Sports', 'Misc']

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile('/pages/index.html', { root: __dirname })
});

app.get('/chat', (req, res) => {
  if(!req.query.room || !rooms.includes(req.query.room)) {
    res.redirect('/');
  }

  res.sendFile('/pages/chat.html', { root: __dirname });
});

io.on('connection', (socket) => {
  console.log(`A new user is connected: ${socket.id}`)

  socket.on('join', (room) => {
    socket.join(room);
    io.to(room).emit('message', { message: 'User joined chat room'});
  });

  socket.on('message', (data) => {
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

http.listen(3000, () => {
  console.log(`Server is listening on port ${3000}`);
});