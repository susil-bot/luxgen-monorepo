export const sidebarTranslations = {
  en: {
    navigation: 'Navigation',
    toggle: 'Toggle sidebar',
    expand: 'Expand sidebar',
    collapse: 'Collapse sidebar',
  },
  es: {
    navigation: 'Navegación',
    toggle: 'Alternar barra lateral',
    expand: 'Expandir barra lateral',
    collapse: 'Contraer barra lateral',
  },
  fr: {
    navigation: 'Navigation',
    toggle: 'Basculer la barre latérale',
    expand: 'Développer la barre latérale',
    collapse: 'Réduire la barre latérale',
  },
  de: {
    navigation: 'Navigation',
    toggle: 'Seitenleiste umschalten',
    expand: 'Seitenleiste erweitern',
    collapse: 'Seitenleiste reduzieren',
  },
  zh: {
    navigation: '导航',
    toggle: '切换侧边栏',
    expand: '展开侧边栏',
    collapse: '收起侧边栏',
  },
  ja: {
    navigation: 'ナビゲーション',
    toggle: 'サイドバーを切り替え',
    expand: 'サイドバーを展開',
    collapse: 'サイドバーを折りたたむ',
  },
  ko: {
    navigation: '내비게이션',
    toggle: '사이드바 토글',
    expand: '사이드바 확장',
    collapse: '사이드바 축소',
  },
  pt: {
    navigation: 'Navegação',
    toggle: 'Alternar barra lateral',
    expand: 'Expandir barra lateral',
    collapse: 'Recolher barra lateral',
  },
  ru: {
    navigation: 'Навигация',
    toggle: 'Переключить боковую панель',
    expand: 'Развернуть боковую панель',
    collapse: 'Свернуть боковую панель',
  },
  ar: {
    navigation: 'التنقل',
    toggle: 'تبديل الشريط الجانبي',
    expand: 'توسيع الشريط الجانبي',
    collapse: 'طي الشريط الجانبي',
  },
};

export type SidebarTranslationKey = keyof typeof sidebarTranslations.en;
export type SidebarTranslations = typeof sidebarTranslations;
