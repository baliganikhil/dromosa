"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.Hero = Hero;
//# sourceMappingURL=hero.js.map