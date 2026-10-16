let audioCtx = null;
let analyser = null;
let canvas, canvasCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.connect(audioCtx.destination);

        setupCanvas();
        drawVisualizer();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function setupCanvas() {
    canvas = document.getElementById('visualizer');
    canvasCtx = canvas.getContext('2d');
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);

    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = '#121629';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#00ffcc';
    canvasCtx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = v * (canvas.height / 2);

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

function playTone(frequency, type = 'sawtooth') {
    initAudio();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gainNode);
    gainNode.connect(analyser);

    osc.start(now);
    osc.stop(now + 0.8);
}

const pads = document.querySelectorAll('.pad');
pads.forEach(pad => {
    const freq = parseFloat(pad.dataset.note);
    
    pad.addEventListener('pointerdown', (e) => {
        e.preventDefault(); 
        playTone(freq, 'sawtooth');
        pad.classList.add('active');
    });

    pad.addEventListener('pointerup', () => {
        pad.classList.remove('active');
    });

    pad.addEventListener('pointerleave', () => {
        pad.classList.remove('active');
    });
});
