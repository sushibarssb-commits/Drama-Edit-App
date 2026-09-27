import React from 'react';
import { X, Smartphone, Download, MoreVertical, CheckCircle2, ShieldCheck } from 'lucide-react';
import { translations } from '../utils/translations';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'my' | 'en';
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language].pwa;
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              {language === 'my' ? 'Android App ထည့်သွင်းနည်း လမ်းညွှန်' : 'How to Install on Android'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg active:scale-95 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Status box */}
          {isInstalled ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{t.installSuccess}</span>
            </div>
          ) : (
            isInstallable && (
              <button
                onClick={async () => {
                  const success = await install();
                  if (success) onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all min-h-[48px]"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'my' ? 'ယခုပင် ဖုန်းထဲသို့ Install ပြုလုပ်မည်' : 'Install App Now'}</span>
              </button>
            )
          )}

          {/* Step 1 Visual Card */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center text-[11px]">1</span>
              <span>{language === 'my' ? 'နေရာ ၁ - Header ပေါ်ရှိ Install ခလုတ်' : 'Location 1: Top Navigation Button'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'my'
                ? 'မျက်နှာပြင် အပေါ်ဘားရှိ အပြာရောင် "App သွင်းရန်" (Install) ခလုတ်ကို နှိပ်ပါက ဖုန်း Screen ပေါ်သို့ အလိုအလျောက် ရောက်ရှိသွားပါမည်။'
                : 'Tap the blue "Install App" button at the top header to place DramaMerge directly onto your Android home screen.'}
            </p>
          </div>

          {/* Step 2 Visual Card (Chrome Browser Menu) */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center text-[11px]">2</span>
              <span>{language === 'my' ? 'နေရာ ၂ - Chrome Browser အစက် ၃ စက် မီနူး' : 'Location 2: Chrome Browser Menu ( ⋮ )'}</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MoreVertical className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{t.modalStep1}</p>
              </div>
              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>{t.modalStep2}</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>{t.modalStep3}</p>
              </div>
            </div>
          </div>

          {/* Advantage Banner */}
          <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl flex items-start gap-2 text-xs text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                {language === 'my' ? 'App အဖြစ် သွင်းထားခြင်း၏ အားသာချက်' : 'Benefits of Installing'}
              </span>
              <p className="text-[11px] text-indigo-300/80 mt-0.5 leading-relaxed">
                {language === 'my'
                  ? 'APK ဒေါင်းစရာမလိုဘဲ ဖုန်း Memory မစားခြင်း၊ အင်တာနက် မရှိသည့် အချိန်တွင်လည်း အသုံးပြုနိုင်ခြင်းနှင့် Drama ဗီဒီယိုများကို စိတ်ချစွာ ပေါင်းစပ်နိုင်ခြင်း။'
                  : 'Fast, native full-screen experience, zero APK bloat, and works completely offline.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs active:scale-95 transition-all min-h-[44px]"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
