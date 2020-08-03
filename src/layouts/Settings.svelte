<script>
  import Select from '../molecules/Select';
  import Button from '../atoms/Button';
  import RangeInput from '../molecules/RangeInput';
  import Toggle from '../atoms/Toggle';
  import Switch from '../atoms/Switch';
  import {
    stateData,
    IVData,
    connectionType,
    storedEnergy,
    mode,
    storedCharge,
  } from '../stores';
  import { COMMANDS, CONSTRAINTS } from '../constants';
  import { getPowerFromFlow } from '../utils/others';
  import { ipcRenderer } from 'electron';

  const connectionTypeOptions = [
    { label: 'последовательное', value: 0 },
    { label: 'параллельное', value: 1 },
  ];

  const chargingOptions = [
    { label: 'зарядка постояным током', value: 1 },
    { label: 'зарядка постояным напряжением', value: 2 },
  ];

  const dischargingOptions = [
    { label: 'разрядка на внеш. нагрузке', value: 0 },
    { label: 'разрядка постояным током', value: 1 },
    { label: 'разрядка постояным напряжением', value: 2 },
  ];

  const initialState = $stateData;

  let isCharging = $stateData.mode,
    loadMode = $stateData.loadMode,
    load = $IVData.setLoad,
    pumpPower = Math.max($stateData.pumpPower, 4);

  function setConnectionType(type) {
    connectionType.set(+type);
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
  function setPumpPower(flow) {
    pumpPower = getPowerFromFlow(+flow);
    if ($stateData.pumpPower > 0)
      ipcRenderer.send('serialCommand', COMMANDS.setPumpPower(pumpPower));
  }
  function toggleMode(e) {
    mode.set(Number(e.target.checked));
    ipcRenderer.send('serialCommand', COMMANDS.setMode($mode));
    setLoad(0);
  }

  function setLoadMode(m) {
    loadMode = +m;
    ipcRenderer.send('serialCommand', COMMANDS.setLoadMode(+m));
  }

  function setLoad(v) {
    load = v;
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
      defaultValue={$connectionType} />
    <div class="label right">Насосы</div>
    <Toggle
      style="grid-column: 5 / 6"
      on:change={togglePump}
      checked={initialState.pumpPower > 0} />
    <div class="label right">Подсветка</div>
    <Toggle
      style="grid-column: 5 / 6"
      on:change={toggleLight}
      checked={initialState.lightingOn} />
    <div class="dbc-label right">
      Подача насосов
      <br />
      мл/мин
    </div>
    <RangeInput
      onChange={setPumpPower}
      range={CONSTRAINTS.pumpFlow}
      defaultValue={initialState.pumpPower}
      step={10}
      style="grid-area: 2 / 10 / 4 / 12" />
    <div class="long-label right">Задание режима работы</div>
    <Switch
      style="grid-column: span 2"
      on:change={toggleMode}
      off="разрядка"
      on="зарядка"
      checked={$mode} />
    <div class="long-label right">Характеристики режима работы</div>
    <Select
      defaultValue={loadMode}
      style="grid-column: span 5"
      options={$mode ? chargingOptions : dischargingOptions}
      onChange={setLoadMode} />
    {#if loadMode}
      <div class="label right">
        Значение {loadMode === 1 ? 'тока, А' : 'напряжения, В'}
      </div>
      <RangeInput
        style="grid-column: 5 / 7"
        step={0.1}
        onChange={setLoad}
        defaultValue={load}
        range={CONSTRAINTS[(loadMode === 1 ? 'current' : 'voltage') + ($connectionType === 1 ? 'Parallel' : 'Series')]} />
    {:else}
      <div class="spacer" />
    {/if}
    <div class="labeled-value" style="grid-column: 2 / 8">
      <span class="label">Заряд, мА * ч</span>
      <strong class="value">{$storedCharge | 0}</strong>
    </div>
    <div class="labeled-value" style="grid-column: 8 / 12">
      <span class="label">Напряжение, В</span>
      <strong class="value">{$IVData.voltage}</strong>
    </div>
    <div class="labeled-value" style="grid-column: 2 / 8">
      <span class="label">Запасенная энергия, мВт * ч</span>
      <strong class="value">{$storedEnergy | 0}</strong>
    </div>
    <div class="labeled-value" style="grid-column: 8 / 12">
      <span class="label">Ток, А</span>
      <strong class="value">{$IVData.current}</strong>
    </div>
  </main>
  <footer>
    <Button on:click={() => window.scrollTo({ top: window.innerHeight })}>
      Построение графиков
    </Button>
  </footer>
</div>

<style>
  main {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-column-gap: 24px;
    padding: 24px;
    align-items: center;
    grid-template-rows: repeat(8, 1fr);
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
  .labeled-value {
    font-size: 2rem;
    display: flex;
    justify-content: space-between;
  }
  .spacer {
    grid-column: span 12;
  }
  footer {
    justify-content: center;
  }
</style>
