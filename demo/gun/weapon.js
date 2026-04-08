// 子弹类
class Bullet {
    constructor(x, y, angle, speed, damage, owner) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.owner = owner;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 100; // 子弹生存时间
        this.size = 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#f39c12';
        ctx.shadowColor = '#f39c12';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 检查与矩形的碰撞
    checkCollision(x, y, width, height) {
        return this.x >= x && this.x <= x + width &&
               this.y >= y && this.y <= y + height;
    }
}

// 武器类
class Weapon {
    constructor(type = 'desert_eagle') {
        this.type = type;
        this.setupWeapon();
        this.currentAmmo = this.maxAmmo;
        this.isReloading = false;
        this.reloadStartTime = 0;
        this.lastShotTime = 0;
    }

    setupWeapon() {
        const weapons = {
            desert_eagle: {
                name: '沙漠之鹰',
                damage: 35,
                maxAmmo: 30,
                reloadTime: 4000, // 4秒
                fireRate: 200, // 每分钟射击次数
                accuracy: 0.95,
                range: 800
            }
        };

        const config = weapons[this.type];
        this.name = config.name;
        this.damage = config.damage;
        this.maxAmmo = config.maxAmmo;
        this.reloadTime = config.reloadTime;
        this.fireRate = config.fireRate;
        this.accuracy = config.accuracy;
        this.range = config.range;
        this.shotInterval = 60000 / this.fireRate; // 毫秒
    }

    canShoot() {
        const now = Date.now();
        return !this.isReloading &&
               this.currentAmmo > 0 &&
               (now - this.lastShotTime) >= this.shotInterval;
    }

    shoot(x, y, targetX, targetY) {
        if (!this.canShoot()) return null;

        this.currentAmmo--;
        this.lastShotTime = Date.now();

        // 计算射击角度，添加一些随机偏差
        let angle = Utils.angle(x, y, targetX, targetY);
        const spread = (1 - this.accuracy) * 0.2; // 散布范围
        angle += (Math.random() - 0.5) * spread;

        // 创建子弹
        const bullet = new Bullet(x, y, angle, 15, this.damage, 'player');

        return bullet;
    }

    startReload() {
        if (this.isReloading || this.currentAmmo === this.maxAmmo) return false;

        this.isReloading = true;
        this.reloadStartTime = Date.now();
        return true;
    }

    updateReload() {
        if (!this.isReloading) return;

        const elapsed = Date.now() - this.reloadStartTime;
        if (elapsed >= this.reloadTime) {
            this.currentAmmo = this.maxAmmo;
            this.isReloading = false;
        }
    }

    getReloadProgress() {
        if (!this.isReloading) return 0;
        const elapsed = Date.now() - this.reloadStartTime;
        return Math.min(elapsed / this.reloadTime, 1);
    }

    // 绘制武器（在玩家手中）
    drawWeapon(ctx, x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // 绘制沙漠之鹰的简化版本
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(15, -3, 25, 6); // 枪管

        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, -8, 20, 16); // 枪身

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-5, -6, 8, 12); // 握把

        // 枪口火焰效果（射击时）
        const timeSinceShot = Date.now() - this.lastShotTime;
        if (timeSinceShot < 100) {
            ctx.fillStyle = '#f39c12';
            ctx.shadowColor = '#f39c12';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(40, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}