import { getPortfolio, type Language } from '@/v2/data/portfolio'
import { renderAsciiWord } from './asciiFont'

export interface BootLine {
	text: string
	delayMs: number
	/** CSS class for this line's <div> (see terminal.css); defaults to plain output text. */
	className?: string
}

const DIVIDER = '────────────────────────────────────────────'

/**
 * The `whoami`-style identity card: handle, name/role, and every link from
 * `profile.links` (GitHub, Mail, Lab — data/portfolio.ts is the only place
 * that list is written). These fields are language-neutral (same in both
 * `profileByLang.ja` and `.en`), so the box itself is built once and reused
 * for both languages — no risk of the box misaligning on CJK glyph width,
 * since it never contains Japanese text.
 */
function buildIdentityBox(): string[] {
	const { profile } = getPortfolio('ja')
	const labelWidth = Math.max(...profile.links.map((l) => l.label.length)) + 2
	const rows = [
		profile.handle,
		`${profile.name} — ${profile.role}`,
		'',
		...profile.links.map((l) => `${l.label.padEnd(labelWidth)}${l.href}`)
	]
	const width = Math.max(...rows.map((r) => r.length))
	const top = `╭${'─'.repeat(width + 2)}╮`
	const bottom = `╰${'─'.repeat(width + 2)}╯`
	const body = rows.map((r) => `│ ${r.padEnd(width)} │`)
	return [top, ...body, bottom]
}

interface BootText {
	welcome: (name: string) => string
	boxHint: string
	overview: string[]
	usageHeading: string
	usage: string[]
	hint: string
}

const TEXT: Record<Language, BootText> = {
	ja: {
		welcome: (name) =>
			`Welcome to ${name}'s portfolio — ターミナルで歩き回れるファイルシステムです。`,
		boxHint: '(このカードはいつでも `whoami` で呼び出せます)',
		overview: [
			'このサイトは「ポートフォリオ = 1台のコンピュータ」という発想で作った実験的なページです。',
			'プロフィール・制作物・研究・スキル・趣味が、それぞれ実際のファイル/ディレクトリとして',
			'/ 以下に置かれていて、スクロールする代わりにシェルのコマンドで歩き回れます。'
		],
		usageHeading: '基本の操作:',
		usage: [
			'  ls / cd / cat        ファイル・ディレクトリの一覧・移動・中身表示',
			'  open <slug>          制作物のプレビューを開く (例: open flex-railway-map)',
			'  Tab                  コマンド・パスの補完',
			'  ↑ / ↓                コマンド履歴',
			'  help                 コマンド一覧を表示'
		],
		hint: 'Hint: Enterで起動'
	},
	en: {
		welcome: (name) =>
			`Welcome to ${name}'s portfolio — a filesystem you explore from the terminal.`,
		boxHint: '(bring this card back anytime with `whoami`)',
		overview: [
			'This site is an experiment: your portfolio as one computer. Profile, projects,',
			'research, skills, and hobbies each live under / as real files and directories —',
			'walk around with ordinary shell commands instead of scrolling a page.'
		],
		usageHeading: 'Basic commands:',
		usage: [
			'  ls / cd / cat        list, move into, and read files & directories',
			'  open <slug>          open a project preview (e.g. open flex-railway-map)',
			'  Tab                  autocomplete commands & paths',
			'  ↑ / ↓                command history',
			'  help                 show the full command list'
		],
		hint: 'Hint: press Enter to boot'
	}
}

/** Lines streamed one at a time on `./start.sh`. Timed 40-150ms apart per docs/DESIGN.md pacing note. */
export function getBootLines(lang: Language): BootLine[] {
	const { profile } = getPortfolio(lang)
	const t = TEXT[lang]
	const box = buildIdentityBox()

	return [
		{ text: '', delayMs: 60 },
		{ text: 'portfolio-shell v1.0.0', delayMs: 150, className: 'pf-line-banner' },
		{ text: '', delayMs: 80 },
		{ text: '[ OK ] Loading profile.............. done', delayMs: 90, className: 'pf-line-ok' },
		{ text: '[ OK ] Loading projects............. 7 found', delayMs: 90, className: 'pf-line-ok' },
		{ text: '[ OK ] Loading research.............. done', delayMs: 90, className: 'pf-line-ok' },
		{ text: '[ OK ] Loading skills................ done', delayMs: 90, className: 'pf-line-ok' },
		{ text: '[ OK ] Loading hobbies............... done', delayMs: 90, className: 'pf-line-ok' },
		{ text: '[ OK ] Loading history............... done', delayMs: 90, className: 'pf-line-ok' },
		{ text: '[ OK ] Mounting portfolio filesystem', delayMs: 150, className: 'pf-line-ok' },
		{ text: '', delayMs: 80 },
		{ text: DIVIDER, delayMs: 40 },
		{ text: '', delayMs: 40 },
		{ text: t.welcome(profile.name), delayMs: 120 },
		{ text: '', delayMs: 40 },
		...box.map((line): BootLine => ({ text: line, delayMs: 20, className: 'pf-line-box' })),
		{ text: t.boxHint, delayMs: 80, className: 'pf-line-hint' },
		{ text: '', delayMs: 40 },
		...t.overview.map((line): BootLine => ({ text: line, delayMs: 90 })),
		{ text: '', delayMs: 40 },
		{ text: t.usageHeading, delayMs: 90, className: 'pf-line-banner' },
		...t.usage.map((line): BootLine => ({ text: line, delayMs: 60 })),
		{ text: '', delayMs: 40 },
		{ text: DIVIDER, delayMs: 0 }
	]
}

export const HINT_DELAY_MS = 6000
// The input already has ./start.sh typed in for the visitor (see app.ts) —
// all that is left to do is run it, so the hint says exactly that.
export function getHintText(lang: Language): string {
	return TEXT[lang].hint
}
export const START_COMMAND = './start.sh'

// Always the full handle — .pf-ascii scrolls horizontally instead of
// wrapping on narrow viewports (same pattern as the identity box above),
// so there's no need to truncate it to "EMAR" on mobile.
export function asciiArtFor(): string[] {
	return renderAsciiWord('EMAR27181')
}
