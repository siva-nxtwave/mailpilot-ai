import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center space-x-2 p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition ${className}`}
      title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {mounted ? (
          isDark ? (
            <Moon className="w-4 h-4 text-indigo-400 animate-in spin-in-90 duration-200" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 animate-in spin-in-90 duration-200" />
          )
        ) : (
          <div className="w-4 h-4" />
        )}
      </div>
      {showLabel && mounted && (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}

