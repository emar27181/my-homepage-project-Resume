/**
 * v2 "portfolio is a computer" — single source of content for both the
 * Terminal mode and the Collage mode (docs/ARCHITECTURE.md). Edit this file
 * to change what the portfolio says; neither UI mode should ever hardcode
 * copy of its own.
 */

export interface Profile {
	name: string
	nameJa: string
	handle: string
	role: string
	location: string
	education: string
	researchLine: string
	bio: string[]
	links: { label: string; href: string }[]
}

export const profile: Profile = {
	name: 'Ryunosuke Ema',
	nameJa: '江馬 龍之介',
	handle: 'emar27181',
	role: 'IT Engineer',
	location: 'Kanagawa, Japan',
	education: '明治大学大学院 理工学研究科 情報科学専攻 修了 (2026.03)',
	researchLine: '配色の推薦によるイラスト制作の支援 — EC2024 発表',
	bio: [
		'情報系大学院を修了し、現在はエンジニアとして活動中。',
		'大学院では、カラーパレットの推薦によるイラスト制作支援について研究していました。',
		'このサイトはひとつの「コンピュータ」として、ターミナルからプロフィール・制作物・研究・趣味を探索できます。'
	],
	links: [
		{ label: 'GitHub', href: 'https://github.com/emar27181' },
		{ label: 'Mail', href: 'mailto:ryunosukeema.job@gmail.com' },
		{ label: 'Lab', href: 'https://int.cs.meiji.ac.jp/' }
	]
}

export interface Project {
	slug: string
	heading: string
	summary: string
	concept: string
	tech: string[]
	year: string
	href?: string
	image?: string
}

export const projects: Project[] = [
	{
		slug: 'flex-railway-map',
		heading: 'Flex Railway Map',
		summary: '必要な路線だけに絞れるフレキシブルな鉄道路線図。',
		concept:
			'路線図は普段使う路線だけ見えれば十分、という発想から、表示する路線を自分で選べる路線図アプリとして作成。',
		tech: ['Astro', 'TypeScript', 'Tailwind CSS'],
		year: '2026'
	},
	{
		slug: 'music-atlas',
		heading: 'Music Atlas',
		summary: '聴いている音楽の統計を可視化するダッシュボード。',
		concept:
			'普段聴いている音楽の傾向を、ジャンルやアーティスト単位で地図のように俯瞰できるようにした個人用ダッシュボード。',
		tech: ['TypeScript', 'React', 'Spotify API'],
		year: '2026'
	},
	{
		slug: 'way-point-map',
		heading: 'Way Point Map',
		summary: 'ゴルフ場を単価で比較できる地図アプリ。',
		concept: '周辺のゴルフ場をプレー単価で比較しながら地図上で探せるようにした検討中のアプリ。',
		tech: ['TypeScript', 'Next.js', 'Maps API'],
		year: '2026'
	},
	{
		slug: 'memorio',
		heading: 'Memorio',
		summary: '日々の出来事を記録し、振り返るための個人用ログ。',
		concept:
			'短い日記とタグだけで日々の出来事を記録し、あとから検索・振り返りできるようにする個人用メモリーログ。',
		tech: ['Astro', 'SQLite'],
		year: '2025'
	},
	{
		slug: 'second-brain',
		heading: 'Second Brain',
		summary: '知識やリンクをつないで検索できる個人用ナレッジベース。',
		concept:
			'メモやリンクをノードとしてつなぎ、あとから全文検索・関連付けをたどれるようにした個人用ナレッジベース。',
		tech: ['TypeScript', 'Markdown', 'Full-text search'],
		year: '2025'
	},
	{
		slug: 'minecraft-tools',
		heading: 'Minecraft Tools',
		summary: 'Minecraftサーバー運用を補助する自作ツール群。',
		concept:
			'友人と運用しているMinecraftサーバーのバックアップ・権限管理・イベント進行を補助する小さなツール群。',
		tech: ['Java', 'Python'],
		year: '2024'
	},
	{
		slug: 'p5-illustration-browser',
		heading: 'p5.js演習ブラウザ',
		summary: '研究で作成した成果物を展示しているブラウザ。',
		concept: '研究過程で作成した配色まわりのp5.jsスケッチをまとめて閲覧できるようにしたブラウザ。',
		tech: ['p5.js', 'JavaScript'],
		year: '2024',
		href: 'https://emar27181.github.io/'
	}
]

