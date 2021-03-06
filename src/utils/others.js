const clone = (obj) => JSON.parse(JSON.stringify(obj));

const mergeRename = (objects, names) => {
  const result = {};
  for (let i = 0; i < objects.length; i++) {
    for (let key in objects[i]) {
      result[key + names[i]] = clone(objects[i][key]);
    }
  }
  return result;
};

const mergeKeysValues = (keys, values) =>
  keys.reduce((map, key, i) => {
    map[key] = values[i];
    return map;
  }, {});

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

const getFileDate = () => {
  const date = new Date();
  return `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;
};

const countKeys = (obj) => {
  let n = 0;
  for (let key in obj) n++;
  return n;
};

const randInt = (min, max) => {
  if (isNaN(max)) {
    max = min;
    min = 0;
  }
  return (Math.random() * (max - min) + min) & 1;
};

const constraint = (val, [min, max]) => Math.max(min, Math.min(max, val));

const getPercentage = (val, [min, max]) =>
  constraint(Math.round(((val - min) / (max - min)) * 100), [0, 100]);

function debounce(fn, ms) {
  let timeout;
  return function () {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, arguments), ms);
  };
}

module.exports = {
  clone,
  mergeRename,
  capitalize,
  getFileDate,
  countKeys,
  randInt,
  mergeKeysValues,
  getPercentage,
  debounce,
  getPowerFromFlow: (n) => constraint(Math.round(0.0019 * n * n - 0.36 * n), [0, 100]),
};
