import React from 'react';
import { Download, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { translations } from '../utils/translations';

interface AndroidHeaderProps {
  language: 'my' | 'en';
  onToggleLanguage: () => void;
  onOpenInstallGuide: () => void;
  isProcessing?: boolean;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenInstallGuide,
  isProcessing,
}) => {
  const t = translations[language];
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) onOpenInstallGuide();
    } else {
      onOpenInstallGuide();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 pt-safe px-4 py-2.5">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Brand wordmark single text element */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <span className="text-white font-black text-sm tracking-tight">5x</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              DramaMerge
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-none">
              {language === 'my' ? '၅ ပိုင်းတစ်ဖြတ် ဗီဒီယို ပေါင်းစက်' : '5-Ep Batch Merger'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Toggle Language"
            aria-label="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'my' ? 'EN' : 'မြန်မာ'}</span>
          </button>

          {/* Android PWA Install / Guide Button */}
          {!isInstalled ? (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-all active:scale-95"
              title={language === 'my' ? 'Android App အဖြစ် Install တင်ရန်' : 'Install as Android App'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'my' ? 'App သွင်းရန်' : 'Install App'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-1 bg-emerald-950/40 rounded-md border border-emerald-800/50">
              <CheckCircle2 className="w-3 h-3" />
              <span>Installed</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
