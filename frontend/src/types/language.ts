export type SupportedLanguage = 'pl' | 'en';

export const supportedLanguages: SupportedLanguage[] = ['pl', 'en'];

export type LanguageOption = {
  code: SupportedLanguage;
  translationKey: string;
};

export const languageOptions: LanguageOption[] = [
  { code: 'pl', translationKey: 'languageSwitcher.languages.pl' },
  { code: 'en', translationKey: 'languageSwitcher.languages.en' },
];
