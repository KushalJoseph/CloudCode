import { Descope } from '@descope/react-sdk';
import { useNavigate } from 'react-router-dom';

export const LoginView = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-8">
                <h2 className="text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">
                    Welcome Back
                </h2>
                <div className="descope-container">
                    <Descope
                        flowId="sign-up-or-in"
                        onSuccess={(e) => {
                            console.log('Logged in!', e);
                            navigate('/');
                        }}
                        onError={(e) => console.log('Could not log in!', e)}
                        theme="dark" // or "light", or based on context
                    />
                </div>
            </div>
        </div>
    );
};
