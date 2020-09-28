<script>
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import { COMMANDS } from '../constants';
  import SwitchKey from '../atoms/SwitchKey';
  import { IVData } from '../stores';
  const cx = 80;
  const cy = 80;

  let storedBatCharge = 0,
    storedBatEnergy = 0,
    storedCellCharge = 0,
    storedCellEnergy = 0;

  $: storedBatCharge += $IVData.batCurrent / 3600;
  $: storedCellCharge += $IVData.cellCurrent / 3600;
  $: storedBatEnergy += ($IVData.cellCurrent * $IVData.batVoltage) / 3600;
  $: storedCellEnergy += ($IVData.cellCurrent * $IVData.cellVoltage) / 3600;

  const switches = {
    cellDcDc: false,
    cellBus: false,
    cellLoad: false,
    batteryBus: false,
    batteryLoad: false,
    pump: false,
    PSU: false,
  };

  function switchGate(e) {
    const id = e.target.id;
    switches[id] = !switches[id];
    ipcRenderer.send('serialCommand', COMMANDS[id + 'Switch'](+switches[id]));
  }
</script>

<div class="layout">
  <header>
    <h3>Управление редокс батареей</h3>
  </header>
  <main>
    <div class="power-sources">
      <div class="cell power-source">
        <h4>Ячейка</h4>
        <div class="param"><span class="value">{$IVData.cellVoltage.toFixed(2)}</span> В</div>
        <div class="param"><span class="value">{$IVData.cellCurrent.toFixed(2)}</span> А</div>
        <div class="param"><span class="value">{storedCellCharge.toFixed(2)}</span> А*ч</div>
        <div class="param"><span class="value">{storedCellEnergy.toFixed(2)}</span> Вт*ч</div>
      </div>
      <div class="battery power-source">
        <h4>АКБ</h4>
        <div class="param"><span class="value">{$IVData.batVoltage.toFixed(2)}</span> В</div>
        <div class="param"><span class="value">{$IVData.batCurrent.toFixed(2)}</span> А</div>
        <div class="param"><span class="value">{storedBatCharge.toFixed(2)}</span> А*ч</div>
        <div class="param"><span class="value">{storedBatEnergy.toFixed(2)}</span> Вт*ч</div>
      </div>
    </div>
    <div class="circuit">
      <svg viewBox="0 0 720 450" xmls="http://www.w3.org/2000/svg">
        <!-- cell related circuit -->
        <path
          d="M0,{cy * 2} h{cx} v{-cy} h{cx} M{cx * 3},{cy} h{cx * 0.5} M{cx * 4},{cy}
          h{cx * 0.5} v{cy} h{-cx * 0.5} M{cx * 3.5},{cy * 2} h{-cx * 2.5} v{cy}
          h{cx * 0.5}" />
        <image
          href="./icons/DcDc.png"
          x={cx * 2}
          y={cy * 0.5}
          width={cx}
          height={cy} />
        <SwitchKey
          boundingBox={{ x: cx * 3.5, y: cy * 0.5, width: cx * 0.5, height: cy }}
          on:click={switchGate}
          id="cellDcDc"
          isReversed={true}
          checked={switches.cellDcDc} />
        <SwitchKey
          boundingBox={{ x: cx * 3.5, y: cy * 1.5, width: cx * 0.5, height: cy }}
          on:click={switchGate}
          id="cellBus"
          checked={switches.cellBus} />
        <!-- /cell related circuit -->

        <!-- battery related circuit -->
        <path
          d="M0,{cy * 5} h{cx} v{-cy * 1.5} h{cx * 0.5} M{cx},{cy * 5} h{cx * 3.5}
          v{-cy * 3}" />
        <image
          href="./icons/DcDc.png"
          x={cx * 2}
          y={cy * 0.5}
          width={cx}
          height={cy} />
        <SwitchKey
          boundingBox={{ x: cx * 2, y: cy * 4.5, width: cx * 0.5, height: cy }}
          on:click={switchGate}
          id="batteryBus"
          checked={switches.batteryBus} />
        <!-- /battery related circuit -->

        <!-- load related circuit -->
        <path
          d="M{cx * 2},{cy * 3.5} h{cx * 0.5} M{cx * 2},{cy * 3} h{cx * 0.5}" />
        <image
          href="./icons/load.png"
          x={cx * 2.5}
          y={cy * 2.5}
          width={cx * 1.5}
          height={cy * 1.5} />
        <SwitchKey
          boundingBox={{ x: cx * 1.5, y: cy * 2.5, width: cx * 0.5, height: cy }}
          on:click={switchGate}
          id="cellLoad"
          checked={switches.cellLoad} />
        <SwitchKey
          boundingBox={{ x: cx * 1.5, y: cy * 3, width: cx * 0.5, height: cy }}
          on:click={switchGate}
          id="batteryLoad"
          checked={switches.batteryLoad} />
        <!-- /load related circuit -->

        <!-- pump related circuit -->
        <path
          d="M{cx * 4.5},{cy * 4.5} h{cx * 0.5} M{cx * 5.5},{cy * 4.5} h{cx * 0.25}" />
        <image
          href="./icons/pump.png"
          x={cx * 6}
          y={cy * 4}
          width={cx * 1.5}
          height={cy * 1.5} />
        <SwitchKey
          boundingBox={{ x: cx * 5, y: cy * 4, width: cx * 0.5, height: cy }}
          on:click={switchGate}
          id="pump"
          checked={switches.pump} />
        <!-- /pump related circuit -->

        <!-- PSU related circuit -->
        <path
          d="M{cx * 4.5},{cy * 2.5} h{cx * 0.5} M{cx * 5.5},{cy * 2.5} h{cx * 0.25}" />
        <image
          href="./icons/PSU.png"
          x={cx * 6}
          y={cy * 1.5}
          width={cx * 1.5}
          height={cy * 1.5} />
        <SwitchKey
          boundingBox={{ x: cx * 5, y: cy * 2, width: cx * 0.5, height: cy }}
          on:click={switchGate}
          id="PSU"
          isReversed={true}
          checked={switches.PSU} />
        <!-- /PSU related circuit -->

      </svg>
    </div>
  </main>
  <footer>
    <Button>Построение графиков</Button>
  </footer>
</div>

<style>
  path {
    fill: none;
    stroke: #37abb8;
    stroke-width: 4px;
  }
  main {
    display: flex;
    padding: 0 2.4rem;
  }
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
    opacity: 0.3;
    background: url('../../static/img/redox.png') center 10% no-repeat,
      url('../../static/img/battery.png') center 90% no-repeat;
    background-size: 80%, 70%;
  }
  .circuit {
    flex-grow: 2;
  }
  footer {
    text-align: center;
  }
</style>
