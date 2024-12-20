// Mapa de Traducción de Código Morse
const morseMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 
    'Z': '--..', 
    '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', 
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', 
    ' ': '/', 
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', 
    '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', 
    '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', 
    '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', 
    '$': '...-..-', '@': '.--.-.'
};

// Función para traducir texto a código Morse
function translateToMorse(text) {
    return text
        .toUpperCase()
        .split('')
        .map(char => morseMap[char] || '?')
        .join(' ');
}

// Función para crear elementos span para cada carácter Morse
function createMorseSpans(morseText, originalText) {
    const container = document.createElement('div');
    container.className = 'morse-output';
    
    const morseChars = morseText.split(' ');
    const originalChars = originalText.toUpperCase().split('');
    
    morseChars.forEach((morseChar, index) => {
        const span = document.createElement('span');
        span.className = 'morse-char';
        span.textContent = morseChar;
        span.dataset.letter = originalChars[index];
        container.appendChild(span);
        
        if (index < morseChars.length - 1) {
            container.appendChild(document.createTextNode(' '));
        }
    });
    
    return container;
}

// Función para reproducir un audio y esperar a que termine
function playAudioPromise(audio) {
    return new Promise((resolve) => {
        audio.play();
        audio.onended = resolve;
    });
}

// Función principal para reproducir el mensaje con animación
async function playMorseMessage(message) {
    const chars = message.toUpperCase().split('');
    const spans = document.querySelectorAll('.morse-char');
    const pauseDuration = 200; // Pausa entre letras
    
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const span = spans[i];
        
        if (char !== ' ' && morseMap[char]) {
            span.classList.add('highlight');
            const audioFileName = char === '?' ? 'interrogante.wav' : `${char}.wav`;
            const audio = new Audio(`audio/${audioFileName}`);
            try {
                await playAudioPromise(audio);
            } catch (error) {
                console.error(`Error al reproducir el audio para ${char}:`, error);
            }
            span.classList.remove('highlight');
            await new Promise(resolve => setTimeout(resolve, pauseDuration));
        } else {
            await new Promise(resolve => setTimeout(resolve, pauseDuration * 2));
        }
    }
}

// Función para generar y descargar audio Morse
async function generateMorseAudio(message) {
    const chars = message.toUpperCase().split('');
    const audioContext = new AudioContext();
    const audioBuffers = [];

    for (const char of chars) {
        const audioFileName = char === '?' ? 'interrogante.wav' : `${char}.wav`;
        if (/[A-Z0-9]/.test(char) || char === '?') {
            try {
                const response = await fetch(`audio/${audioFileName}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                audioBuffers.push(audioBuffer);
            } catch (error) {
                console.error(`Error al cargar el audio para ${char}:`, error);
            }
        } else if (char === ' ') {
            const silenceBuffer = audioContext.createBuffer(1, audioContext.sampleRate / 2, audioContext.sampleRate);
            audioBuffers.push(silenceBuffer);
        }
    }

    const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
    const combinedBuffer = audioContext.createBuffer(1, totalLength, audioContext.sampleRate);
    let offset = 0;

    for (const buffer of audioBuffers) {
        combinedBuffer.getChannelData(0).set(buffer.getChannelData(0), offset);
        offset += buffer.length;
    }

    const wavBlob = await bufferToWave(combinedBuffer, audioContext.sampleRate);
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(wavBlob);
    downloadLink.download = 'morse_message.wav';
    downloadLink.click();
}

// Convertir un AudioBuffer a un archivo WAV
function bufferToWave(buffer, sampleRate) {
    return new Promise((resolve) => {
        const wavBuffer = new ArrayBuffer(44 + buffer.length * 2);
        const view = new DataView(wavBuffer);

        writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 36 + buffer.length * 2, true);
        writeUTFBytes(view, 8, 'WAVE');
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, buffer.length * 2, true);

        const channelData = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < channelData.length; i++) {
            const s = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
        }

        resolve(new Blob([view], { type: 'audio/wav' }));
    });
}

// Helper para escribir texto en el buffer
function writeUTFBytes(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Event Listener para el botón de traducir
document.getElementById('translateButton').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value.trim();
    const morseTranslation = translateToMorse(inputText);
    const outputContainer = document.getElementById('outputText').parentElement;
    
    const oldOutput = document.getElementById('outputText');
    const morseContainer = createMorseSpans(morseTranslation, inputText);
    morseContainer.id = 'outputText';
    outputContainer.replaceChild(morseContainer, oldOutput);
});

// Event Listener para el botón de reproducir
document.getElementById('playAudio').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value.trim();
    if (!inputText) {
        alert('Por favor, ingresa un mensaje para traducir.');
        return;
    }
    playMorseMessage(inputText);
});

// Event Listener para el botón de descargar
document.getElementById('saveMessage').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value.trim();
    if (!inputText) {
        alert('Por favor, ingresa un mensaje para generar el audio.');
        return;
    }
    generateMorseAudio(inputText);
});
