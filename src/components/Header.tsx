import { Bone, Compass, LayoutGrid, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  view: string;
  pendingCount: number;
  onNavigate: (view: { name: 'home' } | { name: 'browse' } | { name: 'editor' }) => void;
}

export function Header({ view, pendingCount, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate({ name: 'home' })}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
              <Bone className="w-5 h-5 text-stone-50" />
            </div>
            <div className="text-left">
              <span className="block text-stone-50 font-bold text-lg leading-none tracking-tight">
                PaleoPedia
              </span>
              <span className="block text-stone-400 text-xs leading-none mt-0.5">
                Community Prehistoric Encyclopedia
              </span>
            </div>
          </button>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavButton
              active={view === 'home'}
              onClick={() => onNavigate({ name: 'home' })}
              icon={<Compass className="w-4 h-4" />}
              label="Home"
            />
            <NavButton
              active={view === 'browse' || view === 'detail'}
              onClick={() => onNavigate({ name: 'browse' })}
              icon={<LayoutGrid className="w-4 h-4" />}
              label="Explore"
            />
            <NavButton
              active={view === 'editor'}
              onClick={() => onNavigate({ name: 'editor' })}
              icon={<ShieldCheck className="w-4 h-4" />}
              label="Editor"
              badge={pendingCount}
            />
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-amber-500/15 text-amber-400'
          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-stone-900">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
