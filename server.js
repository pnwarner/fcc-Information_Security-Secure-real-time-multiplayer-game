require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const helmet = require('helmet');
const socket = require('socket.io');
const cors = require('cors');
const nocache = require('nocache');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet({
  noCache: true,
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: {
    setTo: 'PHP 7.4.3',
  },
}));

app.use(nocache());

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

/* WebSocket Server*/

const io = socket.listen(server);
let connections = [];
let players = [];
let collectibleItems = [];

function removePlayer(id) {
  let newList=[];
  players.forEach((player) =>{
    if (player.id != id) {
      newList.push(player)
    }
  });
  return newList
}

io.on("connection", (socket) => {
  console.log('New connection. ID:',socket.id);
  connections.push(socket);
  
  socket.emit('init', socket.id);

  socket.on('message_all', (message) => {
    socket.broadcast.emit('message', message);
  });

  socket.on('add-player', (player) => {
    players.push(player);
    io.emit('update-player-list', players);
  });

  socket.on('add-collectible', (collectible) => {
    collectibleItems = collectible;
    io.emit('update-collectibles', collectibleItems);
  });

  socket.on('get-collectibles', () => {
    socket.emit('update-collectibles', collectibleItems);
  })

  socket.on('update-player', ({x, y, score, id})=>{
    players.forEach((player)=>{
      if(player.id === id){
        player.x = x;
        player.y = y;
        player.score = score;
      }
    })
    io.emit('update-player-list', players);
  });

  socket.on('disconnect', ()=>{
    console.log('Player', socket.id, 'disconnected.');
    players = removePlayer(socket.id);
    io.emit('update-player-list', players);
  })
});


module.exports = app; // For testing
