import { getPortfolio, type Language } from '@/v2/data/portfolio'
import { asciiArtFor, getBootLines, getHintText, HINT_DELAY_MS, START_COMMAND } from './boot'
import { TerminalEngine } from './engine'
import { getRoot } from './filesystem'
import { buildSlFrames } from './sl'
import type { CommandResult } from './commands'

const lang: Language = document.documentElement.lang === 'en' ? 'en' : 'ja'
const { projects } = getPortfolio(lang)
const engine = new TerminalEngine(lang)
const HINT_TEXT = getHintText(lang)
const CLOSE_PREVIEW_LABEL = lang === 'en' ? 'Close preview' : 'プレビューを閉じる'
const VIEW_PROJECT_LABEL = lang === 'en' ? 'View Project →' : 'プロジェクトを見る →'
const RELOAD_HINT =
	lang === 'en' ? 'Reload this page to restart.' : 'このページを再読み込みすると復帰します。'
const SL_HINT =
	lang === 'en' ? '(hint: you probably meant `ls`)' : '(ヒント: `ls` の打ち間違いかも)'

// A real Linux kernel panic dump — kept in English regardless of display
// language, like every other piece of "shell" text in this app (help text,
// error messages): a panic is system-level output, not portfolio content.
const KERNEL_PANIC = [
	'Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000100',
	'',
	'CPU: 0 PID: 1 Comm: portfolio-shell Not tainted',
	'Call Trace:',
	' rm_rf_root+0x1a/0x40',
	' do_wipe_filesystem+0x88/0xb0',
	' sys_execve+0x2e/0x30',
	' entry_SYSCALL_64+0x7c/0x7c',
	'---[ end Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000100 ]---'
].join('\n')

const output = document.getElementById('pf-output') as HTMLDivElement
const inputRow = document.getElementById('pf-input-row') as HTMLDivElement
const input = document.getElementById('pf-input') as HTMLInputElement
const promptEl = document.getElementById('pf-prompt') as HTMLSpanElement
const windowEl = document.getElementById('pf-window') as HTMLDivElement
const preview = document.getElementById('pf-preview') as HTMLDivElement
const mobileKeys = document.getElementById('pf-mobile-keys')
const mobileCommands = document.getElementById('pf-mobile-commands')

let booted = false
let busy = false
let skipRequested = false
let hintTimer: number | undefined

const sleep = (ms: number) =>
	new Promise<void>((resolve) => {
		const wait = () => {
			if (skipRequested) return resolve()
			window.setTimeout(resolve, ms)
		}
		wait()
	})

function scrollToBottom() {
	output.scrollTop = output.scrollHeight
}

function printRaw(text: string, className = 'pf-line-output') {
	const el = document.createElement('div')
	el.className = className
	el.textContent = text
	// inputRow lives inside #pf-output as its last child (a real terminal's
	// input sits right after the last printed line, not in a separate fixed
	// bar) — inserting before it instead of appending keeps it pinned there.
	output.insertBefore(el, inputRow)
	scrollToBottom()
}

/** Clears printed output while keeping the (single, persistent) input row. */
function clearOutput() {
	Array.from(output.children).forEach((child) => {
		if (child !== inputRow) child.remove()
	})
}

function printLines(lines: string[], className?: string) {
	lines.forEach((line) => printRaw(line, className))
}

function updatePrompt() {
	promptEl.textContent = engine.getPrompt()
}

function resetHintTimer() {
	if (hintTimer) window.clearTimeout(hintTimer)
	if (booted) return
	hintTimer = window.setTimeout(() => printRaw(HINT_TEXT, 'pf-line-hint'), HINT_DELAY_MS)
}

async function playBoot() {
	busy = true
	skipRequested = false
	clearOutput()
	for (const line of getBootLines(lang)) {
		printRaw(line.text, line.className)
		if (!skipRequested && line.delayMs) await sleep(line.delayMs)
	}
	const art = asciiArtFor()
	printRaw('')
	art.forEach((row) => printRaw(row, 'pf-ascii'))
	printRaw('')
	booted = true
	busy = false
	skipRequested = false
	updatePrompt()
}

/** `sl`: a steam locomotive crosses the window instead of listing files. */
async function playSl() {
	busy = true
	skipRequested = false
	const el = document.createElement('div')
	el.className = 'pf-ascii'
	output.insertBefore(el, inputRow)
	for (const frame of buildSlFrames()) {
		if (skipRequested) break
		el.textContent = frame.join('\n')
		scrollToBottom()
		await sleep(90)
	}
	printRaw(SL_HINT, 'pf-line-hint')
	busy = false
	skipRequested = false
	updatePrompt()
}

