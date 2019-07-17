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


// import * as $ from 'jquery';


class Game {
    private BOARD_SIZE = 10;
    private compassDirection: CompassDirection;

    private board = [];

    private hero: Hero;

    init = () => {
        this.createNewMap();
        this.drawMap();
        this.initKeyboard();
    }

    createNewMap = () => {
        for (let i = 0; i <= this.BOARD_SIZE; i++) {
            let row = [];
            for (let j = 0; j <= this.BOARD_SIZE; j++) {
                if (i === 0 || i === this.BOARD_SIZE || j === 0 || j === this.BOARD_SIZE) {
                    row.push(BoardTiles.WALL);
                } else if (i === 4 && j === 4) {
                    this.initHero(i, j);
                    row.push(BoardTiles.HERO);
                } else {
                    row.push(BoardTiles.GRASS);
                }
            }

            this.board.push(row);
        }

        this.board[2][2] = BoardTiles.COMPASS_SHIFTER;
        this.board[3][3] = BoardTiles.GOAL;
        this.board[3][4] = BoardTiles.FIRE;
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
    }

    initKeyboard = () => {
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case "ArrowLeft": {
                    const   origHeroX = this.hero.getX(),
                            origHeroY = this.hero.getY();

                    let newHeroX,
                        newHeroY;

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

                    this.handleHeroMove(origHeroX, origHeroY, newHeroX, newHeroY);
                    break;
                }

                case "ArrowUp": {
                    const   origHeroX = this.hero.getX(),
                            origHeroY = this.hero.getY();

                    let newHeroX,
                        newHeroY;

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

                    this.handleHeroMove(origHeroX, origHeroY, newHeroX, newHeroY);
                    break;
                }

                case "ArrowRight": {
                    const   origHeroX = this.hero.getX(),
                            origHeroY = this.hero.getY();

                    let newHeroX,
                        newHeroY;

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

                    this.handleHeroMove(origHeroX, origHeroY, newHeroX, newHeroY);
                    break;
                }

                case "ArrowDown": {
                    const   origHeroX = this.hero.getX(),
                            origHeroY = this.hero.getY();

                    let newHeroX,
                        newHeroY;

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

                    this.handleHeroMove(origHeroX, origHeroY, newHeroX, newHeroY);
                    break;
                }

            }

        });

        console.log('keyboard ready');
    }

    handleHeroMove = (origHeroX: number, origHeroY: number, newHeroX: number, newHeroY: number) => {
        if (newHeroY === 0) { return; }
        if (this.checkIfGoalReached(newHeroX, newHeroY)) return;

        if (this.board[origHeroX][origHeroY] === BoardTiles.HERO_COMPASS_SHIFTER) {
            this.board[origHeroX][origHeroY] = BoardTiles.COMPASS_SHIFTER;
        } else {
            this.board[origHeroX][origHeroY] = BoardTiles.GRASS;
        }

        if (this.board[newHeroX][newHeroY] === BoardTiles.COMPASS_SHIFTER) {
            this.board[newHeroX][newHeroY] = BoardTiles.HERO_COMPASS_SHIFTER;
            this.changeCompassDirection();
        } else if (this.board[newHeroX][newHeroY] === BoardTiles.GRASS) {
            this.board[newHeroX][newHeroY] = BoardTiles.HERO;
        } else if (this.board[newHeroX][newHeroY] === BoardTiles.WALL) {
            return;
        } else if (this.board[newHeroX][newHeroY] === BoardTiles.FIRE) {
            this.resetHero();
            return;
        }

        this.hero.setXY(newHeroX, newHeroY);
        this.drawMap();
    }

    changeCompassDirection = () => {
        const index = Math.floor(Math.random() * 1000) % 4;
        this.compassDirection = CompassDirection[CompassDirection[index]];
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
    GOAL
}

const game = new Game();
const direction = game.changeCompassDirection();
game.init();
console.log(direction);