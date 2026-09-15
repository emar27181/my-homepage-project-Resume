/**
 * Reshapes v2/data/portfolio.ts (the site's one source of content) into the
 * shape the ported "research portfolio" components expect. There is no
 * separate content file here on purpose — duplicating profile/research text
 * into a second data file is exactly the "same rule written twice" the
 * project's coding conventions rule out. Add or edit content in
 * v2/data/portfolio.ts; this file only reshapes it.
 *
 * v3 only surfaces the research entries (Research Interests / Publications /
 * Presentations) — v1's own sticky header already has tabs for the rest
 * (制作物/趣味/スキル/学歴/資格・免許/作品集), so nothing here computes
 * projects/skills/experience for v3 to avoid showing the same content twice
 * under two different designs.
 */
import { getPortfolio, type Language } from '@/v2/data/portfolio'
import { getSectionDefinitions } from './ui'
import type { ResearchOutput, ResearchPortfolioData, SectionId } from './types'

/** Pulls a `「…」`/`"…"`-quoted title out of a summary sentence, if present. */
function quotedTitle(summary: string, fallback: string): string {
	const match = summary.match(/[「"](.+?)[」"]/)
	return match ? match[1] : fallback
}

function yearOf(date: string | undefined): number | undefined {
	const match = date?.match(/\d{4}/)
	return match ? Number(match[0]) : undefined
}

export function getResearchPortfolio(lang: Language): ResearchPortfolioData {
	const { profile, research } = getPortfolio(lang)

	const links = profile.links.map((link) => ({ label: link.label, url: link.href }))

	// The one research entry without a date is a standing research-interest
	// statement rather than a dated event — the other two are conference
	// presentations (see below), so this is the only "interest" available.
	const interestEntries = research.filter((entry) => !entry.date)
	const interests = interestEntries.map((entry) => `${entry.heading} — ${entry.summary}`)

	// Dated research entries are conference presentations; each one also
	// counts as a publication, matching how portfolio-taraba's own
	// getPortfolio() lets a conference/workshop item populate both sections.
	const presentationEntries = research.filter((entry) => entry.date)
	const outputs: ResearchOutput[] = presentationEntries.map((entry, index) => ({
		id: `presentation-${index + 1}`,
		title: quotedTitle(entry.summary, entry.heading),
		authors: profile.name,
		venue: entry.heading,
		year: yearOf(entry.date),
		date: entry.date,
		links: [
			...(entry.links ?? []).map((link) => ({ label: link.label, url: link.href })),
			...(entry.videoUrl ? [{ label: lang === 'en' ? 'Video' : '動画', url: entry.videoUrl }] : [])
		],
		isPresentation: true
	}))

	const populated: Record<SectionId, boolean> = {
		interests: interests.length > 0,
		publications: outputs.length > 0,
		presentations: outputs.some((item) => item.isPresentation)
	}

	return {
		profile: {
			name: profile.name,
			nameSub: profile.nameJa,
			title: profile.role,
			affiliation: profile.education,
			statement: profile.researchLine,
			location: profile.location,
			about: profile.bio
		},
		links,
		interests,
		publications: outputs,
		presentations: outputs.filter((item) => item.isPresentation),
		sections: getSectionDefinitions(lang).filter((section) => populated[section.id])
	}
}
