// Sunglass is GitHub Default in OKLCH, on a slate (dark) or paper (light) background, with softer contrast.
// A GitHub color keeps its hue; its chroma is scaled by `chroma`; its contrast on the editor becomes GitHub's ratio ** soften.
// dark fg: 16:1 on #0d1117 -> 16 ** 0.85 = 10.6:1 on slate
// Ratios at or above `floor` never drop below it; ratios under it stay as they are.
module.exports = {
	dark: {
		background: 'oklch(0.27 0.018 gray)',
		github: '#0d1117',
		soften: 0.85,
		chroma: 0.85,
		floor: 4.5
	},
	light: {
		background: 'oklch(0.925 0.02 stone)',
		github: '#ffffff',
		soften: 0.86,
		chroma: 0.75,
		floor: 4.5
	}
}
