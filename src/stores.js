const { writable, derived } = require('svelte/store');
const { mergeKeysValues } = require('./utils/others');
const { STATE_DATA } = require('./constants');

const initialIV = {
  voltage: 0,
  current: 0,
};

const initialState = mergeKeysValues(
  STATE_DATA,
  Array(STATE_DATA.length).fill(0)
);

const IVData = writable(initialIV);
const stateData = writable(initialState);

module.exports = {
  IVData,
  stateData,
};
