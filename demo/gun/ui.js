// UI管理类
class UIManager {
    constructor() {
        this.elements = {
            healthFill: document.getElementById('healthFill'),
            healthText: document.getElementById('healthText'),
            shieldFill: document.getElementById('shieldFill'),
            shieldText: document.getElementById('shieldText'),
            currentAmmo: document.getElementById('currentAmmo'),
            reloadIndicator: document.getElementById('reloadIndicator'),
            reloadBar: document.getElementById('reloadBar'),
            killCount: document.getElementById('killCount'),
            startScreen: document.getElementById('startScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            finalKills: document.getElementById('finalKills')
        };

        this.gameState = 'menu'; // menu, playing, gameOver
        this.kills = 0;
    }

    updatePlayerStats(player) {
        // 更新血量
        const healthPercent = (player.health / player.maxHealth) * 100;
        this.elements.healthFill.style.width = healthPercent + '%';
        this.elements.healthText.textContent = Math.ceil(player.health);

        // 更新护盾
        const shieldPercent = (player.shield / player.maxShield) * 100;
        this.elements.shieldFill.style.width = shieldPercent + '%';
        this.elements.shieldText.textContent = Math.ceil(player.shield);

        // 更新弹药
        this.elements.currentAmmo.textContent = player.weapon.currentAmmo;

        // 更新换弹状态
        if (player.weapon.isReloading) {
            this.elements.reloadIndicator.classList.remove('hidden');
            const progress = player.weapon.getReloadProgress() * 100;
            this.elements.reloadBar.style.width = progress + '%';
        } else {
            this.elements.reloadIndicator.classList.add('hidden');
        }
    }

    addKill() {
        this.kills++;
        this.elements.killCount.textContent = this.kills;
    }

    showStartScreen() {
        this.gameState = 'menu';
        this.elements.startScreen.classList.remove('hidden');
        this.elements.gameOverScreen.classList.add('hidden');
    }

    hideStartScreen() {
        this.elements.startScreen.classList.add('hidden');
    }

    showGameOverScreen() {
        this.gameState = 'gameOver';
        this.elements.finalKills.textContent = this.kills;
        this.elements.gameOverScreen.classList.remove('hidden');
    }

    hideGameOverScreen() {
        this.elements.gameOverScreen.classList.add('hidden');
    }

    resetGame() {
        this.kills = 0;
        this.elements.killCount.textContent = '0';
        this.gameState = 'playing';
    }

    // 显示伤害数字
    showDamageNumber(x, y, damage, isPlayer = false) {
        const damageElement = document.createElement('div');
        damageElement.className = 'damage-number';
        damageElement.textContent = '-' + damage;
        damageElement.style.position = 'absolute';
        damageElement.style.left = x + 'px';
        damageElement.style.top = y + 'px';
        damageElement.style.color = isPlayer ? '#e74c3c' : '#f39c12';
        damageElement.style.fontWeight = 'bold';
        damageElement.style.fontSize = '16px';
        damageElement.style.pointerEvents = 'none';
        damageElement.style.zIndex = '20';
        damageElement.style.animation = 'damageFloat 1s ease-out forwards';

        document.getElementById('gameContainer').appendChild(damageElement);

        setTimeout(() => {
            if (damageElement.parentNode) {
                damageElement.parentNode.removeChild(damageElement);
            }
        }, 1000);
    }

    // 显示击杀提示
    showKillFeed(enemyType) {
        const killElement = document.createElement('div');
        killElement.className = 'kill-feed';
        killElement.textContent = `击杀 ${enemyType}`;
        killElement.style.position = 'absolute';
        killElement.style.top = '120px';
        killElement.style.right = '20px';
        killElement.style.color = '#e74c3c';
        killElement.style.fontWeight = 'bold';
        killElement.style.fontSize = '18px';
        killElement.style.pointerEvents = 'none';
        killElement.style.zIndex = '15';
        killElement.style.animation = 'killFeedSlide 3s ease-out forwards';

        document.getElementById('gameContainer').appendChild(killElement);

        setTimeout(() => {
            if (killElement.parentNode) {
                killElement.parentNode.removeChild(killElement);
            }
        }, 3000);
    }

    // 显示低血量警告
    showLowHealthWarning(show) {
        let warningElement = document.getElementById('lowHealthWarning');

        if (show && !warningElement) {
            warningElement = document.createElement('div');
            warningElement.id = 'lowHealthWarning';
            warningElement.style.position = 'absolute';
            warningElement.style.top = '0';
            warningElement.style.left = '0';
            warningElement.style.width = '100%';
            warningElement.style.height = '100%';
            warningElement.style.background = 'radial-gradient(circle, transparent 60%, rgba(231, 76, 60, 0.3) 100%)';
            warningElement.style.pointerEvents = 'none';
            warningElement.style.zIndex = '5';
            warningElement.style.animation = 'pulse 1s infinite';

            document.getElementById('gameContainer').appendChild(warningElement);
        } else if (!show && warningElement) {
            warningElement.parentNode.removeChild(warningElement);
        }
    }

    // 显示护盾破碎效果
    showShieldBreakEffect() {
        const effectElement = document.createElement('div');
        effectElement.className = 'shield-break-effect';
        effectElement.style.position = 'absolute';
        effectElement.style.top = '0';
        effectElement.style.left = '0';
        effectElement.style.width = '100%';
        effectElement.style.height = '100%';
        effectElement.style.background = 'radial-gradient(circle, transparent 40%, rgba(52, 152, 219, 0.5) 60%, transparent 80%)';
        effectElement.style.pointerEvents = 'none';
        effectElement.style.zIndex = '8';
        effectElement.style.animation = 'shieldBreak 0.5s ease-out forwards';

        document.getElementById('gameContainer').appendChild(effectElement);

        setTimeout(() => {
            if (effectElement.parentNode) {
                effectElement.parentNode.removeChild(effectElement);
            }
        }, 500);
    }

    // 显示换弹提示
    showReloadPrompt() {
        let promptElement = document.getElementById('reloadPrompt');

        if (!promptElement) {
            promptElement = document.createElement('div');
            promptElement.id = 'reloadPrompt';
            promptElement.textContent = '按 R 键换弹';
            promptElement.style.position = 'absolute';
            promptElement.style.bottom = '200px';
            promptElement.style.right = '30px';
            promptElement.style.color = '#e67e22';
            promptElement.style.fontWeight = 'bold';
            promptElement.style.fontSize = '18px';
            promptElement.style.pointerEvents = 'none';
            promptElement.style.zIndex = '15';
            promptElement.style.animation = 'blink 1s infinite';

            document.getElementById('gameContainer').appendChild(promptElement);

            setTimeout(() => {
                if (promptElement.parentNode) {
                    promptElement.parentNode.removeChild(promptElement);
                }
            }, 3000);
        }
    }

    // 显示波次信息
    showWaveInfo(waveNumber, enemiesRemaining) {
        let waveElement = document.getElementById('waveInfo');

        if (!waveElement) {
            waveElement = document.createElement('div');
            waveElement.id = 'waveInfo';
            waveElement.style.position = 'absolute';
            waveElement.style.top = '120px';
            waveElement.style.left = '20px';
            waveElement.style.color = 'white';
            waveElement.style.fontWeight = 'bold';
            waveElement.style.fontSize = '16px';
            waveElement.style.pointerEvents = 'none';
            waveElement.style.zIndex = '15';
            waveElement.style.background = 'rgba(0, 0, 0, 0.7)';
            waveElement.style.padding = '10px';
            waveElement.style.borderRadius = '5px';

            document.getElementById('gameContainer').appendChild(waveElement);
        }

        waveElement.innerHTML = `
            <div>第 ${waveNumber} 波</div>
            <div>剩余敌人: ${enemiesRemaining}</div>
        `;
    }

    hideWaveInfo() {
        const waveElement = document.getElementById('waveInfo');
        if (waveElement) {
            waveElement.parentNode.removeChild(waveElement);
        }
    }

    // 显示新波次开始
    showNewWave(waveNumber) {
        const waveElement = document.createElement('div');
        waveElement.className = 'new-wave';
        waveElement.textContent = `第 ${waveNumber} 波开始!`;
        waveElement.style.position = 'absolute';
        waveElement.style.top = '50%';
        waveElement.style.left = '50%';
        waveElement.style.transform = 'translate(-50%, -50%)';
        waveElement.style.color = '#e74c3c';
        waveElement.style.fontWeight = 'bold';
        waveElement.style.fontSize = '48px';
        waveElement.style.pointerEvents = 'none';
        waveElement.style.zIndex = '20';
        waveElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
        waveElement.style.animation = 'waveAnnounce 3s ease-out forwards';

        document.getElementById('gameContainer').appendChild(waveElement);

        setTimeout(() => {
            if (waveElement.parentNode) {
                waveElement.parentNode.removeChild(waveElement);
            }
        }, 3000);
    }
}

// 添加CSS动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes damageFloat {
        0% {
            transform: translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateY(-30px);
            opacity: 0;
        }
    }

    @keyframes killFeedSlide {
        0% {
            transform: translateX(100px);
            opacity: 0;
        }
        20% {
            transform: translateX(0);
            opacity: 1;
        }
        80% {
            transform: translateX(0);
            opacity: 1;
        }
        100% {
            transform: translateX(100px);
            opacity: 0;
        }
    }

    @keyframes shieldBreak {
        0% {
            opacity: 1;
            transform: scale(0.8);
        }
        50% {
            opacity: 0.8;
            transform: scale(1.2);
        }
        100% {
            opacity: 0;
            transform: scale(1.5);
        }
    }

    @keyframes blink {
        0%, 50% {
            opacity: 1;
        }
        51%, 100% {
            opacity: 0.3;
        }
    }

    @keyframes waveAnnounce {
        0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
        }
        20% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        80% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);