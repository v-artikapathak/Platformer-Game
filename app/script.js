const player = document.getElementById('player');
const gameContainer = document.getElementById('gameContainer');
const startButton = document.getElementById('startButton');
const messageContainer = document.getElementById('messageContainer');
const levelMessage = document.getElementById('levelMessage');
const sparklesContainer = document.getElementById('sparkles');
let platforms;
let bananas;
const gravityBase = 0.5;
let gravity = gravityBase;
const jumpStrength = -15;
const speed = 5;
let velocityY = 0;
let velocityX = 0;
let isJumping = false;
let keys = {};
let gameRunning = false;
let score = 0;
let level = 1;
let falling = true; // Add a new variable to track if the monkey is falling

startButton.addEventListener('click', () => {
    gameContainer.style.display = 'block';
    startButton.style.display = 'none';
    messageContainer.style.display = 'none';
    gameRunning = true;
    initializeGame();
    gameLoop();
});

function initializeGame() {
    // Reset variables
    platforms = document.querySelectorAll('.platform');
    bananas = document.querySelectorAll('.banana');
    velocityY = 0;
    velocityX = 0;
    isJumping = false;
    keys = {};
    falling = true;

    // Get the position of the first platform block
    const firstPlatformRect = platforms[0].getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    // Set the monkey's initial position based on the first platform's position
    const initialX = firstPlatformRect.left - containerRect.left;
    const initialY = firstPlatformRect.top - containerRect.top - player.offsetHeight;

    player.style.left = `${initialX}px`;
    player.style.top = `${initialY}px`;

    // Ensure focus is set on the gameContainer
    gameContainer.setAttribute('tabindex', '0'); // Ensure the game container can receive focus
    gameContainer.focus(); // Set focus on the game container

    // Attach event listeners for keydown and keyup events to the gameContainer
    gameContainer.removeEventListener('keydown', handleKeyDown);
    gameContainer.removeEventListener('keyup', handleKeyUp);
    gameContainer.addEventListener('keydown', handleKeyDown);
    gameContainer.addEventListener('keyup', handleKeyUp);

    // Attach event listeners for touch and mouse events
    attachControlEvents();
}

function handleKeyDown(event) {
    keys[event.code] = true;
}

function handleKeyUp(event) {
    keys[event.code] = false;
}

function attachControlEvents() {
    const leftButton = document.getElementById('leftButton');
    const jumpButton = document.getElementById('jumpButton');
    const rightButton = document.getElementById('rightButton');

    leftButton.addEventListener('touchstart', handleLeftTouchStart);
    leftButton.addEventListener('touchend', handleLeftTouchEnd);
    leftButton.addEventListener('mousedown', handleLeftTouchStart);
    leftButton.addEventListener('mouseup', handleLeftTouchEnd);

    jumpButton.addEventListener('touchstart', handleJumpTouchStart);
    jumpButton.addEventListener('touchend', handleJumpTouchEnd);
    jumpButton.addEventListener('mousedown', handleJumpTouchStart);
    jumpButton.addEventListener('mouseup', handleJumpTouchEnd);

    rightButton.addEventListener('touchstart', handleRightTouchStart);
    rightButton.addEventListener('touchend', handleRightTouchEnd);
    rightButton.addEventListener('mousedown', handleRightTouchStart);
    rightButton.addEventListener('mouseup', handleRightTouchEnd);
}

function handleLeftTouchStart() {
    keys['ArrowLeft'] = true;
}

function handleLeftTouchEnd() {
    keys['ArrowLeft'] = false;
}

function handleJumpTouchStart() {
    if (!isJumping) {
        velocityY = jumpStrength;
        isJumping = true;
        keys['Space'] = true; // Simulate space bar press
    }
}

function handleJumpTouchEnd() {
    keys['Space'] = false; // Simulate space bar release
}

function handleRightTouchStart() {
    keys['ArrowRight'] = true;
}

function handleRightTouchEnd() {
    keys['ArrowRight'] = false;
}

function checkCollision(playerRect, rect) {
    return !(
        playerRect.top > rect.bottom ||
        playerRect.bottom < rect.top ||
        playerRect.left > rect.right ||
        playerRect.right < rect.left
    );
}

function showGameOverMessage() {
    levelMessage.innerHTML = `Game Over! Score: ${score}`;
    messageContainer.style.display = 'block';
    startButton.style.display = 'block'; // Show the start again button
}

function showLevelCompleteMessage() {
    levelMessage.innerHTML = `Level ${level} Complete! Congratulations!`;
    messageContainer.style.display = 'block';
    createSparkles();
    setTimeout(() => {
        messageContainer.style.display = 'none';
        gameRunning = true;
        increaseDifficulty();
        resetGame();
        initializeGame();
        gameLoop();
    }, 3000);
}

function createSparkles() {
    // Create and animate sparkles
    for (let i = 0; i < 50; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparklesContainer.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }
}

function increaseDifficulty() {
    level++;
    gravity = gravityBase + (level * 0.1);
}

