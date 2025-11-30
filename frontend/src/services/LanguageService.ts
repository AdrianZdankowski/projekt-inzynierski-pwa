import { SupportedLanguage, supportedLanguages } from '../types/language';

export const isSupportedLanguage = (lang: string): lang is SupportedLanguage =>
  supportedLanguages.includes(lang as SupportedLanguage);

