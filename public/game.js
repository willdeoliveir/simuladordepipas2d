const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const socket = io();
const players = {};

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

socket.on('currentPlayers', data => Object.assign(players, data));
socket.on('newPlayer', p => players[p.id] = p);
socket.on('playerMoved', p => players[p.id] = p);
socket.on('playerDisconnected', id => delete players[id]);

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (players[socket.id]) {
    let p = players[socket.id];
    p.x += (mouseX - p.x) * 0.05;
    p.y += (mouseY - p.y) * 0.05;
    socket.emit('update', { x: p.x, y: p.y });
  }

  Object.values(players).forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y + 120);
    ctx.stroke();

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 15);
    ctx.lineTo(p.x + 15, p.y);
    ctx.lineTo(p.x, p.y + 15);
    ctx.lineTo(p.x - 15, p.y);
    ctx.closePath();
    ctx.fill();
  });

  requestAnimationFrame(loop);
}
loop();