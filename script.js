// Game state
let gameState = {
    coins: 100, // Başlangıç parası
    happiness: 100,
    energy: 100,
    hunger: 100,
    lastSave: new Date().getTime(),
    completedQuests: [],
    activeQuests: []
};

// Görev listesi
const availableQuests = [
    {
        id: 1,
        title: "Happy Raccoon",
        description: "Keep happiness above 80% for 1 minute",
        reward: 50,
        check: () => gameState.happiness >= 80,
        type: "happiness"
    },
    {
        id: 2,
        title: "Well Fed",
        description: "Feed your raccoon with all types of food",
        reward: 30,
        progress: {apple: false, fish: false, pizza: false},
        type: "feeding"
    },
    {
        id: 3,
        title: "Playful Friend",
        description: "Play with all toys and dance",
        reward: 40,
        progress: {ball: false, frisbee: false, dance: false},
        type: "playing"
    },
    {
        id: 4,
        title: "Hard Worker",
        description: "Work 3 times",
        reward: 60,
        progress: 0,
        required: 3,
        type: "work"
    },
    {
        id: 5,
        title: "Energetic Raccoon",
        description: "Keep energy above 90% for 1 minute",
        reward: 45,
        check: () => gameState.energy >= 90,
        type: "energy"
    }
];

// Load game state
function loadGame() {
    const savedState = localStorage.getItem('raccoonPetGame');
    if (savedState) {
        const loadedState = JSON.parse(savedState);
        // Eğer coins tanımlı değilse veya 0 ise, 100 coin ile başlat
        if (!loadedState.coins && loadedState.coins !== 0) {
            loadedState.coins = 100;
        }
        gameState = loadedState;
    }
    updateUI();
    updateQuests();
}

// Save game state
function saveGame() {
    localStorage.setItem('raccoonPetGame', JSON.stringify(gameState));
}

// Update UI elements
function updateUI() {
    document.getElementById('coins').textContent = gameState.coins;
    document.getElementById('happiness-bar').style.width = `${gameState.happiness}%`;
    document.getElementById('energy-bar').style.width = `${gameState.energy}%`;
    document.getElementById('hunger-bar').style.width = `${gameState.hunger}%`;
}

// Update quests
function updateQuests() {
    const questsList = document.getElementById('quests-list');
    questsList.innerHTML = '';

    // Aktif görevleri kontrol et ve yeni görev ekle
    if (gameState.activeQuests.length < 3) {
        const availableNewQuests = availableQuests.filter(quest => 
            !gameState.activeQuests.find(q => q.id === quest.id) && 
            !gameState.completedQuests.includes(quest.id)
        );
        
        if (availableNewQuests.length > 0) {
            const newQuest = availableNewQuests[Math.floor(Math.random() * availableNewQuests.length)];
            gameState.activeQuests.push({...newQuest});
        }
    }

    // Görevleri göster
    gameState.activeQuests.forEach(quest => {
        const questElement = document.createElement('div');
        questElement.className = 'quest-item';
        
        let progressText = '';
        if (quest.progress !== undefined) {
            if (typeof quest.progress === 'number') {
                progressText = ` (${quest.progress}/${quest.required})`;
            } else {
                const completed = Object.values(quest.progress).filter(v => v).length;
                const total = Object.keys(quest.progress).length;
                progressText = ` (${completed}/${total})`;
            }
        }

        questElement.innerHTML = `
            <div class="quest-title">${quest.title}</div>
            <div class="quest-description">${quest.description}${progressText}</div>
            <div class="quest-reward">Reward: ${quest.reward} </div>
        `;
        questsList.appendChild(questElement);
    });

    saveGame();
}

// Check quest progress
function checkQuestProgress(type, action) {
    gameState.activeQuests.forEach((quest, index) => {
        if (quest.type === type) {
            if (type === 'feeding' && quest.progress[action] !== undefined) {
                quest.progress[action] = true;
                const allCompleted = Object.values(quest.progress).every(v => v);
                if (allCompleted) completeQuest(quest, index);
            }
            else if (type === 'playing' && quest.progress[action] !== undefined) {
                quest.progress[action] = true;
                const allCompleted = Object.values(quest.progress).every(v => v);
                if (allCompleted) completeQuest(quest, index);
            }
            else if (type === 'work') {
                quest.progress++;
                if (quest.progress >= quest.required) completeQuest(quest, index);
            }
        }
    });
    updateQuests();
}

// Complete quest
function completeQuest(quest, index) {
    gameState.coins += quest.reward;
    gameState.completedQuests.push(quest.id);
    gameState.activeQuests.splice(index, 1);
    showMessage(`Quest completed: ${quest.title}! +${quest.reward} `);
    updateUI();
}

// Show floating emoji
function showFloatingEmoji(emoji) {
    const container = document.querySelector('.raccoon-container');
    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'action-emoji';
    emojiDiv.textContent = emoji;
    
    // Random direction for emoji
    const x = (Math.random() - 0.5) * 200; // -100px to 100px
    const y = -100 - Math.random() * 100; // -100px to -200px
    
    emojiDiv.style.setProperty('--emoji-x', `${x}px`);
    emojiDiv.style.setProperty('--emoji-y', `${y}px`);
    
    container.appendChild(emojiDiv);
    requestAnimationFrame(() => emojiDiv.classList.add('show'));
    
    // Remove emoji element after animation
    setTimeout(() => {
        container.removeChild(emojiDiv);
    }, 1000);
}

