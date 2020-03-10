<script>
  import Chart from './layouts/Chart';
  import Settings from './layouts/Settings';
  import { STATES } from './constants';
  let state = STATES.initial;
</script>

<div class="content {state}">
  <Settings onNext={() => (state = STATES.chart)} />
  <Chart onBack={() => (state = STATES.initial)} />
</div>

<style>
  .content {
    transition: 0.3s ease-in-out;
  }
  .chart {
    transform: translateY(-100vh);
  }
</style>
