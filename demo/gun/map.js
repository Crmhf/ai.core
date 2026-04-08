// 地图类
class GameMap {
    constructor() {
        this.width = 1200;
        this.height = 800;
        this.obstacles = [];
        this.spawnPoints = [];
        this.theme = 'military'; // 默认主题
        this.themeColors = this.getThemeColors();
        this.generateMap();
    }

    setTheme(theme) {
        this.theme = theme;
        this.themeColors = this.getThemeColors();
        this.generateMap(); // 重新生成地图以应用新主题
    }

    getThemeColors() {
        const themes = {
            military: {
                building: '#7f8c8d',
                building2: '#95a5a6',
                house: '#e67e22',
                house2: '#d35400',
                crate: '#8e44ad',
                crate2: '#9b59b6',
                pillar: '#34495e',
                pillar2: '#2c3e50',
                sandbag: '#d4ac0d',
                sandbag2: '#d68910',
                vehicle: '#1c2833',
                vehicle2: '#17202a',
                rock: '#566573',
                rock2: '#5d6d7e'
            },
            desert: {
                building: '#d2691e',
                building2: '#deb887',
                house: '#cd853f',
                house2: '#d2691e',
                crate: '#f4a460',
                crate2: '#daa520',
                pillar: '#8b7355',
                pillar2: '#a0522d',
                sandbag: '#deb887',
                sandbag2: '#d2691e',
                vehicle: '#654321',
                vehicle2: '#8b4513',
                rock: '#daa520',
                rock2: '#cd853f'
            },
            city: {
                building: '#2c3e50',
                building2: '#34495e',
                house: '#e74c3c',
                house2: '#c0392b',
                crate: '#9b59b6',
                crate2: '#8e44ad',
                pillar: '#1a252f',
                pillar2: '#2c3e50',
                sandbag: '#7f8c8d',
                sandbag2: '#95a5a6',
                vehicle: '#0d1117',
                vehicle2: '#1c2833',
                rock: '#34495e',
                rock2: '#2c3e50'
            }
        };
        return themes[this.theme] || themes.military;
    }

    generateMap() {
        // 清空现有障碍物
        this.obstacles = [];
        this.spawnPoints = [];

        // 创建边界墙（可选，因为已经有边界检查）
        // this.addWalls();

        // 创建建筑物和障碍物
        this.createBuildings();

        // 创建掩体
        this.createCover();

        // 设置敌人生成点
        this.setupSpawnPoints();
    }

    createBuildings() {
        // 大型建筑物
        this.obstacles.push({
            x: 100, y: 100, width: 150, height: 100,
            type: 'building', color: this.themeColors.building
        });

        this.obstacles.push({
            x: 400, y: 50, width: 120, height: 80,
            type: 'building', color: this.themeColors.building2
        });

        this.obstacles.push({
            x: 800, y: 150, width: 180, height: 120,
            type: 'building', color: this.themeColors.building
        });

        this.obstacles.push({
            x: 200, y: 400, width: 100, height: 150,
            type: 'building', color: this.themeColors.building2
        });

        this.obstacles.push({
            x: 600, y: 500, width: 140, height: 100,
            type: 'building', color: this.themeColors.building
        });

        this.obstacles.push({
            x: 900, y: 600, width: 120, height: 80,
            type: 'building', color: this.themeColors.building2
        });

        // 小房子
        this.obstacles.push({
            x: 50, y: 600, width: 80, height: 60,
            type: 'house', color: this.themeColors.house
        });

        this.obstacles.push({
            x: 1050, y: 100, width: 70, height: 50,
            type: 'house', color: this.themeColors.house2
        });

        this.obstacles.push({
            x: 500, y: 300, width: 60, height: 80,
            type: 'house', color: this.themeColors.house
        });
    }

