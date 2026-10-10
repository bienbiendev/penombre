// hex <-> OKLCH. oklch("#79c0ff") -> { l: 0.80, c: 0.11, h: 250 }
function oklch(hex) {
	const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
	const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	const h = (Math.atan2(B, A) * 180) / Math.PI
	return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h }
}

function rgb(l, c, h) {
	const a = c * Math.cos((h * Math.PI) / 180)
	const b = c * Math.sin((h * Math.PI) / 180)
	const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
	const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
	const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
	return [
		4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
		-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
		-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_
	]
}

// OKLCH -> hex. Out-of-gamut colors keep their lightness and hue and lose chroma.
// toHex(0.78, 0.06, 300) -> "#c8b8e4"
function toHex(l, c, h) {
	const inGamut = (channels) => channels.every((v) => v >= -0.0001 && v <= 1.0001)
	let chroma = c
	while (chroma > 0 && !inGamut(rgb(l, chroma, h))) {
		chroma -= 0.002
	}
	const gamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
	return (
		'#' +
		rgb(l, Math.max(chroma, 0), h)
			.map((v) => Math.round(Math.min(1, Math.max(0, gamma(v))) * 255).toString(16).padStart(2, '0'))
			.join('')
	)
}

module.exports = { oklch, toHex }
