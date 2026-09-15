import type { Language } from '@/v2/data/portfolio'
import type { SectionDef, SectionId } from './types'

/** UI chrome strings, resolved per language (see adapter.ts's doc comment). */
export function getUi(lang: Language) {
	return lang === 'en'
		? {
				contents: 'Contents',
				skip: 'Skip to content',
				overview: 'Overview',
				theme: 'Switch theme',
				light: 'Light',
				dark: 'Dark',
				role: 'Personal contribution',
				details: 'Read more',
				technologies: 'Technologies',
				copyCitation: 'Copy citation',
				citationCopied: 'Copied',
				citationCopyFailed: 'Copy failed',
				contactIntro: 'For inquiries and collaboration, reach out through any of the links below.',
				footer: 'Research portfolio',
				backToV1: 'Classic resume page',
				backToV2: 'Terminal-style portfolio'
			}
		: {
				contents: '目次',
				skip: '本文へ移動',
				overview: 'Overview',
				theme: '表示テーマを切り替え',
				light: 'ライト',
				dark: 'ダーク',
				role: '本人の担当範囲',
				details: '詳しく見る',
				technologies: '使用技術',
				copyCitation: '引用情報をコピー',
				citationCopied: 'コピーしました',
				citationCopyFailed: 'コピーできませんでした',
				contactIntro: 'ご連絡・ご相談は以下のリンクからお願いします。',
				footer: 'Research portfolio',
				backToV1: '従来のレジュメページ',
				backToV2: 'ターミナル版ポートフォリオ'
			}
}

const sectionText: Record<SectionId, { ja: [string, string]; en: [string, string] }> = {
	about: { ja: ['About', '研究者について'], en: ['About', 'Profile'] },
	interests: {
		ja: ['Research Interests', '研究領域・関心'],
		en: ['Research Interests', 'Fields of interest']
	},
	projects: {
		ja: ['Featured Projects', '主要な制作物'],
		en: ['Featured Projects', 'Selected work']
	},
	publications: { ja: ['Publications', '論文・研究実績'], en: ['Publications', 'Publications'] },
	presentations: {
		ja: ['Presentations', '発表・登壇'],
		en: ['Presentations', 'Talks and presentations']
	},
	skills: { ja: ['Skills', '使用技術'], en: ['Skills', 'Technical skills'] },
	experience: {
		ja: ['Education / History', '学歴・経歴'],
		en: ['Education / History', 'Education and history']
	},
	contact: { ja: ['Contact', '連絡先'], en: ['Contact', 'Get in touch'] }
}

const sectionOrder: SectionId[] = [
	'about',
	'interests',
	'projects',
	'publications',
	'presentations',
	'skills',
	'experience',
	'contact'
]

export function getSectionDefinitions(lang: Language): SectionDef[] {
	return sectionOrder.map((id) => {
		const [title, subtitle] = sectionText[id][lang]
		return { id, title, subtitle }
	})
}
