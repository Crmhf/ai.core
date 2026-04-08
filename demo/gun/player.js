// 玩家类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 4;

        // 血量和护盾
        this.maxHealth = 200;
        this.health = this.maxHealth;
        this.maxShield = 100;
        this.shield = this.maxShield;

        // 移动状态
        this.vx = 0;
        this.vy = 0;
        this.keys = {};

        // 武器
        this.weapon = new Weapon('desert_eagle');

        // 瞄准
        this.mouseX = 0;
        this.mouseY = 0;
        this.angle = 0;

        // 受伤效果
        this.lastDamageTime = 0;
        this.damageFlash = false;

        // 护盾恢复
        this.lastShieldDamageTime = 0;
        this.shieldRegenDelay = 3000; // 3秒后开始恢复护盾
        this.shieldRegenRate = 20; // 每秒恢复20点护盾

        this.isAlive = true;
    }

    handleInput(keys, mouseX, mouseY) {
        this.keys = keys;
        this.mouseX = mouseX;
        this.mouseY = mouseY;

        // 计算面向角度
        this.angle = Utils.angle(this.x, this.y, mouseX, mouseY);
    }

    update(obstacles) {
        if (!this.isAlive) return;

        // 移动逻辑
        this.vx = 0;
        this.vy = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) this.vy -= this.speed;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) this.vy += this.speed;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.vx -= this.speed;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) this.vx += this.speed;

        // 对角线移动速度修正
        if (this.vx !== 0 && this.vy !== 0) {
            this.vx *= 0.707; // 1/√2
            this.vy *= 0.707;
        }

        // 碰撞检测和移动
        this.moveWithCollision(obstacles);

        // 更新武器
        this.weapon.updateReload();

        // 护盾恢复
        this.updateShieldRegen();

        // 受伤闪烁效果
        if (Date.now() - this.lastDamageTime > 200) {
            this.damageFlash = false;
        }
    }

    moveWithCollision(obstacles) {
        // X轴移动
        const newX = this.x + this.vx;
        let canMoveX = true;

        // 检查边界
        if (newX < 0 || newX + this.width > 1200) {
            canMoveX = false;
        }

        // 检查障碍物碰撞
        if (canMoveX) {
            for (const obstacle of obstacles) {
                if (Utils.rectCollision(newX, this.y, this.width, this.height,
                                      obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                    canMoveX = false;
                    break;
                }
            }
        }

        if (canMoveX) {
            this.x = newX;
        }

        // Y轴移动
        const newY = this.y + this.vy;
        let canMoveY = true;

        // 检查边界
        if (newY < 0 || newY + this.height > 800) {
            canMoveY = false;
        }

        // 检查障碍物碰撞
        if (canMoveY) {
            for (const obstacle of obstacles) {
                if (Utils.rectCollision(this.x, newY, this.width, this.height,
                                      obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                    canMoveY = false;
                    break;
                }
            }
        }

        if (canMoveY) {
            this.y = newY;
        }
    }

    shoot() {
        return this.weapon.shoot(this.x + this.width/2, this.y + this.height/2,
                                this.mouseX, this.mouseY);
    }

    reload() {
        return this.weapon.startReload();
    }

    takeDamage(damage, attackerX, attackerY) {
        if (!this.isAlive) return false;

        let actualDamage = damage;

        // 护盾先承受伤害
        if (this.shield > 0) {
            const shieldDamage = Math.min(this.shield, actualDamage);
            this.shield -= shieldDamage;
            actualDamage -= shieldDamage;
            this.lastShieldDamageTime = Date.now();
        }

        // 剩余伤害作用于血量
        if (actualDamage > 0) {
            this.health -= actualDamage;
            this.health = Math.max(0, this.health);
        }

        // 受伤效果
        this.lastDamageTime = Date.now();
        this.damageFlash = true;

        // 显示攻击指示器
        this.showDamageIndicator(attackerX, attackerY);

        // 检查死亡
        if (this.health <= 0) {
            this.isAlive = false;
            return true; // 返回true表示玩家死亡
        }

        return false;
    }

    showDamageIndicator(attackerX, attackerY) {
        // 计算攻击者相对于玩家的方向
        const angle = Utils.angle(this.x, this.y, attackerX, attackerY);

        // 在屏幕边缘显示红点指示器
        const centerX = 600; // 屏幕中心X
        const centerY = 400; // 屏幕中心Y
        const radius = 200; // 指示器距离中心的距离

        const indicatorX = centerX + Math.cos(angle) * radius;
        const indicatorY = centerY + Math.sin(angle) * radius;

        // 创建DOM元素显示指示器
        const indicator = document.createElement('div');
        indicator.className = 'damage-indicator';
        indicator.style.left = indicatorX + 'px';
        indicator.style.top = indicatorY + 'px';

        document.getElementById('gameContainer').appendChild(indicator);

        // 0.5秒后移除指示器
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 500);
    }

    updateShieldRegen() {
        // 护盾恢复逻辑
        if (this.shield < this.maxShield &&
            Date.now() - this.lastShieldDamageTime > this.shieldRegenDelay) {
            this.shield += this.shieldRegenRate / 60; // 每帧恢复
            this.shield = Math.min(this.shield, this.maxShield);
        }
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save();

        // 受伤闪烁效果
        if (this.damageFlash) {
            ctx.globalAlpha = 0.5;
        }

        // 移动到玩家位置
        ctx.translate(this.x + this.width/2, this.y + this.height/2);

        // 绘制玩家身体（蛋仔造型但军事化）
        this.drawPlayerBody(ctx);

        // 绘制武器
        this.weapon.drawWeapon(ctx, 0, 0, this.angle);

        ctx.restore();
    }

    drawPlayerBody(ctx) {
        // 身体（椭圆形，蛋仔风格）
        ctx.fillStyle = '#2ecc71'; // 军绿色
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // 头盔
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.ellipse(0, -8, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 护目镜
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(0, -8, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 护目镜反光
        ctx.fillStyle = '#3498db';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(-2, -9, 2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // 战术背心
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-8, -5, 16, 10);

        // 战术背心细节
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-6, -3, 3, 2);
        ctx.fillRect(3, -3, 3, 2);
        ctx.fillRect(-6, 1, 3, 2);
        ctx.fillRect(3, 1, 3, 2);

        // 腿部
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(-4, 8, 3, 8);
        ctx.fillRect(1, 8, 3, 8);

        // 靴子
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-4, 14, 4, 3);
        ctx.fillRect(0, 14, 4, 3);
    }

    // 获取中心点坐标
    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }

    // 获取碰撞盒
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}