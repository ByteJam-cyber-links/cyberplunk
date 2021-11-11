const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const { randEncounter } = require('./utils/encounter');
const { formatMessage } = require('./utils/messages');
const e = require('cors');
const { getStartingWeapon } = require('./utils/weapons');
const PORT = process.env.PORT || 5000;

const messageHistory = [];
usersReady = false;
enemyHP = 0;
encounterInProgress = false;
gameRunning = false;
validMessages = ["attack"];

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('joinRoom', ({username, room}) => {

    socket.emit('previous messages', { messageHistory, room });

    socket.emit('chat message', formatMessage('Server', 'Please enter your class and type "start" to start the game when everyone is ready'));
    healths = getRandomInt(100);
    const user = userJoin(socket.id, username, room, false, null, healths, healths, getStartingWeapon());

    socket.join(user.room);

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  })

  socket.on('chat message', (msg) => {
    const username = getCurrentUser(socket.id).username;
    const user = getCurrentUser(socket.id);
    const room = getCurrentUser(socket.id).room;
    // send out the message to room
    io.to(room).emit('chat message', formatMessage(username, msg));

    if (!user.characterCreated){
      if(["solo", "medtech", "netrunner"].includes(msg.toLowerCase())){
        user.role = msg.toLowerCase();
        if (user.role === "solo"){
          user.health += 20;
          user.maxhealth += 20;
        }
        else if (user.role === "medtech"){
          user.health += 30;
          user.maxhealth += 30;
        }
        else if (user.role === "netrunner"){
          user.health += 10
          user.maxhealth += 10;
        }
        user.characterCreated = true;
      }
      //console.log(user) 
    }

    // game logic
    //
    //console.log(`game started in ${room}`);

    roomUsers = getRoomUsers(room);
    roomUsersIds = roomUsers.map(oof => oof.id);
    //console.log(roomUsersIds);

    usersReady = true;
    roomUsers.forEach(user => !user.characterCreated ? usersReady = false : {});

    if(msg === "start" && usersReady){
      io.to(room).emit('userdata', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
      gameRunning = true;
    }
    else if (msg === "start" && !usersReady){
        io.to(room).emit('chat message', formatMessage("server", `Someone in the room has not selected their class`));
    }

    if(gameRunning){
      if(!encounterInProgress){
        gameSetup(room);
        encounterInProgress = true;
      }
      if(encounterInProgress){
        if(encounter.isSkillOrCombat === 0){
          if (msg === "attack" && socket.id === currentPersonID){
            console.log('attacked');
            enemyHP -= 10;
            console.log(enemyHP);
          }
        }
        else{
          if (msg === "roll" && socket.id === currentPersonID){
            roll = randomIntFromInterval(1, 20);
            console.log(roll + ":" + encounter.DC)
            if (roll >= encounter.DC){
              io.to(room).emit('chat message', formatMessage("server", encounter.passOutcome));
              enemyHP = 0;
            }
            else{
              io.to(room).emit('chat message', formatMessage("server", encounter.failOutcom));
              enemyHP = 0;
            }
          }
        }
        if (enemyHP > 0){
          try{
            if (socket.id === currentPersonID && validMessages.includes(msg)){
              currentPersonID = roomUsersIds[Math.floor(Math.random() * roomUsersIds.length)];
              currentPerson = getCurrentUser(currentPersonID);
            }
          }
          catch{
            currentPersonID = roomUsersIds[Math.floor(Math.random() * roomUsersIds.length)];
            currentPerson = getCurrentUser(currentPersonID);
          }
          io.to(room).emit('chat message', formatMessage("server", `${currentPerson.username}, what will you do?`));
        }
        else{
          if(encounter.isSkillOrCombat === 0){
          io.to(room).emit('chat message', formatMessage("server", `You won! Type something to continue..`));
          }
          encounterInProgress = false;
        }
      }
    }
    //console.log(gameRunning);

    // End game logic

    messageHistory.push({ ...formatMessage(user.username, msg), messageRoom: user.room })
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user){
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  })
})

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function gameSetup(room){
  encounter = randEncounter();
  io.to(room).emit('chat message', formatMessage(encounter.name, encounter.description));
  if (encounter.isSkillOrCombat === 0){
    enemyHP = encounter.hp;
    console.log('enemy hp ' + enemyHP);
  }
  else{
    enemyHP = 1;
  }
}

server.listen(PORT, () => {
  console.log(`listening on ${ PORT }`);
});