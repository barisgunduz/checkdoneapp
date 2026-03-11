import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { DEFAULT_LANGUAGE, LanguageCode, translations } from "../i18n/translations"
import { loadLanguage, saveLanguage } from "../services/storage"

type TranslateOptions = {
    params?: Record<string, string | number>
    fallback?: string
}

type LanguageContextValue = {
    language: LanguageCode
    setLanguage: (lang: LanguageCode) => void
    t: (key: string, options?: TranslateOptions) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const interpolate = (template: string, params?: Record<string, string | number>) => {
    if (!params) return template

    return template.replace(/\{(\w+)\}/g, (_, token) =>
        params[token] !== undefined ? String(params[token]) : `{${token}}`
    )
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE)

    useEffect(() => {
        loadLanguage().then(setLanguageState)
    }, [])

    const setLanguage = useCallback((lang: LanguageCode) => {
        setLanguageState(lang)
        saveLanguage(lang)
    }, [])

    const t = useCallback(
        (key: string, options: TranslateOptions = {}) => {
            const { params, fallback } = options
            const selected = translations[language]?.[key]
            const fallbackValue = translations[DEFAULT_LANGUAGE]?.[key]
            const template = selected ?? fallback ?? fallbackValue ?? key

            return interpolate(template, params)
        },
        [language]
    )

    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useTranslation = () => {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error("useTranslation must be used within LanguageProvider")
    return ctx
}