export interface ResearchEntry {
	heading: string
	date?: string
	summary: string
	links?: { label: string; href: string }[]
	videoUrl?: string
}

export const research: ResearchEntry[] = [
	{
		heading: '配色の推薦によるイラスト制作の支援',
		summary:
			'イラストレーターは経験に基づいて配色しますが、初心者は経験が浅く配色バランスが崩れやすいという課題があります。キャンバス上の配色を推定し、相性の良い配色技法の色相環上に表示することで、初心者でもバランスの良い色塗りができるよう支援する手法を提案しました。'
	},
	{
		heading: 'インタラクション2024 デモ発表',
		date: '2024年3月',
		summary:
			'「配色の可視化と配色技法の推定によるイラスト制作支援ツールの開発」というタイトルでデモ発表を行いました。',
		links: [
			{ label: '学会リンク', href: 'https://www.interaction-ipsj.org/2024/' },
			{
				label: '論文リンク',
				href: 'https://www.interaction-ipsj.org/proceedings/2024/data/bib/3B-27.html'
			}
		],
		videoUrl: 'https://www.youtube.com/embed/RDHGUdwDi1A'
	},
	{
		heading: 'エンターテインメントコンピューティング2024 口頭発表・デモ発表',
		date: '2024年9月',
		summary:
			'「利用者のコンセプトに合った配色を推薦するカラーパレットの検討」というタイトルで口頭発表・デモ発表を行いました。',
		links: [
			{ label: '学会リンク', href: 'https://ec2024.entcomp.org/' },
			{
				label: '論文リンク',
				href: 'https://ipsj.ixsq.nii.ac.jp/ej/?action=pages_view_main&active_action=repository_view_main_item_detail&item_id=238714&item_no=1&page_id=13&block_id=8'
			}
		],
		videoUrl: 'https://www.youtube.com/embed/1PHFpr4gAR4'
	}
]

export interface SkillGroup {
	label: string
	items: string[]
}

export const skills: SkillGroup[] = [
	{ label: 'Frontend', items: ['JavaScript', 'TypeScript', 'HTML/CSS', 'React', 'p5.js', 'Astro'] },
	{ label: 'Backend', items: ['Python', 'C', 'Java', 'Flask'] },
	{ label: 'Tool', items: ['Git', 'VSCode'] }
]

export interface HobbyEntry {
	heading: string
	summary: string
	links?: { label: string; href: string }[]
}

export const hobbies: HobbyEntry[] = [
	{
		heading: 'イラスト',
		summary:
			'幼少期から絵を描くことが好きで、動物やキャラクターの模写、サークルや研究室のロゴデザインなど幅広い創作活動を行ってきました。',
		links: [{ label: 'Instagram', href: 'https://www.instagram.com/amen27181/' }]
	},
	{
		heading: 'スポーツ',
		summary:
			'スノーボード、テニス、卓球が趣味。中学では卓球部副部長、高校ではテニス部副部長、大学ではテニスサークルの練習長を務めました。'
	},
	{
		heading: 'ゲーム',
		summary: '主にFPSゲームが好きで、賞金付きのAPEXカスタム大会を主催したこともあります。'
	}
]

export interface HistoryEntry {
	heading: string
	date: string
}

export const history: HistoryEntry[] = [
	{ heading: '神奈川県立鎌倉高等学校 入学', date: '2017年4月' },
	{ heading: '神奈川県立鎌倉高等学校 卒業', date: '2020年3月' },
	{ heading: '明治大学理工学部情報科学科 入学', date: '2020年4月' },
	{ heading: '明治大学理工学部情報科学科 卒業', date: '2024年3月' },
	{ heading: '明治大学大学院理工学研究科情報科学専攻 入学', date: '2024年4月' },
	{ heading: '明治大学大学院理工学研究科情報科学専攻 修了', date: '2026年3月' },
	{ heading: '実用英語技能検定2級 合格', date: '2019年7月' },
	{ heading: '普通自動車第一種免許 取得', date: '2020年8月' }
]
