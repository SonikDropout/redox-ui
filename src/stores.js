const { writable, derived } = require('svelte/store');
const { mergeKeysValues } = require('./utils/others');
const { STATE_DATA, IV_DATA } = require('./constants');
const { ipcRenderer } = require('electron');

const initialData = ipcRenderer.sendSync('initialDataRequest');

const IVData = writable(mergeKeysValues(IV_DATA, initialData.iv));
const stateData = writable(mergeKeysValues(STATE_DATA, initialData.state));
const connectionType = writable(0);

ipcRenderer.on('serialData', (e, data) => {
  IVData.set(mergeKeysValues(IV_DATA, data.iv));
  stateData.set(mergeKeysValues(STATE_DATA, data.state));
});

const storedCharge = writable(0),
  storedEnergy = writable(0);

const mode = writable(0);

module.exports = {
  IVData,
  stateData,
  connectionType,
  storedEnergy,
  storedCharge,
  mode,
};
