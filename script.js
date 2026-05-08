const scenes = Array.from(document.querySelectorAll('[data-scene]'));
const dots = Array.from(document.querySelectorAll('#indicators .dot'));
const progressBar = document.getElementById('progress-bar');
const prevButton = document.getElementById('prevBtn');
const nextButton = document.getElementById('nextBtn');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const mainVideo = document.getElementById('mainVideo');
const videoSceneIndex = scenes.findIndex((scene) => scene.contains(mainVideo));

let currentScene = 0;
let musicStartedByGesture = false;
let wasInVideoScene = false;

function clampScene(index) {
  return Math.max(0, Math.min(index, scenes.length - 1));
}

function syncScene() {
  scenes.forEach((scene, index) => {
    scene.classList.toggle('active', index === currentScene);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentScene);
  });

  if (progressBar) {
    const progress = ((currentScene + 1) / scenes.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  if (prevButton) {
    prevButton.disabled = currentScene === 0;
  }

  if (nextButton) {
    nextButton.disabled = currentScene === scenes.length - 1;
  }

  const inVideoScene = currentScene === videoSceneIndex;

  if (musicToggle) {
    musicToggle.disabled = inVideoScene;
  }

  if (inVideoScene) {
    if (bgMusic && !bgMusic.paused) {
      bgMusic.pause();
    }

    if (mainVideo) {
      mainVideo.muted = false;
    }
  } else {
    if (wasInVideoScene && mainVideo && !mainVideo.paused) {
      mainVideo.pause();
    }

    if (bgMusic && musicStartedByGesture) {
      void tryPlayMusic();
    }
  }

  wasInVideoScene = inVideoScene;
}

function setScene(index) {
  currentScene = clampScene(index);
  syncScene();
}

function setMusicButtonState(isPlaying) {
  if (!musicToggle) {
    return;
  }

  musicToggle.textContent = isPlaying ? 'Pausar música' : 'Tocar música';
  musicToggle.classList.toggle('is-playing', isPlaying);
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
}

async function tryPlayMusic() {
  if (!bgMusic) {
    return false;
  }

  try {
    await bgMusic.play();
    setMusicButtonState(true);
    return true;
  } catch {
    setMusicButtonState(false);
    return false;
  }
}

function ensureMusicAfterGesture() {
  if (musicStartedByGesture || !bgMusic) {
    return;
  }

  musicStartedByGesture = true;
  void tryPlayMusic();
}

if (prevButton) {
  prevButton.addEventListener('click', () => {
    ensureMusicAfterGesture();
    setScene(currentScene - 1);
  });
}

if (nextButton) {
  nextButton.addEventListener('click', () => {
    ensureMusicAfterGesture();
    setScene(currentScene + 1);
  });
}

dots.forEach((dot) => {
  const sceneIndex = Number(dot.dataset.go);
  if (!Number.isNaN(sceneIndex)) {
    dot.addEventListener('click', () => {
      ensureMusicAfterGesture();
      setScene(sceneIndex);
    });
  }
});

if (musicToggle) {
  musicToggle.addEventListener('click', async () => {
    if (!bgMusic) {
      return;
    }

    if (bgMusic.paused) {
      musicStartedByGesture = true;
      await tryPlayMusic();
      return;
    }

    bgMusic.pause();
    setMusicButtonState(false);
  });
}

if (bgMusic) {
  bgMusic.volume = 0.45;
  bgMusic.addEventListener('play', () => setMusicButtonState(true));
  bgMusic.addEventListener('pause', () => setMusicButtonState(false));
}

if (mainVideo) {
  mainVideo.addEventListener('play', () => {
    if (bgMusic && !bgMusic.paused) {
      bgMusic.pause();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    setScene(currentScene + 1);
  }

  if (event.key === 'ArrowLeft') {
    setScene(currentScene - 1);
  }
});

setScene(0);
setMusicButtonState(false);
