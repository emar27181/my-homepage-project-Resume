/**
 * Reshapes v2/data/portfolio.ts (the site's one source of content) into the
 * shape the ported "research portfolio" components expect. There is no
 * separate content file here on purpose — duplicating profile/skills/
 * project text into a second data file is exactly the "same rule written
 * twice" the project's coding conventions rule out. Add or edit content in
 * v2/data/portfolio.ts; this file only reshapes it.
 */
import { getPortfolio, type Language } from '@/v2/data/portfolio'
import { getSectionDefinitions } from './ui'
import type {
	ResearchExperienceEntry,
	ResearchOutput,
	ResearchPortfolioData,
	ResearchProject,
	SectionId
} from './types'

function initialsOf(name: string): string {
	const letters = name
		.split(/\s+/)
		.map((word) => word[0])
		.filter(Boolean)
	return letters.slice(0, 2).join('').toUpperCase() || '?'
}

/** Pulls a `「…」`/`"…"`-quoted title out of a summary sentence, if present. */
function quotedTitle(summary: string, fallback: string): string {
	const match = summary.match(/[「"](.+?)[」"]/)
	return match ? match[1] : fallback
}

function yearOf(date: string | undefined): number | undefined {
	const match = date?.match(/\d{4}/)
	return match ? Number(match[0]) : undefined
}

const historyKind: Record<Language, { education: string; certification: string }> = {
	ja: { education: '学歴', certification: '資格・免許' },
	en: { education: 'Education', certification: 'Certification' }
}

export function getResearchPortfolio(lang: Language): ResearchPortfolioData {
	const { profile, projects, research, skills, history } = getPortfolio(lang)

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

	const projectItems: ResearchProject[] = projects.map((project) => ({
		id: project.slug,
		title: project.heading,
		summary: project.summary,
		role: project.concept,
		technologies: project.tech,
		year: project.year,
		href: project.href
	}))

	const skillItems = skills.flatMap((group) =>
		group.items.map((name) => ({ name, category: group.label }))
	)

	const kind = historyKind[lang]
	const experience: ResearchExperienceEntry[] = history.map((entry) => ({
		period: entry.date,
		title: entry.heading,
		kind: /入学|卒業|修了|Enroll|Graduat|Complet/i.test(entry.heading)
			? kind.education
			: kind.certification
	}))

	const populated: Record<SectionId, boolean> = {
		about: profile.bio.length > 0,
		interests: interests.length > 0,
		projects: projectItems.length > 0,
		publications: outputs.length > 0,
		presentations: outputs.some((item) => item.isPresentation),
		skills: skillItems.length > 0,
		experience: experience.length > 0,
		contact: links.length > 0
	}

	return {
		profile: {
			name: profile.name,
			nameSub: profile.nameJa,
			title: profile.role,
			affiliation: profile.education,
			statement: profile.researchLine,
			location: profile.location,
			about: profile.bio,
			initials: initialsOf(profile.name)
		},
		links,
		interests,
		projects: projectItems,
		publications: outputs,
		presentations: outputs.filter((item) => item.isPresentation),
		skills: skillItems,
		experience,
		sections: getSectionDefinitions(lang).filter((section) => populated[section.id])
	}
}
