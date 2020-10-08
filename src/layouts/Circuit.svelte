<script>
  import Button from '../atoms/Button';
  import { ipcRenderer } from 'electron';
  import { COMMANDS, EXCLUDING_SWITCHES } from '../constants';
  import SwitchKey from '../atoms/SwitchKey';
  import PowerSources from '../organisms/PowerSources';
  import { IVData, stateData } from '../stores';
  const cx = 80;
  const cy = 80;

  let switches = {
    cellDcDc: $stateData.cellDcDcOnOff,
    cellBus: $stateData.cellBusOnOff,
    cellLoad: $stateData.cellLoadOnOff,
    batteryBus: $stateData.batteryBusOnOff,
    batteryLoad: $stateData.batteryLoadOnOff,
    pump: $stateData.pumpOnOff,
    PSU: $stateData.PSUOnOff,
  };

  let disabledSwitches = {
    cellDcDc: 0,
    cellBus: 0,
    cellLoad: 0,
    batteryBus: 0,
    batteryLoad: 0,
    pump: 0,
    PSU: 0,
  };

  for (let key in switches) {
    if (switches[key]) {
      for (let dk in EXCLUDING_SWITCHES[key]) {
        disabledSwitches[dk] += 1;
      }
    }
  }

  const requiresUpdate = {};

  stateData.subscribe(state => {
    for (let key in switches) {
      if (switches[key] != state[key + 'OnOff']) {
        if (requiresUpdate[key]) {
          requiresUpdate[key] = false;
          switches[key] = state[key + 'OnOff'];
          updateDisabledSwitches(key);
        } else {
          requiresUpdate[key] = true;
        }
      } else if (requiresUpdate[key]) requiresUpdate[key] = false;
    }
  });

  function switchGate(e) {
    const id = e.target.id;
    if (!disabledSwitches[id]) {
      switches[id] = !switches[id];
      ipcRenderer.send('serialCommand', COMMANDS[id + 'Switch'](+switches[id]));
      updateDisabledSwitches(id);
    }
  }

  function updateDisabledSwitches(id) {
    if (switches[id]) {
      for (let key of EXCLUDING_SWITCHES[id]) {
        disabledSwitches[key] += 1;
        console.log(key, disabledSwitches[key]);
      }
    } else {
      for (let key of EXCLUDING_SWITCHES[id]) {
        disabledSwitches[key] -= disabledSwitches[key] > 0 ? 1 : 0;
      }
    }
  }
</script>

<div class="layout">
  <header>
    <h3>Управление редокс батареей</h3>
  </header>
  <main>
    <PowerSources isChargingDisabled={!switches.batteryBus} />
    <div class="circuit">
      <svg viewBox="0 0 720 480" xmls="http://www.w3.org/2000/svg">
        <!-- cell related circuit -->
        <path
          d="M0,{cy * 2} h{cx} v{-cy} h{cx} M{cx * 3},{cy} h{cx * 0.5} M{cx * 4},{cy}
          h{cx * 0.5} v{cy} h{-cx * 0.5} M{cx * 3.5},{cy * 2} h{-cx * 2.5} v{cy}
          h{cx * 0.5}" />
        <image
          href="./icons/dcdc.png"
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
          d="M0,{cy * 5} h{cx} v{-cy * 1.5} h{cx * 0.5} M{cx},{cy * 5} h{cx * 1}
          M{cx * 2.5},{cy * 4.5} h{cx * 2} M{cx * 2.5},{cy * 5.5} h{cx * 0.5} M{cx * 4},{cy * 5.5}
          h{cx * 0.5} v{-cy * 3.5}" />
        <image
          href="./icons/dcdc.png"
          x={cx * 3}
          y={cy * 5}
          width={cx}
          height={cy} />
        <circle cx={cx * 2} cy={cy * 5} r="4" />
        <circle cx={cx * 2.5} cy={cy * 4.5} r="4" />
        <circle cx={cx * 2.5} cy={cy * 5.5} r="4" />
        <path
          class="switch"
          class:checked={switches.batteryBus}
          d="M {cx * 2},{cy * 5} h{cx * 0.7}" />
        <rect
          class="switch-hitbox"
          pointer-events="all"
          fill="none"
          on:click={switchGate}
          x={cx * 2}
          y={cy * 4.5}
          id="batteryBus"
          width={cx * 0.5}
          height={cy} />
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

        <!-- bus related circuit -->
        <text x={cx * 4.8} y={cy * 3.5}>
          <tspan dx="0">Напряжение шины</tspan>
          <tspan dx="-16.6rem" dy="2rem">питания, В: {$IVData.busVoltage}</tspan>
        </text>
        <!-- /bus related circuit -->

      </svg>
    </div>
  </main>
  <footer>
    <Button on:click={() => window.scrollTo(0, window.innerHeight)}>
      Управление ячейкой
    </Button>
  </footer>
</div>

<style>
  .switch-hitbox {
    cursor: pointer;
  }
  path {
    fill: none;
    stroke: #37abb8;
    stroke-width: 4px;
  }
  .switch.checked {
    transform: rotate(45deg);
  }
  .switch {
    transform-origin: 0%, 50%;
    transform-box: fill-box;
    transform: rotate(-45deg);
  }
  circle {
    fill: #37abb8;
  }
  main {
    display: flex;
    padding: 0 2.4rem;
  }

  .circuit {
    flex-grow: 2;
  }
  text {
    font: bold 1.6rem 'Open Sans';
  }
  footer {
    text-align: center;
  }
</style>
