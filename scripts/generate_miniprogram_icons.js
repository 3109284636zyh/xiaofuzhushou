const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const TAB_DIR = path.join(ROOT, 'miniprogram', 'assets', 'icons', 'tab');
const UI_DIR = path.join(ROOT, 'miniprogram', 'assets', 'icons', 'ui');

const TRANSPARENT = [0, 0, 0, 0];
const BLUE = [22, 119, 255, 255];
const PURPLE = [108, 99, 255, 255];
const GRAY = [102, 112, 133, 255];
const AMBER = [245, 158, 11, 255];
const GREEN = [16, 185, 129, 255];

const TAB_ICONS = {
  home: 'home',
  assistant: 'assistant',
  toolbox: 'toolbox',
  search: 'search',
  mine: 'mine'
};

const UI_ICONS = [
  'ai', 'api', 'arrow-right', 'article', 'bookmark', 'budget', 'calculator',
  'category', 'chat', 'check', 'clock', 'copy', 'customer-service', 'domain',
  'document', 'empty', 'feature', 'globe', 'history', 'home-service',
  'knowledge', 'lightning', 'lock', 'log', 'menu', 'message', 'plan', 'price',
  'product', 'profile', 'quote', 'reply', 'search', 'seo', 'send', 'shield',
  'speed', 'star', 'stats', 'toolbox', 'trend', 'user', 'warning', 'whois'
];

const COLOR_OVERRIDES = {
  warning: AMBER,
  check: GREEN,
  shield: GREEN,
  lock: PURPLE,
  star: AMBER,
  trend: GREEN
};

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xEDB88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function writeChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

class Canvas {
  constructor(size) {
    this.size = size;
    this.pixels = Buffer.alloc(size * size * 4);
  }

  setPixel(x, y, color) {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= this.size || py >= this.size) return;

    const index = (py * this.size + px) * 4;
    const [srcR, srcG, srcB, srcA] = color;
    if (srcA === 255) {
      this.pixels[index] = srcR;
      this.pixels[index + 1] = srcG;
      this.pixels[index + 2] = srcB;
      this.pixels[index + 3] = srcA;
      return;
    }

    const dstR = this.pixels[index];
    const dstG = this.pixels[index + 1];
    const dstB = this.pixels[index + 2];
    const dstA = this.pixels[index + 3];
    const srcAlpha = srcA / 255;
    const dstAlpha = dstA / 255;
    const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);

    if (outAlpha === 0) {
      this.pixels[index] = 0;
      this.pixels[index + 1] = 0;
      this.pixels[index + 2] = 0;
      this.pixels[index + 3] = 0;
      return;
    }

    this.pixels[index] = Math.round((srcR * srcAlpha + dstR * dstAlpha * (1 - srcAlpha)) / outAlpha);
    this.pixels[index + 1] = Math.round((srcG * srcAlpha + dstG * dstAlpha * (1 - srcAlpha)) / outAlpha);
    this.pixels[index + 2] = Math.round((srcB * srcAlpha + dstB * dstAlpha * (1 - srcAlpha)) / outAlpha);
    this.pixels[index + 3] = Math.round(outAlpha * 255);
  }

  dot(cx, cy, radius, color) {
    for (let y = Math.floor(cy - radius - 1); y <= Math.ceil(cy + radius + 1); y += 1) {
      for (let x = Math.floor(cx - radius - 1); x <= Math.ceil(cx + radius + 1); x += 1) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) this.setPixel(x, y, color);
      }
    }
  }

  line(x1, y1, x2, y2, color, width = 4) {
    const length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let step = 0; step <= length; step += 1) {
      const t = step / length;
      this.dot(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, color);
    }
  }

  rect(x, y, width, height, color, lineWidth = 4) {
    this.line(x, y, x + width, y, color, lineWidth);
    this.line(x + width, y, x + width, y + height, color, lineWidth);
    this.line(x + width, y + height, x, y + height, color, lineWidth);
    this.line(x, y + height, x, y, color, lineWidth);
  }

  fillRect(x, y, width, height, color) {
    for (let py = Math.floor(y); py < Math.ceil(y + height); py += 1) {
      for (let px = Math.floor(x); px < Math.ceil(x + width); px += 1) {
        this.setPixel(px, py, color);
      }
    }
  }

  circle(cx, cy, radius, color, width = 4) {
    const outer = radius + width / 2;
    const inner = Math.max(0, radius - width / 2);
    for (let y = Math.floor(cy - outer - 1); y <= Math.ceil(cy + outer + 1); y += 1) {
      for (let x = Math.floor(cx - outer - 1); x <= Math.ceil(cx + outer + 1); x += 1) {
        const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (distance >= inner && distance <= outer) this.setPixel(x, y, color);
      }
    }
  }

  fillCircle(cx, cy, radius, color) {
    for (let y = Math.floor(cy - radius - 1); y <= Math.ceil(cy + radius + 1); y += 1) {
      for (let x = Math.floor(cx - radius - 1); x <= Math.ceil(cx + radius + 1); x += 1) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) this.setPixel(x, y, color);
      }
    }
  }

  polyline(points, color, width = 4) {
    for (let index = 0; index < points.length - 1; index += 1) {
      this.line(points[index][0], points[index][1], points[index + 1][0], points[index + 1][1], color, width);
    }
  }

  save(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const raw = Buffer.alloc((this.size * 4 + 1) * this.size);
    for (let y = 0; y < this.size; y += 1) {
      const rowStart = y * (this.size * 4 + 1);
      raw[rowStart] = 0;
      this.pixels.copy(raw, rowStart + 1, y * this.size * 4, (y + 1) * this.size * 4);
    }

    const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.size, 0);
    ihdr.writeUInt32BE(this.size, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    fs.writeFileSync(filePath, Buffer.concat([
      signature,
      writeChunk('IHDR', ihdr),
      writeChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
      writeChunk('IEND', Buffer.alloc(0))
    ]));
  }
}

