import { getPortfolio, type Language } from '@/v2/data/portfolio'
import { getNode, getRoot, promptPath, resolveSegments, type FSDir } from './filesystem'

export interface CommandContext {
	args: string[]
	cwd: string[]
	history: string[]
	lang?: Language
}

export type CommandResult =
	| { type: 'text'; lines: string[] }
	| { type: 'cd'; segments: string[]; lines?: string[] }
	| { type: 'clear' }
	| { type: 'reboot' }
	| { type: 'open'; slug: string; lines: string[] }
	| { type: 'wipe' }

const text = (lines: string[]): CommandResult => ({ type: 'text', lines })

function renderTree(node: FSDir, prefix = ''): string[] {
	const lines: string[] = []
	node.children.forEach((child, i) => {
		const isLast = i === node.children.length - 1
		const branch = isLast ? '└── ' : '├── '
		lines.push(`${prefix}${branch}${child.name}${child.type === 'dir' ? '/' : ''}`)
		if (child.type === 'dir') {
			lines.push(...renderTree(child, prefix + (isLast ? '    ' : '│   ')))
		}
	})
	return lines
}

function renderLs(
	segments: string[],
	flags: string[],
	root: FSDir,
	projects: { slug: string; heading: string; summary: string; year: string }[]
): CommandResult {
	const node = getNode(segments, root)
	if (!node) return text([`ls: ${promptPath(segments)}: No such file or directory`])
	if (node.type === 'file') return text([node.name])

	if (flags.includes('-l') && segments.length === 1 && segments[0] === 'projects') {
		const lines: string[] = [`total ${projects.length}`]
		projects.forEach((p, i) => {
			lines.push('', String(i + 1).padStart(2, '0'), p.slug, p.heading, p.summary, p.year)
		})
		return text(lines)
	}

	return text(node.children.map((child) => (child.type === 'dir' ? `${child.name}/` : child.name)))
}

function fmtLinks(links?: { label: string; href: string }[]) {
	return links ? links.map((l) => `  ${l.label}: ${l.href}`) : []
}

const FORTUNES: Record<Language, string[]> = {
	ja: [
		'配色に迷ったら、まず彩度を1段階落としてみる。',
		'動くコードは正義。ただし読めるコードはもっと正義。',
		'締め切りは発表の一週間前だと思え。'
	],
	en: [
		'When unsure about a color, try dropping the saturation one notch.',
		'Working code is righteous. Readable code is more righteous.',
		'Assume the real deadline is a week before the announced one.'
	]
}

export const COMMANDS = [
	'help',
	'whoami',
	'ls',
	'cd',
	'cat',
	'tree',
	'projects',
	'skills',
	'research',
	'hobbies',
	'history',
	'open',
	'clear',
	'reboot'
] as const

