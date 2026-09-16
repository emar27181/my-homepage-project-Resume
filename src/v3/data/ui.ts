import type { Language } from '@/v2/data/portfolio'
import type { SectionDef, SectionId } from './types'

/** UI chrome strings, resolved per language (see adapter.ts's doc comment). */
export function getUi(lang: Language) {
	return lang === 'en'
		? {
				contents: 'Contents',
				skip: 'Skip to content',
				brand: 'Research',
				theme: 'Switch theme',
				light: 'Light',
				dark: 'Dark',
				footer: 'Research portfolio',
				backToV1: 'Classic resume page',
				backToV2: 'Terminal-style portfolio',
				thisIsV3: 'Research portfolio (this page)'
			}
		: {
				contents: '目次',
				skip: '本文へ移動',
				brand: 'Research',
				theme: '表示テーマを切り替え',
				light: 'ライト',
				dark: 'ダーク',
				footer: 'Research portfolio',
				backToV1: '従来のレジュメページ',
				backToV2: 'ターミナル版ポートフォリオ',
				thisIsV3: '研究者ポートフォリオ(現在地)'
			}
}

const sectionText: Record<SectionId, { ja: [string, string]; en: [string, string] }> = {
	interests: {
		ja: ['Research Interests', '研究領域・関心'],
		en: ['Research Interests', 'Fields of interest']
	},
	publications: { ja: ['Publications', '論文・研究実績'], en: ['Publications', 'Publications'] },
	presentations: {
		ja: ['Presentations', '発表・登壇'],
		en: ['Presentations', 'Talks and presentations']
	}
}

const sectionOrder: SectionId[] = ['interests', 'publications', 'presentations']

export function getSectionDefinitions(lang: Language): SectionDef[] {
	return sectionOrder.map((id) => {
		const [title, subtitle] = sectionText[id][lang]
		return { id, title, subtitle }
	})
}
