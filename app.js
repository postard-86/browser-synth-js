let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(frequency, type = 'sine') {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type; 
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8); 

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
}

const pads = document.querySelectorAll('.pad');
pads.forEach(pad => {
    const freq = parseFloat(pad.dataset.note);
    
    pad.addEventListener('click', () => {
        playTone(freq, 'sawtooth');
        pad.classList.add('active');
        setTimeout(() => pad.classList.remove('active'), 100);
    });
});
