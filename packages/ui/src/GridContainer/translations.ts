export const gridContainerTranslations = {
  en: {
    grid: 'Grid',
    layout: 'Layout',
    columns: 'Columns',
    gap: 'Gap',
    responsive: 'Responsive',
  },
  es: {
    grid: 'Cuadrícula',
    layout: 'Diseño',
    columns: 'Columnas',
    gap: 'Espacio',
    responsive: 'Responsivo',
  },
  fr: {
    grid: 'Grille',
    layout: 'Mise en page',
    columns: 'Colonnes',
    gap: 'Espacement',
    responsive: 'Responsive',
  },
  de: {
    grid: 'Raster',
    layout: 'Layout',
    columns: 'Spalten',
    gap: 'Abstand',
    responsive: 'Responsive',
  },
  zh: {
    grid: '网格',
    layout: '布局',
    columns: '列',
    gap: '间距',
    responsive: '响应式',
  },
  ja: {
    grid: 'グリッド',
    layout: 'レイアウト',
    columns: '列',
    gap: '間隔',
    responsive: 'レスポンシブ',
  },
  ko: {
    grid: '그리드',
    layout: '레이아웃',
    columns: '열',
    gap: '간격',
    responsive: '반응형',
  },
  pt: {
    grid: 'Grade',
    layout: 'Layout',
    columns: 'Colunas',
    gap: 'Espaçamento',
    responsive: 'Responsivo',
  },
  ru: {
    grid: 'Сетка',
    layout: 'Макет',
    columns: 'Столбцы',
    gap: 'Промежуток',
    responsive: 'Адаптивный',
  },
  ar: {
    grid: 'شبكة',
    layout: 'تخطيط',
    columns: 'أعمدة',
    gap: 'فجوة',
    responsive: 'متجاوب',
  },
};

export type GridContainerTranslationKey = keyof typeof gridContainerTranslations.en;
export type GridContainerTranslations = typeof gridContainerTranslations;
