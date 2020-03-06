const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = {
  name: IS_RPI ? '/dev/ttyS0' : 'COM5',
  baudRate: 230400,
};

const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(6891);
SEPARATORS.writeUInt16BE(25500, 2);

const STATES = {
  initial: 'params',
  chart: 'chart',
};

const STATE_DATA = [
  'mode',
  'connectionType',
  'pumpOn',
  'ligtingOn',
  'pumpPower',
];

const IV_DATA = ['voltage', 'current'];

const DATA_BYTE_LENGTH =
  STATE_DATA.length + IV_DATA.length * 2 + SEPARATORS.length;

const COMMANDS = {
  setParaller: [4, 0],
  setSeries: [4, 0],
  turnOnLighting: [4, 0],
  turnOffLighting: [4, 0],
  turnOffPump: [4, 0],
  turnOnPump: [4, 0],
  setCurrent: v => [4, v * 10],
  setVoltage: v => [4, v * 10],
  setPower: v => [12, v],
};

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  STATES,
  COMMANDS,
  IV_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
};
