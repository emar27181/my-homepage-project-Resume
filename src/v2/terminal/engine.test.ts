import { beforeEach, describe, expect, it } from 'vitest'
import { getPortfolio, profile, projects } from '@/v2/data/portfolio'
import { TerminalEngine } from './engine'

describe('TerminalEngine', () => {
	let engine: TerminalEngine

	beforeEach(() => {
		engine = new TerminalEngine()
	})

	it('starts at the home prompt', () => {
		expect(engine.getPrompt()).toBe(`${profile.handle}@portfolio:~$`)
	})

	it('cd updates the prompt and cwd', () => {
		engine.submit('cd projects')
		expect(engine.getPrompt()).toBe(`${profile.handle}@portfolio:~/projects$`)
		engine.submit('cd flex-railway-map')
		expect(engine.getPrompt()).toBe(`${profile.handle}@portfolio:~/projects/flex-railway-map$`)
		engine.submit('cd ..')
		expect(engine.getPrompt()).toBe(`${profile.handle}@portfolio:~/projects$`)
	})

	it('reboot resets cwd back to home', () => {
		engine.submit('cd projects')
		engine.submit('reboot')
		expect(engine.getPrompt()).toBe(`${profile.handle}@portfolio:~$`)
	})

	it('records non-empty commands in history', () => {
		engine.submit('help')
		engine.submit('')
		engine.submit('whoami')
		expect(engine.cmdHistory).toEqual(['help', 'whoami'])
	})

	it('history navigation walks backward then forward', () => {
		engine.submit('help')
		engine.submit('whoami')
		expect(engine.historyUp()).toBe('whoami')
		expect(engine.historyUp()).toBe('help')
		expect(engine.historyUp()).toBe('help')
		expect(engine.historyDown()).toBe('whoami')
		expect(engine.historyDown()).toBe('')
	})

	describe('complete', () => {
		it('completes a unique command prefix', () => {
			expect(engine.complete('he').value).toBe('help')
		})

		it('completes the only path match for a subcommand', () => {
			expect(engine.complete('cat pro').value).toBe('cat projects/')
		})

		it('offers every project slug for `open `', () => {
			const { suggestions } = engine.complete('open ')
			for (const p of projects) expect(suggestions).toContain(p.slug)
		})

		it('leaves input untouched when nothing matches', () => {
			const result = engine.complete('zzz')
			expect(result.value).toBe('zzz')
			expect(result.suggestions).toEqual([])
		})
	})

	describe('lang: en', () => {
		it('the prompt uses the same handle (language-neutral)', () => {
			const enEngine = new TerminalEngine('en')
			expect(enEngine.getPrompt()).toBe(`${getPortfolio('en').profile.handle}@portfolio:~$`)
		})

		it('open completion offers the English project slugs (same set as ja)', () => {
			const enEngine = new TerminalEngine('en')
			const { suggestions } = enEngine.complete('open ')
			for (const p of getPortfolio('en').projects) expect(suggestions).toContain(p.slug)
		})

		it('whoami returns English content, not ja', () => {
			const enEngine = new TerminalEngine('en')
			const { result } = enEngine.submit('whoami')
			if (result.type === 'text') {
				expect(result.lines.join('\n')).toContain(getPortfolio('en').profile.education)
			}
		})
	})
})
