// Builds the two themes:
//   colors/ardoise.css + blueprint/*.json -> themes/penombre-ardoise.json
//   colors/papier.css  + blueprint/*.json -> themes/penombre-papier.json
// The color files say what each color is; the blueprints say where it goes.
const fs = require('node:fs');
const path = require('node:path');
const { contrast } = require('./contrast');
const { toHex } = require('./oklch');

const root = path.join(__dirname, '..');
const syntax = require('../blueprint/syntax.json');
const ui = require('../blueprint/ui.json');

const themes = {
  ardoise: { name: 'Penombre Ardoise', type: 'dark' },
  papier: { name: 'Penombre Papier', type: 'light' }
};

// colors/ardoise.css -> { keyword: "#e47da5", ... }
function readColors(theme) {
  const file = `colors/${theme}.css`;
  const css = fs.readFileSync(path.join(root, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const values = {};
  for (const [, name, value] of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    values[name] = value.trim();
  }
  const colors = {};
  const get = (name, seen) => {
    if (!(name in values)) {
      throw new Error(`${file}: var(--${name}) points to a color that does not exist`);
    }
    if (seen.includes(name)) {
      throw new Error(`${file}: --${name} points back to itself`);
    }
    colors[name] ??= parse(values[name], (ref) => get(ref, [...seen, name]), `${file}: --${name}`);
    return colors[name];
  };
  for (const name of Object.keys(values)) {
    get(name, []);
  }
  return colors;
}

// "oklch(0.715 0.134 356.4)" -> "#e47da5", "#E47DA5" -> "#e47da5", "var(--keyword)" -> keyword's value.
function parse(value, lookup, where) {
  const v = value.toLowerCase();
  let m;
  if ((m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/))) {
    return m[1].length === 3 ? '#' + [...m[1]].map((c) => c + c).join('') : v;
  }
  if ((m = v.match(/^var\(--([\w-]+)\)$/))) {
    return lookup(m[1]);
  }
  if (
    (m = v.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/))
  ) {
    const hex = toHex(m[2] ? m[1] / 100 : Number(m[1]), Number(m[3]), Number(m[4]));
    return m[5] === undefined ? hex : hex + alphaHex(m[6] ? Number(m[5]) : m[5] * 100);
  }
  throw new Error(`${where}: "${value}" is not a hex, oklch() or var() color`);
}

function alphaHex(percent) {
  return Math.round((percent / 100) * 255)
    .toString(16)
    .padStart(2, '0');
}

// "accent-selection/40" -> the accent-selection color at 40% opacity.
function pick(colors, ref, where) {
  const [name, alpha] = ref.split('/');
  const hex = colors[name];
  if (hex === undefined) {
    throw new Error(`${where} uses "${name}", which is not in the color file`);
  }
  if (alpha === undefined) {
    return hex;
  }
  if (hex.length > 7) {
    throw new Error(`${where} adds opacity to "${name}", which already has some`);
  }
  return hex + alphaHex(Number(alpha));
}

// "comment": "italic", or "type": { "ardoise": "", "papier": "italic" }
function fontStyle(theme, name) {
  const style = syntax.fontStyles[name];
  return typeof style === 'object' ? style[theme] : style;
}

function build(theme) {
  const colors = readColors(theme);
  const out = {
    $schema: 'vscode://schemas/color-theme',
    name: themes[theme].name,
    type: themes[theme].type,
    semanticHighlighting: true,
    colors: {},
    tokenColors: [],
    semanticTokenColors: {}
  };
  for (const [key, ref] of Object.entries(ui.colors)) {
    out.colors[key] = pick(colors, ref, `blueprint/ui.json "${key}"`);
  }
  for (const rule of syntax.tokenColors) {
    const where = `blueprint/syntax.json "${rule.scope[0]}"`;
    const settings = { foreground: pick(colors, rule.color, where) };
    if (rule.background) {
      settings.background = pick(colors, rule.background, where);
    }
    if (fontStyle(theme, rule.color)) {
      settings.fontStyle = fontStyle(theme, rule.color);
    }
    if (rule.fontStyle !== undefined) {
      settings.fontStyle = rule.fontStyle;
    }
    out.tokenColors.push({ scope: rule.scope, settings });
  }
  for (const [selector, name] of Object.entries(syntax.semanticTokenColors)) {
    // An explicit "" keeps a reference from borrowing the bold of its declaration's TextMate rule.
    out.semanticTokenColors[selector] = {
      foreground: pick(colors, name, `blueprint/syntax.json "${selector}"`),
      fontStyle: fontStyle(theme, name) || ''
    };
  }
  fs.writeFileSync(
    path.join(root, 'themes', `penombre-${theme}.json`),
    JSON.stringify(out, null, 2) + '\n'
  );
  report(theme, colors, out.colors['editor.background']);
}

// Prints the contrast of each code color on the editor background, and colors nothing uses.
function report(theme, colors, background) {
  const code = new Set([
    ...syntax.tokenColors.map((rule) => rule.color),
    ...Object.values(syntax.semanticTokenColors)
  ]);
  const used = new Set([
    ...code,
    ...syntax.tokenColors.map((rule) => rule.background).filter(Boolean),
    ...Object.values(ui.colors).map((ref) => ref.split('/')[0])
  ]);
  const rows = Object.keys(colors)
    .filter((name) => code.has(name))
    .map((name) => {
      const ratio = contrast(colors[name], background);
      const flag = ratio < 4.5 ? '  under 4.5' : '';
      return `  ${name.padEnd(22)} ${ratio.toFixed(2)}${flag}`;
    });
  const unused = Object.keys(colors).filter((name) => !used.has(name));
  console.log(`${themes[theme].name}, contrast on ${background}\n${rows.join('\n')}`);
  if (unused.length) {
    console.log(`  not used: ${unused.map((name) => `--${name}`).join(', ')}`);
  }
}

try {
  for (const theme of Object.keys(themes)) {
    build(theme);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