export function runCommand(input: string, ctx: CommandContext): CommandResult {
	const lang: Language = ctx.lang ?? 'ja'
	const { profile, projects, research, skills, hobbies } = getPortfolio(lang)
	const root = getRoot(lang)

	const [cmd, ...args] = input.trim().split(/\s+/)
	const flags = args.filter((a) => a.startsWith('-'))
	const positional = args.filter((a) => !a.startsWith('-'))

	switch (cmd) {
		case '':
			return text([])

		case 'help':
			return text([
				'Available commands:',
				'',
				'  whoami              About me',
				'  ls [-l] [path]      List files',
				'  cd <directory>      Change directory',
				'  cat <file>          Read file',
				'  tree                Show filesystem',
				'  projects            View projects',
				'  skills              View skills',
				'  research            View research',
				'  hobbies             View hobbies',
				'  history             View timeline',
				'  open <project>      Open a project preview',
				'  clear               Clear terminal',
				'  reboot              Replay boot sequence',
				'',
				'Use Tab for autocomplete, ↑/↓ for command history.'
			])

		case 'whoami':
			return text([
				`${profile.name} / ${profile.nameJa}`,
				'',
				profile.role,
				profile.location,
				'',
				profile.education,
				'',
				'Research:',
				profile.researchLine
			])

		case 'ls':
			return renderLs(
				positional.length ? resolveSegments(ctx.cwd, positional[0]) : ctx.cwd,
				flags,
				root,
				projects
			)

		case 'cd': {
			const target = positional[0] ?? '~'
			const segments = resolveSegments(ctx.cwd, target)
			const node = getNode(segments, root)
			if (!node) return text([`cd: no such file or directory: ${target}`])
			if (node.type !== 'dir') return text([`cd: not a directory: ${target}`])
			return { type: 'cd', segments }
		}

		case 'cat': {
			if (!positional[0]) return text(['usage: cat <file>'])
			const segments = resolveSegments(ctx.cwd, positional[0])
			const node = getNode(segments, root)
			if (!node) return text([`cat: ${positional[0]}: No such file or directory`])
			if (node.type === 'dir') return text([`cat: ${positional[0]}: Is a directory`])
			return text(node.content.split('\n'))
		}

		case 'tree':
			return text(['~', ...renderTree(root)])

		case 'projects': {
			const lines: string[] = []
			projects.forEach((p, i) => {
				lines.push(
					`${String(i + 1).padStart(2, '0')}  ${p.slug}`,
					`    ${p.heading} — ${p.summary} (${p.year})`
				)
			})
			lines.push('', 'Try: open <slug>  e.g. open flex-railway-map')
			return text(lines)
		}

		case 'skills':
			return text(skills.flatMap((group) => [`${group.label}:`, `  ${group.items.join(', ')}`, '']))

		case 'research':
			return text(
				research.flatMap((r) =>
					[r.heading, r.date ?? '', r.summary, ...fmtLinks(r.links), ''].filter(
						(l) => l !== undefined
					)
				)
			)

		case 'hobbies':
			return text(hobbies.flatMap((h) => [h.heading, h.summary, ...fmtLinks(h.links), '']))

		case 'history':
			return text(
				ctx.history.length ? ctx.history.map((h, i) => `  ${i + 1}  ${h}`) : ['(no history yet)']
			)

		case 'open': {
			const slug = positional[0]
			const project = projects.find((p) => p.slug === slug)
			if (!project) return text([`open: ${slug ?? ''}: project not found. Try \`projects\`.`])
			return { type: 'open', slug: project.slug, lines: [`Opening ${project.heading}...`] }
		}

		case 'clear':
			return { type: 'clear' }

		case 'reboot':
			return { type: 'reboot' }

		case 'rm':
			if (positional.includes('/') && flags.includes('-rf')) return { type: 'wipe' }
			return text([`rm: cannot remove: this filesystem is read-only.`])

		case 'sudo':
			if (positional[0] === 'rm' && positional.includes('/')) return { type: 'wipe' }
			return text(['nice try. you already have full access — it is your own portfolio.'])

		case 'coffee':
			return text(['☕ here you go. (no real caffeine included)'])

		case 'vim':
			return text(['entering vim...', 'just kidding — there is no escape from :q anyway.'])

		case 'emacs':
			return text(['M-x nothing-happens'])

		case 'neofetch':
			return text([
				`${profile.handle}@portfolio`,
				'------------------',
				'OS: PortfolioOS',
				'Shell: portfolio-shell 1.0.0',
				`Projects: ${projects.length}`,
				`Skills: ${skills.reduce((n, g) => n + g.items.length, 0)}`
			])

		case 'fortune': {
			const fortunes = FORTUNES[lang]
			return text([fortunes[Math.floor(Math.random() * fortunes.length)]])
		}

		case 'matrix':
			return text(['wake up, visitor...'])

		case 'exit':
			return text(['cannot exit real life that easily. try `clear` instead.'])

		default:
			return text([`command not found: ${cmd}`, '', 'Try `help`.'])
	}
}
