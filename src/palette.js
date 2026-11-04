const { oklch, toHex } = require('./oklch');
const { contrast } = require('./contrast');
const soften = require('./soften');

// The GitHub (Primer) color range, unchanged. Index 0 is always the lightest step.
// palette.dark.blue[2] -> "#79c0ff"
// The one added color: stone, the warm neutral of paper and concrete.

const dark = {
  black: '#010409',
  white: '#ffffff',
  gray: [
    '#f0f6fc',
    '#c9d1d9',
    '#b1bac4',
    '#8b949e',
    '#6e7681',
    '#484f58',
    '#30363d',
    '#21262d',
    '#161b22',
    '#0d1117'
  ],
  blue: [
    '#cae8ff',
    '#a5d6ff',
    '#79c0ff',
    '#58a6ff',
    '#388bfd',
    '#1f6feb',
    '#1158c7',
    '#0d419d',
    '#0c2d6b',
    '#051d4d'
  ],
  green: [
    '#aff5b4',
    '#7ee787',
    '#56d364',
    '#3fb950',
    '#2ea043',
    '#238636',
    '#196c2e',
    '#0f5323',
    '#033a16',
    '#04260f'
  ],
  yellow: [
    '#f8e3a1',
    '#f2cc60',
    '#e3b341',
    '#d29922',
    '#bb8009',
    '#9e6a03',
    '#845306',
    '#693e00',
    '#4b2900',
    '#341a00'
  ],
  orange: [
    '#ffdfb6',
    '#ffc680',
    '#ffa657',
    '#f0883e',
    '#db6d28',
    '#bd561d',
    '#9b4215',
    '#762d0a',
    '#5a1e02',
    '#3d1300'
  ],
  red: [
    '#ffdcd7',
    '#ffc1ba',
    '#ffa198',
    '#ff7b72',
    '#f85149',
    '#da3633',
    '#b62324',
    '#8e1519',
    '#67060c',
    '#490202'
  ],
  purple: [
    '#eddeff',
    '#e2c5ff',
    '#d2a8ff',
    '#bc8cff',
    '#a371f7',
    '#8957e5',
    '#6e40c9',
    '#553098',
    '#3c1e70',
    '#271052'
  ],
  pink: [
    '#ffdaec',
    '#ffbedd',
    '#ff9bce',
    '#f778ba',
    '#db61a2',
    '#bf4b8a',
    '#9e3670',
    '#7d2457',
    '#5e103e',
    '#42062a'
  ],
  coral: [
    '#ffddd2',
    '#ffc2b2',
    '#ffa28b',
    '#f78166',
    '#ea6045',
    '#cf462d',
    '#ac3220',
    '#872012',
    '#640d04',
    '#460701'
  ],
  // Off-scale values GitHub Dark Default already ships.
  special: {
    fg: '#e6edf3',
    muted: '#7d8590',
    accent: '#2f81f7',
    cyan: '#39c5cf',
    cyanBright: '#56d4dd'
  },
  added: { stone: '#a19c90' }
};

const light = {
  black: '#24292f',
  white: '#ffffff',
  gray: [
    '#f6f8fa',
    '#eaeef2',
    '#d0d7de',
    '#afb8c1',
    '#8c959f',
    '#6e7781',
    '#57606a',
    '#424a53',
    '#32383f',
    '#24292f'
  ],
  blue: [
    '#ddf4ff',
    '#b6e3ff',
    '#80ccff',
    '#54aeff',
    '#218bff',
    '#0969da',
    '#0550ae',
    '#033d8b',
    '#0a3069',
    '#002155'
  ],
  green: [
    '#dafbe1',
    '#aceebb',
    '#6fdd8b',
    '#4ac26b',
    '#2da44e',
    '#1a7f37',
    '#116329',
    '#044f1e',
    '#003d16',
    '#002d11'
  ],
  yellow: [
    '#fff8c5',
    '#fae17d',
    '#eac54f',
    '#d4a72c',
    '#bf8700',
    '#9a6700',
    '#7d4e00',
    '#633c01',
    '#4d2d00',
    '#3b2300'
  ],
  orange: [
    '#fff1e5',
    '#ffd8b5',
    '#ffb77c',
    '#fb8f44',
    '#e16f24',
    '#bc4c00',
    '#953800',
    '#762c00',
    '#5c2200',
    '#471700'
  ],
  red: [
    '#ffebe9',
    '#ffcecb',
    '#ffaba8',
    '#ff8182',
    '#fa4549',
    '#cf222e',
    '#a40e26',
    '#82071e',
    '#660018',
    '#4c0014'
  ],
  purple: [
    '#fbefff',
    '#ecd8ff',
    '#d8b9ff',
    '#c297ff',
    '#a475f9',
    '#8250df',
    '#6639ba',
    '#512a97',
    '#3e1f79',
    '#2e1461'
  ],
  pink: [
    '#ffeff7',
    '#ffd3eb',
    '#ffadda',
    '#ff80c8',
    '#e85aad',
    '#bf3989',
    '#99286e',
    '#772057',
    '#611347',
    '#4d0336'
  ],
  coral: [
    '#fff0eb',
    '#ffd6cc',
    '#ffb4a1',
    '#fd8c73',
    '#ec6547',
    '#c4432b',
    '#9e2f1c',
    '#801f0f',
    '#691105',
    '#510901'
  ],
  // Off-scale values GitHub Light Default already ships.
  special: {
    fg: '#1f2328',
    muted: '#656d76',
    green: '#1f883d',
    border: '#d8dee4',
    cyan: '#1b7c83',
    cyanBright: '#3192aa'
  },
  added: { stone: '#a19c90' }
};

