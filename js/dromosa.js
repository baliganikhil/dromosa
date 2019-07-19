class Hero {
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
        this.init = () => {
            this.changeCompassDirection(CompassDirection.NORTH);
            this.createNewMap();
            this.createMaze();
            this.drawMap();
            this.initKeyboard();
        };
        this.createNewMap = () => {
            for (let i = 0; i <= this.BOARD_SIZE; i++) {
                let row = [];
                for (let j = 0; j <= this.BOARD_SIZE; j++) {
                    if (i === 0 || i === this.BOARD_SIZE || j === 0 || j === this.BOARD_SIZE) {
                        row.push(BoardTiles.WALL);
                    }
                    else {
                        row.push(BoardTiles.FIRE);
                    }
                }
                this.board.push(row);
            }
            this.board[2][2] = BoardTiles.COMPASS_SHIFTER;
            this.board[3][4] = BoardTiles.FIRE;
            this.initHero(1, 1);
            this.initGoal(this.BOARD_SIZE - 1, this.BOARD_SIZE - 1);
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
                console.log(i, j, direction, goalX, goalY);
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
            this.solution = stack;
            this.board[this.hero.getStartX()][this.hero.getStartY()] = BoardTiles.HERO;
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
            this.hero = new Hero(x, y);
            this.villain = new Hero(x, y);
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
                this.handleHeroMove(origHeroX, origHeroY, newHeroX, newHeroY);
            });
            console.log('keyboard ready');
        };
        this.handleHeroMove = (origHeroX, origHeroY, newHeroX, newHeroY) => {
            if (newHeroY === 0) {
                return;
            }
            if (this.checkIfGoalReached(newHeroX, newHeroY))
                return;
            switch (this.board[origHeroX][origHeroY]) {
                case BoardTiles.HERO_COMPASS_SHIFTER:
                    this.board[origHeroX][origHeroY] = BoardTiles.COMPASS_SHIFTER;
                    break;
                default:
                    this.board[origHeroX][origHeroY] = BoardTiles.GRASS;
                    break;
            }
            switch (this.board[newHeroX][newHeroY]) {
                case BoardTiles.COMPASS_SHIFTER:
                    this.board[newHeroX][newHeroY] = BoardTiles.HERO_COMPASS_SHIFTER;
                    this.changeCompassDirection();
                    break;
                case BoardTiles.GRASS:
                    this.board[newHeroX][newHeroY] = BoardTiles.HERO;
                    break;
                case BoardTiles.WALL:
                    return;
                case BoardTiles.FIRE:
                    this.resetHero();
                    return;
            }
            this.hero.setXY(newHeroX, newHeroY);
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
        this.checkIfGoalReached = (x, y) => {
            if (this.board[x][y] === BoardTiles.GOAL) {
                this.declareWinner();
                return true;
            }
            return false;
        };
        this.declareWinner = () => {
            alert('You Win');
        };
        this.resetHero = () => {
            this.hero.setXY(this.hero.getStartX(), this.hero.getStartY());
            this.board[this.hero.getX()][this.hero.getY()] = BoardTiles.HERO;
            this.drawMap();
        };
        this.startMovingVillain = () => {
            console.log(this.solution);
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
    BoardTiles[BoardTiles["GOAL"] = 6] = "GOAL";
    BoardTiles[BoardTiles["VILLAIN"] = 7] = "VILLAIN";
})(BoardTiles || (BoardTiles = {}));
const game = new Game();
// const direction = game.changeCompassDirection();
game.init();
// console.log(direction);
game.startMovingVillain();
//# sourceMappingURL=dromosa.js.map