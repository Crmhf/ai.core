// 工具函数
class Utils {
    // 计算两点之间的距离
    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // 计算两点之间的角度
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    // 角度转弧度
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // 弧度转角度
    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    // 检查点是否在矩形内
    static pointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    // 检查两个矩形是否碰撞
    static rectCollision(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
        return r1x < r2x + r2w &&
               r1x + r1w > r2x &&
               r1y < r2y + r2h &&
               r1y + r1h > r2y;
    }

    // 检查圆形碰撞
    static circleCollision(x1, y1, r1, x2, y2, r2) {
        const distance = this.distance(x1, y1, x2, y2);
        return distance < r1 + r2;
    }

    // 限制数值在范围内
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // 线性插值
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // 随机整数
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 随机浮点数
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    // 向量归一化
    static normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }

    // 检查线段与矩形的碰撞
    static lineRectCollision(x1, y1, x2, y2, rx, ry, rw, rh) {
        // 检查线段的两个端点是否在矩形内
        if (this.pointInRect(x1, y1, rx, ry, rw, rh) ||
            this.pointInRect(x2, y2, rx, ry, rw, rh)) {
            return true;
        }

        // 检查线段是否与矩形的边相交
        return this.lineIntersection(x1, y1, x2, y2, rx, ry, rx + rw, ry) ||
               this.lineIntersection(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) ||
               this.lineIntersection(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) ||
               this.lineIntersection(x1, y1, x2, y2, rx, ry + rh, rx, ry);
    }

    // 检查两条线段是否相交
    static lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return false;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
}