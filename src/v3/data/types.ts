/**
 * v3 "research portfolio" — shapes the ported components render. Every
 * string here is already resolved to one language; nothing downstream needs
 * a `t()` helper or a `{ja, en}` pair (unlike the portfolio-taraba theme
 * this was ported from, which switches language client-side). That mirrors
 * how v2/data/portfolio.ts works: `getResearchPortfolio(lang)` is the one
 * place a `Language` resolves to content.
 *
 * v3 only shows the research-related sections (Research Interests /
 * Publications / Presentations) — v1's own header already has tabs for
 * everything else (制作物/趣味/スキル/学歴/資格・免許/作品集), so v3
 * doesn't need to repeat that breadth. See docs/DESIGN.md.
 */

export interface ResearchLink {
	label: string
	url: string
	download?: boolean
}

export interface ResearchProfile {
	name: string
	nameSub: string
	title: string
	affiliation: string
	statement: string
	location: string
	about: string[]
}

export interface ResearchOutput {
	id: string
	title: string
	authors: string
	venue: string
	year?: number
	date?: string
	links: ResearchLink[]
	isPresentation: boolean
}

export type SectionId = 'interests' | 'publications' | 'presentations'

export interface SectionDef {
	id: SectionId
	title: string
	subtitle: string
}

export interface ResearchPortfolioData {
	profile: ResearchProfile
	links: ResearchLink[]
	interests: string[]
	publications: ResearchOutput[]
	presentations: ResearchOutput[]
	sections: SectionDef[]
}
