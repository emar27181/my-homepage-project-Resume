import { projects } from '@/v2/data/portfolio'
import { asciiArtFor, bootLines, HINT_DELAY_MS, HINT_TEXT, START_COMMAND } from './boot'
import { TerminalEngine } from './engine'
import type { CommandResult } from './commands'

const engine = new TerminalEngine()

const output = document.getElementById('pf-output') as HTMLDivElement
const input = document.getElementById('pf-input') as HTMLInputElement
const promptEl = document.getElementById('pf-prompt') as HTMLSpanElement
const windowEl = document.getElementById('pf-window') as HTMLDivElement
const preview = document.getElementById('pf-preview') as HTMLDivElement
const mobileKeys = document.getElementById('pf-mobile-keys')

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
	output.appendChild(el)
	scrollToBottom()
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
	output.innerHTML = ''
	for (const line of bootLines) {
		if (skipRequested) {
			printRaw(line.text)
			continue
		}
		printRaw(line.text)
		if (line.delayMs) await sleep(line.delayMs)
	}
	const art = asciiArtFor(windowEl.clientWidth)
	printRaw('')
	art.forEach((row) => printRaw(row, 'pf-ascii'))
	printRaw('')
	booted = true
	busy = false
	skipRequested = false
	updatePrompt()
}

async function playWipe() {
	busy = true
	skipRequested = false
	const steps = [
		'Deleting profile...',
		'Deleting projects...',
		'Deleting research...',
		'Deleting memories...'
	]
	for (const step of steps) {
		printRaw(step)
		await sleep(220)
	}
	printRaw('████████████████████ 100%')
	await sleep(300)
	printRaw('FATAL: portfolio not found.', 'pf-line-error')
	await sleep(500)
	windowEl.classList.add('pf-window--glitch')
	await sleep(900)
	windowEl.classList.add('pf-window--blackout')
	await sleep(900)
	windowEl.classList.remove('pf-window--glitch')
	output.innerHTML = ''
	printRaw('...')
	await sleep(500)
	printRaw('just kidding.')
	await sleep(300)
	printRaw('restoring from git...')
	await sleep(400)
	printRaw('$ git restore .')
	await sleep(400)
	windowEl.classList.remove('pf-window--blackout')
	printRaw('')
	printRaw('portfolio restored.')
	busy = false
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
	closeButton.setAttribute('aria-label', 'Close preview')
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
		a.textContent = 'View Project →'
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
			output.innerHTML = ''
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

input.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		e.preventDefault()
		void handleSubmit(input.value)
		return
	}
	if (e.key === 'ArrowUp') {
		e.preventDefault()
		const value = engine.historyUp()
		if (value !== undefined) input.value = value
		return
	}
	if (e.key === 'ArrowDown') {
		e.preventDefault()
		input.value = engine.historyDown()
		return
	}
	if (e.key === 'Tab') {
		e.preventDefault()
		triggerTabComplete()
		return
	}
	if (e.ctrlKey && e.key.toLowerCase() === 'l') {
		e.preventDefault()
		output.innerHTML = ''
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

// --- on-screen Enter/Tab keys (mobile has no physical Tab key, and virtual
// keyboards don't reliably fire a keydown 'Enter' the same way) ---
mobileKeys?.querySelectorAll<HTMLButtonElement>('[data-key]').forEach((button) => {
	// Prevent the button from stealing focus (and dismissing the on-screen
	// keyboard) before the click handler runs.
	button.addEventListener('pointerdown', (e) => e.preventDefault())
	button.addEventListener('click', () => {
		if (button.dataset.key === 'tab') triggerTabComplete()
		else if (button.dataset.key === 'enter') void handleSubmit(input.value)
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
