var socket = io();

var messages = document.getElementById('messages');
var messageForm = document.getElementById('messageForm');
var messageInput = document.getElementById('messageInput');
var roomHeader = document.getElementById('roomHeader');
var userList = document.getElementById('userList');
var roomHeaderOffcanvas = document.getElementById('roomHeaderOffcanvas');
var userListOffcanvas = document.getElementById('userListOffCanvas');
var offcanvasMenu = document.getElementById('offcanvasMenu');
var bsOffCanvasMenu = new bootstrap.Offcanvas(offcanvasMenu)
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
var xDown = null;
var yDown = null;

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

socket.emit('joinRoom', {username, room})

messageForm.addEventListener('submit', function(e) {
e.preventDefault();
if (messageInput.value) {
    socket.emit('chat message', messageInput.value);
    messageInput.value = '';
    }
});

socket.on('chat message', function(messageObject) {
    var item = document.createElement('div');
    item.classList.add('message');
    item.innerHTML = `<p class="meta">${messageObject.username}</p><p class="text">${messageObject.message}</p>`;
    messages.appendChild(item);

    messages.scrollTop = messages.scrollHeight;
    //window.scrollTo(0, document.body.scrollHeight);
});

socket.on('roomUsers', ({ room, users }) => {
    roomHeader.innerText = `Users In ${room}`;
    roomHeaderOffcanvas.innerText = `Users In ${room}`;

    userListOffcanvas.innerHTML=`${users.map(user => `<li class="userListItem">${user.username}</li>`).join('')}`;
    userList.innerHTML=`${users.map(user => `<li class="userListItem">${user.username}</li>`).join('')}`;
})

socket.on('userdata', ({ room, users }) => {
    thisCharacter = null;
    users.forEach(user => socket.id === user.id ? thisCharacter = user : {});
    console.log(thisCharacter);

    roomHeader.innerText = `Users In ${room}`;
    roomHeaderOffcanvas.innerText = `Users In ${room}`;

    userListOffcanvas.innerHTML=`${users.map(user => `<li class="userListItem">${user.username} (${user.health}/${user.maxhealth})</li>`).join('')}`;
    userList.innerHTML=`${users.map(user => `<li class="userListItem">${user.username} (${user.health}/${user.maxhealth})</li>`).join('')}`;
})

function cringe(){
    bsOffCanvasMenu.toggle();
}

// Touch event stuff
function getTouches(e) {
  return e.touches ||             // browser API
         e.originalEvent.touches; // jQuery
}                                                     
                                                                         
function handleTouchStart(e) {
    const firstTouch = getTouches(e)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
                                                                         
function handleTouchMove(e) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = e.touches[0].clientX;                                    
    var yUp = e.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* right swipe */
            // console.log($(offcanvasMenu).is(":hidden"));
            if ($(offcanvasMenu).hasClass("show")){
                bsOffCanvasMenu.toggle();
            }
            // console.log("Right swipe");
            // console.log($(offcanvasMenu).hasClass("show"));
        } else {
            /* left swipe */
            if (!$(offcanvasMenu).hasClass("show")){
                bsOffCanvasMenu.toggle();
            }
            // console.log("Left swipe");
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* down swipe */ 
            // console.log("Down swipe");
        } else { 
            /* up swipe */
            // console.log("Up swipe");
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};

