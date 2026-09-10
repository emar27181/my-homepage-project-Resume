/**
 * Virtual filesystem the terminal (and `tree`/`ls`/`cd`/`cat`) walks. Every
 * file's content is rendered from src/v2/data/portfolio.ts — this module
 * only knows how to lay that data out as a tree, never the copy itself.
 *
 * One tree per language, built lazily and cached in `treeCache`. Path
 * resolution (`resolveSegments`/`getNode`/`promptPath`) is language-neutral
 * — it only walks whatever tree it is given.
 */
import { getPortfolio, type Language, type Portfolio } from '@/v2/data/portfolio'

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

function formatProfileMd(data: Portfolio): string {
	const { profile } = data
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

function formatTimelineMd(data: Portfolio): string {
	return data.history.map((h) => `- ${h.date}  ${h.heading}`).join('\n')
}

function formatProjectReadme(data: Portfolio, slug: string): string {
	const p = data.projects.find((project) => project.slug === slug)
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

function formatConceptMd(data: Portfolio, slug: string): string {
	const p = data.projects.find((project) => project.slug === slug)
	return p ? p.concept : 'not found'
}

function formatTechStackJson(data: Portfolio, slug: string): string {
	const p = data.projects.find((project) => project.slug === slug)
	if (!p) return '{}'
	return JSON.stringify({ tech: p.tech, year: p.year }, null, 2)
}

function formatResearchOverview(data: Portfolio): string {
	const [overview] = data.research
	return overview ? overview.summary : ''
}

function formatResearchTalks(data: Portfolio): string {
	return data.research
		.slice(1)
		.map((entry) => {
			const lines = [entry.heading, entry.date ?? '', entry.summary]
			if (entry.links) lines.push('', ...entry.links.map((l) => `${l.label}: ${l.href}`))
			if (entry.videoUrl) lines.push('', `Video: ${entry.videoUrl}`)
			return lines.join('\n')
		})
		.join('\n\n')
}

function formatSkillsJson(data: Portfolio): string {
	return JSON.stringify(
		Object.fromEntries(data.skills.map((group) => [group.label.toLowerCase(), group.items])),
		null,
		2
	)
}

function formatHobbiesMd(data: Portfolio): string {
	return data.hobbies
		.map((h) => {
			const lines = [h.heading, h.summary]
			if (h.links) lines.push(...h.links.map((l) => `${l.label}: ${l.href}`))
			return lines.join('\n')
		})
		.join('\n\n')
}

function buildTree(data: Portfolio): FSDir {
	return dir('~', [
		dir('about', [
			file('profile.md', formatProfileMd(data)),
			file('timeline.md', formatTimelineMd(data))
		]),
		dir(
			'projects',
			data.projects.map((p) =>
				dir(p.slug, [
					file('README.md', formatProjectReadme(data, p.slug)),
					file('concept.md', formatConceptMd(data, p.slug)),
					file('tech-stack.json', formatTechStackJson(data, p.slug))
				])
			)
		),
		dir('research', [
			file('overview.md', formatResearchOverview(data)),
			file('talks.md', formatResearchTalks(data))
		]),
		dir('skills', [file('skills.json', formatSkillsJson(data))]),
		dir('hobbies', [file('hobbies.md', formatHobbiesMd(data))]),
		dir('experiments', [file('README.md', 'nothing here yet. check back later.')]),
		file(
			'README.md',
			[
				`Welcome to ${data.profile.handle}'s portfolio filesystem.`,
				'',
				'Type `help` to see available commands.',
				'Type `tree` to see the full structure.'
			].join('\n')
		),
		file('start.sh', '#!/bin/sh\n# boots the portfolio shell. run: ./start.sh')
	])
}

const treeCache = new Map<Language, FSDir>()

/** The tree for `lang`, built once and cached. Defaults to `ja`. */
export function getRoot(lang: Language = 'ja'): FSDir {
	let tree = treeCache.get(lang)
	if (!tree) {
		tree = buildTree(getPortfolio(lang))
		treeCache.set(lang, tree)
	}
	return tree
}

// Default (ja) tree, kept for call sites that don't need language switching.
export const root = getRoot('ja')

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

export function getNode(segments: string[], tree: FSDir = root): FSNode | undefined {
	let node: FSNode = tree
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
export function listAllPaths(tree: FSDir = root): string[] {
	const paths: string[] = []
	const walk = (node: FSDir, prefix: string[]) => {
		for (const child of node.children) {
			const path = [...prefix, child.name]
			paths.push(path.join('/'))
			if (child.type === 'dir') walk(child, path)
		}
	}
	walk(tree, [])
	return paths
}
