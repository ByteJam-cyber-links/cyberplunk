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
const { randWeapon, getStartingWeapon } = require('./utils/weapons');
const { disconnect } = require('process');
const PORT = process.env.PORT || 5000;

usersReady = false;
enemyHP = 0;
encounterInProgress = false;
gameRunning = false;
validCombatMessages = ["attack", "roll", "fight"];
validSkillMessages = ["roll"];

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {

  socket.on('joinRoom', ({username, room}) => {
    if (gameRunning){
      socket.disconnect();
    }

    socket.emit('chat message', formatMessage('Server', 'Please enter your class (Solo, Medtech, or Netrunner) and type "start" to start the game when everyone is ready'));
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
          if (validCombatMessages.includes(msg) && socket.id === currentPersonID){
            //console.log('attacked');
            damage = randomIntFromInterval(currentPerson.weapon.min, currentPerson.weapon.max);
            enemyHP -= damage;
            io.to(room).emit('chat message', formatMessage("server", `${getCurrentUser(currentPersonID).username} dealt ${damage} damage leaving ${encounter.enemyName} with ${enemyHP >= 0 ? enemyHP : 0} HP`));
            if (enemyHP > 0){
              damage = randomIntFromInterval(encounter.minAttack, encounter.maxAttack);
              getCurrentUser(currentPersonID).health -= damage;
              io.to(room).emit('chat message', formatMessage("server", `${encounter.enemyName} dealt ${damage} damage to ${getCurrentUser(currentPersonID).username}`));
              getCurrentUser(currentPersonID).health <= 0 ? disconnectSocket(currentPersonID) : {};
              io.to(room).emit('userdata', {
                room: user.room,
                users: getRoomUsers(user.room)
              });
              //console.log(enemyHP);
            }
          }
        }
        else{
          if (validSkillMessages.includes(msg) && socket.id === currentPersonID){
            roll = randomIntFromInterval(1, 20);
            console.log(roll + ":" + encounter.DC)
            if (roll >= encounter.DC){
              io.to(room).emit('chat message', formatMessage("server", encounter.passOutcome));
              if(encounter.findWeapon){
                foundWeapon = randWeapon();
                if(foundWeapon.max > currentPerson.weapon.max){
                  io.to(room).emit('chat message', formatMessage("server", `${currentPerson.username} found a(n) ${foundWeapon.name} and left their ${currentPerson.weapon.name}`));
                  currentPerson.weapon = foundWeapon;
                }
                else{
                  io.to(room).emit('chat message', formatMessage("server", `${currentPerson.username} found a(n) ${foundWeapon.name} but did not take it because their ${currentPerson.weapon.name} is better`));
                }
              }
              roomUsers.forEach(user => user.health += encounter.heal);
              roomUsers.forEach(user => user.health > user.maxhealth ? user.health = user.maxhealth : {});
              io.to(room).emit('userdata', {
                room: user.room,
                users: getRoomUsers(user.room)
              });
              enemyHP = 0;
            }
            else{
              io.to(room).emit('chat message', formatMessage("server", encounter.failOutcom));
              roomUsers.forEach(user => user.health -= encounter.dmg);
              roomUsers.forEach(user => user.health <= 0 ? disconnectSocket(user.id) : {});
              io.to(room).emit('userdata', {
                room: user.room,
                users: getRoomUsers(user.room)
              });
              enemyHP = 0;
            }
            io.to(room).emit('chat message', formatMessage("server", `Type something to continue..`));
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
          try{
          io.to(room).emit('chat message', formatMessage("server", `${currentPerson.username}, what will you do?`));
          }
          catch{
            currentPersonID = roomUsersIds[Math.floor(Math.random() * roomUsersIds.length)];
            currentPerson = getCurrentUser(currentPersonID);
          }
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

function disconnectSocket(givenSocketID){
  io.sockets.sockets.forEach((socket) => {
    // If given socket id is exist in list of all sockets, kill it
    if(socket.id === givenSocketID)
        socket.disconnect(true);
  });
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