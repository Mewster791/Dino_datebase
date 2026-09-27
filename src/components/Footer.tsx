import { Bone } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: { name: 'home' } | { name: 'browse' }) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-stone-900 border-t border-stone-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => onNavigate({ name: 'home' })}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <Bone className="w-4 h-4 text-stone-50" />
            </div>
            <span className="text-stone-300 font-semibold">PaleoPedia</span>
          </button>
          <p className="text-stone-500 text-sm text-center sm:text-right">
            A community-driven encyclopedia of prehistoric life.
            <br className="hidden sm:block" />
            Contributions are reviewed by dedicated editors.
          </p>
        </div>
      </div>
    </footer>
  );
}
