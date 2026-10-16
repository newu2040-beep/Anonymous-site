import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useAuth, ThemeMode } from '../../context/AuthContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useAuth();

  const options: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun size={14} />, label: 'Light' },
    { mode: 'system', icon: <Laptop size={14} />, label: 'System' },
    { mode: 'dark', icon: <Moon size={14} />, label: 'Dark' },
  ];

  return (
    <div className="flex items-center p-1 rounded-full bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-white/10 backdrop-blur-md">
      {options.map((opt) => (
        <button
          key={opt.mode}
          onClick={() => setTheme(opt.mode)}
          title={`Switch to ${opt.label} mode`}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
            theme === opt.mode
              ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
