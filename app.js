const express = require('express');
const path = require('path');
const http = require('http');
 
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let waiting = null;

io.on('connection', (sock) => {
  sock.emit('msg', 'You are connected');
 
  if (waiting === null) {
    sock.emit('msg', 'Wait here to play...');
    waiting = sock;
  } else {
    startGame(waiting, sock);
    waiting = null;
  }
});

let roomId = 1;

function startGame(p1, p2) {
  const roomName = 'BKT' + roomId++;
 
  let p1Turn = null;
  let p2Turn = null;

  [p1, p2].forEach((p) => p.join(roomName));
  console.log(roomName)
  io.to(roomName).emit('msg', 'Game Started!');

  p1.on('turn', (e) => {
    console.log(e);
    p1Turn = e;
    checkRoundEnd();
  });
 
  p2.on('turn', (e) => {
    console.log(e);
    p2Turn = e;
    checkRoundEnd();
  });

  function checkRoundEnd() {
    if (p1Turn !== null && p2Turn !== null) {
      io.to(roomName).emit('gameMsg', getWinner());
      
      io.to(roomName).emit('gameMsg', 'Player1: ' + p1Turn + ' ,Player2: ' + p2Turn);
      io.to(roomName).emit('gameMsg', 'Next round!');
      p1Turn = p2Turn = null;
    }
  };

    function getWinner() {
    let winner = "Player1 Win";
    if (p1Turn == "Bo" && p2Turn == "Kyar") {
    winner = "Player2 Win";
  } else if (p1Turn == "Kyar" && p2Turn == "Thanut") {
    winner = "Player2 Win";
  } else if (p1Turn == "Thanut" && p2Turn == "Bo") {
    winner = "Player2 Win";
  } else if (p1Turn == p2Turn) {
    winner = "Tie";
  }
    return winner;
  };
  
}

server.listen(5000, () => console.log('Ready on 0.0.0.0:5000'));
