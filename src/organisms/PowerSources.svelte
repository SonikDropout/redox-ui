<script>
  import Toggle from '../atoms/Toggle';
  import { IVData } from '../stores';
  export let isChargingDisabled;

  let storedBatCharge = 0,
    storedBatEnergy = 0,
    storedCellCharge = 0,
    storedCellEnergy = 0;

  $: storedBatCharge += $IVData.batCurrent / 3600;
  $: storedCellCharge += $IVData.cellCurrent / 3600;
  $: storedBatEnergy += ($IVData.cellCurrent * $IVData.batVoltage) / 3600;
  $: storedCellEnergy += ($IVData.cellCurrent * $IVData.cellVoltage) / 3600;

  function chargeBattery(e) {
    ipcRenderer.send(
      'serialCommand',
      COMMANDS.batteryChargeMode(+e.target.checked)
    );
  }
</script>

<div class="power-sources">
  <div class="cell power-source">
    <h4>Ячейка</h4>
    <div class="param">
      <span class="value">{$IVData.cellVoltage.toFixed(2)}</span>
      В
    </div>
    <div class="param">
      <span class="value">{$IVData.cellCurrent.toFixed(2)}</span>
      А
    </div>
    <div class="param">
      <span class="value">{storedCellCharge.toFixed(2)}</span>
      А*ч
    </div>
    <div class="param">
      <span class="value">{storedCellEnergy.toFixed(2)}</span>
      Вт*ч
    </div>
  </div>
  <div class="battery power-source">
    <h4>АКБ</h4>
    <div class="param">
      <span class="value">{$IVData.batVoltage.toFixed(2)}</span>
      В
    </div>
    <div class="param">
      <span class="value">{$IVData.batCurrent.toFixed(2)}</span>
      А
    </div>
    <div class="param">
      <span class="value">{storedBatCharge.toFixed(2)}</span>
      А*ч
    </div>
    <div class="param">
      <span class="value">{storedBatEnergy.toFixed(2)}</span>
      Вт*ч
    </div>
    <div class="param charging">
      Зарядка
      <Toggle on:change={chargeBattery} disabled={isChargingDisabled} />
    </div>
  </div>
</div>

<style>
  .power-sources {
    width: 30rem;
    position: relative;
    display: flex;
    font-weight: 500;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
  }
  .power-source {
    width: 50%;
    font-size: 130%;
  }
  .param {
    margin: 1.2rem 0;
  }
  .charging {
    position: relative;
    top: 2.4rem;
  }
  .value {
    display: inline-block;
    width: 50%;
    text-align: right;
  }
  .power-sources::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0.4;
    background: url('../../static/img/redox.png') center 10% no-repeat,
      url('../../static/img/battery.png') center 90% no-repeat;
    background-size: 80%, 70%;
  }
</style>
