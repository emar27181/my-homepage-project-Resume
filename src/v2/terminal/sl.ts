/**
 * `sl` — the classic "you meant `ls`" joke: a steam locomotive chugs across
 * the terminal instead of listing files. One fixed piece of ASCII art
 * (TRAIN); `buildSlFrames` slides it across a virtual `width`-column strip
 * frame by frame, same idea as `asciiFont.ts` generating one glyph table
 * instead of several hand-drawn logos. app.ts plays the frames back with a
 * delay between each, same pattern as the boot sequence.
 */
const TRAIN: string[] = [
	'      ====        ________',
	'  _D _|  |_______/        \\',
	'   |(_)---  |   H\\________/',
	'   /     |  |   H  |  |',
	'  |      |  |   H  |__|',
	'  |______|___H__/__|____)',
	' _|________|_[][][][][]__|',
	'(_)(_)---(_)  (_)(_)---(_)'
]

const TRAIN_WIDTH = Math.max(...TRAIN.map((line) => line.length))

/**
 * Frames for the train crossing a `width`-column strip right-to-left (same
 * direction as the original `sl`): starts fully off-screen right, ends
 * fully off-screen left.
 */
export function buildSlFrames(width = 60, step = 2): string[][] {
	const frames: string[][] = []
	for (let pad = width; pad > -TRAIN_WIDTH; pad -= step) {
		frames.push(
			TRAIN.map((line) =>
				pad >= 0 ? ' '.repeat(pad) + line : line.slice(Math.min(-pad, line.length))
			)
		)
	}
	return frames
}
