class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.players = [];
        this.projectiles = [];
        this.particles = [];
        this.keys = {};
        this.gameRunning = false;
        this.score = [0, 0];
        this.lastTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;

        this.init();
        this.bindEvents();
    }

    init() {
        // 创建玩家1 - 大个子角色（浩克）
        this.players[0] = new Character(
            100, 300, 'p1', 'hulk',
            { width: 120, height: 150, speed: 2, health: 200, damage: 30, attackRange: 80 }
        );

        // 创建玩家2 - 小个子角色（蜘蛛侠）
        this.players[1] = new Character(
            700, 300, 'p2', 'spider',
            { width: 60, height: 80, speed: 5, health: 100, damage: 10, attackRange: 50 }
        );

        this.updateHealthBars();
    }

    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    startGame() {
        this.gameRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    resetGame() {
        this.gameRunning = false;
        this.projectiles = [];
        this.particles = [];

        // 重置角色
        this.players[0].reset(100, 300);
        this.players[1].reset(700, 300);

        // 重置分数
        this.score = [0, 0];
        document.querySelectorAll('.score').forEach(el => el.textContent = '0');

        this.updateHealthBars();
    }

    updateHealthBars() {
        document.getElementById('p1-health').style.width = `${(this.players[0].health / this.players[0].maxHealth) * 100}%`;
        document.getElementById('p2-health').style.width = `${(this.players[1].health / this.players[1].maxHealth) * 100}%`;
    }

    handleInput() {
        // 玩家1控制
        const p1 = this.players[0];
        if (this.keys['w']) p1.move(0, -1);
        if (this.keys['s']) p1.move(0, 1);
        if (this.keys['a']) p1.move(-1, 0);
        if (this.keys['d']) p1.move(1, 0);
        if (this.keys['j']) p1.attack(this.players[1], this.projectiles);
        if (this.keys['k']) p1.specialAttack(this.players[1], this.projectiles);

        // 玩家2控制
        const p2 = this.players[1];
        if (this.keys['arrowup']) p2.move(0, -1);
        if (this.keys['arrowdown']) p2.move(0, 1);
        if (this.keys['arrowleft']) p2.move(-1, 0);
        if (this.keys['arrowright']) p2.move(1, 0);
        if (this.keys['1']) p2.attack(this.players[0], this.projectiles);
        if (this.keys['2']) p2.specialAttack(this.players[0], this.projectiles);
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update();

            // 检测碰撞
            const target = projectile.target;
            if (this.checkCollision(projectile, target)) {
                // 造成伤害
                target.takeDamage(projectile.damage);
                this.createExplosion(projectile.x, projectile.y);
                this.updateHealthBars();

                // 检查是否有玩家死亡
                if (target.health <= 0) {
                    this.endRound(projectile.shooter);
                }

                return false;
            }

            // 超出边界
            return projectile.x > 0 && projectile.x < this.canvas.width &&
                   projectile.y > 0 && projectile.y < this.canvas.height;
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(
                x, y,
                Math.random() * 8 - 4,
                Math.random() * 8 - 4,
                Math.random() * 20 + 10,
                `hsl(${Math.random() * 360}, 100%, 70%)`
            ));
        }
    }

    endRound(winner) {
        const winnerIndex = winner.id === 'p1' ? 0 : 1;
        this.score[winnerIndex]++;
        document.querySelectorAll('.score')[winnerIndex].textContent = this.score[winnerIndex];

        // 播放胜利动画
        this.createWinAnimation(winner);

        // 重置角色位置
        setTimeout(() => {
            this.players[0].reset(100, 300);
            this.players[1].reset(700, 300);
            this.projectiles = [];
            this.updateHealthBars();
        }, 2000);
    }

    createWinAnimation(winner) {
        const colors = winner.id === 'p1' ? ['#ff0000', '#ff6600'] : ['#0000ff', '#0066ff'];

        for (let i = 0; i < 50; i++) {
            this.particles.push(new Particle(
                winner.x + winner.width / 2,
                winner.y + winner.height / 2,
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
                Math.random() * 30 + 20,
                colors[Math.floor(Math.random() * colors.length)]
            ));
        }
    }

    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.drawBackground();

        // 绘制角色
        this.players.forEach(player => player.render(this.ctx));

        // 绘制弹幕
        this.projectiles.forEach(projectile => projectile.render(this.ctx));

        // 绘制粒子效果
        this.particles.forEach(particle => particle.render(this.ctx));
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制星星
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    gameLoop() {
        if (!this.gameRunning) return;

        const currentTime = performance.now();
        const elapsedTime = currentTime - this.lastTime;

        if (elapsedTime >= this.frameInterval) {
            this.lastTime = currentTime - (elapsedTime % this.frameInterval);

            this.handleInput();
            this.players.forEach(player => player.update());
            this.updateProjectiles();
            this.updateParticles();
            this.render();
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

class Character {
    constructor(x, y, id, type, stats) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.width = stats.width;
        this.height = stats.height;
        this.speed = stats.speed;
        this.health = stats.health;
        this.maxHealth = stats.health;
        this.damage = stats.damage;
        this.attackRange = stats.attackRange;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.direction = id === 'p1' ? 1 : -1;
        this.animFrame = 0;
        this.animSpeed = 0.2;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.health = this.maxHealth;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.direction = this.id === 'p1' ? 1 : -1;
    }

    move(dx, dy) {
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;

        if (newX > 0 && newX < 800 - this.width) {
            this.x = newX;
            this.direction = dx !== 0 ? dx : this.direction;
        }
        if (newY > 0 && newY < 600 - this.height) {
            this.y = newY;
        }
    }

    attack(target, projectiles) {
        if (this.attackCooldown > 0) return;

        const distance = Math.sqrt(
            Math.pow(target.x - this.x, 2) + Math.pow(target.y - this.y, 2)
        );

        if (distance <= this.attackRange) {
            target.takeDamage(this.damage);
            this.attackCooldown = 60;
        }
    }

    specialAttack(target, projectiles) {
        if (this.specialCooldown > 0) return;

        const projectile = new Projectile(
            this.x + this.width / 2,
            this.y + this.height / 2,
            target,
            this,
            this.damage * 2,
            this.type
        );

        projectiles.push(projectile);
        this.specialCooldown = 120;
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        this.animFrame = 0; // 触发受伤动画
    }

    update() {
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;

        this.animFrame += this.animSpeed;
        if (this.animFrame > 3) this.animFrame = 0;
    }

    render(ctx) {
        ctx.save();

        // 受伤效果
        if (this.animFrame < 1) {
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        // 绘制角色
        ctx.globalAlpha = 1;
        if (this.type === 'hulk') {
            this.drawHulk(ctx);
        } else if (this.type === 'spider') {
            this.drawSpider(ctx);
        }

        ctx.restore();
    }

    drawHulk(ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制面部
        ctx.fillStyle = '#388E3C';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 40, 30, 0, Math.PI * 2);
        ctx.fill();

        // 绘制眼睛
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 10, this.y + 35, 8, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 10, this.y + 35, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 10, this.y + 35, 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 10, this.y + 35, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSpider(ctx) {
        ctx.fillStyle = '#E91E63';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制面具
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 25, 15, 0, Math.PI * 2);
        ctx.fill();

        // 绘制蜘蛛眼睛
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 8, this.y + 25, 5, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 8, this.y + 25, 5, 0, Math.PI * 2);
        ctx.fill();

        // 绘制蜘蛛标志
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 45);
        ctx.lineTo(this.x + this.width / 2 - 10, this.y + 60);
        ctx.lineTo(this.x + this.width / 2 + 10, this.y + 60);
        ctx.closePath();
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, target, shooter, damage, type) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.shooter = shooter;
        this.damage = damage;
        this.type = type;
        this.speed = type === 'hulk' ? 8 : 12;
        this.width = type === 'hulk' ? 20 : 10;
        this.height = type === 'hulk' ? 20 : 10;

        // 计算角度
        const angle = Math.atan2(target.y - y, target.x - x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    render(ctx) {
        ctx.save();

        if (this.type === 'hulk') {
            // 绿巨人的弹幕 - 巨大的绿色球体
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.width
            );
            gradient.addColorStop(0, '#8BC34A');
            gradient.addColorStop(1, '#4CAF50');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'spider') {
            // 蜘蛛侠的弹幕 - 红色蛛网
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }

        ctx.restore();
    }
}

class Particle {
    constructor(x, y, vx, vy, life, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = Math.random() * 5 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 游戏入口
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});