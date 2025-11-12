import React, { useState, useMemo } from 'react';
import MailIcon from './icons/MailIcon';
import PhoneIcon from './icons/PhoneIcon';
import CheckIcon from './icons/CheckIcon';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 76.3c-24.3-23.4-56.3-37.5-96.6-37.5-73.2 0-133.3 60.1-133.3 133.3s60.1 133.3 133.3 133.3c84.3 0 115.8-63.3 122.9-94.2H248v-96.4h239.9c2.3 12.7 3.9 26.1 3.9 40.2z"></path>
    </svg>
);

type View = 'options' | 'signup' | 'login' | 'verify';
type Method = 'email' | 'phone';

interface AuthModalProps {
    onLogin: (isAdmin?: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
    const [view, setView] = useState<View>('options');
    const [method, setMethod] = useState<Method>('email');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const passwordFeedback = useMemo(() => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[^A-Za-z0-9]/.test(password),
        };
        const score = Object.values(checks).filter(Boolean).length;
        
        const feedbackLevels = [
            { label: 'Very Weak', colorClass: 'bg-slate-300', textClass: 'text-slate-400' }, // score 0
            { label: 'Very Weak', colorClass: 'bg-red-500', textClass: 'text-red-500' }, // score 1
            { label: 'Weak', colorClass: 'bg-orange-500', textClass: 'text-orange-500' }, // score 2
            { label: 'Medium', colorClass: 'bg-yellow-500', textClass: 'text-yellow-500' }, // score 3
            { label: 'Good', colorClass: 'bg-lime-500', textClass: 'text-lime-500' }, // score 4
            { label: 'Strong', colorClass: 'bg-green-500', textClass: 'text-green-500' }, // score 5
        ];
        
        return {
            score,
            checks,
            feedback: feedbackLevels[score] || feedbackLevels[0],
        };
    }, [password]);

    const handleAuthAction = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (view === 'signup') {
            if (passwordFeedback.score < 4) {
                setError('Password is too weak. Please meet more of the requirements.');
                return;
            }
            setView('verify');
        } else if (view === 'verify') {
            // Simulate successful verification and login
            onLogin(false);
        } else {
            // Simulate successful login
            onLogin(false);
        }
    };

    const renderPasswordStrength = () => {
        const { score, checks, feedback } = passwordFeedback;

        const requirementList = [
            { key: 'length', text: 'At least 8 characters' },
            { key: 'uppercase', text: 'An uppercase letter' },
            { key: 'lowercase', text: 'A lowercase letter' },
            { key: 'number', text: 'A number' },
            { key: 'symbol', text: 'A special character' },
        ];

        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Password strength</p>
                    <p className={`text-xs font-bold ${feedback.textClass}`}>{feedback.label}</p>
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-600">
                    <div 
                        className={`h-full transition-all duration-300 ease-in-out ${feedback.colorClass}`} 
                        style={{ width: `${(score / 5) * 100}%` }}
                    ></div>
                </div>
                {password.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2 text-slate-500 dark:text-slate-400">
                        {requirementList.map(req => (
                            <li key={req.key} className={`flex items-center transition-colors ${checks[req.key as keyof typeof checks] ? 'text-green-500 dark:text-green-400' : ''}`}>
                                {checks[req.key as keyof typeof checks] ? 
                                    <CheckIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> : 
                                    <div className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                    </div>
                                }
                                {req.text}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
    
    const renderContent = () => {
        switch (view) {
            case 'signup':
            case 'login':
                return (
                    <form onSubmit={handleAuthAction} className="space-y-4">
                        <h2 className="text-2xl font-bold text-center">{view === 'signup' ? `Sign up with ${method}` : `Log in with ${method}`}</h2>
                         <div>
                            <label htmlFor={method} className="block text-sm font-medium">{method === 'email' ? 'Email Address' : 'Phone Number'}</label>
                            <input id={method} type={method === 'email' ? 'email' : 'tel'} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium">Password</label>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                        </div>
                        {view === 'signup' && renderPasswordStrength()}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="submit" className="w-full py-2.5 px-5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg">{view === 'signup' ? 'Create Account' : 'Log In'}</button>
                        <button type="button" onClick={() => setView(view === 'signup' ? 'login' : 'signup')} className="w-full text-sm text-center text-sky-600 hover:underline">
                            {view === 'signup' ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                        </button>
                        <button type="button" onClick={() => setView('options')} className="w-full text-sm text-center mt-2"> &larr; Other options</button>
                    </form>
                );
            case 'verify':
                 return (
                    <form onSubmit={handleAuthAction} className="space-y-4 text-center">
                        <h2 className="text-2xl font-bold">Verify Your Account</h2>
                        <p>A verification code has been sent to your {method}. Please enter it below.</p>
                        <div>
                            <label htmlFor="code" className="sr-only">Verification Code</label>
                            <input id="code" type="text" placeholder="123456" required className="mt-1 text-center tracking-widest text-lg block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                        </div>
                        <button type="submit" className="w-full py-2.5 px-5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg">Verify & Log In</button>
                    </form>
                 );
            default: // options
                return (
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold text-center">Login or Sign up</h1>
                        <p className="text-center text-slate-500 dark:text-slate-400">Welcome to the Team Activities Planner</p>
                        <div className="space-y-3 pt-4">
                            <button onClick={() => onLogin(true)} className="w-full flex items-center justify-center py-2.5 px-5 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <GoogleIcon /> Log in with Google (Admin)
                            </button>
                             <button onClick={() => { setView('login'); setMethod('email'); }} className="w-full flex items-center justify-center py-2.5 px-5 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <MailIcon className="w-5 h-5 mr-3" /> Continue with Email
                            </button>
                            <button onClick={() => { setView('login'); setMethod('phone'); }} className="w-full flex items-center justify-center py-2.5 px-5 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <PhoneIcon className="w-5 h-5 mr-3" /> Continue with Phone
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-50 flex justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto">
                 <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-2xl p-8">
                     {renderContent()}
                 </div>
                 <div className="text-center mt-6 px-4">
                     <h4 className="font-semibold text-sm">Policies and Terms of Condition</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                         By signing up or logging in, you agree to our terms. We are committed to your privacy and want to be transparent: we will not collect, store, or sell any of your personal mail data or information. Your data is used solely for the functionality of this application.
                     </p>
                 </div>
             </div>
        </div>
    );
};

export default AuthModal;