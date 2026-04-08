class WheelSpinner {
    constructor() {
        this.wheel = document.getElementById('wheel');
        this.spinBtn = document.getElementById('spinBtn');
        this.resultText = document.getElementById('resultText');
        this.isSpinning = false;

        // 定义人员和任务
        this.people = ['大豆', '小豆', '爸爸'];
        this.tasks = ['拖地客厅', '收拾桌子', '洗碗'];
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];

        this.init();
    }

    init() {
        this.spinBtn.addEventListener('click', () => this.spin());
    }

    // 随机打乱数组
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    spin() {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.textContent = '分配中...';
        this.resultText.textContent = '正在随机分配家务，请稍候...';
        this.resultText.className = '';

        // 生成随机旋转角度 (至少转3圈，最多转6圈)
        const minRotation = 1080; // 3圈
        const maxRotation = 2160; // 6圈
        const randomRotation = Math.random() * (maxRotation - minRotation) + minRotation;

        // 设置CSS变量用于动画
        this.wheel.style.setProperty('--rotation', `${randomRotation}deg`);
        this.wheel.classList.add('spinning');

        // 3秒后停止并显示结果
        setTimeout(() => {
            this.showResult();
            this.resetButton();
        }, 3000);
    }

    showResult() {
        // 随机打乱任务数组
        const shuffledTasks = this.shuffleArray(this.tasks);

        // 创建分配结果
        const assignments = this.people.map((person, index) => ({
            person: person,
            task: shuffledTasks[index],
            color: this.colors[index]
        }));

        // 显示结果
        this.displayResult(assignments);

        // 添加庆祝效果
        this.addCelebrationEffect();
    }

    displayResult(assignments) {
        let resultHTML = '<div style="text-align: left; max-width: 300px; margin: 0 auto;">';

        assignments.forEach((assignment, index) => {
            resultHTML += `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    margin: 8px 0;
                    background: linear-gradient(45deg, ${assignment.color}20, ${assignment.color}10);
                    border-left: 4px solid ${assignment.color};
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                ">
                    <span style="
                        font-weight: bold;
                        font-size: 18px;
                        color: ${assignment.color};
                    ">${assignment.person}</span>
                    <span style="
                        font-size: 16px;
                        color: #666;
                        text-align: right;
                    ">${assignment.task}</span>
                </div>
            `;
        });

        resultHTML += '</div>';
        resultHTML += '<div style="margin-top: 20px; font-size: 16px; color: #888;">🎉 分配完成！大家加油！</div>';

        this.resultText.innerHTML = resultHTML;
        this.resultText.className = 'result-highlight';
    }

    addCelebrationEffect() {
        // 创建简单的庆祝动画
        const container = document.querySelector('.container');
        container.style.animation = 'celebration 0.6s ease-in-out';

        setTimeout(() => {
            container.style.animation = '';
        }, 600);
    }

    resetButton() {
        this.isSpinning = false;
        this.spinBtn.disabled = false;
        this.spinBtn.textContent = '重新分配';
        this.wheel.classList.remove('spinning');
    }
}

// 添加庆祝动画的CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes celebration {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    .wheel.spinning {
        transform: rotate(var(--rotation));
    }
`;
document.head.appendChild(style);

// 初始化转盘
document.addEventListener('DOMContentLoaded', () => {
    new WheelSpinner();
});

// 添加一些额外的交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 鼠标悬停效果
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            if (!document.querySelector('.wheel').classList.contains('spinning')) {
                section.style.transform += ' scale(1.1)';
                section.style.zIndex = '5';
            }
        });

        section.addEventListener('mouseleave', () => {
            section.style.transform = section.style.transform.replace(' scale(1.1)', '');
            section.style.zIndex = '';
        });
    });

    // 添加键盘支持
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            document.getElementById('spinBtn').click();
        }
    });
});