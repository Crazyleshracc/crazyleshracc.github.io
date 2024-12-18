// Game state
let gameState = {
    hunger: 100,
    happiness: 100,
    energy: 100,
    coins: 50,
    level: 1,
    xp: 0,
    xpNeeded: 100
};

// Quest system
let quests = [
    { id: 'feed3', description: 'Feed your raccoon 3 times', required: 3, progress: 0, reward: 50, xp: 20 },
    { id: 'play2', description: 'Play with your raccoon 2 times', required: 2, progress: 0, reward: 30, xp: 15 },
    { id: 'train1', description: 'Train your raccoon', required: 1, progress: 0, reward: 20, xp: 10 }
];

// Initialize game
function initGame() {
    updateStats();
    updateQuestsDisplay();
    // Start decreasing stats over time
    setInterval(decreaseStats, 10000);
}

// Update stats and check for critical levels
function updateStats() {
    // Ensure stats stay within bounds
    gameState.hunger = Math.max(0, Math.min(100, gameState.hunger));
    gameState.happiness = Math.max(0, Math.min(100, gameState.happiness));
    gameState.energy = Math.max(0, Math.min(100, gameState.energy));
    
    // Update UI
    updateDisplay();
    
    // Check for critical levels
    checkStats();
}

// Update all progress bars and displays
function updateDisplay() {
    // Update progress bars
    document.getElementById('hunger-bar').style.width = `${gameState.hunger}%`;
    document.getElementById('happiness-bar').style.width = `${gameState.happiness}%`;
    document.getElementById('energy-bar').style.width = `${gameState.energy}%`;
    
    // Update level and XP
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('xp').textContent = gameState.xp;
    document.getElementById('xp-needed').textContent = gameState.xpNeeded;
    document.getElementById('xp-progress').style.width = `${(gameState.xp / gameState.xpNeeded) * 100}%`;
    
    // Update coins
    document.getElementById('coins').textContent = gameState.coins;
}

// Quest functions
function updateQuestsDisplay() {
    const questsList = document.getElementById('quests-list');
    questsList.innerHTML = '';
    
    quests.forEach(quest => {
        const questElement = document.createElement('div');
        questElement.className = `quest-item ${quest.progress >= quest.required ? 'completed' : ''}`;
        questElement.innerHTML = `
            ${quest.description} (${quest.progress}/${quest.required})
            <span>Reward: ${quest.reward} coins, ${quest.xp} XP </span>
        `;
        
        if (quest.progress >= quest.required) {
            questElement.style.cursor = 'pointer';
            questElement.onclick = () => completeQuest(quest);
        }
        
        questsList.appendChild(questElement);
    });
}

function completeQuest(quest) {
    if (quest.progress >= quest.required) {
        gameState.coins += quest.reward;
        gainXP(quest.xp);
        quest.progress = 0;
        showMessage(`Quest completed! Earned ${quest.reward} coins and ${quest.xp} XP! 🎉`);
        updateStats();
        updateQuestsDisplay();
    }
}

function updateQuestProgress(type) {
    let quest = null;
    switch(type) {
        case 'feed':
            quest = quests.find(q => q.id === 'feed3');
            break;
        case 'play':
            quest = quests.find(q => q.id === 'play2');
            break;
        case 'train':
            quest = quests.find(q => q.id === 'train1');
            break;
    }
    
    if (quest && quest.progress < quest.required) {
        quest.progress++;
        if (quest.progress >= quest.required) {
            showMessage(`Quest "${quest.description}" is ready to complete! Click to claim reward! 🎉`);
        }
        updateQuestsDisplay();
    }
}

// Game actions
function feed(food) {
    let cost = 0;
    let hungerIncrease = 0;
    
    switch(food) {
        case 'apple':
            cost = 5;
            hungerIncrease = 20;
            break;
        case 'fish':
            cost = 10;
            hungerIncrease = 40;
            break;
        case 'pizza':
            cost = 15;
            hungerIncrease = 60;
            break;
    }
    
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        gameState.hunger = Math.min(100, gameState.hunger + hungerIncrease);
        showMessage(`Fed your raccoon with ${food}! `);
        animateRaccoon('eating');
        updateStats();
        gainXP(5);
        updateQuestProgress('feed');
    } else {
        showMessage("Not enough coins! ");
    }
}

