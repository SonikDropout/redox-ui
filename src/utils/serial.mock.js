const { STATE_DATA, IV_DATA, COMMANDS } = require('../constants');
const EventEmitter = require('events');

const serial = new EventEmitter();
const state = Array(STATE_DATA.length).fill(0);
const iv = Array(IV_DATA.length).fill(0);
iv[2] = 3.4;
state[1] = 1;
// state[2] = 1;

let interval = setInterval(sendData, 1000);

function sendData() {
  serial.emit('data', { iv, state });
}

serial.sendCommand = function sendCommand(cmd) {
  console.info('Sending command to serial:', cmd);
};

serial.close = function close() {
  serial.removeAllListeners();
  clearInterval(interval);
};

module.exports = serial;
