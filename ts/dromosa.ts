class Hero {
    private x: number;
    private y: number;

    private startX: number;
    private startY: number;

    constructor(x: number, y: number) {
        this.startX = x;
        this.startY = y;

        this.setXY(x, y);
    }

    setXY = (x: number, y: number) => {
        this.x = x;
        this.y = y;
    }

    getX = () => this.x;
    getY = () => this.y;

    getStartX = () => this.startX;
    getStartY = () => this.startY;
}


class Goal {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getX = () => this.x;
    getY = () => this.y;
}

class SolutionNode {
    private direction: number;
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.setX(x);
        this.setY(y);
        this.direction = 0;
    }

    getX = () => this.x;
    setX = (x: number) => this.x = x;
    
    getY = () => this.y
    setY = (y: number) => this.y = y;

    getDirection = () => this.direction;
    setDirection = (d: number) => this.direction = d;
}

// import * as $ from 'jquery';


class Game {
    private BOARD_SIZE = 10;
    private compassDirection: CompassDirection;

    private board = [];

    private hero: Hero;
    private villain: Hero;
    private goal: Goal;

    private solution;

    init = () => {
        this.changeCompassDirection(CompassDirection.NORTH);
        this.createNewMap();
        this.createMaze();
        this.drawMap();
        this.initKeyboard();
    }

    createNewMap = () => {
        for (let i = 0; i <= this.BOARD_SIZE; i++) {
            let row = [];
            for (let j = 0; j <= this.BOARD_SIZE; j++) {
                if (i === 0 || i === this.BOARD_SIZE || j === 0 || j === this.BOARD_SIZE) {
                    row.push(BoardTiles.WALL);
                } else {
                    row.push(BoardTiles.FIRE);
                }
            }

            this.board.push(row);
        }

        this.board[2][2] = BoardTiles.COMPASS_SHIFTER;
        this.board[3][4] = BoardTiles.FIRE;
        
        this.initHero(1, 1);
        this.initGoal(this.BOARD_SIZE - 1, this.BOARD_SIZE - 1);
        
    }

    createMaze = () => {
        const   heroX = this.hero.getStartX(),
                heroY = this.hero.getStartY(),
                goalX = this.goal.getX(),
                goalY = this.goal.getY();
        
        let i, j;
    
        const stack = [];

        enum VISITED {
            VISITED,
            UNVISITED
        }

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
            while(uniqueNumberCount !== 4) {
                let randomDirection = Math.floor(Math.random() * 1000) % 4;
                if (directions.indexOf(randomDirection) === -1) {
                    directions[index++] = randomDirection;
                    uniqueNumberCount++;
                }
            }

            return directions.shift();
        }

        let n: SolutionNode = new SolutionNode(heroX, heroY);
        visitedMatrix[heroX][heroY] = VISITED.VISITED;
        stack.push(n);
        
        while(stack.length !== 0) {
            n = stack.pop();
            i = n.getX();
            j = n.getY();

            let direction: number = n.getDirection();
            n.setDirection(getDirection());
            stack.push(n);

            console.log(i, j, direction, goalX, goalY);

            if (i === goalX && j === goalY) {
                break;
            }

            if (direction === 0 && (i - 1) > 0 && visitedMatrix[i - 1][j] === VISITED.UNVISITED) {
                visitedMatrix[i - 1][j] = VISITED.VISITED;

                let newNode: SolutionNode = new SolutionNode(i - 1, j);
                stack.push(newNode);
            } else if (direction === 1 && (j + 1) < this.BOARD_SIZE && visitedMatrix[i][j + 1] === VISITED.UNVISITED) {
                visitedMatrix[i][j + 1] = VISITED.VISITED;

                let newNode: SolutionNode = new SolutionNode(i, j + 1);
                stack.push(newNode);
            } else if (direction === 2 && (i + 1) < this.BOARD_SIZE && visitedMatrix[i + 1][j] === VISITED.UNVISITED) {
                visitedMatrix[i + 1][j] = VISITED.VISITED;

                let newNode: SolutionNode = new SolutionNode(i + 1, j);
                stack.push(newNode);
            } else if (direction === 3 && (j - 1) > 0 && visitedMatrix[i][j - 1] === VISITED.UNVISITED) {
                visitedMatrix[i][j - 1] = VISITED.VISITED;

                let newNode: SolutionNode = new SolutionNode(i, j - 1);
                stack.push(newNode);
            } else if (direction === 4) {
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
    }

    drawMap = () => {
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
    }

    initHero = (x: number, y: number) => {
        this.hero = new Hero(x, y);
        this.villain = new Hero(x, y);
        this.board[x][y] = BoardTiles.HERO;
        this.board[x][y] = BoardTiles.VILLAIN;
    }

    initGoal = (x: number, y: number) => {
        this.goal = new Goal(x, y);
        this.board[x][y] = BoardTiles.GOAL;
    }

    initKeyboard = () => {
        document.addEventListener('keydown', (e) => {
            const   origHeroX = this.hero.getX(),
                    origHeroY = this.hero.getY();

            let newHeroX, newHeroY;

            switch(e.code) {
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
    }

    handleHeroMove = (origHeroX: number, origHeroY: number, newHeroX: number, newHeroY: number) => {
        if (newHeroY === 0) { return; }
        if (this.checkIfGoalReached(newHeroX, newHeroY)) return;

        switch(this.board[origHeroX][origHeroY]) {
            case BoardTiles.HERO_COMPASS_SHIFTER:
                this.board[origHeroX][origHeroY] = BoardTiles.COMPASS_SHIFTER;
                break;

            default:
                this.board[origHeroX][origHeroY] = BoardTiles.GRASS;
                break;
        }

        switch(this.board[newHeroX][newHeroY]) {
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
    }

    changeCompassDirection = (direction?: CompassDirection) => {
        if (direction !== undefined) {
            this.compassDirection = direction;
        } else {
            const index = Math.floor(Math.random() * 1000) % 4;
            this.compassDirection = CompassDirection[CompassDirection[index]];
        }

        $('.compass-direction').text(CompassDirection[this.compassDirection]);
        return this.compassDirection;
    }

    checkIfGoalReached = (x: number, y: number) => {
        if (this.board[x][y] === BoardTiles.GOAL) {
            this.declareWinner();
            return true;
        }

        return false;
    }

    declareWinner = () => {
        alert('You Win');
    }

    resetHero = () => {
        this.hero.setXY(this.hero.getStartX(), this.hero.getStartY());
        this.board[this.hero.getX()][this.hero.getY()] = BoardTiles.HERO;
        this.drawMap();
    }

    startMovingVillain = () => {
        console.log(this.solution);
    }
}

enum CompassDirection {
    NORTH,
    EAST,
    WEST,
    SOUTH
}

enum BoardTiles {
    GRASS,
    WALL,
    FIRE,
    COMPASS_SHIFTER,
    HERO,
    HERO_COMPASS_SHIFTER,
    GOAL,
    VILLAIN
}

const game = new Game();
// const direction = game.changeCompassDirection();
game.init();
// console.log(direction);
game.startMovingVillain();