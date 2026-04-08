// 敌人类
class Enemy {
    constructor(x, y, type = 'soldier') {
        this.x = x;
        this.y = y;
        this.width = 18;
        this.height = 18;
        this.type = type;

        this.setupEnemyType();

        this.health = this.maxHealth;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;

        // AI状态
        this.state = 'patrol'; // patrol, chase, attack, dead
        this.target = null;
        this.lastShotTime = 0;
        this.patrolTarget = { x: x, y: y };
        this.patrolRadius = 100;
        this.sightRange = 150;
        this.attackRange = 120;

        // 寻路
        this.path = [];
        this.pathIndex = 0;
        this.lastPathUpdate = 0;

        // 受伤效果
        this.lastDamageTime = 0;
        this.damageFlash = false;

        this.isAlive = true;
        this.deathTime = 0;
    }

    setupEnemyType() {
        const types = {
            soldier: {
                maxHealth: 80,
                speed: 1.5,
                damage: 25,
                fireRate: 120, // 每分钟射击次数
                accuracy: 0.7,
                color: '#e74c3c'
            },
            heavy: {
                maxHealth: 150,
                speed: 1,
                damage: 40,
                fireRate: 80,
                accuracy: 0.6,
                color: '#8e44ad'
            },
            scout: {
                maxHealth: 60,
                speed: 2.5,
                damage: 20,
                fireRate: 180,
                accuracy: 0.8,
                color: '#f39c12'
            }
        };

        const config = types[this.type];
        this.maxHealth = config.maxHealth;
        this.speed = config.speed;
        this.damage = config.damage;
        this.fireRate = config.fireRate;
        this.accuracy = config.accuracy;
        this.color = config.color;
        this.shotInterval = 60000 / this.fireRate;
    }

    update(player, obstacles, enemies) {
        if (!this.isAlive) return;

        // 更新AI状态
        this.updateAI(player, obstacles);

        // 移动
        this.moveWithCollision(obstacles, enemies);

        // 受伤闪烁效果
        if (Date.now() - this.lastDamageTime > 200) {
            this.damageFlash = false;
        }
    }

    updateAI(player, obstacles) {
        const distanceToPlayer = Utils.distance(
            this.getCenterX(), this.getCenterY(),
            player.getCenterX(), player.getCenterY()
        );

        // 检查是否能看到玩家（简单的视线检查）
        const canSeePlayer = this.canSeeTarget(player, obstacles);

        switch (this.state) {
            case 'patrol':
                this.patrol();
                if (canSeePlayer && distanceToPlayer <= this.sightRange) {
                    this.state = 'chase';
                    this.target = player;
                }
                break;

            case 'chase':
                if (!canSeePlayer || distanceToPlayer > this.sightRange * 1.5) {
                    this.state = 'patrol';
                    this.target = null;
                } else if (distanceToPlayer <= this.attackRange) {
                    this.state = 'attack';
                } else {
                    this.chaseTarget(player);
                }
                break;

            case 'attack':
                if (distanceToPlayer > this.attackRange * 1.2) {
                    this.state = 'chase';
                } else {
                    this.attackTarget(player);
                }
                break;
        }
    }

    patrol() {
        // 简单的巡逻逻辑
        const distanceToPatrol = Utils.distance(
            this.getCenterX(), this.getCenterY(),
            this.patrolTarget.x, this.patrolTarget.y
        );

        if (distanceToPatrol < 20) {
            // 选择新的巡逻点
            const angle = Math.random() * Math.PI * 2;
            this.patrolTarget.x = this.x + Math.cos(angle) * this.patrolRadius;
            this.patrolTarget.y = this.y + Math.sin(angle) * this.patrolRadius;

            // 确保巡逻点在地图内
            this.patrolTarget.x = Utils.clamp(this.patrolTarget.x, 0, 1200);
            this.patrolTarget.y = Utils.clamp(this.patrolTarget.y, 0, 800);
        }

        // 向巡逻点移动
        this.moveTowards(this.patrolTarget.x, this.patrolTarget.y, 0.5);
    }

    chaseTarget(target) {
        this.moveTowards(target.getCenterX(), target.getCenterY(), 1);
        this.angle = Utils.angle(
            this.getCenterX(), this.getCenterY(),
            target.getCenterX(), target.getCenterY()
        );
    }

    attackTarget(target) {
        // 面向目标
        this.angle = Utils.angle(
            this.getCenterX(), this.getCenterY(),
            target.getCenterX(), target.getCenterY()
        );

        // 射击
        const now = Date.now();
        if (now - this.lastShotTime >= this.shotInterval) {
            this.shoot(target);
            this.lastShotTime = now;
        }

        // 保持距离，不要太靠近
        const distance = Utils.distance(
            this.getCenterX(), this.getCenterY(),
            target.getCenterX(), target.getCenterY()
        );

        if (distance < this.attackRange * 0.7) {
            // 后退
            this.moveTowards(target.getCenterX(), target.getCenterY(), -0.5);
        }
    }