function drawHome(canvas, color) {
  canvas.polyline([[14, 32], [32, 16], [50, 32]], color, 5);
  canvas.rect(19, 31, 26, 22, color, 5);
  canvas.line(32, 53, 32, 42, color, 5);
}

function drawSearch(canvas, color) {
  canvas.circle(28, 27, 12, color, 5);
  canvas.line(38, 38, 50, 50, color, 5);
}

function drawUser(canvas, color) {
  canvas.circle(32, 23, 9, color, 5);
  canvas.circle(32, 49, 15, color, 5);
  canvas.fillRect(16, 46, 32, 16, TRANSPARENT);
}

function drawChat(canvas, color) {
  canvas.rect(13, 17, 38, 28, color, 5);
  canvas.line(25, 45, 19, 53, color, 5);
  canvas.line(23, 29, 41, 29, color, 4);
  canvas.line(23, 37, 35, 37, color, 4);
}

function drawToolbox(canvas, color) {
  canvas.rect(13, 24, 38, 26, color, 5);
  canvas.line(24, 24, 24, 17, color, 5);
  canvas.line(24, 17, 40, 17, color, 5);
  canvas.line(40, 17, 40, 24, color, 5);
  canvas.line(13, 34, 51, 34, color, 4);
}

function drawDocument(canvas, color) {
  canvas.rect(18, 12, 28, 40, color, 5);
  canvas.line(28, 24, 39, 24, color, 4);
  canvas.line(25, 34, 39, 34, color, 4);
  canvas.line(25, 43, 35, 43, color, 4);
}

function drawShield(canvas, color) {
  canvas.polyline([[32, 10], [49, 18], [46, 38], [32, 54], [18, 38], [15, 18], [32, 10]], color, 5);
  canvas.line(24, 32, 30, 38, color, 5);
  canvas.line(30, 38, 42, 25, color, 5);
}

function drawLock(canvas, color) {
  canvas.rect(17, 28, 30, 22, color, 5);
  canvas.circle(32, 29, 12, color, 5);
  canvas.fillRect(18, 29, 28, 10, TRANSPARENT);
}

function drawLightning(canvas, color) {
  canvas.polyline([[36, 9], [21, 34], [33, 34], [27, 55], [45, 27], [33, 27], [36, 9]], color, 5);
}

function drawCheck(canvas, color) {
  canvas.line(15, 33, 27, 45, color, 6);
  canvas.line(27, 45, 50, 20, color, 6);
}

function drawArrow(canvas, color) {
  canvas.line(14, 32, 48, 32, color, 5);
  canvas.line(38, 20, 50, 32, color, 5);
  canvas.line(50, 32, 38, 44, color, 5);
}

function drawClock(canvas, color) {
  canvas.circle(32, 32, 19, color, 5);
  canvas.line(32, 32, 32, 20, color, 5);
  canvas.line(32, 32, 42, 38, color, 5);
}

function drawGlobe(canvas, color) {
  canvas.circle(32, 32, 20, color, 4);
  canvas.line(12, 32, 52, 32, color, 4);
  canvas.line(32, 12, 32, 52, color, 4);
  canvas.line(20, 20, 44, 44, color, 3);
  canvas.line(44, 20, 20, 44, color, 3);
}

function drawStar(canvas, color) {
  canvas.polyline([[32, 10], [37, 25], [53, 25], [40, 35], [45, 51], [32, 41], [19, 51], [24, 35], [11, 25], [27, 25], [32, 10]], color, 4);
}

function drawTrend(canvas, color) {
  canvas.polyline([[12, 45], [24, 34], [34, 39], [50, 19]], color, 5);
  canvas.line(39, 19, 50, 19, color, 5);
  canvas.line(50, 19, 50, 30, color, 5);
}

function drawCalculator(canvas, color) {
  canvas.rect(18, 12, 28, 40, color, 5);
  canvas.line(24, 22, 40, 22, color, 4);
  for (const y of [32, 42]) {
    for (const x of [25, 33, 41]) canvas.fillCircle(x, y, 2.4, color);
  }
}

