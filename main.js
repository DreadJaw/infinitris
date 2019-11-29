// Immediate Variables
const canvas = document.getElementById('canvas'); // Game Canvas
const context = canvas.getContext('2d'); // Set Context
const thisGrid = 32; // Grid Cell Dimension 32x32
const thisSequence = []; // Game Sequence
const thisField = []; // Every cell in game with 2D Array; 10x20;   

// Get random integer between min and max
function randomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Make new color schemes per level
function rgbColorScheme() {
    let red = randomNumber(25, 255);
    let green = randomNumber(25, 255);
    let blue = randomNumber(25, 255);
    return {r: red, g: green, b: blue};
}
function hexColorScheme(rgbData) {
    let xRed = parseInt(rgbData.r).toString(16);
    let xGreen = parseInt(rgbData.g).toString(16);
    let xBlue = parseInt(rgbData.b).toString(16);
    return `#${xRed}${xGreen}${xBlue}`;
}
function setNewColors() {
    let rgb = rgbColorScheme();
    let hex = hexColorScheme(rgb);
    rgbColor = rgb;
    hexColor = hex;
    updateUserInterfaceColors();
}

// Generate a block sequence
function createSequence() {
    const possible = Object.keys(thisBlocks);
    while(possible.length) {
        let random = randomNumber(0, possible.length - 1);
        let id = possible.splice(random, 1)[0];
        thisSequence.push(id);
    }
}

// Fetch the next block
function fetchNextBlock() {
    if(thisSequence.length == 0) {
        createSequence();
    }
    // Next block ID from current sequence
    const id = thisSequence.pop();
    // Next block data
    const matrix = thisBlocks[id];
    // I and O start centered, others are left middle
    const col = thisField[0].length / 2 - Math.ceil(matrix[0].length / 2);
    // I starts on row 21 (-1) all others on row 22 (-2)
    const row = (id == 'I') ? -1 : -2;

    return {id: id, matrix: matrix, col: col, row: row};
}

// Rotate a block NxN
function rotate(matrix) {
    const N = (matrix.length - 1);
    const result = matrix.map((row, i) => 
        row.map((val, e) => matrix[N - e][i])
    );
    matrix.length = 0;
    matrix.push(...result);
    return matrix;
}

// Check if a movement should work
function isValidMove(matrix, cellRow, cellCol) {
    let isValid = true;
    for(let row = 0; row < matrix.length; row++) {
        for(let col = 0; col < matrix[row].length; col++) {

            if(matrix[row][col] && (
                // Outside the Game Bounds
                cellCol + col < 0 ||
                cellCol + col >= thisField[0].length ||
                cellRow + row >= thisField.length ||
                // Conflicts with another block
                thisField[cellRow + row][cellCol + col])) 
            { isValid = false; }
        }
    }
    return isValid;
}

// Game Over
function userGameOver() {
    cancelAnimationFrame(animFrame);
    isGameOver = true;
    
    context.fillStyle = '#000000';
    context.globalAlpha = 0.85;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.globalAlpha = 1;
    context.fillStyle = hexColor;
    context.font = '32px "Press Start 2P"';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

// Line Clearing
function clearLines(amount) {
    if(amount == 0) return;
    if(linesRemaining <= amount) {
        let difference = (amount - linesRemaining);
        linesActual = parseInt(linesActual * 1.8);
        linesRemaining = (linesActual - difference);
        highScore += amount;
        level += 1;
        setNewColors();
        for(let row = -2; row < 20; row++) {
            thisField[row] = [];
            for(let col = 0; col < 10; col++) {
                thisField[row][col] = 0;
            }
        } 
    } else {
        linesRemaining -= amount;
        highScore += amount;
    }
}

// Block Dropping and Clearing
function spawnBlock() {
    for(let row = 0; row < thisBlock.matrix.length; row++) {
        for(let col = 0; col < thisBlock.matrix[row].length; col++) {
            if(thisBlock.matrix[row][col]) {
                // If block goes off screen
                if(thisBlock.row + row < 0) {
                    return userGameOver();
                }
                thisField[thisBlock.row + row][thisBlock.col + col] = thisBlock.id;
            }
        }
    }

    // Line clearing
    let linesCleared = 0;
    for(let row = thisField.length - 1; row >= 0;) {
        if(thisField[row].every((cell) => !!cell)) {
            // Drop every row above
            linesCleared++;
            for(let r = row; r >= 0; r--) {
                thisField[r] = thisField[r - 1]
            }
        } else {
            row--;
        }
    }
    // If cleared lines then run numbers
    clearLines(linesCleared);
    // Next block spawn
    thisBlock = fetchNextBlock();
}

// Setting the Game Pieces in Array format
const thisBlocks = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ]
}
// Create Empty State
for(let row = -2; row < 20; row++) {
    thisField[row] = [];
    for(let col = 0; col < 10; col++) {
        thisField[row][col] = 0;
    }
} 
// Establishing Variables
let hexColor = '#ffffff'; // Main color in HEX
let rgbColor = {r: 255, g: 255, b: 255}; // Main color in RGB
let highScore = 0; // Self defined
let level = 1; // Self defined
let userName = 'Player'; // Players Name
let speed = 35; // Fall speed
let count = 0; // Used for timer and speed
let linesRemaining = 5; // Amount of player lines remaining
let linesActual = 5; // Total to next level
let isGameOver = false; // Self defined
let thisBlock = fetchNextBlock(); // Starting block
let animFrame = null; // Stored requested action frame