// The hue of a color family, read from its step closest to the lightness asked.
// hue("dark", "purple", 0.78) -> 306
function hue(mode, family, l) {
  const colors = mode === 'dark' ? dark : light;
  const steps = [colors[family] ?? colors.special[family] ?? colors.added[family]].flat();
  if (!steps[0]) {
    throw new Error(`Unknown color family "${family}" in ${mode}`);
  }
  const nearest = steps.map(oklch).sort((a, b) => Math.abs(a.l - l) - Math.abs(b.l - l))[0];
  return nearest.h;
}

// "blue.2" -> "#79c0ff", "blue.2/40" -> "#79c0ff66", "#123456" passes through.
// "oklch(0.78 0.06 purple)" -> purple's hue at that lightness and chroma.
// "soft(red.3)" -> red.3 at a softer contrast on the Penombre background (see soften.js).
// "soft(pink.3 0.11 8)" -> pink.3's contrast, with chroma 0.11 and hue 8.
// "background" -> the editor background.
function resolve(mode, ref) {
  if (ref.startsWith('#')) {
    return ref;
  }
  const [path, alpha] = ref.split('/');
  const hex = color(mode, path);
  if (typeof hex !== 'string') {
    throw new Error(`Unknown color "${ref}" in ${mode}`);
  }
  if (alpha === undefined) {
    return hex;
  }
  const a = Math.round((Number(alpha) / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + a;
}

function color(mode, path) {
  if (path === 'background') {
    return resolve(mode, soften[mode].background);
  }
  if (path.startsWith('oklch(')) {
    return fromOklch(mode, path);
  }
  if (path.startsWith('soft(')) {
    return soft(mode, path.slice(5, -1));
  }
  return path.split('.').reduce((node, key) => node?.[key], mode === 'dark' ? dark : light);
}

function fromOklch(mode, ref) {
  const [l, c, family] = ref.slice(6, -1).trim().split(/\s+/);
  const h = Number.isNaN(Number(family)) ? hue(mode, family, Number(l)) : Number(family);
  return toHex(Number(l), Number(c), h);
}

// GitHub's color with less chroma, moved in lightness until its contrast on our background is GitHub's, softened.
function soft(mode, args) {
  const [ref, c, h] = args.trim().split(/\s+/);
  const source = resolve(mode, ref);
  const { github, soften: power, chroma, floor } = soften[mode];
  const ratio = contrast(source, github);
  const target = ratio >= floor ? Math.max(floor, ratio ** power) : ratio;
  const lch = oklch(source);
  const finalChroma = c === undefined ? lch.c * chroma : Number(c);
  const finalHue = h === undefined ? lch.h : Number(h);
  return solve(mode, target, (l) => toHex(l, finalChroma, finalHue));
}

// Finds the lightness whose color reaches the target contrast on the editor background.
function solve(mode, target, color) {
  const background = resolve(mode, 'background');
  let [lo, hi] = mode === 'dark' ? [oklch(background).l, 1] : [0, oklch(background).l];
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const enough = contrast(color(mid), background) >= target;
    if (mode === 'dark' ? enough : !enough) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return color(mode === 'dark' ? hi : lo);
}

module.exports = { dark, light, resolve, hue };
