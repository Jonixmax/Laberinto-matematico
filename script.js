// --- CONFIGURACIÓN DE LOS 3 NIVELES ---
const niveles = [
    // --- NIVEL 1: FÁCIL ---
    {
        cols: 4,
        startVal: 10,
        mapa: [
            ['S', {op:'+5', ans:15}, 'W', 'W'],
            ['W', {op:'-3', ans:12}, {op:'+8', ans:20}, 'W'],
            ['W', 'W', {op:'-10', ans:10}, {op:'+2', ans:12}],
            ['W', 'W', 'W', 'F']
        ]
    },
    
    // --- NIVEL 2: MEDIO ---
    {
        cols: 5,
        startVal: 5,
        mapa: [
            ['S', {op:'x2', ans:10}, 'W', 'W', 'W'],
            ['W', {op:'+5', ans:15}, {op:'x2', ans:30}, {op:'-5', ans:25}, 'W'],
            ['W', 'W', 'W', {op:'+10', ans:35}, 'W'],
            ['W', {op:'x0', ans:0}, 'W', {op:'-5', ans:30}, {op:'x2', ans:60}],
            ['W', 'W', 'W', 'W', 'F']
        ]
    },

    // --- NIVEL 3: DIFÍCIL ---
    {
        cols: 6,
        startVal: 100,
        mapa: [
            ['S', {op:'/2', ans:50}, {op:'-10', ans:40}, 'W', 'W', 'W'],
            ['W', 'W', {op:'/4', ans:10}, {op:'x5', ans:50}, 'W', 'W'],
            ['W', {op:'+15', ans:65}, 'W', {op:'-20', ans:30}, 'W', 'W'],
            ['W', {op:'x2', ans:130}, 'W', {op:'/3', ans:10}, {op:'x9', ans:90}, 'W'],
            ['W', 'W', 'W', 'W', {op:'-40', ans:50}, {op:'/2', ans:25}],
            ['W', 'W', 'W', 'W', 'W', 'F']
        ]
    }
];

// Variables del juego
let nivelActual = 0;
let vidas = 3;
let pasosTotales = 0;
let pasosCompletados = 0;

const container = document.getElementById('game-container');
const hudNivel = document.getElementById('nivel-display');
const hudVidas = document.getElementById('vidas-display');
const overlay = document.getElementById('mensaje-overlay');
const tituloMsg = document.getElementById('mensaje-titulo');
const textoMsg = document.getElementById('mensaje-texto');
const btnAccion = document.getElementById('btn-accion');

// --- FUNCIÓN PRINCIPAL DE CONSTRUCCIÓN ---
function cargarNivel(indice) {
    container.innerHTML = '';
    const nivel = niveles[indice];
    
    container.style.gridTemplateColumns = `repeat(${nivel.cols}, 1fr)`;
    
    hudNivel.innerText = indice + 1;
    pasosTotales = 0;
    pasosCompletados = 0;

    for (let fila = 0; fila < nivel.mapa.length; fila++) {
        for (let col = 0; col < nivel.mapa[fila].length; col++) {
            const celdaData = nivel.mapa[fila][col];
            const celdaDiv = document.createElement('div');
            celdaDiv.className = 'cell';

            if (celdaData === 'W') {
                celdaDiv.classList.add('wall');
            } 
            else if (celdaData === 'S') {
                celdaDiv.classList.add('start', 'path');
                celdaDiv.innerHTML = `<span>${nivel.startVal}</span>`;
            } 
            else if (celdaData === 'F') {
                celdaDiv.classList.add('finish', 'path');
                celdaDiv.innerHTML = '🏆';
                celdaDiv.id = 'meta-final';
            } 
            else if (typeof celdaData === 'object') {
                pasosTotales++;
                celdaDiv.classList.add('path');
                
                const opContainer = document.createElement('div');
                opContainer.className = 'op-container';

                let signo = celdaData.op.charAt(0);
                if(signo === 'x') signo = '✖️';
                if(signo === '/') signo = '➗';
                if(signo === '+') signo = '➕';
                if(signo === '-') signo = '➖';
                const num = celdaData.op.substring(1);

                const label = document.createElement('div');
                label.className = 'op-label';
                label.innerHTML = `${signo} ${num}`;

                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'math-input';
                input.dataset.ans = celdaData.ans;

                input.addEventListener('change', function() { validarRespuesta(this, celdaDiv); });
                input.addEventListener('keyup', function(e) { 
                    if (e.key === 'Enter') validarRespuesta(this, celdaDiv); 
                });

                opContainer.appendChild(label);
                opContainer.appendChild(input);
                celdaDiv.appendChild(opContainer);
            }

            container.appendChild(celdaDiv);
        }
    }
}

function validarRespuesta(input, celda) {
    if (celda.classList.contains('correct')) return;

    if (parseInt(input.value) === parseInt(input.dataset.ans)) {
        celda.classList.add('correct');
        input.parentElement.innerHTML = `<span style="font-size:24px; font-weight:bold;">${input.value}</span>`;
        pasosCompletados++;
        checkVictoria();
    } else {
        if (input.value !== '') {
            quitarVida();
            input.classList.add('wrong-anim');
            input.value = '';
            setTimeout(() => input.classList.remove('wrong-anim'), 500);
        }
    }
}

function quitarVida() {
    vidas--;
    actualizarHUD();
    if (vidas <= 0) {
        mostrarMensaje("¡Game Over!", "Te has quedado sin vidas.", "Reintentar", () => location.reload());
    }
}

function actualizarHUD() {
    let corazones = "";
    for(let i=0; i<vidas; i++) corazones += "❤️";
    hudVidas.innerText = corazones;
}

function checkVictoria() {
    if (pasosCompletados === pasosTotales) {
        document.getElementById('meta-final').style.transform = "scale(1.3)";
        setTimeout(() => {
            nivelSuperado();
        }, 500);
    }
}

function nivelSuperado() {
    if (nivelActual < niveles.length - 1) {
        mostrarMensaje(`¡Nivel ${nivelActual + 1} Completado!`, "¡Excelente! Vamos al siguiente desafío.", "Siguiente Nivel", () => {
            nivelActual++;
            cargarNivel(nivelActual);
            cerrarMensaje();
        });
    } else {
        mostrarMensaje("¡VICTORIA TOTAL!", "¡Eres un maestro de las matemáticas! 🏆", "Jugar de Nuevo", () => location.reload());
    }
}

function mostrarMensaje(titulo, texto, boton, accion) {
    tituloMsg.innerText = titulo;
    textoMsg.innerText = texto;
    btnAccion.innerText = boton;
    btnAccion.onclick = accion;
    overlay.style.display = 'flex';
}

function cerrarMensaje() {
    overlay.style.display = 'none';
}

// Iniciar juego
cargarNivel(0);