function play(toy) {
    let cost = 0;
    let happinessIncrease = 0;
    
    switch(toy) {
        case 'ball':
            cost = 5;
            happinessIncrease = 25;
            break;
        case 'frisbee':
            cost = 8;
            happinessIncrease = 40;
            break;
    }
    
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        gameState.happiness = Math.min(100, gameState.happiness + happinessIncrease);
        showMessage(`Playing with ${toy}! `);
        animateRaccoon('playing');
        updateStats();
        gainXP(8);
        updateQuestProgress('play');
    } else {
        showMessage("Not enough coins! ");
    }
}

function train() {
    if (gameState.energy >= 20) {
        gameState.energy -= 20;
        showMessage("Training hard! ");
        gainXP(10);
        updateStats();
        updateQuestProgress('train');
    } else {
        showMessage("Too tired to train! ");
    }
}

// Decrease stats over time
function decreaseStats() {
    gameState.hunger = Math.max(0, gameState.hunger - 5);
    gameState.happiness = Math.max(0, gameState.happiness - 3);
    gameState.energy = Math.max(0, gameState.energy - 2);
    updateStats();
}

// Check if any stats are critically low
function checkStats() {
    if (gameState.hunger <= 20 || gameState.happiness <= 20 || gameState.energy <= 20) {
        showMessage("Your raccoon needs attention! ");
    }
}

// Gain XP and handle leveling up
function gainXP(amount) {
    gameState.xp += amount;
    
    while (gameState.xp >= gameState.xpNeeded) {
        gameState.xp -= gameState.xpNeeded;
        gameState.level++;
        gameState.xpNeeded = Math.floor(gameState.xpNeeded * 1.5);
        showMessage(`Level Up! Now level ${gameState.level}! `);
    }
    
    updateStats();
}

// Show message
function showMessage(text) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.style.opacity = '1';
    
    setTimeout(() => {
        message.style.opacity = '0';
    }, 3000);
}

// Animate raccoon
function animateRaccoon(action) {
    const raccoon = document.getElementById('raccoon');
    const actionEmoji = document.getElementById('action-emoji');
    
    // Remove any existing animation classes
    raccoon.classList.remove('eating', 'playing', 'sleeping', 'working', 'dancing');
    
    // Add the new animation class
    raccoon.classList.add(action);
    
    // Set action emoji
    switch(action) {
        case 'eating':
            actionEmoji.textContent = '🍽️';
            break;
        case 'playing':
            actionEmoji.textContent = '🎮';
            break;
        case 'sleeping':
            actionEmoji.textContent = '💤';
            break;
        case 'working':
            actionEmoji.textContent = '💼';
            break;
        case 'dancing':
            actionEmoji.textContent = '🎵';
            break;
        default:
            actionEmoji.textContent = '';
    }
    
    // Show the action emoji
    actionEmoji.style.display = 'block';
    
    // Hide the action emoji after animation
    setTimeout(() => {
        actionEmoji.style.display = 'none';
        raccoon.classList.remove(action);
    }, 2000);
}

// Dance function
function dance() {
    if (gameState.energy >= 10) {
        gameState.energy -= 10;
        gameState.happiness = Math.min(100, gameState.happiness + 30);
        gameState.coins += 15; 
        showMessage("Your raccoon is dancing! Earned 15 coins! 💃🪙");
        animateRaccoon('dancing');
        gainXP(8);
        updateStats();
    } else {
        showMessage("Too tired to dance! 😫");
    }
}

// Mini game
let miniGameActive = false;
let miniGameScore = 0;
let treatInterval;

function startMiniGame() {
    if (gameState.energy >= 10) {
        gameState.energy -= 10;
        document.getElementById('mini-game').style.display = 'flex';
        miniGameActive = true;
        miniGameScore = 0;
        spawnTreats();
    } else {
        showMessage("Too tired to play the mini-game! ");
    }
}

function closeMiniGame() {
    document.getElementById('mini-game').style.display = 'none';
    miniGameActive = false;
    clearInterval(treatInterval);
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    
    // Give rewards based on score
    const coinsEarned = miniGameScore * 2;
    gameState.coins += coinsEarned;
    gainXP(miniGameScore * 3);
    showMessage(`Game Over! Earned ${coinsEarned} coins and ${miniGameScore * 3} XP! `);
    updateStats();
}

