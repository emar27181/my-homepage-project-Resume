import type { ResearchOutput } from '../data/types'

/** A portable, human-readable citation line for the copy-citation button. */
export function formatCitation(output: ResearchOutput): string {
	const details = [output.venue, output.date].filter(Boolean).join(', ')
	return [`${output.authors}.`, `“${output.title},”`, details && `${details}.`]
		.filter(Boolean)
		.join(' ')
}
