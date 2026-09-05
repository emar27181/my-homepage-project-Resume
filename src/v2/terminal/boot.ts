import { profile } from '@/v2/data/portfolio'
import { renderAsciiWord } from './asciiFont'

export interface BootLine {
	text: string
	delayMs: number
}

/** Lines streamed one at a time on `./start.sh`. Timed 50-200ms apart per docs/DESIGN.md pacing note. */
export const bootLines: BootLine[] = [
	{ text: '', delayMs: 60 },
	{ text: 'portfolio-shell v1.0.0', delayMs: 150 },
	{ text: '', delayMs: 80 },
	{ text: '[ OK ] Loading profile.............. done', delayMs: 90 },
	{ text: '[ OK ] Loading projects............. 7 found', delayMs: 90 },
	{ text: '[ OK ] Loading research.............. done', delayMs: 90 },
	{ text: '[ OK ] Loading skills................ done', delayMs: 90 },
	{ text: '[ OK ] Loading hobbies............... done', delayMs: 90 },
	{ text: '[ OK ] Mounting portfolio filesystem', delayMs: 150 },
	{ text: '', delayMs: 80 },
	{ text: '────────────────────────────────────────────', delayMs: 40 },
	{ text: '', delayMs: 40 },
	{ text: `Welcome to ${profile.name}'s portfolio.`, delayMs: 120 },
	{ text: '', delayMs: 40 },
	{ text: 'Type `help` to see available commands.', delayMs: 120 },
	{ text: '', delayMs: 40 },
	{ text: '────────────────────────────────────────────', delayMs: 0 }
]

export const HINT_DELAY_MS = 6000
export const HINT_TEXT = 'Hint: try ./start.sh'

export function asciiArtFor(width: number): string[] {
	return width < 560 ? renderAsciiWord('RYU') : renderAsciiWord('NODOAME')
}
