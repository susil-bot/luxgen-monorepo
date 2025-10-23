export const pageWrapperTranslations = {
  en: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
  },
  es: {
    loading: 'Cargando...',
    error: 'Ocurrió un error',
    retry: 'Reintentar',
  },
  fr: {
    loading: 'Chargement...',
    error: 'Une erreur s\'est produite',
    retry: 'Réessayer',
  },
  de: {
    loading: 'Wird geladen...',
    error: 'Ein Fehler ist aufgetreten',
    retry: 'Wiederholen',
  },
  zh: {
    loading: '加载中...',
    error: '发生错误',
    retry: '重试',
  },
  ja: {
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    retry: '再試行',
  },
  ko: {
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    retry: '다시 시도',
  },
  pt: {
    loading: 'Carregando...',
    error: 'Ocorreu um erro',
    retry: 'Tentar novamente',
  },
  ru: {
    loading: 'Загрузка...',
    error: 'Произошла ошибка',
    retry: 'Повторить',
  },
  ar: {
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
  },
};

export type PageWrapperTranslationKey = keyof typeof pageWrapperTranslations.en;
export type PageWrapperTranslations = typeof pageWrapperTranslations;
