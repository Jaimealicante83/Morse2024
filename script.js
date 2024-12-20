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
    ' ': '/', // Espacio entre palabras
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', 
    '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', 
    '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', 
    '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', 
    '$': '...-..-', '@': '.--.-.'
  };
  
  // Función para traducir texto a código Morse
  function translateToMorse(text) {
    return text
      .toUpperCase() // Convertir texto a mayúsculas
      .split('') // Dividir en caracteres
      .map(char => morseMap[char] || '?') // Mapear a Morse (usar '?' si no existe)
      .join(' '); // Unir los caracteres en un string con espacios
  }
  
  // Event Listener para el botón de traducir
  document.getElementById('translateButton').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value.trim(); // Texto del usuario
    const morseTranslation = translateToMorse(inputText); // Traducción a Morse
    document.getElementById('outputText').value = morseTranslation; // Mostrar resultado
  });
  
  // Función para reproducir el mensaje en código Morse
  function playMorseMessage(message) {
    const audioQueue = []; // Cola de reproducción de sonidos
    const basePath = 'audio/'; // Carpeta donde están los audios
  
    // Crear la cola de reproducción
    message.toUpperCase().split('').forEach(char => {
      if (/[A-Z]/.test(char)) {
        // Si el carácter es una letra, agregar su audio correspondiente
        audioQueue.push(new Audio(`${basePath}${char}.wav`));
      } else if (char === ' ') {
        // Si es un espacio, agregar un pequeño retraso (silencio)
        audioQueue.push(null);
      }
    });
  
    // Reproducir la cola
    playQueue(audioQueue);
  }
  
  // Función para reproducir la cola de audios
  function playQueue(queue) {
    if (queue.length === 0) return; // Si no hay más sonidos, detener
  
    const audio = queue.shift(); // Tomar el primer elemento de la cola
    if (audio) {
      audio.play();
      audio.onended = () => {
        setTimeout(() => playQueue(queue), 200); // Pausa de 500ms entre audios
      };
    } else {
      // Si es un espacio, añadir un pequeño retraso antes del siguiente audio
      setTimeout(() => playQueue(queue), 400); // 800ms de silencio para espacios
    }
  }
  
  // Event Listener para el botón "Reproducir"
  document.getElementById("playAudio").addEventListener("click", () => {
    const inputText = document.getElementById("inputText").value.trim(); // Obtener el texto ingresado
    if (!inputText) {
      alert("Por favor, ingresa un mensaje para traducir."); // Validación básica
      return;
    }
  
    playMorseMessage(inputText); // Reproducir el mensaje ingresado
  });
  