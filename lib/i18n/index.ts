import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enUS from "@/locales/en-US.json";
import ptBR from "@/locales/pt-BR.json";

const resources = {
    "en-US": { translation: enUS },
    "en": { translation: enUS },
    "pt-BR": { translation: ptBR },
    "pt": { translation: ptBR },
};

// Don't initialize here - let I18nProvider handle it
i18n
    .use(LanguageDetector)
    .use(initReactI18next);

// Configuration for when initialized
export const i18nConfig = {
    resources,
    fallbackLng: "en-US",
    supportedLngs: ["en-US", "en", "pt-BR", "pt"],

    // Detection options
    detection: {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
        lookupLocalStorage: "i18nextLng",
    },

    interpolation: {
        escapeValue: false, // React already escapes values
    },

    react: {
        useSuspense: false, // Disable suspense for client-side rendering
    },
};

export default i18n;