function drawSend(canvas, color) {
  canvas.polyline([[12, 18], [52, 32], [12, 46], [22, 33], [12, 18]], color, 5);
  canvas.line(22, 33, 52, 32, color, 4);
}

function drawDomain(canvas, color) {
  drawGlobe(canvas, color);
  canvas.line(19, 48, 45, 48, color, 4);
}

function drawSpeed(canvas, color) {
  canvas.circle(32, 36, 20, color, 5);
  canvas.fillRect(0, 36, 64, 30, TRANSPARENT);
  canvas.line(32, 36, 46, 24, color, 5);
  canvas.line(16, 48, 48, 48, color, 4);
}

function drawBookmark(canvas, color) {
  canvas.rect(20, 12, 24, 42, color, 5);
  canvas.line(21, 52, 32, 43, color, 5);
  canvas.line(32, 43, 43, 52, color, 5);
}

function drawWarning(canvas, color) {
  canvas.polyline([[32, 11], [53, 50], [11, 50], [32, 11]], color, 5);
  canvas.line(32, 25, 32, 38, color, 5);
  canvas.fillCircle(32, 45, 2.5, color);
}

function drawSpark(canvas, color) {
  canvas.line(32, 11, 32, 53, color, 5);
  canvas.line(11, 32, 53, 32, color, 5);
  canvas.line(18, 18, 46, 46, color, 4);
  canvas.line(46, 18, 18, 46, color, 4);
}

function drawIcon(name, color) {
  const canvas = new Canvas(64);

  if (name === 'home' || name === 'home-service') drawHome(canvas, color);
  else if (name === 'assistant' || name === 'ai') drawSpark(canvas, color);
  else if (name === 'toolbox') drawToolbox(canvas, color);
  else if (name === 'search') drawSearch(canvas, color);
  else if (['mine', 'profile', 'user'].includes(name)) drawUser(canvas, color);
  else if (['chat', 'message', 'reply', 'customer-service'].includes(name)) drawChat(canvas, color);
  else if (name === 'send') drawSend(canvas, color);
  else if (['document', 'article', 'knowledge', 'log', 'feature', 'menu'].includes(name)) drawDocument(canvas, color);
  else if (name === 'shield') drawShield(canvas, color);
  else if (name === 'lock' || name === 'api') drawLock(canvas, color);
  else if (name === 'lightning') drawLightning(canvas, color);
  else if (name === 'check') drawCheck(canvas, color);
  else if (name === 'arrow-right') drawArrow(canvas, color);
  else if (name === 'clock' || name === 'history') drawClock(canvas, color);
  else if (name === 'globe' || name === 'whois') drawGlobe(canvas, color);
  else if (name === 'star') drawStar(canvas, color);
  else if (['trend', 'stats', 'seo'].includes(name)) drawTrend(canvas, color);
  else if (['calculator', 'quote', 'price', 'budget'].includes(name)) drawCalculator(canvas, color);
  else if (name === 'domain') drawDomain(canvas, color);
  else if (name === 'speed') drawSpeed(canvas, color);
  else if (name === 'product' || name === 'category') {
    canvas.rect(16, 16, 32, 32, color, 5);
    canvas.line(16, 28, 48, 28, color, 4);
    canvas.line(28, 16, 28, 48, color, 4);
  } else if (name === 'bookmark') drawBookmark(canvas, color);
  else if (name === 'copy') {
    canvas.rect(15, 20, 26, 32, color, 5);
    canvas.rect(23, 12, 26, 32, color, 5);
  } else if (name === 'plan') {
    drawDocument(canvas, color);
    canvas.line(24, 44, 30, 50, color, 4);
    canvas.line(30, 50, 42, 38, color, 4);
  } else if (name === 'warning') drawWarning(canvas, color);
  else if (name === 'empty') {
    canvas.rect(14, 24, 36, 22, color, 5);
    canvas.line(22, 24, 27, 17, color, 4);
    canvas.line(27, 17, 37, 17, color, 4);
    canvas.line(37, 17, 42, 24, color, 4);
  } else drawSpark(canvas, color);

  return canvas;
}

function main() {
  fs.mkdirSync(TAB_DIR, { recursive: true });
  fs.mkdirSync(UI_DIR, { recursive: true });

  for (const [fileName, iconName] of Object.entries(TAB_ICONS)) {
    drawIcon(iconName, GRAY).save(path.join(TAB_DIR, `${fileName}.png`));
    drawIcon(iconName, BLUE).save(path.join(TAB_DIR, `${fileName}-active.png`));
  }

  for (const iconName of UI_ICONS) {
    drawIcon(iconName, COLOR_OVERRIDES[iconName] || BLUE).save(path.join(UI_DIR, `${iconName}.png`));
  }

  console.log(`Generated ${Object.keys(TAB_ICONS).length * 2} tab icons and ${UI_ICONS.length} UI icons`);
}

main();
