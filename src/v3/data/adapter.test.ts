import { describe, expect, it } from 'vitest'
import { getPortfolio } from '@/v2/data/portfolio'
import { getResearchPortfolio } from './adapter'

describe('research portfolio public identity', () => {
	for (const lang of ['ja', 'en'] as const) {
		it(`uses the public name in ${lang} while preserving paper author names`, () => {
			const source = getPortfolio(lang).profile
			const result = getResearchPortfolio(lang)
			expect(result.profile.name).toBe(source.handle)
			expect(result.profile.nameSub).toBe('')
			expect(result.publications.length).toBeGreaterThan(0)
			for (const publication of result.publications) {
				expect(publication.authors).toBe(source.name)
			}
		})
	}
})
