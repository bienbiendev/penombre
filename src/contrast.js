// WCAG contrast of a palette ref against a background ref.
// node src/contrast.js dark blue.2 gray.9   ->  9.12
function luminance(hex) {
	const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
	const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a, b) {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (hi + 0.05) / (lo + 0.05)
}

module.exports = { contrast, luminance }

if (require.main === module) {
	const { resolve } = require('./palette')
	const [mode, fg, bg] = process.argv.slice(2)
	console.log(contrast(resolve(mode, fg), resolve(mode, bg)).toFixed(2))
}
