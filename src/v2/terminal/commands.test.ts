import { describe, expect, it } from 'vitest'
import { profile, projects } from '@/v2/data/portfolio'
import { runCommand } from './commands'

const ctx = (overrides: Partial<{ cwd: string[]; history: string[] }> = {}) => ({
	args: [],
	cwd: overrides.cwd ?? [],
	history: overrides.history ?? []
})

describe('runCommand', () => {
	it('help lists the available commands', () => {
		const result = runCommand('help', ctx())
		expect(result.type).toBe('text')
		if (result.type === 'text') expect(result.lines.join('\n')).toContain('Available commands:')
	})

	it('whoami shows the real profile', () => {
		const result = runCommand('whoami', ctx())
		if (result.type === 'text') expect(result.lines.join('\n')).toContain(profile.name)
	})

	it('ls lists the root entries', () => {
		const result = runCommand('ls', ctx())
		if (result.type === 'text') {
			expect(result.lines).toContain('projects/')
			expect(result.lines).toContain('README.md')
		}
	})

	it('cd into an existing directory returns a cd result', () => {
		const result = runCommand('cd projects', ctx())
		expect(result).toEqual({ type: 'cd', segments: ['projects'] })
	})

	it('cd into a missing directory errors without changing state', () => {
		const result = runCommand('cd nope', ctx())
		expect(result.type).toBe('text')
		if (result.type === 'text') expect(result.lines[0]).toContain('no such file or directory')
	})

	it('cat prints a project README', () => {
		const result = runCommand('cat projects/flex-railway-map/README.md', ctx())
		if (result.type === 'text') expect(result.lines.join('\n')).toContain('Flex Railway Map')
	})

	it('cat on a missing file errors', () => {
		const result = runCommand('cat nope.md', ctx())
		if (result.type === 'text') expect(result.lines[0]).toContain('No such file or directory')
	})

	it('tree prints the whole structure from ~', () => {
		const result = runCommand('tree', ctx())
		if (result.type === 'text') {
			expect(result.lines[0]).toBe('~')
			expect(result.lines.join('\n')).toContain('projects/')
		}
	})

	it('projects lists every project slug', () => {
		const result = runCommand('projects', ctx())
		if (result.type === 'text') {
			const text = result.lines.join('\n')
			for (const p of projects) expect(text).toContain(p.slug)
		}
	})

	it('open on a real project returns an open result', () => {
		const result = runCommand('open flex-railway-map', ctx())
		expect(result.type).toBe('open')
		if (result.type === 'open') expect(result.slug).toBe('flex-railway-map')
	})

	it('open on an unknown project errors instead of crashing', () => {
		const result = runCommand('open not-a-project', ctx())
		expect(result.type).toBe('text')
		if (result.type === 'text') expect(result.lines[0]).toContain('project not found')
	})

	it('clear and reboot return control signals', () => {
		expect(runCommand('clear', ctx())).toEqual({ type: 'clear' })
		expect(runCommand('reboot', ctx())).toEqual({ type: 'reboot' })
	})

	it('rm -rf / and sudo rm -rf / trigger the wipe easter egg', () => {
		expect(runCommand('rm -rf /', ctx())).toEqual({ type: 'wipe' })
		expect(runCommand('sudo rm -rf /', ctx())).toEqual({ type: 'wipe' })
	})

	it('rm without -rf / is refused, not executed', () => {
		const result = runCommand('rm README.md', ctx())
		expect(result.type).toBe('text')
		if (result.type === 'text') expect(result.lines[0]).toContain('read-only')
	})

	it('history echoes back what was passed in', () => {
		const result = runCommand('history', ctx({ history: ['help', 'ls'] }))
		if (result.type === 'text') {
			expect(result.lines.join('\n')).toContain('help')
			expect(result.lines.join('\n')).toContain('ls')
		}
	})

	it('an unknown command says so instead of crashing', () => {
		const result = runCommand('frobnicate', ctx())
		if (result.type === 'text') expect(result.lines[0]).toContain('command not found: frobnicate')
	})
})
