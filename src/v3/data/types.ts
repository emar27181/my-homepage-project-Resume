/**
 * v3 "research portfolio" — shapes the ported components render. Every
 * string here is already resolved to one language; nothing downstream needs
 * a `t()` helper or a `{ja, en}` pair (unlike the portfolio-taraba theme
 * this was ported from, which switches language client-side). That mirrors
 * how v2/data/portfolio.ts works: `getResearchPortfolio(lang)` is the one
 * place a `Language` resolves to content.
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
	initials: string
}

export interface ResearchSkill {
	name: string
	category: string
}

export interface ResearchExperienceEntry {
	period: string
	title: string
	kind: string
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

export interface ResearchProject {
	id: string
	title: string
	summary: string
	role: string
	technologies: string[]
	year: string
	href?: string
}

export type SectionId =
	| 'about'
	| 'interests'
	| 'projects'
	| 'publications'
	| 'presentations'
	| 'skills'
	| 'experience'
	| 'contact'

export interface SectionDef {
	id: SectionId
	title: string
	subtitle: string
}

// portfolio-taraba (the theme this was ported from) also has an "awards"
// section, dropped here: v2/data/portfolio.ts has no awards/grants data at
// all (not just an empty array), so there is no way to ever populate it —
// keeping the id around would just be an AwardList component with no caller.

export interface ResearchPortfolioData {
	profile: ResearchProfile
	links: ResearchLink[]
	interests: string[]
	projects: ResearchProject[]
	publications: ResearchOutput[]
	presentations: ResearchOutput[]
	skills: ResearchSkill[]
	experience: ResearchExperienceEntry[]
	sections: SectionDef[]
}
