export const cardTranslations = {
  en: {
    loading: 'Loading...',
    error: 'Error loading content',
    close: 'Close',
    open: 'Open',
  },
  es: {
    loading: 'Cargando...',
    error: 'Error al cargar el contenido',
    close: 'Cerrar',
    open: 'Abrir',
  },
  fr: {
    loading: 'Chargement...',
    error: 'Erreur lors du chargement du contenu',
    close: 'Fermer',
    open: 'Ouvrir',
  },
};

export type CardTranslationKey = string;
export type CardTranslations = Record<string, any>;
