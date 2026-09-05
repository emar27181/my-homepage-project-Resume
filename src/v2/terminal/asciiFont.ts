/**
 * Tiny 5-row block font, just wide enough to spell the handle/name shown
 * after boot. One glyph table, two render calls (wide/narrow name) — see
 * boot.ts — instead of two hand-drawn ascii-art blocks that could drift.
 */
const GLYPHS: Record<string, string[]> = {
	A: [' ██ ', '█  █', '████', '█  █', '█  █'],
	D: ['███ ', '█  █', '█  █', '█  █', '███ '],
	E: ['████', '█   ', '███ ', '█   ', '████'],
	M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
	N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
	O: ['████', '█  █', '█  █', '█  █', '████'],
	R: ['███ ', '█  █', '███ ', '█ █ ', '█  █'],
	U: ['█  █', '█  █', '█  █', '█  █', ' ██ '],
	Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
	' ': ['  ', '  ', '  ', '  ', '  ']
}

export function renderAsciiWord(word: string): string[] {
	const glyphs = word
		.toUpperCase()
		.split('')
		.map((ch) => GLYPHS[ch] ?? GLYPHS[' '])
	const rows = ['', '', '', '', '']
	glyphs.forEach((glyph, i) => {
		for (let row = 0; row < 5; row++) {
			rows[row] += glyph[row] + (i < glyphs.length - 1 ? ' ' : '')
		}
	})
	return rows
}
