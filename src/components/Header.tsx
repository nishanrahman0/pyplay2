import { BookOpen, Home, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 sm:px-6 py-2.5">
      <button onClick={() => navigate('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
        <img src="/favicon.png" alt="PY Play" className="h-8 w-8 rounded-lg" />
        <div>
          <h1 className="font-sans text-lg font-bold text-foreground leading-tight">
            PY Play
          </h1>
          <p className="text-[10px] text-muted-foreground hidden sm:block">Python IDE in your browser</p>
        </div>
      </button>

      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-1 rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm transition-colors ${
            location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Notebook</span>
        </button>
        <button
          onClick={() => navigate('/lessons')}
          className={`flex items-center gap-1 rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm transition-colors ${
            location.pathname.startsWith('/lessons') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Lessons</span>
        </button>
        <button
          onClick={() => navigate('/docs')}
          className={`flex items-center gap-1 rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm transition-colors ${
            location.pathname === '/docs' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Docs</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="hidden sm:inline">Ready</span>
        </div>
      </nav>
    </header>
  );
};

export default Header;
