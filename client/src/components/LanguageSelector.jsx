import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Globe } from 'lucide-react';

export const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', native: 'EN' },
    { code: 'hi', label: 'हिन्दी', native: 'HI' },
    { code: 'od', label: 'ଓଡ଼ିଆ', native: 'OD' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200">
      <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            lang === l.code
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={l.label}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
};