function resetGame() {
    // Remove existing bananas and platforms
    document.querySelectorAll('.banana').forEach(banana => banana.remove());
    document.querySelectorAll('.platform').forEach(platform => platform.remove());

    // Add starting platform
    const startingPlatform = document.createElement('div');
    startingPlatform.classList.add('platform');
    startingPlatform.style.position = 'absolute';
    startingPlatform.style.bottom = '50px'; // Adjust platform bottom position
    startingPlatform.style.left = '50px'; // Adjust platform left position
    startingPlatform.style.width = '150px'; // Adjust platform width
    startingPlatform.style.height = '20px'; // Adjust platform height
    startingPlatform.style.backgroundColor = 'brown'; // Set platform color
    gameContainer.appendChild(startingPlatform);

    // Add new platforms and bananas for the next level
    const bananaCount = 3 + level; // Increase banana count with each level
    const platformWidth = 100; // Width of each platform
    const platformHeight = 20; // Height of each platform
    let platformGap = 50; // Initial gap between platforms
    let currentX = 100; // Initial X position for platforms
    let currentY = 150; // Initial Y position for platforms
    let lastPlatformY = 50; // Y position of the last platform created
    const maxJumpHeight = 100; // Maximum height the character can jump

    for (let i = 0; i < bananaCount; i++) {
        // Create a random pattern for platform and banana positions
        const randomOffsetX = Math.random() * 100;
        let randomOffsetY = Math.random() * 50;

        // Ensure platforms are reachable
        if (randomOffsetY + currentY > gameContainer.clientHeight - platformHeight) {
            randomOffsetY = gameContainer.clientHeight - platformHeight - currentY - 10; // Adjusted value to make sure it's reachable
        }

        // Create banana
        const banana = document.createElement('div');
        banana.classList.add('banana');
        banana.style.position = 'absolute';
        const bananaX = currentX + (platformWidth / 2) - 10 + randomOffsetX; // Randomize banana position
        const bananaY = currentY + platformHeight + 10 + randomOffsetY; // Position banana above the platform
        banana.style.left = `${bananaX}px`;
        banana.style.bottom = `${bananaY}px`;
        gameContainer.appendChild(banana);

        // Create platform below the banana
        const platform = document.createElement('div');
        platform.classList.add('platform');
        platform.style.position = 'absolute';
        platform.style.width = `${platformWidth}px`; // Set platform width
        platform.style.height = `${platformHeight}px`; // Set platform height
        platform.style.left = `${currentX}px`; // Position platform
        platform.style.bottom = `${currentY}px`; // Position platform
        platform.style.backgroundColor = 'brown'; // Set platform color
        gameContainer.appendChild(platform);

        // Adjust current X position for the next platform
        currentX += platformWidth + platformGap + randomOffsetX;

        // Adjust current Y position for the next row of platforms
        if (currentX + platformWidth + platformGap > gameContainer.clientWidth) {
            currentX = 100;
            currentY += platformHeight + platformGap + randomOffsetY;
        }

        // Increase platform gap slightly with each level but ensure it's not too large
        platformGap += level * 5;
        
        if(platformGap + currentX > gameContainer.clientWidth) {
            platformGap = gameContainer.clientWidth - currentX - platformWidth - 10; // Adjusted value to make sure next platform is visible and reachable
        }

        // Ensure the platform is not too high to jump to from the previous platform
        if (currentY - (lastPlatformY + platformHeight) > maxJumpHeight) {
            currentY = lastPlatformY + platformHeight + maxJumpHeight;
        }

        // Update lastPlatformY to currentY after each platform is created
        lastPlatformY = currentY;
    }

    bananas = document.querySelectorAll('.banana');
    platforms = document.querySelectorAll('.platform');
}

function gameLoop() {
    if (!gameRunning) return;

    // Apply gravity
    velocityY += gravity;
    
    // Apply horizontal movement
    if (keys['ArrowLeft']) velocityX = -speed;
    else if (keys['ArrowRight']) velocityX = speed;
    else velocityX = 0;

    // Apply vertical movement
    if (keys['ArrowUp'] && !isJumping) {
        velocityY = jumpStrength;
        isJumping = true;
        const jumpSound = document.getElementById('jumpSound');
        jumpSound.play();
    }

    if (keys['ArrowDown']) velocityY = speed;

    // Move player
    const playerRect = player.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    const bottom = containerRect.bottom - playerRect.height;
    const top = containerRect.top;
    const leftBoundary = containerRect.left;
    const rightBoundary = containerRect.right - playerRect.width;

    let newY = player.offsetTop + velocityY;
    let newX = player.offsetLeft + velocityX;

    // Collision detection with platforms
    let onPlatform = false;
    platforms.forEach(platform => {
        const platformRect = platform.getBoundingClientRect();
        if (checkCollision(playerRect, platformRect)) {
            // If the player is falling and collides with the top of the platform
            if (velocityY > 0 && playerRect.bottom - platformRect.top < 10) {
                newY = platformRect.top - playerRect.height - containerRect.top;
                velocityY = 0;
                isJumping = false;
                onPlatform = true;
                falling = false;
            }
        }
    });

    // Ensure player doesn't go above the top boundary during a jump
    if (newY < 0) newY = 0;

    // Check if the player falls below the game area
    if (newY >= bottom) {
        gameRunning = false;
        showGameOverMessage();
        return;
    }

    // If the player is not on any platform and is falling below the game area, end the game
    if (!onPlatform && playerRect.top <= top && velocityY < 0) {
        gameRunning = false;
        showGameOverMessage();
        return;
    }

    // Check for collisions with bananas
    bananas.forEach(banana => {
        const bananaRect = banana.getBoundingClientRect();
        if (checkCollision(playerRect, bananaRect)) {
            // Remove the banana and increase the score
            banana.remove();
            score++;
            const bananaSound = document.getElementById('bananaSound');
            bananaSound.play();
        }
    });

    // Boundary conditions
    if (newX < 0) newX = 0;
    if (newX > rightBoundary) newX = rightBoundary;

    // Update player position
    player.style.top = `${newY}px`;
    player.style.left = `${newX}px`;

    // Check if the player has collected all bananas
    if (document.querySelectorAll('.banana').length === 0) {
        gameRunning = false;
        showLevelCompleteMessage();
        return;
    }

    requestAnimationFrame(gameLoop);
}
