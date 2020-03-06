<script>
  import Chart from './layouts/Chart';
  import { STATES } from './constants';
  let state = STATES.chart;
</script>

<div class="content {state}">
  <div class="layout"></div>
  <Chart />
</div>

<style>
  .content {
    transition: 0.3s ease-in-out;
  }
  .chart {
    transform: translateY(-100vh);
  }
</style>
