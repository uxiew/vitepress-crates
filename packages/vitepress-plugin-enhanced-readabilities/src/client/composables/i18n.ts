import { createI18n } from '@ver5/vitepress-ui'
import { InjectionKey } from '../constants'
import { defaultEnLocale, defaultLocales } from '../locales'

export const useI18n = createI18n(InjectionKey, defaultLocales, defaultEnLocale)
