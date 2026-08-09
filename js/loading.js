const LoadingModule = {
  init() {
    const overlay = document.getElementById('loadingOverlay');
    const app = document.getElementById('appContainer');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');

    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 15) + 5;
      if (count >= 100) {
        count = 100;
        clearInterval(interval);
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.classList.add('hidden');
            app.classList.remove('hidden');
          }, 500);
        }, 200);
      }
      fill.style.width = `${count}%`;
      text.textContent = `LOADING ... ${count}%`;
    }, 100);
  }
};

document.addEventListener('DOMContentLoaded', () => LoadingModule.init());