// Feed the raccoon
function feed(food) {
    let cost = 0;
    let happinessGain = 0;
    let hungerGain = 0;

    switch(food) {
        case 'apple':
            cost = 5;
            happinessGain = 5;
            hungerGain = 15;
            showFloatingEmoji('🍎');
            break;
        case 'fish':
            cost = 10;
            happinessGain = 10;
            hungerGain = 30;
            showFloatingEmoji('🐟');
            break;
        case 'pizza':
            cost = 15;
            happinessGain = 15;
            hungerGain = 50;
            showFloatingEmoji('🍕');
            break;
    }

    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        gameState.happiness = Math.min(100, gameState.happiness + happinessGain);
        gameState.hunger = Math.min(100, gameState.hunger + hungerGain);
        
        const raccoon = document.getElementById('raccoon');
        raccoon.classList.add('eating');
        setTimeout(() => {
            raccoon.classList.remove('eating');
        }, 1000);

        updateUI();
        saveGame();
        showMessage(`Fed the raccoon with ${food}! 🍽️`);
        checkQuestProgress('feeding', food);
    } else {
        showMessage("Not enough coins! 😢");
    }
}

// Play with raccoon
function play(toy) {
    let cost = 0;
    let happinessGain = 0;
    let energyCost = 0;
    let hungerCost = 10;

    switch(toy) {
        case 'ball':
            cost = 5;
            happinessGain = 15;
            energyCost = 10;
            showFloatingEmoji('⚽');
            break;
        case 'frisbee':
            cost = 8;
            happinessGain = 20;
            energyCost = 15;
            showFloatingEmoji('🥏');
            break;
    }

    if (gameState.coins >= cost && gameState.energy >= energyCost && gameState.hunger >= hungerCost) {
        gameState.coins -= cost;
        gameState.energy -= energyCost;
        gameState.hunger = Math.max(0, gameState.hunger - hungerCost);
        gameState.happiness = Math.min(100, gameState.happiness + happinessGain);
        
        const raccoon = document.getElementById('raccoon');
        raccoon.classList.add('playing');
        setTimeout(() => {
            raccoon.classList.remove('playing');
        }, 1000);

        updateUI();
        saveGame();
        showMessage(`Playing with ${toy}! 🎮`);
        checkQuestProgress('playing', toy);
    } else if (gameState.energy < energyCost) {
        showMessage("Not enough energy! 😴");
    } else if (gameState.hunger < hungerCost) {
        showMessage("Too hungry to play! 🍽️");
    } else {
        showMessage("Not enough coins! 😢");
    }
}

// Sleep
function sleep() {
    gameState.energy = 100;
    gameState.happiness = Math.max(0, gameState.happiness - 5);
    gameState.hunger = Math.max(0, gameState.hunger - 20);
    
    showFloatingEmoji('💤');
    
    const raccoon = document.getElementById('raccoon');
    raccoon.classList.add('sleeping');
    setTimeout(() => {
        raccoon.classList.remove('sleeping');
    }, 2000);

    updateUI();
    saveGame();
    showMessage("Had a good sleep! 😴");
}

// Work
function work() {
    if (gameState.energy >= 20 && gameState.hunger >= 20) {
        gameState.energy -= 20;
        gameState.hunger -= 20;
        gameState.coins += 20;
        gameState.happiness = Math.max(0, gameState.happiness - 5);
        
        showFloatingEmoji('💼');
        
        const raccoon = document.getElementById('raccoon');
        raccoon.classList.add('working');
        setTimeout(() => {
            raccoon.classList.remove('working');
        }, 1000);

        updateUI();
        saveGame();
        showMessage("Worked hard! 💼 +20 coins");
        checkQuestProgress('work');
    } else if (gameState.energy < 20) {
        showMessage("Too tired to work! 😴");
    } else {
        showMessage("Too hungry to work! 🍽️");
    }
}

// Reset game
function resetGame() {
    localStorage.removeItem('raccoonPetGame');
    gameState = {
        coins: 100,
        happiness: 100,
        energy: 100,
        hunger: 100,
        lastSave: new Date().getTime(),
        completedQuests: [],
        activeQuests: []
    };
    updateUI();
    updateQuests();
    showMessage("Game reset! Starting with 100 coins! ");
}

// Show message
function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => {
            message.remove();
        }, 300);
    }, 2000);
}

// Initialize game
if (!localStorage.getItem('raccoonPetGame')) {
    resetGame();
}
loadGame();

// Auto-save every minute
setInterval(saveGame, 60000);

// Decrease stats over time (her 5 saniyede bir)
setInterval(() => {
    // Açlık her zaman azalır
    gameState.hunger = Math.max(0, gameState.hunger - 3);

    // Açlık 50'nin altındaysa mutluluk azalır
    if (gameState.hunger < 50) {
        gameState.happiness = Math.max(0, gameState.happiness - 2);
    }

    // Açlık 30'un altındaysa enerji azalır
    if (gameState.hunger < 30) {
        gameState.energy = Math.max(0, gameState.energy - 2);
    }

    // Normal enerji ve mutluluk azalması
    gameState.energy = Math.max(0, gameState.energy - 1);
    gameState.happiness = Math.max(0, gameState.happiness - 1);

    updateUI();
    saveGame();
}, 5000); // 5 saniyede bir kontrol et

// Check continuous quests
setInterval(() => {
    gameState.activeQuests.forEach((quest, index) => {
        if (quest.check && quest.check()) {
            completeQuest(quest, index);
        }
    });
}, 60000);
