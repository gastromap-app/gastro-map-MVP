import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '@/locales/en/translation.json'
import pl from '@/locales/pl/translation.json'
import ua from '@/locales/ua/translation.json'
import ru from '@/locales/ru/translation.json'
import de from '@/locales/de/translation.json'

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { en: { translation: en }, pl: { translation: pl }, ua: { translation: ua }, ru: { translation: ru }, de: { translation: de } },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
})

export default i18n
