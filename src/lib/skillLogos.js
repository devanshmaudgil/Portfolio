import {
  siCss,
  siDart,
  siFlutter,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siLaravel,
  siMysql,
  siNodedotjs,
  siPhp,
  siReact,
  siSqlite,
  siWordpress,
} from "simple-icons";

// Simple Icons ship a single path in a 24x24 viewBox
const ICONS = {
  javascript: siJavascript,
  react: siReact,
  nodejs: siNodedotjs,
  php: siPhp,
  laravel: siLaravel,
  html5: siHtml5,
  css: siCss,
  flutter: siFlutter,
  dart: siDart,
  mysql: siMysql,
  sqlite: siSqlite,
  wordpress: siWordpress,
  git: siGit,
  github: siGithub,
};

const OVERRIDE_COLOR = {
  github: "e6edf3",
  sqlite: "3aa9dc",
  flutter: "47c5fb",
};

const RES = 420;
const cache = new Map();

function renderMask(icon) {
  const canvas = document.createElement("canvas");
  canvas.width = RES;
  canvas.height = RES;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const scale = RES / 24;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D(icon.path));
  return ctx.getImageData(0, 0, RES, RES).data;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}

function samplePoints(id) {
  const icon = ICONS[id];
  if (!icon) return [];

  const data = renderMask(icon);
  const hits = [];
  // Step 1 keeps the outline crisp; the icon is only 420px wide
  for (let y = 0; y < RES; y += 1) {
    for (let x = 0; x < RES; x += 1) {
      if (data[(y * RES + x) * 4 + 3] > 110) {
        hits.push([x, y]);
      }
    }
  }
  if (!hits.length) return [];

  shuffle(hits);
  return hits.map(([x, y]) => ({
    x: (x - RES / 2) / RES,
    y: (y - RES / 2) / RES,
  }));
}

export function getLogoPoints(id, count) {
  if (!cache.has(id)) cache.set(id, samplePoints(id));
  const all = cache.get(id);
  if (!all.length) return [];
  if (!count || count >= all.length) return all;

  // Even stride across the shuffled set keeps coverage uniform
  const stride = all.length / count;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(all[Math.floor(i * stride)]);
  }
  return out;
}

export function getSkillColor(id) {
  const hex = OVERRIDE_COLOR[id] || ICONS[id]?.hex;
  return hex ? `#${hex}` : "#e8b86d";
}