    createCover() {
        // 创建各种掩体

        // 箱子
        this.obstacles.push({
            x: 300, y: 250, width: 40, height: 40,
            type: 'crate', color: this.themeColors.crate
        });

        this.obstacles.push({
            x: 700, y: 350, width: 35, height: 35,
            type: 'crate', color: this.themeColors.crate2
        });

        this.obstacles.push({
            x: 150, y: 300, width: 45, height: 30,
            type: 'crate', color: this.themeColors.crate
        });

        // 柱子
        this.obstacles.push({
            x: 450, y: 200, width: 20, height: 20,
            type: 'pillar', color: this.themeColors.pillar
        });

        this.obstacles.push({
            x: 650, y: 250, width: 25, height: 25,
            type: 'pillar', color: this.themeColors.pillar2
        });

        // 沙袋
        this.obstacles.push({
            x: 350, y: 450, width: 60, height: 25,
            type: 'sandbag', color: this.themeColors.sandbag
        });

        this.obstacles.push({
            x: 750, y: 400, width: 50, height: 20,
            type: 'sandbag', color: this.themeColors.sandbag2
        });

        // 车辆残骸
        this.obstacles.push({
            x: 550, y: 650, width: 80, height: 40,
            type: 'vehicle', color: this.themeColors.vehicle
        });

        this.obstacles.push({
            x: 250, y: 550, width: 70, height: 35,
            type: 'vehicle', color: this.themeColors.vehicle2
        });

        // 岩石
        this.obstacles.push({
            x: 850, y: 450, width: 30, height: 25,
            type: 'rock', color: this.themeColors.rock
        });

        this.obstacles.push({
            x: 400, y: 600, width: 35, height: 30,
            type: 'rock', color: this.themeColors.rock2
        });
    }

    setupSpawnPoints() {
        // 设置敌人生成点（远离玩家起始位置）
        this.spawnPoints = [
            { x: 1100, y: 50 },
            { x: 1150, y: 200 },
            { x: 1000, y: 350 },
            { x: 1100, y: 500 },
            { x: 950, y: 700 },
            { x: 800, y: 750 },
            { x: 600, y: 50 },
            { x: 400, y: 750 },
            { x: 50, y: 300 },
            { x: 100, y: 500 }
        ];
    }

    getRandomSpawnPoint() {
        if (this.spawnPoints.length === 0) return { x: 1000, y: 100 };

        const index = Math.floor(Math.random() * this.spawnPoints.length);
        return this.spawnPoints[index];
    }

    // 检查位置是否与障碍物碰撞
    isPositionBlocked(x, y, width, height) {
        for (const obstacle of this.obstacles) {
            if (Utils.rectCollision(x, y, width, height,
                                  obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
                return true;
            }
        }
        return false;
    }

    // 获取安全的生成位置
    getSafeSpawnPosition(width, height, minDistanceFromPlayer = 200) {
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const spawnPoint = this.getRandomSpawnPoint();
            const x = spawnPoint.x + Utils.randomInt(-50, 50);
            const y = spawnPoint.y + Utils.randomInt(-50, 50);

            // 检查边界
            if (x < 0 || y < 0 || x + width > this.width || y + height > this.height) {
                attempts++;
                continue;
            }

            // 检查障碍物碰撞
            if (this.isPositionBlocked(x, y, width, height)) {
                attempts++;
                continue;
            }

            // 检查与玩家的距离（假设玩家在中心附近）
            const playerX = 600;
            const playerY = 400;
            const distance = Utils.distance(x + width/2, y + height/2, playerX, playerY);

            if (distance >= minDistanceFromPlayer) {
                return { x, y };
            }

            attempts++;
        }

        // 如果找不到安全位置，返回默认位置
        return { x: 1000, y: 100 };
    }

    draw(ctx) {
        // 只绘制障碍物，背景由游戏主类处理
        this.drawObstacles(ctx);
    }

    drawGround(ctx) {
        // 绘制地面纹理
        ctx.fillStyle = '#2c5530'; // 深绿色地面
        ctx.fillRect(0, 0, this.width, this.height);

        // 添加地面细节
        ctx.fillStyle = '#1e3a20';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 3 + 1;
            ctx.fillRect(x, y, size, size);
        }

        // 绘制网格线（可选，用于调试）
        if (false) { // 设置为true来显示网格
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;

            for (let x = 0; x < this.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.height);
                ctx.stroke();
            }

