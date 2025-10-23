export const headerTranslations = {
  en: {
    logo: 'Logo',
    navigation: 'Navigation',
    menu: 'Menu',
    close: 'Close',
    open: 'Open',
  },
  es: {
    logo: 'Logo',
    navigation: 'Navegación',
    menu: 'Menú',
    close: 'Cerrar',
    open: 'Abrir',
  },
  fr: {
    logo: 'Logo',
    navigation: 'Navigation',
    menu: 'Menu',
    close: 'Fermer',
    open: 'Ouvrir',
  },
  de: {
    logo: 'Logo',
    navigation: 'Navigation',
    menu: 'Menü',
    close: 'Schließen',
    open: 'Öffnen',
  },
  zh: {
    logo: '标志',
    navigation: '导航',
    menu: '菜单',
    close: '关闭',
    open: '打开',
  },
  ja: {
    logo: 'ロゴ',
    navigation: 'ナビゲーション',
    menu: 'メニュー',
    close: '閉じる',
    open: '開く',
  },
  ko: {
    logo: '로고',
    navigation: '내비게이션',
    menu: '메뉴',
    close: '닫기',
    open: '열기',
  },
  pt: {
    logo: 'Logo',
    navigation: 'Navegação',
    menu: 'Menu',
    close: 'Fechar',
    open: 'Abrir',
  },
  ru: {
    logo: 'Логотип',
    navigation: 'Навигация',
    menu: 'Меню',
    close: 'Закрыть',
    open: 'Открыть',
  },
  ar: {
    logo: 'الشعار',
    navigation: 'التنقل',
    menu: 'القائمة',
    close: 'إغلاق',
    open: 'فتح',
  },
};

export type HeaderTranslationKey = keyof typeof headerTranslations.en;
export type HeaderTranslations = typeof headerTranslations;
