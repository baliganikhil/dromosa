class Player {
    constructor(x, y) {
        this.setXY = (x, y) => {
            this.x = x;
            this.y = y;
        };
        this.getX = () => this.x;
        this.getY = () => this.y;
        this.getStartX = () => this.startX;
        this.getStartY = () => this.startY;
        this.startX = x;
        this.startY = y;
        this.setXY(x, y);
    }
}
class Goal {
    constructor(x, y) {
        this.getX = () => this.x;
        this.getY = () => this.y;
        this.x = x;
        this.y = y;
    }
}
class SolutionNode {
    constructor(x, y) {
        this.getX = () => this.x;
        this.setX = (x) => this.x = x;
        this.getY = () => this.y;
        this.setY = (y) => this.y = y;
        this.getDirection = () => this.direction;
        this.setDirection = (d) => this.direction = d;
        this.setX(x);
        this.setY(y);
        this.direction = 0;
    }
}
// import * as $ from 'jquery';
class Game {
    constructor() {
        this.BOARD_SIZE = 10;
        this.board = [];
        this.gameSpeed = 500;
        this.gameRunning = false;
        this.init = () => {
            this.killTimer();
            this.gameRunning = true;
            this.changeCompassDirection(CompassDirection.NORTH);
            this.createNewMap();
            this.createMaze();
            this.drawMap();
            this.initKeyboard();
            this.initDifficulty();
            this.startMovingVillain();
        };
        this.initDifficulty = () => {
            let difficulty = $('#difficulty').val();
            switch (difficulty) {
                case 'easy':
                    this.gameSpeed = 1000;
                    break;
                case 'medium':
                    this.gameSpeed = 700;
                    break;
                case 'hard':
                    this.gameSpeed = 400;
                    break;
            }
        };
        this.getRandomPosition = () => Math.floor(Math.random() * 1000) % (this.BOARD_SIZE - 1) + 1;
        this.shouldDrawCompassShifter = () => Math.floor(Math.random() * 1000) % 20 === 0;
        this.createNewMap = () => {
            for (let i = 0; i <= this.BOARD_SIZE; i++) {
                let row = [];
                for (let j = 0; j <= this.BOARD_SIZE; j++) {
                    if (i === 0 || i === this.BOARD_SIZE || j === 0 || j === this.BOARD_SIZE) {
                        row.push(BoardTiles.WALL);
                    }
                    else if (this.shouldDrawCompassShifter()) {
                        row.push(BoardTiles.COMPASS_SHIFTER);
                    }
                    else {
                        row.push(BoardTiles.FIRE);
                    }
                }
                this.board.push(row);
            }
            this.initHero(this.getRandomPosition(), this.getRandomPosition());
            this.initGoal(this.getRandomPosition(), this.getRandomPosition());
        };
        this.createMaze = () => {
            const heroX = this.hero.getStartX(), heroY = this.hero.getStartY(), goalX = this.goal.getX(), goalY = this.goal.getY();
            let i, j;
            const stack = [];
            let VISITED;
            (function (VISITED) {
                VISITED[VISITED["VISITED"] = 0] = "VISITED";
                VISITED[VISITED["UNVISITED"] = 1] = "UNVISITED";
            })(VISITED || (VISITED = {}));
            const visitedMatrix = [];
            for (let i = 0; i < this.BOARD_SIZE; i++) {
                let row = [];
                for (let j = 0; j < this.BOARD_SIZE; j++) {
                    row.push(VISITED.UNVISITED);
                }
                visitedMatrix.push(row);
            }
            let directions = [];
            let getDirection = () => {
                if (directions.length > 0) {
                    return directions.shift();
                }
                directions[4] = 4;
                let index = 0, uniqueNumberCount = 0;
                while (uniqueNumberCount !== 4) {
                    let randomDirection = Math.floor(Math.random() * 1000) % 4;
                    if (directions.indexOf(randomDirection) === -1) {
                        directions[index++] = randomDirection;
                        uniqueNumberCount++;
                    }
                }
                return directions.shift();
            };
            let n = new SolutionNode(heroX, heroY);
            visitedMatrix[heroX][heroY] = VISITED.VISITED;
            stack.push(n);
            while (stack.length !== 0) {
                n = stack.pop();
                i = n.getX();
                j = n.getY();
                let direction = n.getDirection();
                n.setDirection(getDirection());
                stack.push(n);
                if (i === goalX && j === goalY) {
                    break;
                }
                if (direction === 0 && (i - 1) > 0 && visitedMatrix[i - 1][j] === VISITED.UNVISITED) {
                    visitedMatrix[i - 1][j] = VISITED.VISITED;
                    let newNode = new SolutionNode(i - 1, j);
                    stack.push(newNode);
                }
                else if (direction === 1 && (j + 1) < this.BOARD_SIZE && visitedMatrix[i][j + 1] === VISITED.UNVISITED) {
                    visitedMatrix[i][j + 1] = VISITED.VISITED;
                    let newNode = new SolutionNode(i, j + 1);
                    stack.push(newNode);
                }
                else if (direction === 2 && (i + 1) < this.BOARD_SIZE && visitedMatrix[i + 1][j] === VISITED.UNVISITED) {
                    visitedMatrix[i + 1][j] = VISITED.VISITED;
                    let newNode = new SolutionNode(i + 1, j);
                    stack.push(newNode);
                }
                else if (direction === 3 && (j - 1) > 0 && visitedMatrix[i][j - 1] === VISITED.UNVISITED) {
                    visitedMatrix[i][j - 1] = VISITED.VISITED;
                    let newNode = new SolutionNode(i, j - 1);
                    stack.push(newNode);
                }
                else if (direction === 4) {
                    visitedMatrix[i][j] = VISITED.UNVISITED;
                    stack.pop();
                }
            }
            for (let i = 0; i < stack.length; i++) {
                n = stack[i];
                this.board[n.getX()][n.getY()] = BoardTiles.GRASS;
            }
            this.board[this.hero.getStartX()][this.hero.getStartY()] = BoardTiles.HERO_VILLAIN;
            this.board[goalX][goalY] = BoardTiles.GOAL;
            this.board[5][5] = BoardTiles.COMPASS_SHIFTER;
            this.board[6][4] = BoardTiles.COMPASS_SHIFTER;
            this.board[2][3] = BoardTiles.COMPASS_SHIFTER;
        };
        this.drawMap = () => {
            $('#board').html('');
            this.board.forEach(row => {
                let rowDiv = [];
                row.forEach(cell => {
                    const tile = '<div class="tile ' + BoardTiles[cell] + '"></div>';
                    rowDiv.push(tile);
                });
                const rowHtml = '<div class="row">' + rowDiv.join('') + '</div>';
                $('#board').append(rowHtml);
            });
        };
        this.initHero = (x, y) => {
            this.hero = new Player(x, y);
            this.villain = new Player(x, y);
            this.board[x][y] = BoardTiles.HERO;
            this.board[x][y] = BoardTiles.VILLAIN;
        };
        this.initGoal = (x, y) => {
            this.goal = new Goal(x, y);
            this.board[x][y] = BoardTiles.GOAL;
        };
        this.initKeyboard = () => {
            document.addEventListener('keydown', (e) => {
                const origHeroX = this.hero.getX(), origHeroY = this.hero.getY();
                let newHeroX, newHeroY;
                if (!this.gameRunning)
                    return;
                switch (e.code) {
                    case "ArrowLeft": {
                        switch (this.compassDirection) {
                            case CompassDirection.NORTH:
                                newHeroX = this.hero.getX(),
                                    newHeroY = this.hero.getY() - 1;
                                break;
                            case CompassDirection.EAST:
                                newHeroX = this.hero.getX() - 1,
                                    newHeroY = this.hero.getY();
                                break;
                            case CompassDirection.WEST:
                                newHeroX = this.hero.getX() + 1,
                                    newHeroY = this.hero.getY();
                                break;
                            case CompassDirection.SOUTH:
                                newHeroX = this.hero.getX(),
                                    newHeroY = this.hero.getY() + 1;
                                break;
                        }
                        break;
                    }
                    case "ArrowUp": {
                        switch (this.compassDirection) {
                            case CompassDirection.NORTH:
                                newHeroX = this.hero.getX() - 1,
                                    newHeroY = this.hero.getY();
                                break;
                            case CompassDirection.EAST:
                                newHeroX = this.hero.getX(),
                                    newHeroY = this.hero.getY() + 1;
                                break;
                            case CompassDirection.WEST:
                                newHeroX = this.hero.getX(),
                                    newHeroY = this.hero.getY() - 1;
                                break;
                            case CompassDirection.SOUTH:
                                newHeroX = this.hero.getX() + 1,
                                    newHeroY = this.hero.getY();
                                break;
                        }
                        break;
                    }
                    case "ArrowRight": {
                        switch (this.compassDirection) {
                            case CompassDirection.NORTH:
                                newHeroX = this.hero.getX(),
                                    newHeroY = this.hero.getY() + 1;
                                break;
                            case CompassDirection.EAST:
                                newHeroX = this.hero.getX() + 1,
                                    newHeroY = this.hero.getY();
                                break;
                            case CompassDirection.WEST:
                                newHeroX = this.hero.getX() - 1,
                                    newHeroY = this.hero.getY();
                                break;
                            case CompassDirection.SOUTH:
                                newHeroX = this.hero.getX(),
                                    newHeroY = this.hero.getY() - 1;
                                break;
                        }
                        break;
                    }
                    case "ArrowDown": {
                        switch (this.compassDirection) {
                            case CompassDirection.NORTH:
                                newHeroX = this.hero.getX() + 1,
                                    newHeroY = this.hero.getY();
                                break;
                            case CompassDirection.EAST:
                                newHeroX = this.hero.getX(),
                                    newHeroY = this.hero.getY() - 1;
                                break;
                            case CompassDirection.WEST:
                                newHeroX = this.hero.getX(),
                                    newHeroY = this.hero.getY() + 1;
                                break;
                            case CompassDirection.SOUTH:
                                newHeroX = this.hero.getX() - 1,
                                    newHeroY = this.hero.getY();
                                break;
                        }
                        break;
                    }
                }
                this.handleMove(origHeroX, origHeroY, newHeroX, newHeroY, BoardTiles.HERO);
            });
        };
        this.getOppositeCharacter = (character) => {
            if (character === BoardTiles.HERO) {
                return BoardTiles.VILLAIN;
            }
            return BoardTiles.HERO;
        };
        this.handleMove = (origX, origY, newX, newY, character) => {
            if (newY === 0) {
                return;
            }
            if (this.checkIfGoalReached(newX, newY, character))
                return;
            switch (this.board[origX][origY]) {
                case BoardTiles.HERO_COMPASS_SHIFTER:
                case BoardTiles.VILLAIN_COMPASS_SHIFTER:
                    this.board[origX][origY] = BoardTiles.COMPASS_SHIFTER;
                    break;
                case BoardTiles.HERO_VILLAIN:
                    this.board[origX][origY] = this.getOppositeCharacter(character);
                    break;
                default:
                    this.board[origX][origY] = BoardTiles.GRASS;
                    break;
            }
            switch (this.board[newX][newY]) {
                case BoardTiles.COMPASS_SHIFTER:
                    if (character === BoardTiles.HERO) {
                        this.board[newX][newY] = BoardTiles.HERO_COMPASS_SHIFTER;
                    }
                    else {
                        this.board[newX][newY] = BoardTiles.VILLAIN_COMPASS_SHIFTER;
                    }
                    this.changeCompassDirection();
                    break;
                case BoardTiles.GRASS:
                    this.board[newX][newY] = character;
                    break;
                case BoardTiles.WALL:
                    return;
                case BoardTiles.FIRE:
                    this.resetHero();
                    return;
                case BoardTiles.HERO:
                case BoardTiles.VILLAIN:
                    this.board[newX][newY] = BoardTiles.HERO_VILLAIN;
                    break;
            }
            if (character === BoardTiles.HERO) {
                this.hero.setXY(newX, newY);
            }
            this.drawMap();
        };
        this.changeCompassDirection = (direction) => {
            if (direction !== undefined) {
                this.compassDirection = direction;
            }
            else {
                const index = Math.floor(Math.random() * 1000) % 4;
                this.compassDirection = CompassDirection[CompassDirection[index]];
            }
            $('.compass-direction').text(CompassDirection[this.compassDirection]);
            return this.compassDirection;
        };
        this.checkIfGoalReached = (x, y, character) => {
            if (this.board[x][y] === BoardTiles.GOAL) {
                this.declareWinner(character);
                return true;
            }
            return false;
        };
        this.declareWinner = (character) => {
            if (character === BoardTiles.HERO) {
                alert('You Win');
            }
            else {
                alert('You Lose!');
            }
            this.killTimer();
            this.gameRunning = false;
        };
        this.resetHero = () => {
            this.hero.setXY(this.hero.getStartX(), this.hero.getStartY());
            this.board[this.hero.getX()][this.hero.getY()] = BoardTiles.HERO;
            this.drawMap();
        };
        this.startMovingVillain = () => {
            const villainX = this.villain.getStartX(), villainY = this.villain.getStartY(), goalX = this.goal.getX(), goalY = this.goal.getY();
            let i, j;
            const stack = [];
            let VISITED;
            (function (VISITED) {
                VISITED[VISITED["VISITED"] = 0] = "VISITED";
                VISITED[VISITED["UNVISITED"] = 1] = "UNVISITED";
            })(VISITED || (VISITED = {}));
            const visitedMatrix = [];
            for (let i = 0; i < this.BOARD_SIZE; i++) {
                let row = [];
                for (let j = 0; j < this.BOARD_SIZE; j++) {
                    row.push(VISITED.UNVISITED);
                }
                visitedMatrix.push(row);
            }
            let n = new SolutionNode(villainX, villainY);
            visitedMatrix[villainX][villainY] = VISITED.VISITED;
            stack.push(n);
            while (stack.length !== 0) {
                n = stack.pop();
                i = n.getX();
                j = n.getY();
                let direction = n.getDirection();
                n.setDirection(direction + 1);
                stack.push(n);
                if (i === goalX && j === goalY) {
                    break;
                }
                if (direction === 2 && (i - 1) > 0 && visitedMatrix[i - 1][j] === VISITED.UNVISITED && this.board[i - 1][j] !== BoardTiles.FIRE) {
                    visitedMatrix[i - 1][j] = VISITED.VISITED;
                    let newNode = new SolutionNode(i - 1, j);
                    stack.push(newNode);
                }
                else if (direction === 1 && (j + 1) < this.BOARD_SIZE && visitedMatrix[i][j + 1] === VISITED.UNVISITED && this.board[i][j + 1] !== BoardTiles.FIRE) {
                    visitedMatrix[i][j + 1] = VISITED.VISITED;
                    let newNode = new SolutionNode(i, j + 1);
                    stack.push(newNode);
                }
                else if (direction === 0 && (i + 1) < this.BOARD_SIZE && visitedMatrix[i + 1][j] === VISITED.UNVISITED && this.board[i + 1][j] !== BoardTiles.FIRE) {
                    visitedMatrix[i + 1][j] = VISITED.VISITED;
                    let newNode = new SolutionNode(i + 1, j);
                    stack.push(newNode);
                }
                else if (direction === 3 && (j - 1) > 0 && visitedMatrix[i][j - 1] === VISITED.UNVISITED && this.board[i][j - 1] !== BoardTiles.FIRE) {
                    visitedMatrix[i][j - 1] = VISITED.VISITED;
                    let newNode = new SolutionNode(i, j - 1);
                    stack.push(newNode);
                }
                else if (direction === 4) {
                    visitedMatrix[i][j] = VISITED.UNVISITED;
                    stack.pop();
                }
            }
            this.villainIntervalhandle = setInterval(() => {
                if (stack.length === 0) {
                    this.killTimer();
                    return;
                }
                let n = stack.shift();
                let newVillainX = n.getX();
                let newVillainY = n.getY();
                this.handleMove(this.villain.getX(), this.villain.getY(), newVillainX, newVillainY, BoardTiles.VILLAIN);
                this.villain.setXY(newVillainX, newVillainY);
            }, this.gameSpeed);
        };
        this.killTimer = () => {
            if (this.villainIntervalhandle)
                clearInterval(this.villainIntervalhandle);
        };
    }
}
var CompassDirection;
(function (CompassDirection) {
    CompassDirection[CompassDirection["NORTH"] = 0] = "NORTH";
    CompassDirection[CompassDirection["EAST"] = 1] = "EAST";
    CompassDirection[CompassDirection["WEST"] = 2] = "WEST";
    CompassDirection[CompassDirection["SOUTH"] = 3] = "SOUTH";
})(CompassDirection || (CompassDirection = {}));
var BoardTiles;
(function (BoardTiles) {
    BoardTiles[BoardTiles["GRASS"] = 0] = "GRASS";
    BoardTiles[BoardTiles["WALL"] = 1] = "WALL";
    BoardTiles[BoardTiles["FIRE"] = 2] = "FIRE";
    BoardTiles[BoardTiles["COMPASS_SHIFTER"] = 3] = "COMPASS_SHIFTER";
    BoardTiles[BoardTiles["HERO"] = 4] = "HERO";
    BoardTiles[BoardTiles["HERO_COMPASS_SHIFTER"] = 5] = "HERO_COMPASS_SHIFTER";
    BoardTiles[BoardTiles["VILLAIN_COMPASS_SHIFTER"] = 6] = "VILLAIN_COMPASS_SHIFTER";
    BoardTiles[BoardTiles["GOAL"] = 7] = "GOAL";
    BoardTiles[BoardTiles["VILLAIN"] = 8] = "VILLAIN";
    BoardTiles[BoardTiles["HERO_VILLAIN"] = 9] = "HERO_VILLAIN";
})(BoardTiles || (BoardTiles = {}));
$('.start-game').on('click', () => {
    const game = new Game();
    game.init();
});
$('.start-game').click();
//# sourceMappingURL=dromosa.js.map