/**
 * KeyGenX | Premium Password Generator Logic
 */

// Elements
const passwordOutput = document.getElementById('password-output');
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');
const generateBtn = document.getElementById('generate-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const copyBtn = document.getElementById('copy-btn');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const historyList = document.getElementById('history-list');

// Toggles
const upperToggle = document.getElementById('upper');
const lowerToggle = document.getElementById('lower');
const numbersToggle = document.getElementById('numbers');
const symbolsToggle = document.getElementById('symbols');
const excludeSimilarToggle = document.getElementById('exclude-similar');
const autoCopyToggle = document.getElementById('auto-copy');

const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    similar: 'il1Lo0O'
};

let passwordHistory = [];

// Initialize
function init() {
    lengthSlider.addEventListener('input', (e) => {
        lengthVal.textContent = e.target.value;
    });

    generateBtn.addEventListener('click', () => {
        generateAction();
    });

    regenerateBtn.addEventListener('click', () => {
        // Add rotation animation
        const icon = regenerateBtn.querySelector('svg');
        icon.style.transition = 'transform 0.5s ease';
        icon.style.transform = 'rotate(360deg)';
        
        generateAction();
        
        setTimeout(() => {
            icon.style.transition = 'none';
            icon.style.transform = 'rotate(0deg)';
        }, 500);
    });

    copyBtn.addEventListener('click', () => {
        copyToClipboard(passwordOutput.innerText);
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        // Simple CSS toggle for light mode if added later
    });

    // Initial generate
    generateAction();
}

/**
 * Main generation action
 */
function generateAction() {
    const length = +lengthSlider.value;
    const config = {
        upper: upperToggle.checked,
        lower: lowerToggle.checked,
        numbers: numbersToggle.checked,
        symbols: symbolsToggle.checked,
        exclude: excludeSimilarToggle.checked
    };

    const password = createPassword(length, config);
    if (!password) return;

    passwordOutput.innerText = password;
    updateStrength(password);
    addToHistory(password);

    if (autoCopyToggle.checked) {
        copyToClipboard(password, true); // silent copy
    }
}

/**
 * Core Password Logic
 */
function createPassword(length, config) {
    let charset = '';
    if (config.upper) charset += CHARS.upper;
    if (config.lower) charset += CHARS.lower;
    if (config.numbers) charset += CHARS.numbers;
    if (config.symbols) charset += CHARS.symbols;

    if (config.exclude) {
        const pattern = new RegExp(`[${CHARS.similar}]`, 'g');
        charset = charset.replace(pattern, '');
    }

    if (!charset) {
        alert('Please select at least one character type!');
        return '';
    }

    let result = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        result += charset.charAt(array[i] % charset.length);
    }

    return result;
}

/**
 * Strength Meter with red/orange/green
 */
function updateStrength(password) {
    let score = 0;
    if (password.length > 10) score++;
    if (password.length > 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let width = '20%';
    let color = '#FF4D4D'; // Red
    let text = 'Weak';

    if (score >= 5) {
        width = '100%';
        color = '#00E5A8'; // Neon Green
        text = 'Strong';
    } else if (score >= 3) {
        width = '60%';
        color = '#FF9F1C'; // Orange
        text = 'Medium';
    }

    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    strengthText.innerText = `Strength: ${text}`;
    strengthText.style.color = color;
}

/**
 * Clipboard Logic
 */
async function copyToClipboard(text, silent = false) {
    if (!text || text === '••••••••••••') return;

    try {
        await navigator.clipboard.writeText(text);
        
        if (!silent) {
            const copyIcon = copyBtn.querySelector('.copy-icon');
            const checkIcon = copyBtn.querySelector('.check-icon');
            
            copyBtn.classList.add('active');
            copyIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');
            
            setTimeout(() => {
                copyBtn.classList.remove('active');
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
            }, 2000);
        }
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

/**
 * History Management
 */
function addToHistory(password) {
    // Avoid duplicates at the top
    if (passwordHistory[0] === password) return;

    passwordHistory.unshift(password);
    if (passwordHistory.length > 5) passwordHistory.pop();

    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    passwordHistory.forEach(pw => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `${pw} <span>Click to Copy</span>`;
        item.onclick = () => copyToClipboard(pw);
        historyList.appendChild(item);
    });
}

// Start the app
init();