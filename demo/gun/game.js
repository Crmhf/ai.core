// 主游戏类
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 游戏状态
        this.gameState = 'menu'; // menu, playing, gameOver
        this.isPaused = false;

        // 游戏对象
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.map = new GameMap();
        this.ui = new UIManager();

        // 场景管理
        this.currentScene = 'military';
        this.backgroundImage = null;
        this.loadBackgroundImage();

        // 输入处理
        this.keys = {};
        this.mouse = { x: 0, y: 0, isDown: false };

        // 游戏循环
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);

        // 波次系统
        this.currentWave = 1;
        this.enemiesPerWave = 5;
        this.waveStartTime = 0;
        this.timeBetweenWaves = 5000; // 5秒
        this.isWaveActive = false;

        // 初始化
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUI();
        this.setupSceneSelector();
        this.ui.showStartScreen();
    }

    loadBackgroundImage() {
        this.backgroundImage = new Image();
        this.backgroundImage.src = `bg/${this.currentScene}_background.svg`;
    }

    setupSceneSelector() {
        const sceneOptions = document.querySelectorAll('.scene-option');
        sceneOptions.forEach(option => {
            option.addEventListener('click', () => {
                // 移除其他选项的active类
                sceneOptions.forEach(opt => opt.classList.remove('active'));
                // 添加当前选项的active类
                option.classList.add('active');
                // 设置当前场景
                this.currentScene = option.dataset.scene;
                this.loadBackgroundImage();
                // 更新地图主题
                this.map.setTheme(this.currentScene);
            });
        });
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (this.gameState === 'playing') {
                // R键换弹
                if (e.code === 'KeyR') {
                    this.player.reload();
                }

                // ESC键暂停
                if (e.code === 'Escape') {
                    this.togglePause();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.gameState === 'playing' && !this.isPaused) {
                this.mouse.isDown = true;
                this.handleShooting();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.mouse.isDown = false;
        });

        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 失去焦点时暂停游戏
        window.addEventListener('blur', () => {
            if (this.gameState === 'playing') {
                this.isPaused = true;
            }
        });
    }

    setupUI() {
        // 开始按钮
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        // 重新开始按钮
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        this.gameState = 'playing';
        this.ui.hideStartScreen();
        this.ui.resetGame();

        // 初始化游戏对象
        this.player = new Player(100, 300);
        this.enemies = [];
        this.bullets = [];

        // 重置波次
        this.currentWave = 1;
        this.isWaveActive = false;
        this.waveStartTime = Date.now();

        // 确保背景图片已加载
        this.loadBackgroundImage();

        // 开始游戏循环
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    restartGame() {
        this.ui.hideGameOverScreen();
        // 重置游戏状态
        this.gameState = 'menu';
        this.isPaused = false;

        // 清理游戏对象
        this.player = null;
        this.enemies = [];
        this.bullets = [];

        // 显示开始界面
        this.ui.showStartScreen();
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (!this.isPaused) {
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing' || this.isPaused) {
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // 更新游戏
        this.update(deltaTime);

        // 渲染游戏
        this.render();

        // 继续游戏循环
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // 更新玩家
        if (this.player && this.player.isAlive) {
            this.player.handleInput(this.keys, this.mouse.x, this.mouse.y);
            this.player.update(this.map.obstacles);

            // 检查玩家死亡
            if (!this.player.isAlive) {
                this.gameOver();
                return;
            }
        }

        // 更新敌人
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.isAlive) {
                enemy.update(this.player, this.map.obstacles, this.enemies);

                // 敌人射击
                if (enemy.state === 'attack') {
                    const bullet = enemy.shoot(this.player);
                    if (bullet) {
                        this.bullets.push(bullet);
                    }
                }
            } else {
                // 移除死亡的敌人
                this.enemies.splice(i, 1);
                this.ui.addKill();
                this.ui.showKillFeed(enemy.type);
            }
        }

        // 更新子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            if (!bullet.update()) {
                this.bullets.splice(i, 1);
                continue;
            }

            // 检查子弹碰撞
            this.checkBulletCollisions(bullet, i);
        }

        // 波次管理
        this.updateWaveSystem();

        // 更新UI
        this.ui.updatePlayerStats(this.player);

        // 显示换弹提示
        if (this.player.weapon.currentAmmo === 0 && !this.player.weapon.isReloading) {
            this.ui.showReloadPrompt();
        }

        // 低血量警告
        this.ui.showLowHealthWarning(this.player.health < 50);
    }

    handleShooting() {
        if (this.player && this.player.isAlive) {
            const bullet = this.player.shoot();
            if (bullet) {
                this.bullets.push(bullet);
            }
        }
    }

    checkBulletCollisions(bullet, bulletIndex) {
        // 检查与障碍物的碰撞
        for (const obstacle of this.map.obstacles) {
            if (bullet.checkCollision(obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                this.bullets.splice(bulletIndex, 1);
                return;
            }
        }

        // 检查玩家子弹与敌人的碰撞
        if (bullet.owner === 'player') {
            for (let i = 0; i < this.enemies.length; i++) {
                const enemy = this.enemies[i];

                if (enemy.isAlive &&
                    bullet.checkCollision(enemy.x, enemy.y, enemy.width, enemy.height)) {

                    // 造成伤害
                    const killed = enemy.takeDamage(bullet.damage);

                    // 显示伤害数字
                    this.ui.showDamageNumber(enemy.getCenterX(), enemy.getCenterY(), bullet.damage);

                    // 移除子弹
                    this.bullets.splice(bulletIndex, 1);

                    if (killed) {
                        // 处理物资掉落
                        this.handleLootDrop(enemy);
                    }

                    return;
                }
            }
        }

        // 检查敌人子弹与玩家的碰撞
        if (bullet.owner === 'enemy' && this.player.isAlive) {
            if (bullet.checkCollision(this.player.x, this.player.y, this.player.width, this.player.height)) {

                // 计算攻击者位置（简化为子弹起始位置）
                const attackerX = bullet.x - bullet.vx * 10;
                const attackerY = bullet.y - bullet.vy * 10;

                // 造成伤害
                const killed = this.player.takeDamage(bullet.damage, attackerX, attackerY);

                // 显示伤害数字
                this.ui.showDamageNumber(this.player.getCenterX(), this.player.getCenterY(), bullet.damage, true);

                // 护盾破碎效果
                if (this.player.shield <= 0) {
                    this.ui.showShieldBreakEffect();
                }

                // 移除子弹
                this.bullets.splice(bulletIndex, 1);

                return;
            }
        }
    }

    handleLootDrop(enemy) {
        // 简化的物资掉落处理
        const loot = enemy.dropLoot();

        // 自动拾取物资（简化版本）
        setTimeout(() => {
            switch (loot.type) {
                case 'health':
                    this.player.health = Math.min(this.player.health + loot.value, this.player.maxHealth);
                    break;
                case 'shield':
                    this.player.shield = Math.min(this.player.shield + loot.value, this.player.maxShield);
                    break;
                case 'ammo':
                    // 弹药无限，这里可以加其他效果
                    break;
            }
        }, 1000);
    }

    updateWaveSystem() {
        const now = Date.now();

        if (!this.isWaveActive) {
            // 检查是否开始新波次
            if (this.enemies.length === 0 && now - this.waveStartTime > this.timeBetweenWaves) {
                this.startNewWave();
            }
        } else {
            // 更新波次信息
            this.ui.showWaveInfo(this.currentWave, this.enemies.length);
        }
    }

    startNewWave() {
        this.isWaveActive = true;
        this.ui.showNewWave(this.currentWave);

        // 计算这一波的敌人数量
        const enemyCount = this.enemiesPerWave + Math.floor(this.currentWave / 3);

        // 生成敌人
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                this.spawnEnemy();
            }, i * 1000); // 每秒生成一个敌人
        }

        // 准备下一波
        this.currentWave++;
        this.waveStartTime = Date.now();

        setTimeout(() => {
            this.isWaveActive = false;
        }, enemyCount * 1000 + 2000);
    }

    spawnEnemy() {
        // 选择敌人类型
        const types = ['soldier', 'soldier', 'scout', 'heavy']; // 士兵更常见
        const weights = [0.5, 0.3, 0.15, 0.05]; // 权重

        let enemyType = 'soldier';
        const random = Math.random();
        let cumulative = 0;

        for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                enemyType = types[i];
                break;
            }
        }

        // 获取安全的生成位置
        const position = this.map.getSafeSpawnPosition(18, 18, 200);

        // 创建敌人
        const enemy = new Enemy(position.x, position.y, enemyType);
        this.enemies.push(enemy);
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.ui.showGameOverScreen();
        this.ui.hideWaveInfo();
    }

    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景图片
        if (this.backgroundImage && this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // 如果背景图片未加载，使用默认背景
            this.ctx.fillStyle = '#2c5530';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 绘制地图障碍物
        this.map.draw(this.ctx);

        // 绘制子弹
        for (const bullet of this.bullets) {
            bullet.draw(this.ctx);
        }

        // 绘制敌人
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx);
        }

        // 绘制玩家
        if (this.player) {
            this.player.draw(this.ctx);
        }

        // 绘制准星
        this.drawCrosshair();

        // 绘制暂停提示
        if (this.isPaused) {
            this.drawPauseScreen();
        }
    }

    drawCrosshair() {
        const size = 10;
        const x = this.mouse.x;
        const y = this.mouse.y;

        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x + size, y);
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x, y + size);
        this.ctx.stroke();

        // 中心点
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
    }

    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.font = '24px Arial';
        this.ctx.fillText('按ESC继续游戏', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
}

// 游戏初始化
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});