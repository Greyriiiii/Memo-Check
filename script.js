// Theme based on month
function applySeasonTheme() {
  const month = new Date().getMonth();
  const root = document.documentElement;

  if (month >= 2 && month <= 4) {
    // Spring
    root.style.setProperty('--bg-color', '#e8f5e9');
    root.style.setProperty('--card-color', '#c8e6c9');
    root.style.setProperty('--card-back', '#81c784');
    root.style.setProperty('--text-color', '#2e7d32');
  } else if (month >= 5 && month <= 7) {
    // Summer
    root.style.setProperty('--bg-color', '#fff8e1');
    root.style.setProperty('--card-color', '#ffe082');
    root.style.setProperty('--card-back', '#ffb300');
    root.style.setProperty('--text-color', '#e65100');
  } else if (month >= 8 && month <= 10) {
    // Fall
    root.style.setProperty('--bg-color', '#fff3e0');
    root.style.setProperty('--card-color', '#ffcc80');
    root.style.setProperty('--card-back', '#fb8c00');
    root.style.setProperty('--text-color', '#4e342e');
  } else {
    // Winter
    root.style.setProperty('--bg-color', '#e3f2fd');
    root.style.setProperty('--card-color', '#bbdefb');
    root.style.setProperty('--card-back', '#64b5f6');
    root.style.setProperty('--text-color', '#0d47a1');
  }
}

applySeasonTheme();

// Game logic
const emojis = ['🍎','🍌','🍇','🍓','🍒','🥝','🍉','🍍'];
let cards = [...emojis, ...emojis];
cards.sort(() => 0.5 - Math.random());

const board = document.getElementById('gameBoard');
let firstCard = null;
let lockBoard = false;
let moves = 0;
let matched = 0;
let startTime = null;
let timerInterval = null;

const moveCounter = document.getElementById('moveCount');
const timerDisplay = document.getElementById('timer');

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = `${seconds}s`;
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

cards.forEach((emoji) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.emoji = emoji;
  card.innerText = emoji;
  card.addEventListener('click', () => flipCard(card));
  board.appendChild(card);
});

function flipCard(card) {
  if (lockBoard || card.classList.contains('flipped')) return;

  // Start timer on first flip
  if (moves === 0 && matched === 0 && !startTime) {
    startTimer();
  }

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
  } else {
    moves++;
    moveCounter.textContent = moves;
    if (firstCard.dataset.emoji === card.dataset.emoji) {
      matched++;
      firstCard = null;
      if (matched === emojis.length) {
        stopTimer();
        setTimeout(() => alert(`🎉 You win in ${moves} moves and ${timerDisplay.textContent}!`), 500);
      }
    } else {
      lockBoard = true;
      setTimeout(() => {
        card.classList.remove('flipped');
        firstCard.classList.remove('flipped');
        firstCard = null;
        lockBoard = false;
      }, 1000);
    }
  }
}
