document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById('game-canvas');
    const scoreDisplay = document.getElementById('score');
    const gameOverText = document.getElementById('game-over');
    const restartButton = document.getElementById('restart-game');
    const instructionsModal = document.getElementById('instructions-modal');
    const startGameButton = document.getElementById('start-game-btn');
    const backToHomeButton = document.getElementById('back-to-home');
    const ctx = gameCanvas.getContext('2d');
    
    let score = 0;
    let gameInterval;
    let obstacles = [];
    let zSymbols = [];
    let player;
    const playerSize = 50;
    const obstacleSize = 30;
    const zSize = 20;
    let keys = {};
    let obstacleFrequency = 0.02; // Frequência inicial de obstáculos
    let zSymbolFrequency = 0.05; // Frequência inicial de símbolos "Z"
    let obstacleSpeed = 3; // Velocidade inicial dos obstáculos
    let zSymbolSpeed = 2; // Velocidade inicial dos símbolos "Z"

    function init() {
        gameCanvas.width = 600;
        gameCanvas.height = 400;

        const selectedCharacter = localStorage.getItem('selectedCharacter');
        if (selectedCharacter) {
            player = { 
                x: gameCanvas.width / 2 - playerSize / 2, 
                y: gameCanvas.height - playerSize - 10, 
                width: playerSize, 
                height: playerSize, 
                speed: 5, 
                image: selectedCharacter 
            };
        } else {
            player = { 
                x: gameCanvas.width / 2 - playerSize / 2, 
                y: gameCanvas.height - playerSize - 10, 
                width: playerSize, 
                height: playerSize, 
                speed: 5, 
                image: 'images/dorminhoca1.jpg' // Padrão, caso nada seja selecionado
            };
        }

        score = 0;
        obstacles = [];
        zSymbols = [];
        keys = {};
        obstacleFrequency = 0.02;
        zSymbolFrequency = 0.05;
        obstacleSpeed = 3;
        zSymbolSpeed = 2;
        gameOverText.classList.add('hidden');
        scoreDisplay.textContent = `Score: ${score}`;
        instructionsModal.classList.remove('hidden'); // Exibe o modal de instruções
    }

    function startGame() {
        instructionsModal.classList.add('hidden'); // Esconde o modal de instruções
        gameInterval = setInterval(gameLoop, 1000 / 60);
    }

    function endGame() {
        clearInterval(gameInterval);
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

        // Update obstacles and Z symbols
        obstacles = obstacles.filter(obstacle => obstacle.y < gameCanvas.height);
        zSymbols = zSymbols.filter(z => z.y < gameCanvas.height);

        obstacles.forEach(obstacle => obstacle.y += obstacle.speed);
        zSymbols.forEach(z => z.y += z.speed);

        if (Math.random() < obstacleFrequency) {
            obstacles.push(createObstacle());
        }

        if (Math.random() < zSymbolFrequency) {
            zSymbols.push(createZSymbol());
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
    }

    function draw() {
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawEntity(player);

        obstacles.forEach(obstacle => drawEntity(obstacle));
        zSymbols.forEach(z => drawEntity(z));
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

    function isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    function increaseDifficulty() {
        // Aumenta a dificuldade conforme o tempo passa
        obstacleFrequency += 0.00002; // Aumenta a frequência de aparecimento dos obstáculos
        zSymbolFrequency += 0.00001; // Aumenta a frequência de aparecimento dos símbolos "Z"
        obstacleSpeed += 0.002; // Aumenta a velocidade dos obstáculos
        zSymbolSpeed += 0.001; // Aumenta a velocidade dos símbolos "Z"
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

    init(); // Inicia o jogo quando a página carregar completamente
});
