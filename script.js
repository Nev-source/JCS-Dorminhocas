document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById('game-canvas');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const gameOverText = document.getElementById('game-over');
    const restartButton = document.getElementById('restart-game');
    const instructionsModal = document.getElementById('instructions-modal');
    const startGameButton = document.getElementById('start-game-btn');
    const backToHomeButton = document.getElementById('back-to-home');
    const ctx = gameCanvas.getContext('2d');
    
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameInterval;
    let obstacles = [];
    let zSymbols = [];
    let powerUps = [];
    let player;
    const playerSize = 42;
    const obstacleSize = 34;
    const zSize = 30;
    const powerUpSize = 40;
    let keys = {};
    let obstacleFrequency = 0.027;
    let zSymbolFrequency = 0.15;
    let powerUpFrequency = 0.0012;
    let obstacleSpeed = 3;
    let zSymbolSpeed = 2;
    let powerUpSpeed = 2;
    let powerUpActive = false;
    let powerUpDuration = 5000;
    let powerUpEffectEnd = 0;

    function init() {
        gameCanvas.width = 600;
        gameCanvas.height = 400;
        const selectedCharacter = localStorage.getItem('selectedCharacter');
        player = { x: gameCanvas.width / 2 - playerSize / 2, y: gameCanvas.height - playerSize - 10, width: playerSize, height: playerSize, speed: 5.3, image: selectedCharacter || 'images/dorminhoca1.jpg' };
        score = 0;
        obstacles = [];
        zSymbols = [];
        powerUps = [];
        keys = {};
        obstacleFrequency = 0.022;
        zSymbolFrequency = 0.07;
        powerUpFrequency = 0.0012;
        obstacleSpeed = 5;
        zSymbolSpeed = 4;
        powerUpSpeed = 2;
        powerUpActive = false;
        gameOverText.classList.add('hidden');
        scoreDisplay.textContent = `Score: ${score}`;
        highScoreDisplay.textContent = `Recorde: ${highScore}`;
        instructionsModal.classList.remove('hidden');
    }

    function startGame() {
        instructionsModal.classList.add('hidden');
        gameInterval = setInterval(gameLoop, 1000 / 60);
    }

    function endGame() {
        clearInterval(gameInterval);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        gameOverText.classList.remove('hidden');
    }

    function gameLoop() {
        update();
        draw();
        increaseDifficulty();
    }

    function update() {
        if (keys['ArrowLeft'] && player.x > 0) {
            player.x -= player.speed;
        }
        if (keys['ArrowRight'] && player.x < gameCanvas.width - player.width) {
            player.x += player.speed;
        }

        obstacles = obstacles.filter(obstacle => obstacle.y < gameCanvas.height);
        zSymbols = zSymbols.filter(z => z.y < gameCanvas.height);
        powerUps = powerUps.filter(powerUp => powerUp.y < gameCanvas.height);

        obstacles.forEach(obstacle => obstacle.y += obstacle.speed);
        zSymbols.forEach(z => z.y += z.speed);
        powerUps.forEach(powerUp => powerUp.y += powerUp.speed);

        if (!powerUpActive && Math.random() < obstacleFrequency) {
            obstacles.push(createObstacle());
        }

        if (Math.random() < zSymbolFrequency) {
            zSymbols.push(createZSymbol());
        }

        if (Math.random() < powerUpFrequency) {
            powerUps.push(createPowerUp());
        }

        // Check for collisions
        obstacles.forEach(obstacle => {
            if (isColliding(player, obstacle)) {
                endGame();
            }
        });

        zSymbols.forEach((z, index) => {
            if (isColliding(player, z)) {
                score += 10;
                zSymbols.splice(index, 1);
                scoreDisplay.textContent = `Score: ${score}`;
            }
        });

        powerUps.forEach((powerUp, index) => {
            if (isColliding(player, powerUp)) {
                activatePowerUp();
                powerUps.splice(index, 1);
            }
        });

        // Handle power-up effect duration
        if (powerUpActive && Date.now() > powerUpEffectEnd) {
            deactivatePowerUp();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawEntity(player);

        obstacles.forEach(obstacle => drawEntity(obstacle));
        zSymbols.forEach(z => drawEntity(z));
        powerUps.forEach(powerUp => drawEntity(powerUp));
    }

    function drawEntity(entity) {
        const img = new Image();
        img.src = entity.image;
        ctx.drawImage(img, entity.x, entity.y, entity.width, entity.height);
    }

    function createObstacle() {
        return {
            x: Math.random() * (gameCanvas.width - obstacleSize),
            y: -obstacleSize,
            width: obstacleSize,
            height: obstacleSize,
            speed: obstacleSpeed,
            image: Math.random() < 0.5 ? 'images/coffee-icon.png' : 'images/alarm-icon.png'
        };
    }

    function createZSymbol() {
        return {
            x: Math.random() * (gameCanvas.width - zSize),
            y: -zSize,
            width: zSize,
            height: zSize,
            speed: zSymbolSpeed,
            image: 'images/z-icon.png'
        };
    }

    function createPowerUp() {
        return {
            x: Math.random() * (gameCanvas.width - powerUpSize),
            y: -powerUpSize,
            width: powerUpSize,
            height: powerUpSize,
            speed: powerUpSpeed,
            image: 'images/teddy-bear-icon.png'
        };
    }

    function isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    function increaseDifficulty() {
        obstacleFrequency += 0.00001;
        zSymbolFrequency += 0.000005;
        obstacleSpeed += 0.0007;
        zSymbolSpeed += 0.0001;
    }

    function activatePowerUp() {
        powerUpActive = true;
        powerUpEffectEnd = Date.now() + powerUpDuration;
        player.speed = 11;
        zSymbolFrequency *= 3; 
        powerUpFrequency = 0;
        obstacleFrequency = 0;
        showJumpscare();
    }

    function deactivatePowerUp() {
        powerUpActive = false;
        player.speed = 5.3;
        zSymbolFrequency /= 3; 
        powerUpFrequency = 0.0015;
        obstacleFrequency = 0.025;
    }

    function showJumpscare() {
        const jumpscares = document.querySelectorAll('.jumpscare');
        const randomIndex = Math.floor(Math.random() * jumpscares.length);
        const jumpscare = jumpscares[randomIndex];
        jumpscare.style.display = 'block';
        setTimeout(() => {
            jumpscare.style.display = 'none';
        }, 400);
    }

    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    startGameButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', init);
    backToHomeButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    init();
});