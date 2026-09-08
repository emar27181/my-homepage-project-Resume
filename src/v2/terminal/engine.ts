import { profile, projects } from '@/v2/data/portfolio'
import { COMMANDS, runCommand, type CommandResult } from './commands'
import { getNode, promptPath, resolveSegments, splitPath } from './filesystem'

export interface TerminalEntry {
	prompt: string
	command: string
	lines: string[]
}

export class TerminalEngine {
	cwd: string[] = []
	cmdHistory: string[] = []
	private historyIndex = 0

	getPrompt(): string {
		return `${profile.handle}@portfolio:${promptPath(this.cwd)}$`
	}

	/** Run one line of input. Returns the entry to render plus any side effect the UI must act on. */
	submit(input: string): { entry: TerminalEntry; result: CommandResult } {
		const prompt = this.getPrompt()
		const trimmed = input.trim()
		if (trimmed) {
			this.cmdHistory.push(trimmed)
		}
		this.historyIndex = this.cmdHistory.length

		const result = runCommand(trimmed, { args: [], cwd: this.cwd, history: this.cmdHistory })
		if (result.type === 'cd') {
			this.cwd = result.segments
		}
		if (result.type === 'reboot') {
			this.cwd = []
		}

		const lines = result.type === 'text' ? result.lines : result.type === 'open' ? result.lines : []
		return { entry: { prompt, command: trimmed, lines }, result }
	}

	historyUp(): string | undefined {
		if (this.historyIndex > 0) this.historyIndex -= 1
		return this.cmdHistory[this.historyIndex]
	}

	historyDown(): string {
		if (this.historyIndex < this.cmdHistory.length) this.historyIndex += 1
		return this.cmdHistory[this.historyIndex] ?? ''
	}

	/** Tab-completion: command name for the first token, path/slug for the rest. */
	complete(input: string): { value: string; suggestions: string[] } {
		const hasTrailingSpace = /\s$/.test(input)
		const tokens = input.split(/\s+/).filter(Boolean)
		if (tokens.length === 0) return { value: input, suggestions: [] }

		if (tokens.length === 1 && !hasTrailingSpace) {
			const [partial] = tokens
			const matches = COMMANDS.filter((c) => c.startsWith(partial))
			return this.applyCompletion(input, partial, matches)
		}

		const [cmd, ...rest] = tokens
		const partial = hasTrailingSpace ? '' : rest.pop() ?? ''
		const base = rest.join(' ')

		let candidates: string[] = []
		if (cmd === 'open') {
			candidates = projects.map((p) => p.slug)
		} else if (cmd === 'cd' || cmd === 'ls' || cmd === 'cat') {
			const dirSegments = resolveSegments(
				this.cwd,
				partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/')) : '.'
			)
			const node = getNode(dirSegments)
			const leaf = partial.includes('/') ? partial.slice(partial.lastIndexOf('/') + 1) : partial
			if (node && node.type === 'dir') {
				const prefix = partial.includes('/') ? partial.slice(0, partial.lastIndexOf('/') + 1) : ''
				candidates = node.children
					.filter((c) => c.name.startsWith(leaf))
					.map((c) => prefix + c.name + (c.type === 'dir' ? '/' : ''))
			}
		}

		const matches = candidates.filter((c) => c.startsWith(partial))
		const prefixInput = `${cmd} ${base ? base + ' ' : ''}`.replace(/\s+/g, ' ')
		return this.applyCompletion(input, partial, matches, prefixInput)
	}

	private applyCompletion(
		input: string,
		partial: string,
		matches: string[],
		prefix?: string
	): { value: string; suggestions: string[] } {
		if (matches.length === 0) return { value: input, suggestions: [] }
		if (matches.length === 1) {
			return { value: (prefix ?? '') + matches[0], suggestions: [] }
		}
		const common = longestCommonPrefix(matches)
		if (common.length > partial.length) {
			return { value: (prefix ?? '') + common, suggestions: matches }
		}
		return { value: input, suggestions: matches }
	}
}

function longestCommonPrefix(items: string[]): string {
	if (items.length === 0) return ''
	let prefix = items[0]
	for (const item of items.slice(1)) {
		while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1)
	}
	return prefix
}

export { splitPath }
