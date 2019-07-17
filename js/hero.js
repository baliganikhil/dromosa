export class Hero {
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
//# sourceMappingURL=hero.js.map