
// ========================
// Simulador de Pipas 2D
// Versão: Pipa maior + rabiola animada
// ========================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const socket = io();
const players = {};

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

canvas.addEventListener("mousemove", e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ========================
// Configurações visuais
// ========================
const KITE_SCALE = 2;   // dobra o tamanho da pipa

// ========================
// Socket events
// ========================
socket.on("currentPlayers", data => Object.assign(players, data));
socket.on("newPlayer", p => players[p.id] = p);
socket.on("playerMoved", p => players[p.id] = p);
socket.on("playerDisconnected", id => delete players[id]);

// ========================
// Desenho da rabiola
// ========================
function drawRabiola(p) {
  const segments = 14;
  const segmentLength = 12;
  const waveStrength = 8;
  const time = Date.now() * 0.004;

  let x = p.x;
  let y = p.y + 30 * KITE_SCALE;

  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 0; i < segments; i++) {
    const sway = Math.sin(time + i * 0.7) * waveStrength;
    x += sway;
    y += segmentLength;
    ctx.lineTo(x, y);
  }

  ctx.stroke();
}

// ========================
// Desenho da pipa
// ========================
function drawPipa(p) {
  const size = 15 * KITE_SCALE;

  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - size);
  ctx.lineTo(p.x + size, p.y);
  ctx.lineTo(p.x, p.y + size);
  ctx.lineTo(p.x - size, p.y);
  ctx.closePath();
  ctx.fill();
}

// ========================
// Loop principal
// ========================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (players[socket.id]) {
    const p = players[socket.id];
    p.vx = (mouseX - p.x) * 0.05;
    p.vy = (mouseY - p.y) * 0.05;
    p.x += p.vx;
    p.y += p.vy + Math.sin(Date.now() / 600) * 0.4;
    socket.emit("update", { x: p.x, y: p.y });
  }

  Object.values(players).forEach(p => {
    drawRabiola(p);
    drawPipa(p);
  });

  requestAnimationFrame(loop);
}

loop();