            for (let y = 0; y < this.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.width, y);
                ctx.stroke();
            }
        }
    }

    drawObstacles(ctx) {
        for (const obstacle of this.obstacles) {
            this.drawObstacle(ctx, obstacle);
        }
    }

    drawObstacle(ctx, obstacle) {
        ctx.save();

        switch (obstacle.type) {
            case 'building':
                this.drawBuilding(ctx, obstacle);
                break;
            case 'house':
                this.drawHouse(ctx, obstacle);
                break;
            case 'crate':
                this.drawCrate(ctx, obstacle);
                break;
            case 'pillar':
                this.drawPillar(ctx, obstacle);
                break;
            case 'sandbag':
                this.drawSandbag(ctx, obstacle);
                break;
            case 'vehicle':
                this.drawVehicle(ctx, obstacle);
                break;
            case 'rock':
                this.drawRock(ctx, obstacle);
                break;
            default:
                // 默认绘制
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }

        ctx.restore();
    }

    drawBuilding(ctx, building) {
        // 建筑主体
        ctx.fillStyle = building.color;
        ctx.fillRect(building.x, building.y, building.width, building.height);

        // 建筑阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(building.x + 3, building.y + 3, building.width, building.height);

        // 重新绘制主体
        ctx.fillStyle = building.color;
        ctx.fillRect(building.x, building.y, building.width, building.height);

        // 建筑细节
        ctx.fillStyle = '#5d6d7e';
        ctx.fillRect(building.x, building.y, building.width, 5); // 屋顶

        // 窗户
        ctx.fillStyle = '#1c2833';
        const windowSize = 8;
        const windowSpacing = 20;

        for (let x = building.x + 10; x < building.x + building.width - windowSize; x += windowSpacing) {
            for (let y = building.y + 15; y < building.y + building.height - windowSize; y += windowSpacing) {
                ctx.fillRect(x, y, windowSize, windowSize);
            }
        }
    }

    drawHouse(ctx, house) {
        // 房子主体
        ctx.fillStyle = house.color;
        ctx.fillRect(house.x, house.y, house.width, house.height);

        // 屋顶
        ctx.fillStyle = '#a04000';
        ctx.beginPath();
        ctx.moveTo(house.x - 5, house.y);
        ctx.lineTo(house.x + house.width/2, house.y - 15);
        ctx.lineTo(house.x + house.width + 5, house.y);
        ctx.closePath();
        ctx.fill();

        // 门
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(house.x + house.width/2 - 8, house.y + house.height - 20, 16, 20);

        // 窗户
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(house.x + 8, house.y + 15, 12, 12);
        ctx.fillRect(house.x + house.width - 20, house.y + 15, 12, 12);
    }

    drawCrate(ctx, crate) {
        // 箱子主体
        ctx.fillStyle = crate.color;
        ctx.fillRect(crate.x, crate.y, crate.width, crate.height);

        // 箱子边框
        ctx.strokeStyle = '#6c3483';
        ctx.lineWidth = 2;
        ctx.strokeRect(crate.x, crate.y, crate.width, crate.height);

        // 箱子细节
        ctx.strokeStyle = '#5b2c6f';
        ctx.beginPath();
        ctx.moveTo(crate.x + crate.width/2, crate.y);
        ctx.lineTo(crate.x + crate.width/2, crate.y + crate.height);
        ctx.moveTo(crate.x, crate.y + crate.height/2);
        ctx.lineTo(crate.x + crate.width, crate.y + crate.height/2);
        ctx.stroke();
    }

    drawPillar(ctx, pillar) {
        // 柱子主体
        ctx.fillStyle = pillar.color;
        ctx.fillRect(pillar.x, pillar.y, pillar.width, pillar.height);

        // 柱子顶部
        ctx.fillStyle = '#566573';
        ctx.fillRect(pillar.x - 2, pillar.y - 2, pillar.width + 4, 4);

        // 柱子底部
        ctx.fillRect(pillar.x - 2, pillar.y + pillar.height - 2, pillar.width + 4, 4);
    }

    drawSandbag(ctx, sandbag) {
        // 沙袋主体
        ctx.fillStyle = sandbag.color;
        ctx.beginPath();
        ctx.ellipse(sandbag.x + sandbag.width/2, sandbag.y + sandbag.height/2,
                   sandbag.width/2, sandbag.height/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 沙袋细节
        ctx.strokeStyle = '#b7950b';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawVehicle(ctx, vehicle) {
        // 车辆主体
        ctx.fillStyle = vehicle.color;
        ctx.fillRect(vehicle.x, vehicle.y, vehicle.width, vehicle.height);

        // 车窗
        ctx.fillStyle = '#5d6d7e';
        ctx.fillRect(vehicle.x + 5, vehicle.y + 5, vehicle.width - 10, vehicle.height/3);

        // 车轮
        ctx.fillStyle = '#1c2833';
        ctx.beginPath();
        ctx.arc(vehicle.x + 10, vehicle.y + vehicle.height - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(vehicle.x + vehicle.width - 10, vehicle.y + vehicle.height - 5, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRock(ctx, rock) {
        // 岩石主体
        ctx.fillStyle = rock.color;
        ctx.beginPath();
        ctx.ellipse(rock.x + rock.width/2, rock.y + rock.height/2,
                   rock.width/2, rock.height/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 岩石纹理
        ctx.fillStyle = '#4a5568';
        ctx.beginPath();
        ctx.ellipse(rock.x + rock.width/3, rock.y + rock.height/3,
                   rock.width/6, rock.height/6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}