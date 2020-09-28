<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import SaveButton from '../organisms/SaveButton';
  import Switch from '../atoms/Switch';
  import Toggle from '../atoms/Toggle';
  import RangeInput from '../molecules/RangeInput';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import 'chartjs-plugin-zoom';
  import 'chartjs-plugin-downsample';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';
  import {
    IVData,
    mode,
    stateData,
    connectionType,
    storedEnergy,
    storedCharge,
  } from '../stores';
  import { COMMANDS, CONSTRAINTS } from '../constants';
  import pointsStorage from '../utils/pointsStorage';

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(pointsStorage.points, { x: xAxis.symbol, y: yAxis.symbol })
    );
    chart.options.onClick = chart.resetZoom;
  });

  const xOptions = [
    { label: 'время', value: 0, symbol: 't, c' },
    { label: 'напряжение', value: 1, symbol: 'U, B' },
  ];

  const yOptions = [
    { label: 'ток', value: 2, symbol: 'I, A' },
    { label: 'напряжение', value: 1, symbol: 'U, B' },
  ];

  const chargingOptions = [
    { label: 'постояным током', value: 1 },
    { label: 'постояным напряжением', value: 2 },
  ];

  const dischargingOptions = [
    { label: 'на внеш. нагрузке', value: 0 },
    { label: 'постояным током', value: 1 },
    { label: 'постояным напряжением', value: 2 },
  ];

  let saveDisabled = true,
    isDrawing,
    unsubscribeData,
    isCharging = $stateData.mode,
    xAxis = xOptions[0],
    yAxis = yOptions[0],
    chart,
    load,
    pumpOn,
    pumpPower = $stateData.pumpPower,
    loadMode = $stateData.loadMode,
    loadConstraint =
      CONSTRAINTS[
        (loadMode === 1 ? 'current' : 'voltage') +
          (isCharging ? 'Charge' : 'Discharge')
      ],
    timeStart;

  $: if (!$stateData.mode && $IVData.voltage < 4) startCharging();

  $: if (chart && xAxis) {
    pointsStorage.setX(xAxis.value);
    chart.options.scales.xAxes[0].scaleLabel.labelString = xAxis.symbol;
    chart.update();
  }

  $: if (chart && yAxis) {
    pointsStorage.setY(yAxis.value);
    chart.options.scales.yAxes[0].scaleLabel.labelString = yAxis.symbol;
    chart.update();
  }

  function startCharging() {
    toggleMode({ target: { checked: true } });
    setChargeMode(2);
    setChargeLoad(6);
  }

  function toggleDrawing() {
    if (isDrawing) {
      stopDrawing();
    } else {
      startDrawing();
    }
  }

  function startDrawing() {
    isDrawing = true;
    pointsStorage.drain();
    startLog();
    resetStored();
    ipcRenderer.send('serialCommand', COMMANDS.start);
    subscribeData();
  }

  function startLog() {
    const fileName = 'Redox';
    const headers = ['Время, с', 'Напряжение, В', 'Ток, А'];
    ipcRenderer.send('startLog', fileName, headers);
    saveDisabled = false;
  }

  function stopDrawing() {
    isDrawing = false;
    unsubscribeData();
    ipcRenderer.send('serialCommand', COMMANDS.stop);
  }

  function subscribeData() {
    timeStart = 0;
    isCharging = $stateData.mode;
    unsubscribeData = IVData.subscribe(addPoint);
  }

  function addPoint(iv) {
    pointsStorage.addRow([timeStart++, iv.voltage, iv.current]);
    ipcRenderer.send(
      'logRow',
      pointsStorage.rows[pointsStorage.rows.length - 1]
    );
    storedCharge.update(
      charge => charge + (iv.current * (isCharging ? 1 : -1)) / 3.6
    );
    storedEnergy.update(
      energy => energy + (iv.current * iv.voltage * (isCharging ? 1 : -1)) / 3.6
    );
    updateChart();
  }

  function updateChart() {
    chart.data.datasets[0].data = pointsStorage.points;
    chart.update();
  }

  function resetStored() {
    storedCharge.set(0);
    storedEnergy.set(0);
  }

  function toggleMode(e) {
    isCharging = e.target.checked;
    ipcRenderer.send('serialCommand', COMMANDS.setMode(+isCharging));
    if (isCharging && !loadMode) setChargeMode(1);
    resetLoadConstraint();
  }

  function setChargeMode(mode) {
    loadMode = +mode;
    ipcRenderer.send('serialCommand', COMMANDS.setLoadMode(loadMode));
    resetLoadConstraint();
  }

  function setChargeLoad(l) {
    load = l;
    ipcRenderer.send('serialCommand', COMMANDS.setLoad(load));
  }

  function setPumpPower(power) {
    pumpPower = power;
    if (pumpOn) {
      ipcRenderer.send('serialCommand', COMMANDS.setPumpPower(power));
    }
  }

  function togglePump(e) {
    pumpOn = !pumpOn;
    ipcRenderer.send(
      'serialCommand',
      COMMANDS.setPumpPower(e.target.checked ? pumpPower : 0)
    );
  }

  function resetLoadConstraint() {
    loadConstraint =
      CONSTRAINTS[
        (loadMode === 1 ? 'current' : 'voltage') +
          (isCharging ? 'Charge' : 'Discharge')
      ];
  }
