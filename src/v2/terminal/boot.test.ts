import { describe, expect, it } from 'vitest'
import { getPortfolio } from '@/v2/data/portfolio'
import { getBootLines } from './boot'

describe('terminal boot public identity', () => {
	for (const lang of ['ja', 'en'] as const) {
		it(`uses the public handle on the ${lang} boot screen`, () => {
			const profile = getPortfolio(lang).profile
			const boot = getBootLines(lang).map((line) => line.text).join('\n')
			expect(boot).toContain(profile.handle)
			expect(boot).not.toContain(profile.name)
			expect(boot).not.toContain(profile.nameJa)
		})
	}
})
