// 以下程式碼中出現的所有 " 座標 " 指的都是每一最小單位格子的左上角

const board = document.querySelector('#game-board');
const ctx = board.getContext('2d');
const boardHeight = board.height;
const boardWidth = board.width;

const startButton = document.querySelector('#start-btn');
const scoreTxt = document.querySelector('#game-score');
const resetButton = document.querySelector('#reset-btn');

/* game params */

const boardBgColor = 'white';
const snakeColor = '#2AB573';
const snakeBorderColor = 'black';
const foodColor = 'red';
const unitSize = 25;

let running = false;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;

// 蛇的身體，每一節就是陣列的一個元素。當蛇吃掉食物時，陣列的長度就會 ( 從頭開始 ) 增加

let snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: 0, y: 0 }
];

window.addEventListener('keydown', changeDirection);

startButton.addEventListener('click', () => {

    const parentElement = startButton.parentElement;
    parentElement.remove();

    gameStart();

});

resetButton.addEventListener('click', resetGame);

/* functions */

function gameStart() {

    running = true;
    scoreTxt.textContent = score;

    createFood();
    drawFood();
    nextTick();

};

function nextTick() {

    if (running) {

        setTimeout(() => {

            // 1. 清空版面並根據指定座標生成食物，食物的座標是由 createFood() 控制

            clearBoard();
            drawFood();

            // 2. 根據當前蛇的移動方向，重新繪製蛇的圖形

            moveSnake();
            drawSnake();

            // 3. 檢查是否觸發遊戲完結條件，若成功觸發，則 running = false ( 下一次執行 nextTick() 時，就會直接 else 觸發 displayGameOver() )
            
            checkGameOver();

            // 4. 重複執行

            nextTick();

        }, 75);

    } else {

        displayGameOver();

    }

};

function clearBoard() {

    ctx.fillStyle = boardBgColor;
    ctx.fillRect(0, 0, boardWidth, boardHeight);

};

function createFood() {

    function randomFood(min, max) {

        const num = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;

        // 根據預設的遊戲參數，得出的隨機數字必須是 25 的倍數，避免食物出現在非對齊的位置讓蛇無法吃到

        // 1、

        // Math.random() 回傳 0 ~ 1 之間的隨機小數

        // 乘以 (max - min) 之後，就會回傳 0 ~ (max - min) 之間的隨機小數

        // 再加上 min 就會回傳 min ~ max 之間的隨機小數

        // 2、

        // 除以 unitSize 之後，再丟給 Math.round() 處理，得到四捨五入至小數點後第一位的整數

        // 這步驟是為了將每一個隨機數字 " 分配 " 給格子

        // 可以想像成是一種 " 索引 "

        // 在預設的遊戲參數中，最小單位是 25 × 25

        // 在 min ~ max 之間，每 25 一個索引，未滿 25 的數字屬於第一索引、介於 25 至 50 之間的屬於第二索引 ...

        // 和 Math.floor() 的無條件捨去、Math.ceil() 的無條件進位不同，Math.round() 可以得到相對均衡的數字出現機率

        // 總而言之，最終我們就會得到一個整數的 " 索引 "

        // 4、

        // 索引數字乘上 unitSize

        // 在這個範例裡，就是讓它成為 25 的倍數

        // 這麼一來，就能確保食物落點座標會是 0, 25, 50, 75 ... 一直到最大值的 475

        // console.log(num);

        return num;

    }

    // 象徵食物的格子

    // 由於預設最小單位為 25 × 25，因此在 500 × 500 的遊戲空間裡，最小值是 (0, 0) 最大值是 (475, 475)

    foodX = randomFood(0, boardWidth - unitSize); // 0 ~ 475
    foodY = randomFood(0, boardWidth - unitSize); // 0 ~ 475

};

function drawFood() {

    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);

    // 填充矩形的函數，帶入的參數依序是 X 軸座標、Y 軸座標、矩形寬度、矩形長度

};

function moveSnake() {

    // 蛇的移動邏輯：

    // 根據 xVelocity 和 yVelocity ( 前進的座標 ) 從蛇頭生成格子，再根據食物的吃掉與否，決定是否減去蛇尾格子

    // 換句話說，視覺上我們看到的移動效果，其實是透過增加格子和減去格子來完成的

    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
    snake.unshift(head);
    
    // if food is eaten

    if (snake[0].x === foodX && snake[0].y == foodY) {

        score += 1;
        scoreTxt.textContent = score;

        createFood();

    } else { snake.pop(); }

};

function drawSnake() {

    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorderColor;

    snake.forEach(snakePart => {

        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);

    });

};

function changeDirection(event) {

    event.preventDefault();

    const keyPressed = event.keyCode;

    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingLeft  = (xVelocity == - unitSize);
    const goingRight = (xVelocity ==   unitSize);
    const goingUP    = (yVelocity == - unitSize);
    const goingDown  = (yVelocity ==   unitSize);

    // console.log(xVelocity, yVelocity);

    switch(true) {

        case(keyPressed == LEFT && !goingRight):

            xVelocity = - unitSize;
            yVelocity = 0;
            break;

        case(keyPressed == RIGHT && !goingLeft):

            xVelocity = unitSize;
            yVelocity = 0;
            break;

        case(keyPressed == UP && !goingDown):

            xVelocity = 0;
            yVelocity = - unitSize;
            break;

        case(keyPressed == DOWN && !goingUP):

            xVelocity = 0;
            yVelocity = unitSize;
            break;

    }

    // 當前的蛇頭座標，再加上：往左 (-25, 0) || 往右 (25, 0) || 往上 (0, -25) || 往下 (0, 25)

    // 這些座標會按下方向鍵在移動時，立刻加入蛇的陣列

    // 比方說，假如當前蛇頭座標為 (75, 75) 如果按右就會變成 (75 + 25, 75 + 0) 亦即 (100, 75)

    // 由於每 75 毫秒執行一次 moveSnake() 和 drawSnake()

    // 在下一次的事件佇列裡，就會重新繪製蛇的圖形，(100, 75) 將成為新的蛇頭格子

};

function checkGameOver() {

    switch(true) {

        case (snake[0].x < 0):

            running = false;
            break;
        
        case (snake[0].x >= boardWidth):
            
            running = false;
            break;

        case (snake[0].y < 0):

            running = false;
            break;
        
        case (snake[0].y >= boardHeight):

            running = false;
            break;

    }

    for(let i = 1; i < snake.length; i ++) {

        if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) { running = false; } 

    }

};

function displayGameOver() {

    ctx.font = '50px MV Boli';
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.textAlign = 'center';
    ctx.fillText("GAME OVER", boardWidth / 2, boardHeight / 2);

    running = false;

};

function resetGame() {

    score = 0;
    xVelocity = unitSize;
    yVelocity = 0;

    snake = [
        { x: unitSize * 4, y: 0 },
        { x: unitSize * 3, y: 0 },
        { x: unitSize * 2, y: 0 },
        { x: 0, y: 0 }
    ];

    gameStart();

};