</script>

<div class="layout">
  <header>Управление редокс батареей</header>
  <main>
    <div class="label">Насосы</div>
    <div class="user-input">
      <Toggle style="grid-column: 5 / 6" on:change={togglePump} />
    </div>
    <div class="label">Мощность насосов, %</div>
    <div class="user-input">
      <RangeInput
        onChange={setPumpPower}
        range={CONSTRAINTS.pumpPower}
        defaultValue={pumpPower} />
    </div>

    <div class="label">Режим работы</div>
    <div class="user-input">
      <Switch
        checked={isCharging}
        style="grid-column: span 2"
        on:change={toggleMode}
        off="разрядка"
        on="зарядка" />
    </div>
    <div class="label">Режим {isCharging ? 'зарядки' : 'разрядки'}:</div>
    <div class="user-input">
      <Select
        defaultValue={loadMode}
        style="grid-column: span 5"
        options={isCharging ? chargingOptions : dischargingOptions}
        onChange={setChargeMode} />
    </div>
    {#if loadMode}
      <div class="label">
        Значение {loadMode === 1 ? 'тока, А' : 'напряжения, В'}
      </div>
      <div class="user-input">
        <RangeInput
          style="grid-column: 5 / 7"
          step={0.1}
          onChange={setChargeLoad}
          defaultValue={load}
          range={loadConstraint} />
      </div>
    {:else}
      <div class="spacer" />
    {/if}
    <div class="short-label">Ось х</div>
    <Select
      order={1}
      options={xOptions}
      defaultValue={xAxis.value}
      style="grid-column: 2 / 4"
      onChange={i => (xAxis = xOptions[i])} />
    <div class="short-label">Ось у</div>
    <Select
      order={2}
      options={yOptions}
      defaultValue={yAxis.value}
      style="grid-column: 2 / 4"
      onChange={i => (yAxis = yOptions[+i % 2])} />

    <div class="label">Напряжение, В</div>
    <div class="value">{$IVData.voltage}</div>
    <div class="label">Ток, А</div>
    <div class="value">{$IVData.current}</div>
    <div class="chart">
      <canvas id="chart" height="400" width="520" />
    </div>
  </main>
  <footer>
    <Button style="grid-area: 6 / 4 / 8 / 6" on:click={toggleDrawing}>
      {isDrawing ? 'Стоп' : 'Старт'}
    </Button>
    <SaveButton disabled={saveDisabled} />
  </footer>
</div>

<style>
  main {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(10, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 8px;
    align-items: center;
    padding: 0 24px;
  }
  .chart {
    grid-area: 1 / 6 / 11 / 13;
  }
  footer {
    justify-content: space-between;
    padding: 0 24px;
  }
  .user-input {
    grid-column: 3 / 6;
  }
  .spacer {
    grid-column: 1 / 6;
  }
  .label {
    grid-column: 1 / 3;
  }
  .short-label {
    grid-column: 1 / 2;
  }
  .value {
    grid-column: 4 / 6;
  }
  .value {
    font-family: 'Oswald';
  }
</style>
