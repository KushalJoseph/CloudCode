import { useDescope, useSession } from '@descope/react-sdk';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginButton = () => {
    const { isAuthenticated } = useSession();
    const sdk = useDescope();
    const navigate = useNavigate();

    const handleLogin = useCallback(async () => {
        navigate('/login');
    }, [navigate]);

    return (
        <div className="flex items-center gap-4">
            {!isAuthenticated && (
                <button
                    className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 group"
                    onClick={handleLogin}
                >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900">
                        Login
                    </span>
                </button>
            )}

            {isAuthenticated && (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Logged In</span>
                    <button
                        className="text-xs text-slate-500 underline ml-2 cursor-pointer"
                        onClick={() => sdk.logout()}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};
