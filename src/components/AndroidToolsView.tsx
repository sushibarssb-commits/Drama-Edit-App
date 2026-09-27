import React, { useState } from 'react';
import { EpisodeBatch } from '../types';
import {
  Terminal,
  Copy,
  Check,
  Download,
  Smartphone,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { generateAndroidTermuxScript, triggerFileDownload } from '../utils/videoMerger';
import { translations } from '../utils/translations';

interface AndroidToolsViewProps {
  language: 'my' | 'en';
  batches: EpisodeBatch[];
  seriesName: string;
  onOpenInstallGuide: () => void;
}

export const AndroidToolsView: React.FC<AndroidToolsViewProps> = ({
  language,
  batches,
  seriesName,
  onOpenInstallGuide,
}) => {
  const t = translations[language].toolsView;
  const [copied, setCopied] = useState(false);

  const { scriptText, fileName, instructions } = generateAndroidTermuxScript(
    batches,
    seriesName
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSh = () => {
    const blob = new Blob([scriptText], { type: 'application/x-sh' });
    triggerFileDownload(blob, fileName);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Installation Guide Banner Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-800/50 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
          <Smartphone className="w-4 h-4" />
          <span>{t.installGuideTitle}</span>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
            <p className="leading-relaxed">{t.installGuideMethod1}</p>
          </div>
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
            <p className="leading-relaxed">{t.installGuideMethod2}</p>
          </div>
        </div>

        <button
          onClick={onOpenInstallGuide}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 active:scale-95 transition-all min-h-[44px]"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{t.openInstallDialog}</span>
        </button>
      </div>

      {/* Termux Lossless Script Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
          <Terminal className="w-4 h-4" />
          <span>{t.title}</span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
          {t.subtitle}
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          {language === 'my'
            ? 'ဖုန်းတွင်း File Manager ရှိ အပိုင်း ၈၀/၁၀၀ ကျော် ဖိုင်ဆိုဒ် ကြီးမားသည့်အခါ Termux FFmpeg ဖြင့် Lossless (-c copy) အမြန်ဆုံး ပေါင်းနိုင်ပါသည်'
            : 'For huge files or 100+ episodes on phone storage, lossless FFmpeg stream-copy runs in seconds.'}
        </p>

        {/* Action Buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all min-h-[44px]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t.copiedText : t.copyScriptBtn}</span>
          </button>

          <button
            onClick={handleDownloadSh}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 active:scale-95 transition-all min-h-[44px]"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{t.downloadShBtn}</span>
          </button>
        </div>
      </div>

      {/* Step by Step Guide for Android Users */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span>{t.howToTitle}</span>
        </h3>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
            <p>{t.step1}</p>
          </div>
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
            <p>{t.step2}</p>
          </div>
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
            <p>{t.step3}</p>
          </div>
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">4</span>
            <p>{t.step4}</p>
          </div>
        </div>
      </div>

      {/* Script Code Preview */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold text-slate-300 font-mono">
              {fileName}
            </h4>
          </div>
          <button
            onClick={handleCopy}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
          >
            {copied ? t.copiedText : 'Copy Code'}
          </button>
        </div>

        <pre className="p-3 bg-slate-950 text-slate-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed border border-slate-800">
          {scriptText}
        </pre>
      </div>

      {/* Why Lossless Stream Copy Matters */}
      <div className="p-3.5 bg-blue-950/30 border border-blue-900/40 rounded-xl flex items-start gap-2.5 text-xs">
        <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-300 block">
            {language === 'my'
              ? 'Lossless Stream Copy နည်းပညာ အကျိုးကျေးဇူး'
              : 'Benefits of Lossless Stream Copy'}
          </span>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
            {language === 'my'
              ? 'Video ကို Re-encode ပြန်မလုပ်သောကြောင့် Video Pixels နှင့် Audio များကို ၁၀၀% မူရင်းအတိုင်း တိကျစွာ ပေါင်းပေးပါသည်။ ဖုန်းဘက်ထရီ မကုန်စေသည့်အပြင် အပိုင်း ၁၀၀ ကို စက္ကန့် ၃၀ အတွင်း ပြီးစီးစေပါသည်'
              : 'Zero quality re-encoding loss. Directly preserves H.264/AAC packets, saving battery and completing 100 episodes in seconds.'}
          </p>
        </div>
      </div>
    </div>
  );
};
