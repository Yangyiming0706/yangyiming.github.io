// 全局变量
let towerList = [[], [], []];
let diskHeight = 24;
let selectPole = -1;
let step = 0;
let history = [];
let isAutoRun = false;
let diskCount = 4;

// DOM
const poles = document.querySelectorAll('.pole');
const stepDom = document.getElementById('stepNum');
const winDom = document.getElementById('winText');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const autoBtn = document.getElementById('autoBtn');
const diffSelect = document.getElementById('diffSelect');

// 初始化游戏
function initGame(num) {
    diskCount = num;
    towerList = [[], [], []];
    selectPole = -1;
    step = 0;
    history = [];
    isAutoRun = false;
    winDom.innerText = '';
    stepDom.innerText = step;
    poles.forEach(p => {
        p.innerHTML = '';
        p.classList.remove('active');
    });

    // 初始化左侧柱子圆盘
    for (let i = num; i >= 1; i--) {
        towerList[0].push(i);
    }
    render();
}

// 渲染页面
function render() {
    poles.forEach((pole, idx) => {
        pole.innerHTML = '';
        towerList[idx].forEach((disk, dIdx) => {
            const div = document.createElement('div');
            div.className = `disk d${disk}`;
            div.style.bottom = dIdx * diskHeight + 'px';
            div.dataset.disk = disk;
            div.dataset.pole = idx;
            pole.appendChild(div);
        });
    });
}

// 移动圆盘（规则判断）
function moveDisk(from, to) {
    if (from === to) return false;
    if (towerList[from].length === 0) return false;

    const topFrom = towerList[from][towerList[from].length - 1];
    const topTo = towerList[to][towerList[to].length - 1];

    if (topTo && topFrom > topTo) return false;

    // 记录历史（撤销用）
    history.push({ from, to });

    towerList[to].push(towerList[from].pop());
    step++;
    stepDom.innerText = step;
    render();
    checkWin();
    return true;
}

// 撤销上一步
function undoMove() {
    if (history.length === 0 || isAutoRun) return;
    const last = history.pop();
    const from = last.to;
    const to = last.from;

    towerList[to].push(towerList[from].pop());
    step--;
    stepDom.innerText = step;
    winDom.innerText = '';
    render();
}

// 判断胜利
function checkWin() {
    if (towerList[2].length === diskCount) {
        winDom.innerText = `恭喜通关！共用 ${step} 步`;
    }
}

// 柱子点击事件
poles.forEach((pole, idx) => {
    pole.addEventListener('click', () => {
        if (isAutoRun) return;
        if (selectPole === -1) {
            if (towerList[idx].length === 0) return;
            selectPole = idx;
            pole.classList.add('active');
        } else {
            moveDisk(selectPole, idx);
            poles[selectPole].classList.remove('active');
            selectPole = -1;
        }
    });
});

// 延时函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 递归汉诺塔自动演示
async function hanoi(n, a, b, c) {
    if (n === 0) return;
    await hanoi(n - 1, a, c, b);
    moveDisk(a, c);
    await sleep(700);
    await hanoi(n - 1, b, a, c);
}

// 自动演示按钮
autoBtn.addEventListener('click', async () => {
    if (isAutoRun) return;
    initGame(diskCount);
    isAutoRun = true;
    await sleep(300);
    await hanoi(diskCount, 0, 1, 2);
    isAutoRun = false;
});

// 重置按钮
resetBtn.addEventListener('click', () => {
    initGame(diskCount);
});

// 撤销按钮
undoBtn.addEventListener('click', undoMove);

// 切换难度
diffSelect.addEventListener('change', e => {
    const num = parseInt(e.target.value);
    initGame(num);
});

// 页面加载初始化
window.onload = () => {
    initGame(4);
};