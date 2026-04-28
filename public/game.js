// ==================================================
// Simulador de Pipas 2D
// ✅ Tela inicial com nome
// ✅ Nome aparece sobre o pipa
// ✅ Dinâmica clara de MERGULHO
// ==================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// ================= REDIMENSIONAMENTO =================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ================= ESTADO GLOBAL =================
let gameStarted = false;
let playerName = '';

// ================= MOUSE =================
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let lastMouseY = mouseY;

canvas.addEventListener('mousemove', e => {
  lastMouseY = mouseY;
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ================= TELA INICIAL =================
const startBtn = document.getElementById('startBtn');
const nameInput = document.getElementById('playerName');

startBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name.length > 0) {
    playerName = name;
    gameStarted = true;
    document.getElementById('startScreen').style.display = 'none';
  }
});

// ================= ALVO COM SUAVIDADE =================
const target = { x: mouseX, y: mouseY };
const TARGET_LAG = 0.08;

// ================= ESTADO DO PIPA =================
const kite = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
  angle: 0
};

// ================= FÍSICA =================
const FOLLOW_FORCE = 0.03;
const DAMPING = 0.94;
const WIND_FORCE = 0.15;
const DIVE_FORCE = 0.12;

// limites de inclinação
const MAX_ANGLE = Math.PI / 2.8;

// ================= GEOMETRIA =================
const KITE_TOP = 16;
const KITE_BOTTOM = 44;
const KITE_WIDTH = 48;

// ================= DESENHO DO PIPA =================
function drawKite() {
  ctx.save();
  ctx.translate(kite.x, kite.y);
  ctx.rotate(kite.angle);

  // corpo do pipa
  ctx.fillStyle = '#f28c28';
  ctx.strokeStyle = '#9c5312';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, -KITE_TOP);          // cabeça
  ctx.lineTo(KITE_WIDTH / 2, 0);
  ctx.lineTo(0, KITE_BOTTOM);        // pé
  ctx.lineTo(-KITE_WIDTH / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // cruz do pipa
  ctx.strokeStyle = '#6a3b0f';
  ctx.beginPath();
  ctx.moveTo(0, -KITE_TOP);
  ctx.lineTo(0, KITE_BOTTOM);
  ctx.moveTo(-KITE_WIDTH / 2, 0);
  ctx.lineTo(KITE_WIDTH / 2, 0);
  ctx.stroke();

  ctx.restore();

  // ================= NOME DO JOGADOR =================
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000';
  ctx.fillText(
    playerName,
    kite.x,
    kite.y - KITE_BOTTOM - 20
  );
}

// ================= LOOP PRINCIPAL =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    requestAnimationFrame(loop);
    return;
  }

  // atraso do mouse (movimento suave)
  target.x += (mouseX - target.x) * TARGET_LAG;
  target.y += (mouseY - target.y) * TARGET_LAG;

  const dx = target.x - kite.x;
  const dy = target.y - kite.y;

  // seguir o alvo
  kite.vx += dx * FOLLOW_FORCE;
  kite.vy += dy * FOLLOW_FORCE;

  // ================= MERGULHO =================
  // mouse descendo rápido OU abaixo do pipa
  const mouseSpeedDown = mouseY - lastMouseY;
  if (mouseSpeedDown > 3 || mouseY > kite.y + 40) {
    kite.vy += mouseSpeedDown * DIVE_FORCE;
  }

  // vento lateral leve
  kite.vx += Math.sin(Date.now() * 0.002) * WIND_FORCE;

  // amortecimento
  kite.vx *= DAMPING;
  kite.vy *= DAMPING;

  // posição
  kite.x += kite.vx;
  kite.y += kite.vy;

  // inclinação / mergulho visual
  let desiredAngle = Math.atan2(kite.vx, -kite.vy);
  desiredAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, desiredAngle));
  kite.angle += (desiredAngle - kite.angle) * 0.15;

  drawKite();
  requestAnimationFrame(loop);
}

loop();