// Keyboard Input
let keyboard = {
    KEY_UP: 38,
    KEY_DOWN: 40,
    KEY_LEFT: 37,
    KEY_RIGHT: 39,
    KEY_SPACE: 32,
    KEY_R: 82
}

function addCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function updateUserInterface() {
    document.getElementById('level').innerHTML = addCommas(level);
    document.getElementById('highScore').innerHTML = addCommas(highScore);
    document.getElementById('linesRemaining').innerHTML = addCommas(linesRemaining);
    document.getElementById('linesTotal').innerHTML = addCommas(linesActual);
}

function updateUserInterfaceColors() {
    let borders = document.getElementsByClassName('bd-custom');
    for(let i = 0; i < borders.length; i++) {
        borders[i].style.border = '1px solid ' + hexColor;
    }
    let texts = document.getElementsByClassName('text-custom');
    for(let i = 0; i < texts.length; i++) {
        texts[i].style.color = hexColor;
    }
}

function loop() {
    animFrame = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create the Playfield
    for(let row = 0; row < 20; row++) {
        for(let col = 0; col < 10; col++) {
            if(thisField[row][col]) {
                context.fillStyle = hexColor;
                // Draw 1px smaller for grid effect
                context.fillRect(col * thisGrid, row * thisGrid, thisGrid - 1, thisGrid - 1);
            }
        }
    }

    if(thisBlock) {
        if(++count > speed) {
            thisBlock.row++;
            count = 0;
            // If piece runs into something
            if(!isValidMove(thisBlock.matrix, thisBlock.row, thisBlock.col)) {
                thisBlock.row--;
                spawnBlock();
            }
        }
    }

    context.fillStyle = hexColor;

    for(let row = 0; row < thisBlock.matrix.length; row++) {
        for(let col = 0; col < thisBlock.matrix[row].length; col++) {
            if(thisBlock.matrix[row][col]) {
                // Make block gridlike
                let colGrid = (thisBlock.col + col) * thisGrid;
                let rowGrid = (thisBlock.row + row) * thisGrid;
                context.fillRect(colGrid, rowGrid, thisGrid - 1, thisGrid - 1);
            }
        }
    }
    updateUserInterface();
}

// Keyboard Input
document.addEventListener('keydown', function(e) {
    if(isGameOver) { return; }
    // Moving left and right
    if(e.which == keyboard.KEY_LEFT || e.which == keyboard.KEY_RIGHT) {
        let col = (e.which == keyboard.KEY_LEFT) ? thisBlock.col - 1 : thisBlock.col + 1;
        if(isValidMove(thisBlock.matrix, thisBlock.row, col)) {
            thisBlock.col = col;
        }
    }
    // Rotation
    if(e.which == keyboard.KEY_UP) {
        let matrix = rotate(thisBlock.matrix);
        if(isValidMove(matrix, thisBlock.row, thisBlock.col)) {
            thisBlock.matrix = matrix;
        }
    }
    // Soft Drop
    if(e.which == keyboard.KEY_DOWN) {
        const row = thisBlock.row + 1;
        if(!isValidMove(thisBlock.matrix, row, thisBlock.col)) {
            thisBlock.row = row - 1;
            spawnBlock();
            return;
        } else {
            thisBlock.row = row;
        }
    }

    if(e.which == keyboard.KEY_R) {
        for(let row = -2; row < 20; row++) {
            thisField[row] = [];
            for(let col = 0; col < 10; col++) {
                thisField[row][col] = 0;
            }
        }
        level = 1;
        hexColor = '#ffffff';
        rgbColor = {r: 255, g: 255, b: 255};
        highScore = 0;
        linesActual = 5;
        linesRemaining = 5;
    }
})

// Start the damn game
animFrame = requestAnimationFrame(loop);

