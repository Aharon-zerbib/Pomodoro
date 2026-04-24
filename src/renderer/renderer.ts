// @ts-ignore
const api = (window as any).electronAPI;

const notificationSound = new Audio('../../MondiaPupu.m4a');

const workInput = document.getElementById('work-input') as HTMLInputElement;
const shortInput = document.getElementById('short-input') as HTMLInputElement;
const longInput = document.getElementById('long-input') as HTMLInputElement;
const cyclesInput = document.getElementById('cycles-input') as HTMLInputElement;
const adjustBtns = document.querySelectorAll('.adjust');

const minutesDisplay = document.getElementById('minutes') as HTMLSpanElement;
const secondsDisplay = document.getElementById('seconds') as HTMLSpanElement;
const statusDisplay = document.getElementById('status') as HTMLHeadingElement;
const startBtn = document.getElementById('start') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause') as HTMLButtonElement;
const resetBtn = document.getElementById('reset') as HTMLButtonElement;

let timeLeft = parseInt(workInput.value) * 60;
let timerId: any = null;
let currentCycle = 1;
let mode = 'WORK';

function getDuration(m: string) {
    if (m === 'WORK') return parseInt(workInput.value) * 60;
    if (m === 'SHORT_BREAK') return parseInt(shortInput.value) * 60;
    return parseInt(longInput.value) * 60;
}

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    minutesDisplay.textContent = mins.toString().padStart(2, '0');
    secondsDisplay.textContent = secs.toString().padStart(2, '0');
    
    const maxCycles = cyclesInput.value;
    let statusText = "";
    if (mode === 'WORK') statusText = `Travail (Cycle ${currentCycle}/${maxCycles})`;
    else if (mode === 'SHORT_BREAK') statusText = "Pause Courte";
    else statusText = "Pause Longue";
    
    statusDisplay.textContent = statusText;
}

function nextMode() {
    const maxCycles = parseInt(cyclesInput.value);
    
    if (mode === 'WORK') {
        if (currentCycle >= maxCycles) {
            mode = 'LONG_BREAK';
            currentCycle = 1;
        } else {
            mode = 'SHORT_BREAK';
            currentCycle++;
        }
    } else {
        mode = 'WORK';
    }
    
    timeLeft = getDuration(mode);
    
    const title = mode === 'WORK' ? "C'est reparti !" : "Pause !";
    const body = mode === 'WORK' ? `Concentration pendant ${workInput.value} min.` : "Prenez un moment pour vous.";
    
    notificationSound.play().catch(err => console.error(err));
    
    if (api && api.sendNotification) {
        api.sendNotification(title, body);
    }
    
    updateDisplay();
}

function startTimer() {
    if (timerId) return;

    workInput.disabled = true;
    shortInput.disabled = true;
    longInput.disabled = true;
    cyclesInput.disabled = true;
    adjustBtns.forEach(btn => (btn as HTMLButtonElement).disabled = true);

    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');

    timerId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerId);
            timerId = null;
            nextMode();
            startTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    workInput.disabled = false;
    shortInput.disabled = false;
    longInput.disabled = false;
    cyclesInput.disabled = false;
    adjustBtns.forEach(btn => (btn as HTMLButtonElement).disabled = false);
    
    mode = 'WORK';
    currentCycle = 1;
    timeLeft = getDuration('WORK');
    updateDisplay();
}

function onInputChange() {
    if (!timerId) {
        timeLeft = getDuration(mode);
        updateDisplay();
    }
}

adjustBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const action = btn.getAttribute('data-action');
        if (!targetId || !action) return;
        
        const input = document.getElementById(targetId) as HTMLInputElement;
        let val = parseInt(input.value);
        let max = parseInt(input.getAttribute('max') || "60");
        let min = parseInt(input.getAttribute('min') || "1");
        
        if (action === 'plus' && val < max) val++;
        else if (action === 'minus' && val > min) val--;
        
        input.value = val.toString();
        onInputChange();
    });
});

workInput.addEventListener('change', onInputChange);
shortInput.addEventListener('change', onInputChange);
longInput.addEventListener('change', onInputChange);
cyclesInput.addEventListener('change', onInputChange);

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);

updateDisplay();
