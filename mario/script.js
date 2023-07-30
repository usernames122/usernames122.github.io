const canvas = document.getElementById("marioCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Load the Mario image
const marioImage = new Image();
marioImage.src = "mario.png";

// Mario settings
const marioWidth = 150;
const marioHeight = 150;
let marioX = 50;
let marioY = canvas.height - marioHeight;
let marioSpeedX = 0;
let marioSpeedY = 0;
let gravity = 0.5;
let isJumping = false;

// Update Mario's position
function updateMario() {
    // Apply gravity
    marioSpeedY += gravity;
    marioY += marioSpeedY;

    // Check for collision with the ground
    if (marioY > canvas.height - marioHeight) {
        marioY = canvas.height - marioHeight;
        isJumping = false;
    }

    // Apply horizontal movement
    marioX += marioSpeedX;

    // Prevent Mario from going off the screen
    if (marioX < 0) {
        marioX = 0;
    } else if (marioX > canvas.width - marioWidth) {
        marioX = canvas.width - marioWidth;
    }
}

// Jumping logic
function jump() {
    if (!isJumping) {
        marioSpeedY = -12;
        isJumping = true;
    }
}

// Keyboard input handling
const keys = {};
document.addEventListener("keydown", (event) => {
    keys[event.keyCode] = true;

    // Left arrow key (move left)
    if (keys[37]) {
        marioSpeedX = -5;
    }

    // Right arrow key (move right)
    if (keys[39]) {
        marioSpeedX = 5;
    }

    // Space key (jump)
    if (keys[32]) {
        jump();
    }
});

document.addEventListener("keyup", (event) => {
    delete keys[event.keyCode];

    // Stop horizontal movement when arrow keys are released
    if (!keys[37] && !keys[39]) {
        marioSpeedX = 0;
    }
});

// Draw Mario on the canvas
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Mario
    ctx.drawImage(marioImage, marioX, marioY, marioWidth, marioHeight);

    // Draw the ground
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

// Game loop
function gameLoop() {
    updateMario();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
