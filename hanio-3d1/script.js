// 全局状态
let diskNum = 3;
// 三根柱子数组 栈结构
let pegs = [[], [], []];
let stepCount = 0;
let selectedDisk = null;
let isAutoRunning = false;
let delayTime = 800;

// DOM获取
const diskCountInput = document.getElementById('diskCount');
const speedSelect = document.getElementById('speedSelect');
const stepNumDom = document.getElementById('stepNum');
const resetBtn = document.getElementById('resetBtn');
const autoBtn = document.getElementById('autoBtn');
const statusTip = document.getElementById('statusTip');
const warnTip = document.getElementById('warnTip');
const winTip = document.getElementById('winTip');
const pegDoms = document.querySelectorAll('.peg');

// 初始化游戏（使用 slice 考点）
function initGame() {
    diskNum = parseInt(diskCountInput.value);
    delayTime = parseInt(speedSelect.value);
    stepCount = 0;
    stepNumDom.innerText = stepCount;

    selectedDisk = null;
    isAutoRunning = false;
    autoBtn.disabled = false;
    warnTip.innerText = '';
    winTip.classList.remove('glow-anim');
    statusTip.innerText = '请点击柱子选择圆盘';

    // slice 克隆清空数组 必用方法
    pegs = [[], [], []].slice(0);

    // 初始化圆盘 push 考点
    for (let i = diskNum; i >= 1; i--) {
        pegs[0].push(i);
    }
    renderDisk();
}

// 渲染圆盘（forEach 考点）
function renderDisk() {
    // 清空旧元素
    document.querySelectorAll('.disk').forEach(item => item.remove());

    // 遍历所有柱子 forEach 考点
    pegDoms.forEach((pegDom, index) => {
        const stack = pegs[index];
        // length 获取数组长度 考点
        const len = stack.length;

        stack.forEach((size, pos) => {
            const disk = document.createElement('div');
            disk.className = 'disk';
            disk.dataset.size = size;

            // 动态宽度
            const width = 60 + (size - 1) * (130 / (diskNum - 1));
            disk.style.width = width + 'px';
            disk.style.bottom = `${pos * 24}px`;
            // 圆盘渐变
            const hue = size * 35;
            disk.style.background = `linear-gradient(#ffffff, hsl(${hue}, 75%, 55%))`;

            pegDom.appendChild(disk);
        });
    });

    // 给选中圆盘加样式
    if (selectedDisk) {
        const targetPeg = pegDoms[selectedDisk.pegIdx];
        const diskList = targetPeg.querySelectorAll('.disk');
        if (diskList.length > 0) {
            diskList[diskList.length - 1].classList.add('active');
        }
    }
}

// 点击交互：选中+放置
pegDoms.forEach((pegDom, pegIdx) => {
    pegDom.addEventListener('click', () => {
        if (isAutoRunning) return;
        const currentStack = pegs[pegIdx];
        const stackLen = currentStack.length;

        // 第一次点击：选中圆盘
        if (!selectedDisk) {
            if (stackLen === 0) {
                statusTip.innerText = '该柱子暂无圆盘，请重新选择';
                return;
            }
            selectedDisk = {
                pegIdx: pegIdx,
                size: currentStack[stackLen - 1]
            };
            statusTip.innerText = `已选中圆盘，点击目标柱子放置`;
            renderDisk();
        } 
        // 第二次点击：放置圆盘
        else {
            const fromIdx = selectedDisk.pegIdx;
            const diskSize = selectedDisk.size;
            const targetStack = pegs[pegIdx];
            const targetLen = targetStack.length;

            // 移动规则判断
            if (targetLen === 0 || targetStack[targetLen - 1] > diskSize) {
                // pop / push 栈操作 考点
                pegs[fromIdx].pop();
                pegs[pegIdx].push(diskSize);
                stepCount++;
                stepNumDom.innerText = stepCount;
                statusTip.innerText = '移动成功，请继续操作';
            } else {
                // 非法移动警告+抖动动画
                showWarning('禁止将大圆盘放在小圆盘上！');
            }
            selectedDisk = null;
            renderDisk();
            checkWin();
        }
    });
});

// 非法提示动画
function showWarning(text) {
    warnTip.innerText = text;
    warnTip.classList.add('shake-anim');
    setTimeout(() => {
        warnTip.classList.remove('shake-anim');
        warnTip.innerText = '';
    }, 500);
}

// 胜利判断
function checkWin() {
    // length 判断完成状态 考点
    if (pegs[2].length === diskNum) {
        winTip.innerText = '🎉 恭喜通关！🎉';
        winTip.classList.add('glow-anim');
        isAutoRunning = true;
        autoBtn.disabled = true;
        statusTip.innerText = '游戏结束';
    }
}

// 递归汉诺塔 考点
let moveArr = [];
function hanoiRecursion(n, start, mid, end) {
    if (n === 0) return;
    hanoiRecursion(n - 1, start, end, mid);
    moveArr.push({ from: start, to: end });
    hanoiRecursion(n - 1, mid, start, end);
}

// 延时分步自动演示 考点
async function autoPlay() {
    if (isAutoRunning) return;
    isAutoRunning = true;
    autoBtn.disabled = true;
    statusTip.innerText = '自动解题中...';
    moveArr = [];

    // 生成移动步骤
    hanoiRecursion(diskNum, 0, 1, 2);

    // 分步执行
    for (const item of moveArr) {
        pegs[item.from].pop();
        pegs[item.to].push(pegs[item.from].length);
        stepCount++;
        stepNumDom.innerText = stepCount;
        renderDisk();
        await new Promise(resolve => setTimeout(resolve, delayTime));
    }
    checkWin();
}

// 事件绑定
resetBtn.addEventListener('click', initGame);
autoBtn.addEventListener('click', autoPlay);
diskCountInput.addEventListener('change', initGame);
speedSelect.addEventListener('change', initGame);

// 页面初始化
initGame();