import '../css/index.css';
import initPreviewButtons from './meeting/preview/preview';

window.addEventListener('DOMContentLoaded', async () => {
  console.log('======= Initializing preview =======');
  await initPreviewButtons();
  console.log('======= Done initializing preview =======');
});
