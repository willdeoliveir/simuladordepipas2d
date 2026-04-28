
// ==================================================
// Simulador de Pipas 2D
// Ponta segue o mouse + pipa com atraso + rabiola viva
// ==================================================

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

// Mouse controla a PONTA da pipa
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 3;

canvas.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ========================
// Configurações visuais
// ========================
const KITE_SCALE = 2;          // pipa maior
const KITE_HEIGHT = 30 * KITE_SCALE;

// ========================
// Socket events
// ========================
socket.on("currentPlayers", data => Object.assign(players, data));
socket.on("newPlayer", p => players[p.id] = p);
socket.on("playerMoved", p => players[p.id] = p);
socket.on("playerDisconnected", id => delete players[id]);

// ========================
// Rabiola animada (segue o pipa)
// ========================
function drawRabiola(p) {
  const segments = 16;
  const length = 10;
  const wave = 10;
  const time = Date.now() * 0.005;

  let x = p.x;
  let y = p.y + KITE_HEIGHT;

  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 0; i < segments; i++) {
    const sway = Math.sin(time + i * 0.6) * wave + p.vx * 0.4;
    x += sway * 0.1;
    y += length;
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
  ctx.moveTo(p.x, p.y - size);      // ponta
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

    // A ponta da pipa segue o mouse (suavemente)
    const targetX = mouseX;
    const targetY = mouseY + KITE_HEIGHT;

    p.vx = (targetX - p.x) * 0.08;
    p.vy = (targetY - p.y) * 0.08;

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
