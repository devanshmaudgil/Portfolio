function dilate(src, w, h) {
  const out = new Uint8Array(src.length);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      let on = 0;
      for (let dy = -1; dy <= 1 && !on; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (src[(y + dy) * w + (x + dx)]) on = 1;
        }
      }
      out[y * w + x] = on;
    }
  }
  return out;
}

export function buildSilhouetteMask(image, cols = 360, rows = 203) {
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);

  const lit = new Uint8Array(cols * rows);
  for (let i = 0; i < cols * rows; i += 1) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const warm = r > 28 && r >= g && r > b + 6;
    if (lum > 16 || warm) lit[i] = 1;
  }

  let wall = lit;
  wall = dilate(wall, cols, rows);
  wall = dilate(wall, cols, rows);
  wall = dilate(wall, cols, rows);

  const xMin = Math.floor(cols * 0.1);
  const xMax = Math.floor(cols * 0.9);
  const yMax = Math.floor(rows * 0.8);

  const left = new Float32Array(rows).fill(cols);
  const right = new Float32Array(rows).fill(-1);
  let minRow = rows;
  let maxRow = -1;

  for (let y = Math.floor(rows * 0.06); y < yMax; y += 1) {
    for (let x = xMin; x < xMax; x += 1) {
      if (!wall[y * cols + x]) continue;
      if (x < left[y]) left[y] = x;
      if (x > right[y]) right[y] = x;
      if (y < minRow) minRow = y;
      if (y > maxRow) maxRow = y;
    }
    if (right[y] - left[y] > cols * 0.7) {
      left[y] = cols;
      right[y] = -1;
    }
  }

  if (maxRow < 0) {
    return { body: new Uint8Array(cols * rows), cols, rows };
  }

  const fillGaps = (arr, empty, fallback) => {
    let last = fallback;
    for (let y = minRow; y <= maxRow; y += 1) {
      if (arr[y] !== empty) last = arr[y];
      else arr[y] = last;
    }
    last = fallback;
    for (let y = maxRow; y >= minRow; y -= 1) {
      if (arr[y] !== empty && arr[y] !== fallback) last = arr[y];
      else if (arr[y] === empty) arr[y] = last;
    }
  };

  fillGaps(left, cols, cols * 0.35);
  fillGaps(right, -1, cols * 0.65);

  const body = new Uint8Array(cols * rows);
  const pad = 3;
  for (let y = minRow; y <= maxRow; y += 1) {
    const x0 = Math.max(0, Math.floor(left[y]) - pad);
    const x1 = Math.min(cols - 1, Math.ceil(right[y]) + pad);
    for (let x = x0; x <= x1; x += 1) body[y * cols + x] = 1;
  }

  return { body, cols, rows };
}

export function containRect(containerW, containerH, imageW, imageH) {
  const scale = Math.min(containerW / imageW, containerH / imageH);
  const w = imageW * scale;
  const h = imageH * scale;
  return {
    x: (containerW - w) / 2,
    y: (containerH - h) / 2,
    w,
    h,
    scale,
  };
}

export function buildMaskUrl(mask, image, hostW, hostH) {
  const width = Math.max(1, Math.round(hostW));
  const height = Math.max(1, Math.round(hostH));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const pixels = ctx.createImageData(width, height);
  const box = containRect(width, height, image.naturalWidth, image.naturalHeight);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      let visible = 255;
      if (
        x >= box.x &&
        y >= box.y &&
        x <= box.x + box.w &&
        y <= box.y + box.h
      ) {
        const mx = Math.floor(((x - box.x) / box.w) * mask.cols);
        const my = Math.floor(((y - box.y) / box.h) * mask.rows);
        if (
          mx >= 0 &&
          my >= 0 &&
          mx < mask.cols &&
          my < mask.rows &&
          mask.body[my * mask.cols + mx]
        ) {
          visible = 0;
        }
      }
      pixels.data[i] = 255;
      pixels.data[i + 1] = 255;
      pixels.data[i + 2] = 255;
      pixels.data[i + 3] = visible;
    }
  }

  ctx.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
}
