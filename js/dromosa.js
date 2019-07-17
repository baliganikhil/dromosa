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
// import * as $ from 'jquery';
class Game {
    constructor() {
        this.BOARD_SIZE = 10;
        this.board = [];
        this.init = () => {
            this.createNewMap();
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
                    else if (i === 4 && j === 4) {
                        this.initHero(i, j);
                        row.push(BoardTiles.HERO);
                    }
                    else {
                        row.push(BoardTiles.GRASS);
                    }
                }
                this.board.push(row);
            }
            this.board[2][2] = BoardTiles.COMPASS_SHIFTER;
            this.board[3][3] = BoardTiles.GOAL;
            this.board[3][4] = BoardTiles.FIRE;
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
        this.changeCompassDirection = () => {
            const index = Math.floor(Math.random() * 1000) % 4;
            this.compassDirection = CompassDirection[CompassDirection[index]];
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
})(BoardTiles || (BoardTiles = {}));
const game = new Game();
const direction = game.changeCompassDirection();
game.init();
console.log(direction);
//# sourceMappingURL=dromosa.js.map