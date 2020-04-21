const Serial = require('serialport');
const { PORT, SEPARATORS } = require('../constants');
const EventEmitter = require('events');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });
const emitter = new EventEmitter();

serial.on('data', handleData);

function handleData(buf) {
  if (buf.toString('ascii') == 'ok') return;
  try {
    emitter.emit('data', parse(buf));
  } catch (e) {
    console.error('There is a hole in your logic:', e);
  }
}

let commandQueue = [];
let portBusy = false;

function sendCommand([byte1, byte2]) {
  commandQueue.push(Buffer.from([45, byte1, byte2, byte1 + byte2 + 45]));
  if (!portBusy) {
    portBusy = true;
    writeCommandFromQueue();
  }
}

function writeCommandFromQueue() {
  if (!commandQueue.length) {
    portBusy = false;
    return;
  }
  const cmd = commandQueue.shift();
  console.log('Sending command to serial:', cmd);
  serial.write(cmd);
  serial.once('data', (buf) => {
    console.log('Recieved answer:', buf);
    if (buf.toString('ascii') != 'ok') {
      commandQueue.unshift(cmd);
    }
    writeCommandFromQueue();
  });
}

emitter.sendCommand = sendCommand;

emitter.close = function close() {
  emitter.removeAllListeners();
  if (serial.isOpen) serial.close();
};

module.exports = emitter;