/**
 * Takes the window over completely with a fake kernel-panic dump and
 * disables input — there is no scripted way back from here, same as a
 * real crash. Reloading the page (fresh JS state) is the only fix.
 */
function showCrashScreen() {
	input.disabled = true
	input.blur()
	mobileKeys?.setAttribute('hidden', '')
	mobileCommands?.setAttribute('hidden', '')

	const overlay = document.createElement('div')
	overlay.className = 'pf-crash-screen'
	overlay.textContent = `${KERNEL_PANIC}\n\n`

	const hint = document.createElement('span')
	hint.className = 'pf-crash-hint'
	hint.textContent = RELOAD_HINT

	const cursor = document.createElement('span')
	cursor.className = 'pf-crash-cursor'

	overlay.append(hint, cursor)
	windowEl.appendChild(overlay)
}

async function playWipe() {
	busy = true
	skipRequested = false
	// Real paths from the actual filesystem, not a hardcoded fake list —
	// what's "deleted" here is what `tree`/`ls` would really show you.
	for (const entry of getRoot(lang).children) {
		const path = `~/${entry.name}`
		if (entry.type === 'dir') {
			printRaw(`rm: descending into directory '${path}'`)
			await sleep(90)
			printRaw(`removed directory '${path}'`)
		} else {
			printRaw(`removed '${path}'`)
		}
		await sleep(150)
	}
	printRaw('████████████████████ 100%')
	await sleep(300)
	printRaw(`rm: cannot remove '/': Device or resource busy`, 'pf-line-error')
	await sleep(500)
	printRaw('Segmentation fault (core dumped)', 'pf-line-error')
	await sleep(700)
	windowEl.classList.add('pf-window--glitch')
	await sleep(900)
	windowEl.classList.remove('pf-window--glitch')
	showCrashScreen()
}

function renderPreview(slug: string) {
	const project = projects.find((p) => p.slug === slug)
	if (!project || !preview) return
	preview.hidden = false
	preview.innerHTML = ''

	const header = document.createElement('div')
	header.className = 'pf-preview__header'
	const h3 = document.createElement('h3')
	h3.textContent = project.heading
	const closeButton = document.createElement('button')
	closeButton.type = 'button'
	closeButton.className = 'pf-chip pf-chip--sm pf-preview__close'
	closeButton.setAttribute('aria-label', CLOSE_PREVIEW_LABEL)
	closeButton.textContent = '×'
	closeButton.addEventListener('click', () => {
		preview.hidden = true
	})
	header.append(h3, closeButton)

	const p = document.createElement('p')
	p.textContent = project.concept
	const tech = document.createElement('div')
	tech.className = 'pf-tech'
	project.tech.forEach((t) => {
		const span = document.createElement('span')
		span.className = 'pf-chip pf-chip--sm'
		span.textContent = t
		tech.appendChild(span)
	})
	preview.append(header, p, tech)

	if (project.href) {
		const a = document.createElement('a')
		a.className = 'pf-link'
		a.href = project.href
		a.target = '_blank'
		a.rel = 'noopener noreferrer'
		a.textContent = VIEW_PROJECT_LABEL
		preview.appendChild(a)
	}
}

async function applyResult(result: CommandResult) {
	switch (result.type) {
		case 'text':
			printLines(result.lines)
			break
		case 'open':
			printLines(result.lines)
			renderPreview(result.slug)
			break
		case 'clear':
			clearOutput()
			break
		case 'cd':
			if (result.lines) printLines(result.lines)
			break
		case 'reboot':
			await playBoot()
			break
		case 'wipe':
			await playWipe()
			break
		case 'sl':
			await playSl()
			break
	}
}

async function handleSubmit(raw: string) {
	if (busy) {
		skipRequested = true
		return
	}
	input.value = ''
	const trimmed = raw.trim()

	if (trimmed === START_COMMAND || trimmed === 'start.sh') {
		printRaw(`${engine.getPrompt()} ${raw}`, 'pf-line-command')
		engine.cmdHistory.push(trimmed)
		await playBoot()
		return
	}

	const { entry, result } = engine.submit(raw)
	printRaw(`${entry.prompt} ${entry.command}`, 'pf-line-command')
	await applyResult(result)
	updatePrompt()
	resetHintTimer()
}

function triggerTabComplete() {
	const { value, suggestions } = engine.complete(input.value)
	input.value = value
	if (suggestions.length > 1) {
		printRaw(`${engine.getPrompt()} ${input.value}`, 'pf-line-command')
		printLines(suggestions)
	}
}

