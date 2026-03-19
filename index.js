const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(` ${socket.id} joined room ${roomId}`);
  });

  socket.on('offer',({roomId,offer})=>{
    console.log("offer recieved");

    socket.to(roomId).emit('offer',{offer});
  });

  socket.on('answer',({roomId,answer})=>{
    console.log("answer recieved");

    socket.to(roomId).emit('answer',{answer});
  });

  socket.on('ice-candidate',({roomId,candidate})=>{
    console.log("ICE condidates recieved",candidate,"from",roomId);

    socket.to(roomId).emit('ice-candidate',{candidate});
  });

  /* socket.on('send-message', (data) => {
    console.log('📩 Message received from client:', data); */

  socket.on('send-message', ({ roomId, text }) => {
    console.log(`Message in room ${roomId}:`, text);

    socket.to(roomId).emit('receive-message', {
      text,
      from: socket.id,
    });

    /*  socket.emit('receive-message', {
      text: data.text,
      from: 'server',
    });  */

    /*  socket.broadcast.emit('receive-message', {
      text: data.text,
      from: socket.id,
    }); */
  });

  socket.on('disconnect', () => {
    console.log(' User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Socket.IO server is running');
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
