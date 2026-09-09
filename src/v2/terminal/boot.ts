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
	{
		text: `Welcome to ${profile.name}'s portfolio — mounted as a filesystem you can explore.`,
		delayMs: 120
	},
	{ text: '', delayMs: 40 },
	{ text: 'Try: whoami · ls · cd projects · open <slug> · help', delayMs: 120 },
	{ text: '', delayMs: 40 },
	{ text: '────────────────────────────────────────────', delayMs: 0 }
]

export const HINT_DELAY_MS = 6000
// The input already has ./start.sh typed in for the visitor (see app.ts) —
// all that is left to do is run it, so the hint says exactly that.
export const HINT_TEXT = 'Hint: press Enter to boot'
export const START_COMMAND = './start.sh'

export function asciiArtFor(width: number): string[] {
	return width < 560 ? renderAsciiWord('EMAR') : renderAsciiWord('EMAR27181')
}
