export type Language = 'ja' | 'en'

export interface I18nConfig {
  defaultLanguage: Language
  languages: Language[]
}

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'ja',
  languages: ['ja', 'en']
}

export const translations = {
  ja: {
    // ナビゲーション
    home: 'ホーム',
    about: 'このサイトについて',
    aboutMe: '私について',
    projects: '制作物',
    research: '研究テーマ',
    publications: '学会発表',
    skills: 'スキル',
    education: '学歴',
    hobbies: '趣味',
    certifications: '資格・免許',
    gallery: '作品集',
    
    // サイト情報
    siteDescription: 'ここは情報系大学院生Emaのポートフォリオサイトです。就職活動のための情報(自己PRや制作物、スキルなど)をまとめています。',
    githubLink: 'このサイトのGitHubリポジトリは',
    githubLinkText: 'こちら',
    githubLinkSuffix: 'からご覧いただけます。',
    
    // 個人情報
    profileDescription: '現在、明治大学大学院理工学研究科情報科学専攻に在学中の大学院生。研究室では、カラーパレットの推薦によるイラスト制作支援について研究中。過去に書いたコードはGitHubにて公開しています。スポーツやイラスト、ゲームなど、趣味として幅広く楽しんでいます。イラスト作品は',
    galleryLinkText: 'こちら',
    galleryLinkSuffix: 'からご覧いただけます。',
    
    // プロジェクト
    galleryPortfolio: 'ギャラリーポートフォリオ',
    galleryPortfolioDesc: '自身が描いたイラストや動画などをグリッド上に展示しています．',
    colorRecommendApp: '色相・トーン推薦アプリ',
    colorRecommendAppDesc: '研究内容のデモを公開しています．',
    portfolioSite: 'ポートフォリオ(このサイト)',
    portfolioSiteDesc: '経歴などをまとめたポートフォリオサイトです．',
    juqsMap: 'JUQSマップ',
    juqsMapDesc: 'JUQSと呼ばれるラクガキの写真をマップ上にまとめたサイトです．',
    gamePortfolio: 'ゲーム用ポートフォリオ',
    gamePortfolioDesc: '自身のゲームアカウントに関する情報やプレイ実績をまとめたポートフォリオサイトです。',
    valorantPointViewer: 'VALORANT Point Viewer',
    valorantPointViewerDesc: 'VALORANTの各マップの定点動画をマップ上で確認できるWebサイトです。プレイヤーがマップを理解し、戦略を練るためのツールとして制作しました。',
    p5jsBrowser: 'p5.js演習ブラウザ',
    p5jsBrowserDesc: '研究で作成した成果物を展示しています．',
    
    // 研究
    researchTitle: '配色の推薦によるイラスト制作の支援',
    researchDescription: '一般的にイラストを描く際、イラストレーターは自身の経験に基づいて色を塗りますが、初心者は経験が浅いため、配色のバランスが崩れやすいという問題があります。そのため、使われている色の数や配色を利用者が把握することが重要です。私の研究では、キャンバス上で使用されている配色を推定し、相性の良いとされる配色技法の色相環上にに表示させる手法を提案しました。提案手法を用いることで配色技法について知らない初心者でもバランスの良い色塗りが出来るように支援します。',
    
    // 学歴
    highSchoolEnrollment: '神奈川県立鎌倉高等学校 入学',
    highSchoolGraduation: '神奈川県立鎌倉高等学校 卒業',
    universityEnrollment: '明治大学理工学部情報科学科 入学',
    universityGraduation: '明治大学理工学部情報科学科 卒業',
    graduateSchoolEnrollment: '明治大学大学院理工学研究科情報科学専攻 入学',
    
    // 趣味
    illustrationHobby: 'イラスト',
    illustrationDesc: '幼少期から絵を描くことが好きで日常的に絵を描き続けてきました。動物やキャラクターの模写、サークルや研究室のロゴデザインを手掛けるなど幅広い創作活動を行ってきました。',
    sportsHobby: 'スポーツ',
    sportsDesc: 'スノーボード、テニス、卓球などのスポーツをするのが趣味です。中学時代には卓球部の副部長、高校時代にはテニス部の副部長、大学時代にはテニスサークルの練習長(練習をまとめる役)を任されていました。',
    gamingHobby: 'ゲーム',
    gamingDesc: '主にFPSゲームをするのが好きです。APEXというFPSゲームの賞金付きカスタム大会を主催したこともあります。',
    
    // 資格
    englishTest: '実用英語技能検定2級合格',
    drivingLicense: '普通自動車第1種免許取得',
    
    // その他
    moreWorksLink: 'からより多くの作品をご覧いただけます。',
    illutWorksLink: 'イラスト作品はこちら'
  },
  en: {
    // Navigation
    home: 'Home',
    about: 'About This Site',
    aboutMe: 'About Me',
    projects: 'Projects',
    research: 'Research',
    publications: 'Publications',
    skills: 'Skills',
    education: 'Education',
    hobbies: 'Hobbies',
    certifications: 'Certifications',
    gallery: 'Gallery',
    
    // Site information
    siteDescription: 'This is the portfolio site of Ema, a graduate student in information science. It summarizes information for job hunting (self-promotion, projects, skills, etc.).',
    githubLink: 'You can view the GitHub repository of this site',
    githubLinkText: 'here',
    githubLinkSuffix: '. The English translation of this site was created by Claude Code.',
    
    // Personal information
    profileDescription: 'Currently a graduate student at Meiji University Graduate School of Science and Technology, Department of Computer Science. In the laboratory, I am researching illustration creation support through color palette recommendations. I have published my past code on GitHub. I enjoy a wide range of hobbies including sports, illustration, and gaming. You can view my illustration works',
    galleryLinkText: 'here',
    galleryLinkSuffix: '.',
    
    // Projects
    galleryPortfolio: 'Gallery Portfolio',
    galleryPortfolioDesc: 'Displaying illustrations and videos I created in a grid layout.',
    colorRecommendApp: 'Hue & Tone Recommendation App',
    colorRecommendAppDesc: 'Publishing a demo of my research content.',
    portfolioSite: 'Portfolio (This Site)',
    portfolioSiteDesc: 'A portfolio site summarizing my career and achievements.',
    juqsMap: 'JUQS Map',
    juqsMapDesc: 'A site that compiles photos of doodles called JUQS on a map.',
    gamePortfolio: 'Gaming Portfolio',
    gamePortfolioDesc: 'A portfolio site summarizing information about my gaming accounts and play achievements.',
    valorantPointViewer: 'VALORANT Point Viewer',
    valorantPointViewerDesc: 'A website where you can check fixed-point videos of each VALORANT map on the map. Created as a tool for players to understand maps and develop strategies.',
    p5jsBrowser: 'p5.js Exercise Browser',
    p5jsBrowserDesc: 'Exhibiting the results created in my research.',
    
    // Research
    researchTitle: 'Supporting Illustration Creation Through Color Palette Recommendations',
    researchDescription: 'Generally, when drawing illustrations, illustrators color based on their own experience, but beginners have little experience and tend to lose color balance. Therefore, it is important for users to understand the number of colors used and the color scheme. In my research, I proposed a method to estimate the color scheme used on the canvas and display it on a color wheel of color scheme techniques that are considered to be compatible. Using the proposed method, even beginners who do not know about color scheme techniques can create well-balanced coloring.',
    
    // Education
    highSchoolEnrollment: 'Enrolled in Kanagawa Prefectural Kamakura High School',
    highSchoolGraduation: 'Graduated from Kanagawa Prefectural Kamakura High School',
    universityEnrollment: 'Enrolled in Meiji University School of Science and Technology, Department of Computer Science',
    universityGraduation: 'Graduated from Meiji University School of Science and Technology, Department of Computer Science',
    graduateSchoolEnrollment: 'Enrolled in Meiji University Graduate School of Science and Technology, Department of Computer Science',
    
    // Hobbies
    illustrationHobby: 'Illustration',
    illustrationDesc: 'I have loved drawing since childhood and have continued to draw on a daily basis. I have engaged in a wide range of creative activities, including copying animals and characters, and designing logos for circles and laboratories.',
    sportsHobby: 'Sports',
    sportsDesc: 'My hobbies include sports such as snowboarding, tennis, and table tennis. I served as vice-captain of the table tennis club in junior high school, vice-captain of the tennis club in high school, and practice leader (role of organizing practice) of the tennis circle in university.',
    gamingHobby: 'Gaming',
    gamingDesc: 'I mainly enjoy playing FPS games. I have also hosted a custom tournament with prize money for the FPS game APEX.',
    
    // Certifications
    englishTest: 'Passed EIKEN Grade 2',
    drivingLicense: 'Obtained Ordinary Motor Vehicle License',
    
    // Others
    moreWorksLink: ' to view more works.',
    illutWorksLink: 'View illustration works here'
  }
} as const

export function getLanguageFromPath(pathname: string): Language {
  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  
  if (firstSegment && i18nConfig.languages.includes(firstSegment as Language)) {
    return firstSegment as Language
  }
  
  return i18nConfig.defaultLanguage
}

export function getLocalizedPath(path: string, language: Language): string {
  if (language === i18nConfig.defaultLanguage) {
    return path === '/' ? '/' : path
  }
  
  return path === '/' ? `/${language}` : `/${language}${path}`
}

export function removeLanguagePrefix(path: string): string {
  const segments = path.split('/').filter(Boolean)
  if (segments.length > 0 && i18nConfig.languages.includes(segments[0] as Language)) {
    segments.shift()
  }
  return '/' + segments.join('/')
}

export function useTranslations(language: Language) {
  return translations[language]
}