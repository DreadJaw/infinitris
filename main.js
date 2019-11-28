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
    const result = matrix.map((row, i) => {
        row.map((val, e) => { matrix[N - e][i] })
    });
    return result;
}

// Check if a movement should work
function isValidMove(matrix, cellRow, cellCol) {
    for(let row = 0; row < matrix.length; row++) {
        for(let col = 0; col < matrix[row].length; col++) {
            if(matrix[row][col] && (
                // Outside the Game Bounds
                cellCol + col < 0 ||
                cellCol + col >= thisField[0].length ||
                cellRow + row >= thisField.length ||
                // Conflicts with another block
                thisField[cellRow + row][cellCol + col])) 
            { return false; }
        }
    }
    return true;
}

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
let linesRemaining = 10; // Amount of player lines remaining
let linesActual = 10; // Total to next level
let isGameOver = false; // Self defined
let thisBlock = fetchNextBlock(); // Starting block
let animFrame = null; // Stored requested action frame


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
}

// Start the damn game
animFrame = requestAnimationFrame(loop);

