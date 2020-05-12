const IS_RPI = process.platform === 'linux' && process.arch == 'arm';
const PORT = {
  name: IS_RPI ? '/dev/ttyS0' : 'COM5',
  baudRate: 230400,
};

const SEPARATORS = Buffer.alloc(4);
SEPARATORS.writeUInt16BE(18735);
SEPARATORS.writeUInt16BE(869, 2);

const STATES = {
  initial: 'params',
  chart: 'chart',
};

const STATE_DATA = ['pumpPower', 'loadMode', 'ligtingOn', /*'mode'*/];

const IV_DATA = ['voltage', 'current', 'setLoad'];
const IV_DIVIDERS = [1000, 1000, 10];

const DATA_BYTE_LENGTH =
  STATE_DATA.length + IV_DATA.length * 2 + SEPARATORS.length;

const COMMANDS = {
  turnOffLighting: [4, 0],
  turnOnLighting: [8, 0],
  start: [12, 0],
  stop: [16, 0],
  setPumpPower: (v) => [20, v],
  setMode: (v) => [24, v],
  setLoadMode: (v) => [28, v],
  setLoad: (v) => [32, v * 10],
};

const CONSTRAINTS = {
  voltageParallel: [0, 1.7],
  voltageSeries: [0, 6.8],
  currentParallel: [0, 1.5],
  currentSeries: [0, 0.4],
  pumpFlow: [200, 350],
};

CONNECTION_TYPES = ['Последовательное', 'Параллельное'];

module.exports = {
  IS_RPI,
  PORT,
  SEPARATORS,
  STATES,
  COMMANDS,
  IV_DATA,
  STATE_DATA,
  DATA_BYTE_LENGTH,
  CONSTRAINTS,
  CONNECTION_TYPES,
  IV_DIVIDERS,
};
