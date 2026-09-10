import { describe, expect, it } from 'vitest'
import { getNode, getRoot, listAllPaths, promptPath, resolveSegments, root } from './filesystem'

describe('resolveSegments', () => {
	it('resolves ~ and / to the root', () => {
		expect(resolveSegments(['projects'], '~')).toEqual([])
		expect(resolveSegments(['projects'], '/')).toEqual([])
	})

	it('resolves a relative path against cwd', () => {
		expect(resolveSegments([], 'projects')).toEqual(['projects'])
		expect(resolveSegments(['projects'], 'flex-railway-map')).toEqual([
			'projects',
			'flex-railway-map'
		])
	})

	it('resolves an absolute-style path from ~/', () => {
		expect(resolveSegments(['projects', 'flex-railway-map'], '~/skills')).toEqual(['skills'])
	})

	it('handles .. and .', () => {
		expect(resolveSegments(['projects', 'flex-railway-map'], '..')).toEqual(['projects'])
		expect(resolveSegments(['projects'], '.')).toEqual(['projects'])
	})

	it('does not go above root', () => {
		expect(resolveSegments([], '..')).toEqual([])
	})
})

describe('getNode', () => {
	it('returns the root for an empty path', () => {
		expect(getNode([])).toBe(root)
	})

	it('finds a nested directory', () => {
		const node = getNode(['projects', 'flex-railway-map'])
		expect(node?.type).toBe('dir')
	})

	it('finds a file and its content', () => {
		const node = getNode(['projects', 'flex-railway-map', 'README.md'])
		expect(node?.type).toBe('file')
		if (node?.type === 'file') {
			expect(node.content).toContain('Flex Railway Map')
		}
	})

	it('returns undefined for a path that does not exist', () => {
		expect(getNode(['does-not-exist'])).toBeUndefined()
		expect(getNode(['about', 'profile.md', 'nope'])).toBeUndefined()
	})
})

describe('promptPath', () => {
	it('formats the root as ~', () => {
		expect(promptPath([])).toBe('~')
	})

	it('formats nested paths', () => {
		expect(promptPath(['projects', 'flex-railway-map'])).toBe('~/projects/flex-railway-map')
	})
})

describe('listAllPaths', () => {
	it('includes every project directory and file', () => {
		const paths = listAllPaths()
		expect(paths).toContain('projects')
		expect(paths).toContain('projects/flex-railway-map')
		expect(paths).toContain('projects/flex-railway-map/README.md')
		expect(paths).toContain('about/profile.md')
	})
})

describe('getRoot with lang', () => {
	it('ja and en trees share the same shape (same project slugs)', () => {
		const jaPaths = listAllPaths(getRoot('ja'))
		const enPaths = listAllPaths(getRoot('en'))
		expect(enPaths).toEqual(jaPaths)
	})

	it('en tree content is in English, not ja', () => {
		const node = getNode(['projects', 'way-point-map', 'README.md'], getRoot('en'))
		expect(node?.type).toBe('file')
		if (node?.type === 'file') expect(node.content).toContain('golf courses')
	})

	it('getRoot() defaults to ja, same as the default `root` export', () => {
		expect(getRoot()).toBe(root)
	})
})