function historyUp() {
	const value = engine.historyUp()
	if (value !== undefined) input.value = value
}

function historyDown() {
	input.value = engine.historyDown()
}

/** Moves the input's text cursor by `delta` characters — for the on-screen
 * ←/→ buttons, which stand in for arrow keys a mobile keyboard lacks. */
function moveCursor(delta: number) {
	const pos = input.selectionStart ?? input.value.length
	const next = Math.max(0, Math.min(input.value.length, pos + delta))
	input.setSelectionRange(next, next)
}

/** Inserts `text` at the cursor (replacing any selection) — for the
 * on-screen `/ . - ~` buttons, standing in for a phone keyboard's symbols
 * layout switch. */
function insertAtCursor(text: string) {
	const start = input.selectionStart ?? input.value.length
	const end = input.selectionEnd ?? input.value.length
	input.value = input.value.slice(0, start) + text + input.value.slice(end)
	const pos = start + text.length
	input.setSelectionRange(pos, pos)
}

input.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		e.preventDefault()
		void handleSubmit(input.value)
		return
	}
	if (e.key === 'ArrowUp') {
		e.preventDefault()
		historyUp()
		return
	}
	if (e.key === 'ArrowDown') {
		e.preventDefault()
		historyDown()
		return
	}
	if (e.key === 'Tab') {
		e.preventDefault()
		triggerTabComplete()
		return
	}
	if (e.ctrlKey && e.key.toLowerCase() === 'l') {
		e.preventDefault()
		clearOutput()
		return
	}
	if (e.ctrlKey && e.key.toLowerCase() === 'c') {
		e.preventDefault()
		printRaw(`${engine.getPrompt()} ${input.value}^C`, 'pf-line-command')
		input.value = ''
		return
	}
	resetHintTimer()
})

windowEl.addEventListener('click', () => input.focus())

// --- on-screen keys mobile lacks: Tab, arrows, Enter, Ctrl+L (Clear), and
// symbols usually behind a keyboard layout switch (/ . - ~) ---
// Each one runs immediately, the same as pressing the real key — there is
// nothing to review first, unlike the quick commands below.
mobileKeys?.querySelectorAll<HTMLButtonElement>('[data-key]').forEach((button) => {
	// Prevent the button from stealing focus (and dismissing the on-screen
	// keyboard) before the click handler runs.
	button.addEventListener('pointerdown', (e) => e.preventDefault())
	button.addEventListener('click', () => {
		switch (button.dataset.key) {
			case 'tab':
				triggerTabComplete()
				break
			case 'enter':
				void handleSubmit(input.value)
				break
			case 'up':
				historyUp()
				break
			case 'down':
				historyDown()
				break
			case 'left':
				moveCursor(-1)
				break
			case 'right':
				moveCursor(1)
				break
			case 'clear':
				clearOutput()
				break
			default:
				// Not a named action — e.g. `/ . - ~` — so the key itself is the
				// literal text to insert at the cursor.
				if (button.dataset.key) insertAtCursor(button.dataset.key)
		}
		input.focus()
	})
})

// --- on-screen quick commands (mobile: tap instead of typing) ---
// These only fill the input — like Tab-completion, they never run the
// command themselves. Enter is the one way to submit, same as typing it
// by hand, so a tap doesn't fire off `ls`/`open <slug>` on the visitor
// before they've seen what's about to run.
mobileCommands?.querySelectorAll<HTMLButtonElement>('[data-cmd]').forEach((button) => {
	button.addEventListener('pointerdown', (e) => e.preventDefault())
	button.addEventListener('click', () => {
		input.value = button.dataset.cmd ?? ''
		input.focus()
	})
})

// --- mode toggle (terminal / collage) ---
const modeButtons = document.querySelectorAll<HTMLButtonElement>('[data-mode]')
const views = {
	terminal: document.getElementById('pf-terminal-view'),
	collage: document.getElementById('pf-collage-view')
}

modeButtons.forEach((button) => {
	button.addEventListener('click', () => {
		const mode = button.dataset.mode as 'terminal' | 'collage'
		modeButtons.forEach((b) => b.classList.toggle('is-active', b === button))
		Object.entries(views).forEach(([key, el]) => {
			if (el) el.hidden = key !== mode
		})
		if (mode === 'terminal') input.focus()
	})
})

updatePrompt()
// The boot command is already typed in for the visitor — pressing Enter is
// the only thing left to do — and the hint right away says exactly that,
// instead of waiting for the first idle timeout.
input.value = START_COMMAND
printRaw(HINT_TEXT, 'pf-line-hint')
input.focus()
input.select()
