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

  ipcRenderer.send('startLog', ['t, s', 'U, V', 'I, A']);

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(pointsStorage.points, { x: xAxis.symbol, y: yAxis.symbol })
    );
    chart.options.onClick = chart.resetZoom;
    stateData.subscribe(state => {
      if (!isDrawing && (state.cellBusOnOff || state.cellDcDcOnOff || state.cellLoadOnOff))
        startDrawing();
      if (!state.cellBusOnOff && !state.cellDcDcOnOff && !state.cellLoadOnOff && isDrawing)
        stopDrawing();
    });
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

  $: isCharging = $stateData.cellDcDcOnOff;
  $: resetLoadConstraint(isCharging);

  let isDrawing,
    unsubscribeData,
    isCharging = $stateData.cellDcDcOnOff,
    xAxis = xOptions[0],
    yAxis = yOptions[0],
    chart,
    load,
    loadMode = $stateData.loadMode,
    loadConstraint =
      CONSTRAINTS[
        (loadMode === 1 ? 'current' : 'voltage') +
          (isCharging ? 'Charge' : 'Discharge')
      ],
    timeStart;

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

  function startDrawing() {
    isDrawing = true;
    pointsStorage.drain();
    resetStored();
    subscribeData();
  }

  function stopDrawing() {
    isDrawing = false;
    unsubscribeData();
  }

  function subscribeData() {
    timeStart = 0;
    unsubscribeData = IVData.subscribe(addPoint);
  }

  function addPoint(iv) {
    pointsStorage.addRow([timeStart++, iv.cellVoltage, iv.cellCurrent]);
    ipcRenderer.send(
      'logRow',
      pointsStorage.rows[pointsStorage.rows.length - 1]
    );
    storedCharge.update(
      charge => charge + (iv.cellCurrent * (isCharging ? 1 : -1)) / 3.6
    );
    storedEnergy.update(
      energy =>
        energy + (iv.cellCurrent * iv.cellVoltage * (isCharging ? 1 : -1)) / 3.6
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
  
  function setChargeMode(mode) {
    loadMode = +mode;
    ipcRenderer.send('serialCommand', COMMANDS.setLoadMode(loadMode));
    resetLoadConstraint();
  }

  function setChargeLoad(l) {
    load = l;
    ipcRenderer.send('serialCommand', COMMANDS.setLoad(load));
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
  <header>Задание рабочих параметров ячейки</header>
  <main>
    <div class="label">Режим {isCharging ? 'зарядки' : 'разрядки'}:</div>
    <div class="user-input">
      <Select
        defaultValue={loadMode}
        style="grid-column: span 5"
        options={isCharging ? chargingOptions : dischargingOptions}
        onChange={setChargeMode} />
    </div>
    {#if loadMode}
      <div class="label">{loadMode === 1 ? 'Ток, А' : 'Напряжение, В'}</div>
      <div class="user-input">
        <RangeInput
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
    <div class="value">{$IVData.cellVoltage}</div>
    <div class="label">Ток, А</div>
    <div class="value">{$IVData.cellCurrent}</div>
    <div class="chart">
      <canvas id="chart" height="380" width="520" />
    </div>
  </main>
  <footer>
    <Button on:click={() => window.scrollTo(0, 0)} style="margin-right: auto">
      Назад
    </Button>
    <SaveButton />
  </footer>
</div>

<style>
  main {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: repeat(10, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 8px;
    align-items: center;
    padding: 0 24px;
  }
  .chart {
    grid-area: 1 / 4 / 11 / 10;
  }
  footer {
    justify-content: space-between;
    padding: 0 24px;
  }
  .user-input {
    grid-column: 2 / 4;
  }
  .spacer {
    grid-column: 1 / 4;
  }
  .label {
    grid-column: 1 / 2;
  }
  .short-label {
    grid-column: 1 / 2;
  }
  .value {
    grid-column: 2 / 3;
  }
  .value {
    font-family: 'Oswald';
  }
  footer {
    display: flex;
    align-items: flex-start;
  }
</style>
