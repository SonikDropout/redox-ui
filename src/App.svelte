<script>
  import Circuit from './layouts/Circuit';
  import Chart from './layouts/Chart';
  import Version from './atoms/Version';
  import UpdateModal from './organisms/UpdateModal';
  let updateAvailable = ipcRenderer.sendSync('checkUpdate');

  ipcRenderer.on('updateAvailable', () => (updateAvailable = true));
</script>

<Circuit />
<Version />
{#if updateAvailable}
  <UpdateModal />
{/if}
