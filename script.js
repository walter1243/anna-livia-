const startButton = document.getElementById('startButton');
const storyPanel = document.getElementById('storyPanel');
const scenes = Array.from(document.querySelectorAll('[data-scene]'));
const panelNav = document.getElementById('panelNav');
const progressBar = document.getElementById('progressBar');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const replayButton = document.getElementById('replayButton');

let storyStarted = false;
let currentScene = 0;

function buildDots() {
  scenes.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'panel-dot';
    dot.setAttribute('aria-label', `Ir para o capitulo ${index + 1}`);
    dot.addEventListener('click', () => setScene(index));
    panelNav.appendChild(dot);
  });
}

function syncScene() {
  const dots = Array.from(panelNav.querySelectorAll('.panel-dot'));
  scenes.forEach((scene, index) => {
    scene.classList.toggle('active', index === currentScene);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentScene);
  });

  const progress = ((currentScene + 1) / scenes.length) * 100;
  progressBar.style.width = `${progress}%`;
  prevButton.disabled = currentScene === 0;
  nextButton.disabled = currentScene === scenes.length - 1;
}

function setScene(index) {
  currentScene = index;
  syncScene();
}

function openStory() {
  if (storyStarted) {
    return;
  }

  storyStarted = true;
  document.body.classList.add('intro-open');
  startButton.setAttribute('aria-expanded', 'true');

  window.setTimeout(() => {
    document.body.classList.add('story-open');
    storyPanel.classList.add('visible');
    setScene(0);
  }, 450);
}

function resetExperience() {
  storyStarted = false;
  currentScene = 0;
  document.body.classList.remove('story-open', 'intro-open');
  startButton.setAttribute('aria-expanded', 'false');
  storyPanel.classList.remove('visible');
  syncScene();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

startButton.addEventListener('click', openStory);
prevButton.addEventListener('click', () => setScene(Math.max(0, currentScene - 1)));
nextButton.addEventListener('click', () => setScene(Math.min(scenes.length - 1, currentScene + 1)));
replayButton.addEventListener('click', resetExperience);

document.addEventListener('keydown', (event) => {
  if (!storyStarted) {
    if (event.key === 'Enter' || event.key === ' ') {
      openStory();
    }
    return;
  }

  if (event.key === 'ArrowRight') {
    setScene(Math.min(scenes.length - 1, currentScene + 1));
  }

  if (event.key === 'ArrowLeft') {
    setScene(Math.max(0, currentScene - 1));
  }
});

buildDots();
syncScene();
