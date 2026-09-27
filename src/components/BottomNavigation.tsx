import React from 'react';
import { Layers, Film, ListOrdered, FolderDown, Smartphone } from 'lucide-react';
import { translations } from '../utils/translations';

export type TabKey = 'merger' | 'episodes' | 'queue' | 'library' | 'tools';

interface BottomNavigationProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  language: 'my' | 'en';
  queueCount?: number;
  completedCount?: number;
  savedCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  language,
  queueCount = 0,
  completedCount = 0,
  savedCount = 0,
}) => {
  const t = translations[language].tabs;

  const items = [
    {
      key: 'merger' as TabKey,
      label: t.merger,
      icon: Layers,
    },
    {
      key: 'episodes' as TabKey,
      label: t.episodes,
      icon: Film,
    },
    {
      key: 'queue' as TabKey,
      label: t.queue,
      icon: ListOrdered,
      badge: queueCount > 0 ? queueCount : undefined,
    },
    {
      key: 'library' as TabKey,
      label: t.library,
      icon: FolderDown,
      badge: savedCount > 0 ? String(savedCount) : undefined,
    },
    {
      key: 'tools' as TabKey,
      label: t.tools,
      icon: Smartphone,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 pb-[env(safe-area-inset-bottom,0px)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className="relative flex flex-col items-center justify-center min-h-[48px] w-full py-1 text-center transition-colors active:scale-95"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-blue-500 scale-110' : 'text-slate-400'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1.5 py-0.2 bg-blue-500 text-white font-mono text-[9px] font-bold rounded-full min-w-[16px] text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-semibold mt-1 truncate max-w-[62px] leading-tight ${
                  isActive ? 'text-blue-400 font-bold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

