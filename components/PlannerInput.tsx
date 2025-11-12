import React from 'react';
import { useTheme } from './ThemeProvider';

// Inline SVGs to avoid creating new files
const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 20V12L5 14V10L9 8V4H15V8L19 10V14L15 12V20H9Z" fill="currentColor" className="text-sky-500"/>
    </svg>
);

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

type Page = 'entry' | 'results' | 'analysis';

interface HeaderProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    user: User;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, user, onLogout }) => {
    const { theme, setTheme } = useTheme();
    
    const NavLink: React.FC<{ page: Page; children: React.ReactNode }> = ({ page, children }) => (
        <button
            onClick={() => onNavigate(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === page
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {children}
        </button>
    );

    return (
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-2">
                             <LogoIcon />
                             <span className="font-bold text-xl text-slate-800 dark:text-slate-100">Team Planner</span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <NavLink page="entry">Data Entry</NavLink>
                                <NavLink page="results">Results</NavLink>
                                <NavLink page="analysis">Analysis</NavLink>
                            </div>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                             <input type="text" placeholder="Search activities..." className="bg-slate-100 dark:bg-slate-700 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                             <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <button
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800"
                          aria-label="Toggle dark mode"
                        >
                          {theme === 'dark' ? (
                            <SunIcon className="w-5 h-5" />
                          ) : (
                            <MoonIcon className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex items-center">
                           <span className="mr-4 text-sm font-medium">Welcome, {user.name}</span>
                            <button onClick={onLogout} className="flex items-center justify-center bg-sky-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-sky-700 transition-colors">
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;