import { SPRITE_SIZE, RARITY_COLORS, RARITY } from './utils/constants.js';

const S = SPRITE_SIZE;

export function drawBottleSprite(ctx, x, y, bottle, scale = 1) {
  const size = S * scale;
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const borderColor = bottle.limited ? '#FFD700' : (RARITY_COLORS[bottle.rarity] || '#888');
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x - 1, y - 1, size + 2, size + 2);

  ctx.fillStyle = bottle.spriteColor;
  const shape = bottle.shape || 'can';
  const padding = 3 * scale;
  const px = x + padding, py = y + padding;
  const pw = size - padding * 2, ph = size - padding * 2;

  switch (shape) {
    case 'can': drawCan(ctx, px, py, pw, ph, bottle.spriteColor); break;
    case 'glass': drawGlass(ctx, px, py, pw, ph, bottle.spriteColor); break;
    case 'bottle': drawBottleShape(ctx, px, py, pw, ph, bottle.spriteColor); break;
    case 'cup': drawCup(ctx, px, py, pw, ph, bottle.spriteColor); break;
    case 'tetra': drawTetra(ctx, px, py, pw, ph, bottle.spriteColor); break;
    default: drawCan(ctx, px, py, pw, ph, bottle.spriteColor);
  }

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(x, y, size, size);

  if (bottle.rarity === RARITY.LEGENDARY) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2 * scale;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 6 * scale;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    ctx.shadowBlur = 0;
  }

  if (bottle.limited) {
    ctx.fillStyle = '#FFD700';
    ctx.font = `${8 * scale}px "Press Start 2P"`;
    ctx.fillText('限', x + 2, y + size - 2);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1 * scale;
    ctx.setLineDash([3 * scale, 3 * scale]);
    ctx.strokeRect(x, y, size, size);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawCan(ctx, x, y, w, h, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + w * 0.15, y, w * 0.7, h * 0.1);
  ctx.fillRect(x + w * 0.15, y + h * 0.9, w * 0.7, h * 0.1);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x + w * 0.22, y + h * 0.25, w * 0.12, h * 0.35);
}

function drawGlass(ctx, x, y, w, h, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y);
  ctx.lineTo(x + w * 0.8, y);
  ctx.lineTo(x + w * 0.9, y + h * 0.15);
  ctx.lineTo(x + w * 0.9, y + h * 0.85);
  ctx.lineTo(x + w * 0.8, y + h);
  ctx.lineTo(x + w * 0.2, y + h);
  ctx.lineTo(x + w * 0.1, y + h * 0.85);
  ctx.lineTo(x + w * 0.1, y + h * 0.15);
  ctx.closePath();
  ctx.fill();
}

function drawBottleShape(ctx, x, y, w, h, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.35, y);
  ctx.lineTo(x + w * 0.65, y);
  ctx.lineTo(x + w * 0.7, y + h * 0.1);
  ctx.lineTo(x + w * 0.85, y + h * 0.3);
  ctx.lineTo(x + w * 0.85, y + h * 0.8);
  ctx.lineTo(x + w * 0.7, y + h * 0.9);
  ctx.lineTo(x + w * 0.7, y + h);
  ctx.lineTo(x + w * 0.3, y + h);
  ctx.lineTo(x + w * 0.3, y + h * 0.9);
  ctx.lineTo(x + w * 0.15, y + h * 0.8);
  ctx.lineTo(x + w * 0.15, y + h * 0.3);
  ctx.lineTo(x + w * 0.3, y + h * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawCup(ctx, x, y, w, h, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.25, y);
  ctx.lineTo(x + w * 0.75, y);
  ctx.lineTo(x + w * 0.8, y + h * 0.85);
  ctx.lineTo(x + w * 0.2, y + h * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + w * 0.75, y + h * 0.5, w * 0.12, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
}

function drawTetra(ctx, x, y, w, h, color) {
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y);
  ctx.lineTo(x + w * 0.9, y + h * 0.2);
  ctx.lineTo(x + w * 0.9, y + h * 0.8);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.lineTo(x + w * 0.1, y + h * 0.8);
  ctx.lineTo(x + w * 0.1, y + h * 0.2);
  ctx.closePath();
  ctx.fill();
}

export function drawMachineSprite(ctx, x, y, machine, scale = 1) {
  const w = 100 * scale, h = 150 * scale;
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = '#e94560';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#c23450';
  ctx.fillRect(x + 4 * scale, y + 4 * scale, w - 8 * scale, h - 8 * scale);
  ctx.fillStyle = 'rgba(26,26,46,0.55)';
  ctx.fillRect(x + 10 * scale, y + 15 * scale, w - 20 * scale, 60 * scale);
  ctx.fillStyle = '#333';
  ctx.fillRect(x + 20 * scale, y + h - 30 * scale, w - 40 * scale, 20 * scale);
  ctx.fillStyle = '#f0c040';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h - 50 * scale, 8 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return { w, h };
}
