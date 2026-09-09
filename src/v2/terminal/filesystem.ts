/**
 * Virtual filesystem the terminal (and `tree`/`ls`/`cd`/`cat`) walks. Every
 * file's content is rendered from src/v2/data/portfolio.ts — this module
 * only knows how to lay that data out as a tree, never the copy itself.
 */
import { history, hobbies, profile, projects, research, skills } from '@/v2/data/portfolio'

export interface FSFile {
	type: 'file'
	name: string
	content: string
}

export interface FSDir {
	type: 'dir'
	name: string
	children: FSNode[]
}

export type FSNode = FSFile | FSDir

const file = (name: string, content: string): FSFile => ({ type: 'file', name, content })
const dir = (name: string, children: FSNode[]): FSDir => ({ type: 'dir', name, children })

function formatProfileMd(): string {
	return [
		`${profile.name} / ${profile.nameJa}`,
		'',
		profile.role,
		profile.location,
		'',
		profile.education,
		'',
		'Research:',
		profile.researchLine,
		'',
		...profile.bio,
		'',
		...profile.links.map((l) => `${l.label}: ${l.href}`)
	].join('\n')
}

function formatTimelineMd(): string {
	return history.map((h) => `- ${h.date}  ${h.heading}`).join('\n')
}

function formatProjectReadme(slug: string): string {
	const p = projects.find((project) => project.slug === slug)
	if (!p) return 'not found'
	return [
		p.heading,
		'',
		p.summary,
		'',
		'Tech:',
		...p.tech,
		'',
		'Year:',
		p.year,
		...(p.href ? ['', `Link: ${p.href}`] : [])
	].join('\n')
}

function formatConceptMd(slug: string): string {
	const p = projects.find((project) => project.slug === slug)
	return p ? p.concept : 'not found'
}

function formatTechStackJson(slug: string): string {
	const p = projects.find((project) => project.slug === slug)
	if (!p) return '{}'
	return JSON.stringify({ tech: p.tech, year: p.year }, null, 2)
}

function formatResearchOverview(): string {
	const [overview] = research
	return overview ? overview.summary : ''
}

function formatResearchTalks(): string {
	return research
		.slice(1)
		.map((entry) => {
			const lines = [entry.heading, entry.date ?? '', entry.summary]
			if (entry.links) lines.push('', ...entry.links.map((l) => `${l.label}: ${l.href}`))
			if (entry.videoUrl) lines.push('', `Video: ${entry.videoUrl}`)
			return lines.join('\n')
		})
		.join('\n\n')
}

function formatSkillsJson(): string {
	return JSON.stringify(
		Object.fromEntries(skills.map((group) => [group.label.toLowerCase(), group.items])),
		null,
		2
	)
}

function formatHobbiesMd(): string {
	return hobbies
		.map((h) => {
			const lines = [h.heading, h.summary]
			if (h.links) lines.push(...h.links.map((l) => `${l.label}: ${l.href}`))
			return lines.join('\n')
		})
		.join('\n\n')
}

function buildTree(): FSDir {
	return dir('~', [
		dir('about', [file('profile.md', formatProfileMd()), file('timeline.md', formatTimelineMd())]),
		dir(
			'projects',
			projects.map((p) =>
				dir(p.slug, [
					file('README.md', formatProjectReadme(p.slug)),
					file('concept.md', formatConceptMd(p.slug)),
					file('tech-stack.json', formatTechStackJson(p.slug))
				])
			)
		),
		dir('research', [
			file('overview.md', formatResearchOverview()),
			file('talks.md', formatResearchTalks())
		]),
		dir('skills', [file('skills.json', formatSkillsJson())]),
		dir('hobbies', [file('hobbies.md', formatHobbiesMd())]),
		dir('experiments', [file('README.md', 'nothing here yet. check back later.')]),
		file(
			'README.md',
			[
				`Welcome to ${profile.handle}'s portfolio filesystem.`,
				'',
				'Type `help` to see available commands.',
				'Type `tree` to see the full structure.'
			].join('\n')
		),
		file('start.sh', '#!/bin/sh\n# boots the portfolio shell. run: ./start.sh')
	])
}

export const root = buildTree()

export function splitPath(path: string): string[] {
	return path.split('/').filter(Boolean)
}

/** Resolve `input` (absolute or relative to `cwd`) to a segment path from root. */
export function resolveSegments(cwd: string[], input: string): string[] {
	if (input === '~' || input === '/') return []
	const absolute = input.startsWith('/') || input.startsWith('~/')
	const raw = input.replace(/^~\/?/, '').replace(/^\/+/, '')
	const base = absolute ? [] : [...cwd]
	for (const part of splitPath(raw)) {
		if (part === '.') continue
		if (part === '..') base.pop()
		else base.push(part)
	}
	return base
}

export function getNode(segments: string[]): FSNode | undefined {
	let node: FSNode = root
	for (const part of segments) {
		if (node.type !== 'dir') return undefined
		const next: FSNode | undefined = node.children.find((child) => child.name === part)
		if (!next) return undefined
		node = next
	}
	return node
}

export function promptPath(segments: string[]): string {
	return segments.length === 0 ? '~' : `~/${segments.join('/')}`
}

/** All absolute-ish path strings in the tree, for tab completion. */
export function listAllPaths(): string[] {
	const paths: string[] = []
	const walk = (node: FSDir, prefix: string[]) => {
		for (const child of node.children) {
			const path = [...prefix, child.name]
			paths.push(path.join('/'))
			if (child.type === 'dir') walk(child, path)
		}
	}
	walk(root, [])
	return paths
}
