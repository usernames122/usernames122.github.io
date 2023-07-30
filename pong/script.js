const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Paddle settings
const paddleWidth = 10;
const paddleHeight = 100;
const paddleSpeed = 5;

// Ball settings
const ballSize = 10;
let ballX = canvas.width / 2 - ballSize / 2;
let ballY = canvas.height / 2 - ballSize / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

// Paddle positions
let player1Y = canvas.height / 2 - paddleHeight / 2;
let player2Y = canvas.height / 2 - paddleHeight / 2;

// Score
let player1Score = 0;
let player2Score = 0;

// Update paddle positions
function updatePaddles() {
    // Player 1 controls
    if (keys[87] && player1Y > 0) { // W key
        player1Y -= paddleSpeed;
    }
    if (keys[83] && player1Y < canvas.height - paddleHeight) { // S key
        player1Y += paddleSpeed;
    }

    // Player 2 controls
    if (keys[38] && player2Y > 0) { // Up arrow key
        player2Y -= paddleSpeed;
    }
    if (keys[40] && player2Y < canvas.height - paddleHeight) { // Down arrow key
        player2Y += paddleSpeed;
    }
}

// Update ball position
function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Collision with top and bottom walls
    if (ballY <= 0 || ballY >= canvas.height - ballSize) {
        ballSpeedY = -ballSpeedY;
    }

    // Collision with paddles
    if (
        (ballX <= paddleWidth && ballY + ballSize >= player1Y && ballY <= player1Y + paddleHeight) ||
        (ballX >= canvas.width - paddleWidth - ballSize && ballY + ballSize >= player2Y && ballY <= player2Y + paddleHeight)
    ) {
        ballSpeedX = -ballSpeedX;
    }

    // Scoring
    if (ballX <= 0) {
        player2Score++;
        resetBall();
    } else if (ballX >= canvas.width - ballSize) {
        player1Score++;
        resetBall();
    }
}

// Reset ball position
function resetBall() {
    ballX = canvas.width / 2 - ballSize / 2;
    ballY = canvas.height / 2 - ballSize / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = Math.random() * 6 - 3; // Random initial Y direction
}

// Draw everything on the canvas
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight);

    // Draw ball
    ctx.fillRect(ballX, ballY, ballSize, ballSize);

    // Draw scores
    ctx.font = "30px Arial";
    ctx.fillText(player1Score, canvas.width / 4, 50);
    ctx.fillText(player2Score, (3 * canvas.width) / 4, 50);
}

// Game loop
function gameLoop() {
    updatePaddles();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Keyboard input handling
const keys = {};
document.addEventListener("keydown", (event) => {
    keys[event.keyCode] = true;
});
document.addEventListener("keyup", (event) => {
    delete keys[event.keyCode];
});
