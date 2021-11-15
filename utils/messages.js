//const moment = require('moment');
const fs = require('fs');

function formatMessage(username, message){
    return{
        username,
        message,
        //time: moment().format('h:mm a')
    };
}

module.exports = { formatMessage };