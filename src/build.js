// Builds themes/penombre-{ardoise,papier}.json from the two blueprints.
// dark -> "Penombre Ardoise" in penombre-ardoise.json
// role "keyword" -> "oklch(0.74 0.045 blue)" in dark -> "#9fb2c9"
const fs = require('node:fs');
const path = require('node:path');
const palette = require('./palette');
const { contrast } = require('./contrast');
const { oklch } = require('./oklch');

const root = path.join(__dirname, '..');
const syntax = require('../blueprint/syntax.json');
const ui = require('../blueprint/ui.json');

const variant = { dark: 'Ardoise', light: 'Papier' };

// "accent.selection/40" -> the role's ref with 40% alpha. A non-role value is a palette ref.
function color(mode, roles, value) {
  const [name, alpha] = value.split('/');
  const role = roles[name];
  if (!role) {
    return palette.resolve(mode, value);
  }
  const ref = role[mode];
  return palette.resolve(mode, alpha === undefined ? ref : `${ref}/${alpha}`);
}

// fontStyle: "bold", or { dark: "bold", light: "" }
function fontStyle(mode, role) {
  return typeof role.fontStyle === 'object' ? role.fontStyle[mode] : role.fontStyle;
}

function tokenColors(mode) {
  return syntax.scopes.map((rule) => {
    const role = syntax.roles[rule.role];
    const settings = { foreground: color(mode, syntax.roles, rule.role) };
    // background: "red.5/20", or { dark: "red.9", light: "red.0" }
    if (rule.background) {
      const background =
        typeof rule.background === 'string' ? rule.background : rule.background[mode];
      settings.background = color(mode, syntax.roles, background);
    }
    if (fontStyle(mode, role)) {
      settings.fontStyle = fontStyle(mode, role);
    }
    if (rule.fontStyle !== undefined) {
      settings.fontStyle = rule.fontStyle;
    }
    return { scope: rule.scope, settings };
  });
}

function semanticTokenColors(mode) {
  const out = {};
  for (const [selector, name] of Object.entries(syntax.semantic)) {
    const role = syntax.roles[name];
    // An explicit "" keeps a reference from borrowing the bold of its declaration's TextMate rule.
    out[selector] = {
      foreground: color(mode, syntax.roles, name),
      fontStyle: fontStyle(mode, role) || ''
    };
  }
  return out;
}

function colors(mode) {
  const out = {};
  for (const [key, value] of Object.entries(ui.keys)) {
    out[key] = color(mode, ui.roles, value);
  }
  return out;
}

function report(mode, theme) {
  const bg = theme.colors['editor.background'];
  const rows = Object.entries(syntax.roles).map(([name, role]) => {
    const hex = color(mode, syntax.roles, name).slice(0, 7);
    const ratio = contrast(hex, bg.slice(0, 7));
    const { l, c, h } = oklch(hex);
    const flag = ratio < 4.5 ? '  < 4.5' : '';
    const lch = `L${l.toFixed(2)} C${c.toFixed(3)} H${Math.round(h)}`;
    return `  ${role.importance}  ${name.padEnd(20)} ${hex}  ${lch.padEnd(20)} ${ratio.toFixed(2)}${flag}`;
  });
  console.log(`${mode} (editor ${bg})\n${rows.join('\n')}`);
}

for (const mode of ['dark', 'light']) {
  const theme = {
    $schema: 'vscode://schemas/color-theme',
    name: `Penombre ${variant[mode]}`,
    type: mode,
    semanticHighlighting: true,
    colors: colors(mode),
    tokenColors: tokenColors(mode),
    semanticTokenColors: semanticTokenColors(mode)
  };
  fs.writeFileSync(
    path.join(root, 'themes', `penombre-${variant[mode].toLowerCase()}.json`),
    JSON.stringify(theme, null, 2) + '\n'
  );
  report(mode, theme);
}
