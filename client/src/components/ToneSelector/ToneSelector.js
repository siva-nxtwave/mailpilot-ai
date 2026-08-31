import { useAIStore } from '../../store/aiStore';
import { Sparkles, Briefcase, Smile, ScrollText, Zap } from 'lucide-react';

const TONES = [
  { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Balanced & polished' },
  { id: 'friendly', label: 'Friendly', icon: Smile, desc: 'Warm & conversational' },
  { id: 'formal', label: 'Formal', icon: ScrollText, desc: 'Diplomatic & executive' },
  { id: 'concise', label: 'Concise', icon: Zap, desc: 'Direct & to the point' }
];

export default function ToneSelector({ selected, onSelect, compact = false }) {
  const { selectedTone, setSelectedTone } = useAIStore();
  const current = selected || selectedTone;

  const handleSelect = (id) => {
    if (onSelect) {
      onSelect(id);
    } else {
      setSelectedTone(id);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
        {TONES.map(t => {
          const Icon = t.icon;
          const isSelected = current === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {TONES.map(t => {
        const Icon = t.icon;
        const isSelected = current === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => handleSelect(t.id)}
            className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
              isSelected
                ? 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-400 dark:border-indigo-500/40 text-indigo-900 dark:text-indigo-200 shadow-glow'
                : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.label}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
