// DOM Elements
const board = document.getElementById('gameBoard');
const moveCounter = document.getElementById('moveCount');
const timerDisplay = document.getElementById('timer');

// Game state variables
let cards = [];
let firstCard = null;
let lockBoard = false;
let moves = 0;
let matched = 0;
let startTime = null;
let timerInterval = null;

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

// Function to update the theme based on time of day
function updateTheme() {
    const hour = new Date().getHours();
    const root = document.documentElement;
    
    // Remove any existing time class
    root.removeAttribute('data-time');
    
    // Set the appropriate time class based on hour
    if (hour >= 5 && hour < 8) {
        root.setAttribute('data-time', 'dawn');
    } else if (hour >= 8 && hour < 17) {
        root.setAttribute('data-time', 'day');
    } else if (hour >= 17 && hour < 20) {
        root.setAttribute('data-time', 'sunset');
    } else {
        root.setAttribute('data-time', 'night');
    }
}

// Update theme when the page loads
updateTheme();

// Update theme every minute
setInterval(updateTheme, 60000);

// Player behavior tracking and adaptive mechanics
const playerStats = {
    averageTime: 0,
    averageMoves: 0,
    gamesPlayed: 0,
    winStreak: 0,
    lastPlayTime: null,
    engagementScore: 0,
    difficultyLevel: 1, // 1-5 scale
    preferredTimeOfDay: null,
    preferredEmojis: {},
    sessionDuration: 0
};

// Load player stats from localStorage
function loadPlayerStats() {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
        Object.assign(playerStats, JSON.parse(savedStats));
    }
}

// Save player stats to localStorage
function savePlayerStats() {
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
}

// Update player stats after each game
function updatePlayerStats(moves, time) {
    playerStats.gamesPlayed++;
    playerStats.averageMoves = (playerStats.averageMoves * (playerStats.gamesPlayed - 1) + moves) / playerStats.gamesPlayed;
    playerStats.averageTime = (playerStats.averageTime * (playerStats.gamesPlayed - 1) + time) / playerStats.gamesPlayed;
    playerStats.lastPlayTime = new Date().toISOString();
    
    // Update engagement score (0-100)
    const timeScore = Math.min(100, (time / 60) * 20); // Up to 20 points for time
    const movesScore = Math.min(100, (moves / 20) * 20); // Up to 20 points for moves
    const streakBonus = Math.min(60, playerStats.winStreak * 10); // Up to 60 points for streak
    playerStats.engagementScore = Math.min(100, timeScore + movesScore + streakBonus);
    
    // Adjust difficulty based on performance
    adjustDifficulty();
    
    savePlayerStats();
}

// Adjust game difficulty based on player performance
function adjustDifficulty() {
    const targetMoves = 12; // Ideal number of moves for optimal engagement
    const moveDiff = playerStats.averageMoves - targetMoves;
    
    if (moveDiff < -2 && playerStats.difficultyLevel < 5) {
        playerStats.difficultyLevel++;
    } else if (moveDiff > 2 && playerStats.difficultyLevel > 1) {
        playerStats.difficultyLevel--;
    }
}

// Apply difficulty settings
function applyDifficultySettings() {
    const difficulty = playerStats.difficultyLevel;
    
    // Adjust card flip speed based on difficulty
    const flipSpeed = 1000 - (difficulty * 100); // Faster flips for higher difficulty
    document.documentElement.style.setProperty('--flip-speed', `${flipSpeed}ms`);
    
    // Adjust number of cards based on difficulty
    const baseEmojis = ['🍎','🍌','🍇','🍓','🍒','🥝','🍉','🍍'];
    const additionalEmojis = ['🍊','🍋','🍐','🍑','🥭','🍈'];
    const selectedEmojis = baseEmojis.concat(additionalEmojis.slice(0, difficulty - 1));
    
    return selectedEmojis;
}

// Optimize reward timing
function optimizeRewards() {
    const now = new Date();
    const lastPlay = new Date(playerStats.lastPlayTime);
    const hoursSinceLastPlay = (now - lastPlay) / (1000 * 60 * 60);
    
    // Increase engagement score if player returns after a break
    if (hoursSinceLastPlay > 24) {
        playerStats.engagementScore = Math.min(100, playerStats.engagementScore + 20);
    }
    
    // Adjust reward frequency based on engagement
    const rewardInterval = Math.max(2, 5 - (playerStats.engagementScore / 20));
    return rewardInterval;
}

// Track player's preferred time of day
function updateTimePreference() {
    const hour = new Date().getHours();
    if (!playerStats.preferredTimeOfDay) {
        playerStats.preferredTimeOfDay = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
        };
    }
    
    if (hour >= 5 && hour < 12) {
        playerStats.preferredTimeOfDay.morning++;
    } else if (hour >= 12 && hour < 17) {
        playerStats.preferredTimeOfDay.afternoon++;
    } else if (hour >= 17 && hour < 22) {
        playerStats.preferredTimeOfDay.evening++;
    } else {
        playerStats.preferredTimeOfDay.night++;
    }
}

// Track preferred emojis
function updateEmojiPreference(emoji) {
    if (!playerStats.preferredEmojis[emoji]) {
        playerStats.preferredEmojis[emoji] = 0;
    }
    playerStats.preferredEmojis[emoji]++;
}

// Initialize game with adaptive features
function initGame() {
    loadPlayerStats();
    updateTimePreference();
    
    const selectedEmojis = applyDifficultySettings();
    cards = [...selectedEmojis, ...selectedEmojis];
    cards.sort(() => 0.5 - Math.random());
    
    // Clear and rebuild the board
    board.innerHTML = '';
    cards.forEach((emoji) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.emoji = emoji;
        card.innerText = emoji;
        card.addEventListener('click', () => {
            flipCard(card);
            updateEmojiPreference(emoji);
        });
        board.appendChild(card);
    });
    
    // Reset game state
    firstCard = null;
    lockBoard = false;
    moves = 0;
    matched = 0;
    startTime = null;
    if (timerInterval) clearInterval(timerInterval);
    
    // Update displays
    moveCounter.textContent = moves;
    timerDisplay.textContent = '0s';
}

// Modified flipCard function to include adaptive features
function flipCard(card) {
    if (lockBoard || card.classList.contains('flipped')) return;

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
            
            if (matched === cards.length / 2) {
                stopTimer();
                const time = Math.floor((Date.now() - startTime) / 1000);
                updatePlayerStats(moves, time);
                
                // Show adaptive reward message
                const rewardInterval = optimizeRewards();
                const message = `🎉 You win in ${moves} moves and ${time}s! 
                               ${playerStats.engagementScore >= 80 ? '🌟 Amazing performance!' : ''}
                               Come back in ${rewardInterval} hours for a special reward!`;
                
                setTimeout(() => alert(message), 500);
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

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

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
