import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'ar', 'wo'],
  defaultNS: 'common',
  ns: ['common'],
  resources: {
    fr: { common: {} },
    ar: { common: {} },
    wo: { common: {} },
  },
  interpolation: { escapeValue: false },
})

export default i18n
