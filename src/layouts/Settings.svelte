<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import RangeInput from '../molecules/RangeInput';
  import Toggle from '../atoms/Toggle';
  import Switch from '../atoms/Switch';
  import { stateData, IVData } from '../stores';
  import { COMMANDS, CONSTRAINTS } from '../constants';
  export let onNext;

  const connectionTypeOptions = [
    { label: 'последовательное', value: 0 },
    { label: 'параллельное', value: 1 },
  ];

  const chargingOptions = [
    {label: 'зарядка постояным током', value: 1},
    {label: 'зарядка постояным напряжением', value: 2},
  ]

  const dischargingOptions = [
    {label: 'разрядка постояным током', value: 1},
    {label: 'разрядка постояным напряжением', value: 2},
  ]

  let selectedConnectionType = 0,
    isCharging = $stateData.mode,
    pumpPower = $stateData.pumpPower;

  function setConnectionType(type) {
    selectedConnectionType = type;
  }

  function togglePump(e) {
    if (e.target.checked) {
      ipcRenderer.send('serialCommand', COMMANDS.setPumpPower(pumpPower));
    } else {
      ipcRenderer.send('serialCommand', COMMANDS.setPumpPower(0));
    }
  }

  function toggleLight(e) {
    if (e.target.checked) {
      ipcRenderer.send('serialCommand', COMMANDS.turnOnLighting);
    } else {
      ipcRenderer.send('serialCommand', COMMANDS.turnOffLighting);
    }
  }
  function setPumpPower(p) {
    pumpPower = p;
    ipcRenderer.send('serialCommand', COMMANDS.setPumpPower(p));
  }
  function toggleMode(e) {
    ipcRenderer.send(
      'serialCommand',
      COMMANDS.setMode(Number(e.target.checked))
    );
  }
  function setMode(m) {
    ipcRenderer.send('serialCommand', COMMANDS.setMode(m));
  }

  function setLoad(v) {
    ipcRenderer.send('serialCommand', COMMANDS.setLoad(v));
  }
</script>

<div class="layout">
  <header>Задание рабочих параметров стенда</header>
  <main>
    <div class="label right">Тип соединения МЭБ</div>
    <Select
      style="grid-column: 5 / 8"
      options={connectionTypeOptions}
      onChange={setConnectionType}
      defaultValue={selectedConnectionType} />
    <div class="label right">Насосы</div>
    <Toggle style="grid-column: 5 / 6" on:change={togglePump} />
    <div class="label right">Подсветка</div>
    <Toggle style="grid-column: 5 / 6" on:change={toggleLight} checked={$stateData.lightingOn} />
    <div class="dbc-label right">
      Мощность насосов
      <br />
      % от макс
    </div>
    <RangeInput onChange={setPumpPower} style="grid-area: 2 / 10 / 4 / 12" />
    <div class="long-label right">Задание режима работы</div>
    <Switch
      style="grid-column: span 2"
      on:change={toggleMode}
      off="разрядка"
      on="зарядка"
      checked={!!$stateData.mode} />
    <div class="long-label right">Характеристики режима работы</div>
    <Select
      style="grid-column: span 5"
      options={isCharging ? chargingOptions : dischargingOptions}
      onChange={setMode} />
    <div class="label right">Значение тока, мА</div>
    <RangeInput style="grid-column: 5 / 7" onChange={setLoad} value={$IVData.setLoad} range={CONSTRAINTS.voltgeCharge} />
  </main>
  <footer>
    <Button on:click={onNext}>Построение графиков</Button>
  </footer>
</div>

<style>
  main {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-column-gap: 24px;
    padding: 30px 24px 90px;
    align-items: center;
    grid-template-rows: repeat(6, 1fr);
  }
  .label {
    grid-column: 1 / 5;
  }
  .right {
    font-size: 2rem;
    text-align: right;
    justify-self: end;
  }
  .long-label {
    grid-column: 1 / 6;
  }
  .dbc-label {
    grid-area: 2 / 7 / 4 / 10;
    line-height: 1.5;
  }
  footer {
    justify-content: center;
  }
</style>