function spawnTreats() {
    treatInterval = setInterval(() => {
        if (miniGameActive) {
            const treat = document.createElement('div');
            treat.className = 'treat';
            treat.innerHTML = '';
            treat.style.left = Math.random() * 90 + '%';
            treat.style.top = '0';
            
            treat.onclick = () => {
                if (miniGameActive) {
                    treat.remove();
                    miniGameScore++;
                }
            };
            
            document.getElementById('game-area').appendChild(treat);
            
            // Animate treat falling
            let pos = 0;
            const fall = setInterval(() => {
                if (pos >= 270) {
                    treat.remove();
                    clearInterval(fall);
                } else {
                    pos += 2;
                    treat.style.top = pos + 'px';
                }
            }, 20);
        }
    }, 1000);
}

// Sleep function
function sleep() {
    if (gameState.energy < 100) {
        gameState.energy = Math.min(100, gameState.energy + 50);
        showMessage("Your raccoon is taking a nap! ");
        animateRaccoon('sleeping');
        updateStats();
        gainXP(3);
    } else {
        showMessage("Your raccoon isn't tired! ");
    }
}

// Work function
function work() {
    if (gameState.energy >= 15) {
        gameState.energy -= 15;
        gameState.coins += 20;
        showMessage("Working hard! Earned 20 coins! ");
        updateStats();
        gainXP(5);
    } else {
        showMessage("Too tired to work! ");
    }
}

// OXO Game Logic
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

function initOXOGame() {
    const cells = document.querySelectorAll('.cell');
    const restartButton = document.getElementById('restart-game');
    
    cells.forEach(cell => {
        cell.addEventListener('click', () => handleCellClick(cell));
    });
    
    restartButton.addEventListener('click', restartGame);
    updateGameMessage("Your turn! (X)");
}

function handleCellClick(cell) {
    const index = cell.getAttribute('data-index');
    
    if (gameBoard[index] === '' && gameActive) {
        gameBoard[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
        
        if (checkWin()) {
            if (currentPlayer === 'X') {
                updateGameMessage("You won! ");
                gameState.coins += 30;
                gameState.happiness += 20;
                showMessage("You won! Earned 30 coins and made your raccoon happy!");
                updateStats();
            } else {
                updateGameMessage("Raccoon won! Better luck next time!");
            }
            gameActive = false;
            return;
        }
        
        if (checkDraw()) {
            updateGameMessage("It's a draw!");
            gameActive = false;
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateGameMessage(currentPlayer === 'X' ? "Your turn! (X)" : "Raccoon's turn! (O)");
        
        if (currentPlayer === 'O') {
            setTimeout(makeRaccoonMove, 1000);
        }
    }
}

function makeRaccoonMove() {
    if (!gameActive) return;
    
    // Try to win
    const winningMove = findBestMove('O');
    if (winningMove !== -1) {
        makeMove(winningMove);
        return;
    }
    
    // Block player's winning move
    const blockingMove = findBestMove('X');
    if (blockingMove !== -1) {
        makeMove(blockingMove);
        return;
    }
    
    // Take center if available
    if (gameBoard[4] === '') {
        makeMove(4);
        return;
    }
    
    // Take random available corner
    const corners = [0, 2, 6, 8].filter(i => gameBoard[i] === '');
    if (corners.length > 0) {
        makeMove(corners[Math.floor(Math.random() * corners.length)]);
        return;
    }
    
    // Take any available space
    const availableMoves = gameBoard.map((cell, index) => cell === '' ? index : -1).filter(i => i !== -1);
    if (availableMoves.length > 0) {
        makeMove(availableMoves[Math.floor(Math.random() * availableMoves.length)]);
    }
}

function findBestMove(player) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] === player && gameBoard[b] === player && gameBoard[c] === '') return c;
        if (gameBoard[a] === player && gameBoard[c] === player && gameBoard[b] === '') return b;
        if (gameBoard[b] === player && gameBoard[c] === player && gameBoard[a] === '') return a;
    }
    return -1;
}

function makeMove(index) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    handleCellClick(cell);
}

function checkWin() {
    return winningCombinations.some(combination => {
        const [a, b, c] = combination;
        return gameBoard[a] !== '' && 
               gameBoard[a] === gameBoard[b] && 
               gameBoard[b] === gameBoard[c];
    });
}

function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

function updateGameMessage(message) {
    document.getElementById('game-message').textContent = message;
}

function restartGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    
    updateGameMessage("Your turn! (X)");
}

// Add mini-games button to the main menu
function showMiniGames() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('mini-games').style.display = 'block';
    initOXOGame();
}

// Add back button functionality
function goBack() {
    document.getElementById('mini-games').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

// Start the game when the page loads
window.onload = initGame;
