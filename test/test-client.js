const { io } = require('socket.io-client');

const socket = io('http://localhost:5000');

const ROOM_ID = 'room-123';

socket.on('connect', () => {
  console.log('Connected with id:', socket.id);

  socket.emit('join-room', ROOM_ID);

  /* socket.emit('send-message', {
    text: 'Hello from client',
  }); */

  setTimeout(() => {
    socket.emit('send-message', {
      roomId: ROOM_ID,
      text: 'Hello from ' + socket.id,
    });
  }, 2000);

  socket.on('receive-message', (data) => {
    console.log('📥 Message from server:', data);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
