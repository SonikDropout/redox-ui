<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import Chart from 'chart.js';
  import 'chartjs-plugin-zoom';
  import configureChart from './chart.config';
  import { onMount } from 'svelte';
  import { IVData, stateData } from '../stores';
  export let onBack;

  onMount(() => {
    chart = new Chart(
      document.getElementById('chart').getContext('2d'),
      configureChart(points, { x: xAxis.symbol, y: yAxis.symbol })
    );
    chart.options.onClick = chart.resetZoom;
  });

  ipcRenderer.send('usbStorageRequest');
  ipcRenderer.on('usbConnected', () => (saveDisabled = false));
  ipcRenderer.on('usbDisconnected', () => (saveDisabled = true));

  const xOptions = [
    { label: 'время', value: 0, symbol: 't, c' },
    { label: 'напряжение', value: 1, symbol: 'U, B' },
  ];

  const yOptions = [
    { label: 'ток', value: 0, symbol: 'I, A' },
    { label: 'напряжение', value: 1, symbol: 'U, B' },
  ];

  let points = [],
    saveDisabled = true,
    isDrawing,
    unsubscribeData,
    xAxis = xOptions[0],
    yAxis = yOptions[0],
    chart,
    storedCharge = 0,
    storedEnergy = 0,
    timeStart;

  $: if (chart && xAxis) {
    chart.options.scales.xAxes[0].scaleLabel.labelString = xAxis.symbol;
    chart.update();
  }

  $: if (chart && yAxis) {
    chart.options.scales.yAxes[0].scaleLabel.labelString = yAxis.symbol;
    chart.update();
  }

  function toggleDrawing() {
    if (isDrawing) {
      unsubscribeData();
      stopDrawing();
    } else {
      startLogging();
      subscribeData();
    }
    isDrawing = !isDrawing;
  }

  function startLogging() {
    const fileName = '';
    const headers = [];
    ipcRenderer.send('startFileWrite', fileName, headers);
  }

  function stopDrawing() {
    points = [];
  }

  function subscribeData() {
    timeStart = Date.now();
    unsubscribeData = commonData.subscirbe(addPoint);
  }

  function addPoint(data) {
    chart.data.datasets[0].data.push({
      x: data[xAxis.value],
      y: data[yAxis.value],
    });
  }

  function updateChart(p) {
    points.push(p);
    chart.data.datasets[0].data = points;
    chart.update();
  }

  function sendToLogger(row) {
    ipcRenderer.send('excelRow', row);
  }

  function saveFile() {
    ipcRenderer.send('saveFile');
  }
</script>

<div class="layout">
  <header>Построение графиков</header>
  <main>
    <h3>Характеристики редокс батареи</h3>
    <div class="label">Напряжение, В</div>
    <div class="long-value">{$IVData.voltage}</div>
    <div class="label">Ток, А</div>
    <div class="long-value">{$IVData.current}</div>
    <div class="label">Режим работы</div>
    <div class="long-value">{$stateData.mode}</div>
    <div class="label">Тип соединения МЭБ</div>
    <div class="long-value">{$stateData.connectionType}</div>
    <div class="short-label">Ось х</div>
    <Select
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
      onChange={i => (yAxis = yOptions[i])} />
    <Button style="grid-area: 6 / 4 / 8 / 6" on:click={toggleDrawing}>
      {isDrawing ? 'Стоп' : 'Старт'}
    </Button>
    <div class="long-label">Заряд, мА * с</div>
    <div class="value">{storedCharge}</div>
    <div class="long-label">Запасенная энергия, мВт * с</div>
    <div class="value">{storedEnergy}</div>
    <div class="chart">
      <canvas id="chart" height="400" width="520" />
    </div>
  </main>
  <footer>
    <Button on:click={onBack}>Назад</Button>
    <Button on:click={saveFile} disabled={saveDisabled}>
      Сохранить данные на USB-устройство
    </Button>
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
  h3 {
    grid-column: 1 / 6;
  }
  .chart {
    grid-area: 1 / 6 / 11 / 13;
  }
  footer {
    justify-content: space-between;
    padding: 0 24px;
  }
  .label {
    grid-column: 1 / 4;
  }
  .short-label {
    grid-column: 1 / 2;
  }
  .long-label {
    grid-column: 1 / 5;
  }
  .value {
    grid-column: 5 / 6;
  }
  .long-value {
    grid-column: 4 / 6;
  }
  .value,
  .long-value {
    font-family: 'Oswald';
  }
</style>
