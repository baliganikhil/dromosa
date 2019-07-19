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

    private gameSpeed = 500;
    private gameRunning = false;
    private villainIntervalhandle;

    init = () => {
        this.gameRunning = true;

        this.changeCompassDirection(CompassDirection.NORTH);
        this.createNewMap();
        this.createMaze();
        this.drawMap();
        this.initKeyboard();
        this.initDifficulty();
        this.startMovingVillain();
    }

    initDifficulty = () => {
        let difficulty = $('#difficulty').val();
        
        switch(difficulty) {
            case 'easy':    this.gameSpeed = 1000;
                            break;
            
            case 'medium':    this.gameSpeed = 700;
                            break;
            
            case 'hard':    this.gameSpeed = 400;
                            break;
        }
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

            if (!this.gameRunning) return;

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

            this.handleHeroMove(origHeroX, origHeroY, newHeroX, newHeroY, BoardTiles.HERO);
        });

    }

    handleHeroMove = (origX: number, origY: number, newX: number, newY: number, character: BoardTiles) => {
        if (newY === 0) { return; }
        if (this.checkIfGoalReached(newX, newY, character)) return;

        switch(this.board[origX][origY]) {
            case BoardTiles.HERO_COMPASS_SHIFTER:
                this.board[origX][origY] = BoardTiles.COMPASS_SHIFTER;
                break;

            default:
                this.board[origX][origY] = BoardTiles.GRASS;
                break;
        }

        if (this.hero.getX() === this.villain.getX() && this.hero.getY() === this.villain.getY() && character === BoardTiles.HERO) {
            this.board[origX][origY] = BoardTiles.HERO;
        }

        switch(this.board[newX][newY]) {
            case BoardTiles.COMPASS_SHIFTER:
                this.board[newX][newY] = BoardTiles.HERO_COMPASS_SHIFTER;
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
        }

        if (character === BoardTiles.HERO) {
            this.hero.setXY(newX, newY);
        }

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

    checkIfGoalReached = (x: number, y: number, character: BoardTiles) => {
        if (this.board[x][y] === BoardTiles.GOAL) {
            this.declareWinner(character);
            return true;
        }

        return false;
    }

    declareWinner = (character: BoardTiles) => {
        if (character === BoardTiles.HERO) {
            alert('You Win');
        } else {
            alert('You Lose!');
        }

        clearInterval(this.villainIntervalhandle);
        this.gameRunning = false;
    }

    resetHero = () => {
        this.hero.setXY(this.hero.getStartX(), this.hero.getStartY());
        this.board[this.hero.getX()][this.hero.getY()] = BoardTiles.HERO;
        this.drawMap();
    }

    startMovingVillain = () => {
        const   villainX = this.villain.getStartX(),
                villainY = this.villain.getStartY(),
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

        let n: SolutionNode = new SolutionNode(villainX, villainY);
        visitedMatrix[villainX][villainY] = VISITED.VISITED;
        stack.push(n);
        
        while(stack.length !== 0) {
            n = stack.pop();
            i = n.getX();
            j = n.getY();

            let direction: number = n.getDirection();
            n.setDirection(direction + 1);
            stack.push(n);

            if (i === goalX && j === goalY) {
                break;
            }

            if (direction === 2 && (i - 1) > 0 && visitedMatrix[i - 1][j] === VISITED.UNVISITED && this.board[i - 1][j] !== BoardTiles.FIRE) {
                visitedMatrix[i - 1][j] = VISITED.VISITED;

                let newNode: SolutionNode = new SolutionNode(i - 1, j);
                stack.push(newNode);
            } else if (direction === 1 && (j + 1) < this.BOARD_SIZE && visitedMatrix[i][j + 1] === VISITED.UNVISITED && this.board[i][j + 1] !== BoardTiles.FIRE) {
                visitedMatrix[i][j + 1] = VISITED.VISITED;

                let newNode: SolutionNode = new SolutionNode(i, j + 1);
                stack.push(newNode);
            } else if (direction === 0 && (i + 1) < this.BOARD_SIZE && visitedMatrix[i + 1][j] === VISITED.UNVISITED && this.board[i + 1][j] !== BoardTiles.FIRE) {
                visitedMatrix[i + 1][j] = VISITED.VISITED;

                let newNode: SolutionNode = new SolutionNode(i + 1, j);
                stack.push(newNode);
            } else if (direction === 3 && (j - 1) > 0 && visitedMatrix[i][j - 1] === VISITED.UNVISITED && this.board[i][j - 1] !== BoardTiles.FIRE) {
                visitedMatrix[i][j - 1] = VISITED.VISITED;

                let newNode: SolutionNode = new SolutionNode(i, j - 1);
                stack.push(newNode);
            } else if (direction === 4) {
                visitedMatrix[i][j] = VISITED.UNVISITED;
                stack.pop();
            }
        }

        this.villainIntervalhandle = setInterval(() => {
            if (stack.length === 0) {
                clearInterval(this.villainIntervalhandle);
                return;
            }

            let n: SolutionNode = stack.shift();
            let newVillainX = n.getX();
            let newVillainY = n.getY();
            this.handleHeroMove(this.villain.getX(), this.villain.getY(), newVillainX, newVillainY, BoardTiles.VILLAIN);
            this.villain.setXY(newVillainX, newVillainY);
        }, this.gameSpeed);
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

$('.start-game').on('click', () => {
    const game = new Game();
    game.init();
});

$('.start-game').click();