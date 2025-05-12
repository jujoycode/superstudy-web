import { TOptions } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { languageState } from 'src/store';
import { Languages } from '../util/i18n';

export const useLanguage = () => {
  const { t: originalT, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useRecoilState(languageState);

  const changeLanguage = () => {
    const nextLang: Languages = currentLang === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('language', nextLang);
    setCurrentLang(nextLang);
  };

  const t = (key: string, defaultText?: string, options?: TOptions & { defaultValue?: string }): string => {
    const defaultValue = options?.defaultValue || defaultText;
    return originalT(key, { ...options, defaultValue });
  };

  return { currentLang, t, changeLanguage };
};