    moveTowards(targetX, targetY, speedMultiplier) {
        const dx = targetX - this.getCenterX();
        const dy = targetY - this.getCenterY();
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.vx = (dx / distance) * this.speed * speedMultiplier;
            this.vy = (dy / distance) * this.speed * speedMultiplier;
        }
    }

    moveWithCollision(obstacles, enemies) {
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

        // 检查与其他敌人的碰撞
        if (canMoveX) {
            for (const enemy of enemies) {
                if (enemy !== this && enemy.isAlive &&
                    Utils.rectCollision(newX, this.y, this.width, this.height,
                                      enemy.x, enemy.y, enemy.width, enemy.height)) {
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

        // 检查与其他敌人的碰撞
        if (canMoveY) {
            for (const enemy of enemies) {
                if (enemy !== this && enemy.isAlive &&
                    Utils.rectCollision(this.x, newY, this.width, this.height,
                                      enemy.x, enemy.y, enemy.width, enemy.height)) {
                    canMoveY = false;
                    break;
                }
            }
        }

        if (canMoveY) {
            this.y = newY;
        }
    }

    canSeeTarget(target, obstacles) {
        // 简单的视线检查 - 检查是否有障碍物阻挡
        const x1 = this.getCenterX();
        const y1 = this.getCenterY();
        const x2 = target.getCenterX();
        const y2 = target.getCenterY();

        for (const obstacle of obstacles) {
            if (Utils.lineRectCollision(x1, y1, x2, y2,
                                      obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                return false;
            }
        }
        return true;
    }

    shoot(target) {
        // 计算射击角度，添加精度影响
        let angle = Utils.angle(
            this.getCenterX(), this.getCenterY(),
            target.getCenterX(), target.getCenterY()
        );

        const spread = (1 - this.accuracy) * 0.3;
        angle += (Math.random() - 0.5) * spread;

        // 创建子弹
        const bullet = new Bullet(
            this.getCenterX(), this.getCenterY(),
            angle, 12, this.damage, 'enemy'
        );

        return bullet;
    }

    takeDamage(damage) {
        if (!this.isAlive) return false;

        this.health -= damage;
        this.health = Math.max(0, this.health);

        // 受伤效果
        this.lastDamageTime = Date.now();
        this.damageFlash = true;

        // 检查死亡
        if (this.health <= 0) {
            this.isAlive = false;
            this.deathTime = Date.now();
            this.dropLoot();
            return true; // 返回true表示敌人死亡
        }

        return false;
    }

    dropLoot() {
        // 掉落物资
        const lootTypes = ['health', 'shield', 'ammo'];
        const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];

        // 创建掉落物品（这里简化为直接给玩家加血/护盾）
        const loot = {
            type: lootType,
            x: this.getCenterX(),
            y: this.getCenterY(),
            value: this.getLootValue(lootType)
        };

        // 显示掉落提示
        this.showLootPickup(loot);

        return loot;
    }

    getLootValue(type) {
        switch (type) {
            case 'health': return 30;
            case 'shield': return 25;
            case 'ammo': return 15;
            default: return 10;
        }
    }

    showLootPickup(loot) {
        const pickup = document.createElement('div');
        pickup.className = 'loot-pickup';
        pickup.textContent = `+${loot.value} ${loot.type}`;
        pickup.style.left = loot.x + 'px';
        pickup.style.top = loot.y + 'px';

        document.getElementById('gameContainer').appendChild(pickup);

        setTimeout(() => {
            if (pickup.parentNode) {
                pickup.parentNode.removeChild(pickup);
            }
        }, 2000);
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save();

        // 受伤闪烁效果
        if (this.damageFlash) {
            ctx.globalAlpha = 0.5;
        }

        // 移动到敌人位置
        ctx.translate(this.x + this.width/2, this.y + this.height/2);

        // 绘制敌人身体
        this.drawEnemyBody(ctx);

        // 绘制武器
        this.drawEnemyWeapon(ctx);

        // 绘制血量条
        this.drawHealthBar(ctx);

        ctx.restore();
    }

    drawEnemyBody(ctx) {
        // 身体（根据类型使用不同颜色）
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 头部
        ctx.fillStyle = '#d35400';
        ctx.beginPath();
        ctx.ellipse(0, -6, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(-2, -6, 1, 1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(2, -6, 1, 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // 装备（根据类型）
        if (this.type === 'heavy') {
            // 重装甲
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(-8, -4, 16, 12);
        } else if (this.type === 'scout') {
            // 轻装
            ctx.fillStyle = '#34495e';
            ctx.fillRect(-6, -2, 12, 8);
        } else {
            // 普通装备
            ctx.fillStyle = '#34495e';
            ctx.fillRect(-7, -3, 14, 10);
        }

        // 腿部
        ctx.fillStyle = this.color;
        ctx.fillRect(-3, 6, 2, 6);
        ctx.fillRect(1, 6, 2, 6);
    }

    drawEnemyWeapon(ctx) {
        ctx.save();
        ctx.rotate(this.angle);

        // 绘制武器
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(8, -2, 15, 4);

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, -4, 10, 8);

        ctx.restore();
    }

    drawHealthBar(ctx) {
        // 只在受伤时显示血量条
        if (this.health < this.maxHealth) {
            const barWidth = 20;
            const barHeight = 3;
            const healthPercent = this.health / this.maxHealth;

            // 背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(-barWidth/2, -18, barWidth, barHeight);

            // 血量
            ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' :
                           healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
            ctx.fillRect(-barWidth/2, -18, barWidth * healthPercent, barHeight);
        }
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