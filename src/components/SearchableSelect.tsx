import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string | null;
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  placeholder,
  onChange,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-forest-800 border border-forest-600 rounded-sm text-warmwhite text-sm transition-colors ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-olive-400'
        }`}
      >
        <span className={selected ? 'text-warmwhite' : 'text-warmwhite/50'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-warmwhite/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-max min-w-full max-w-[18rem] bg-forest-800 border border-forest-600 rounded-sm shadow-xl overflow-hidden">
          <div className="p-2 border-b border-forest-600">
            <div className="flex items-center gap-2 px-2 py-1 bg-forest-900 rounded-sm min-w-0">
              <Search className="w-4 h-4 shrink-0 text-warmwhite/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 w-0 min-w-0 bg-transparent text-warmwhite text-sm outline-none placeholder:text-warmwhite/30"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-warmwhite/40">No results found</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-left text-sm whitespace-nowrap transition-colors hover:bg-forest-700 ${
                    opt.value === value ? 'text-olive-300' : 'text-warmwhite/80'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
