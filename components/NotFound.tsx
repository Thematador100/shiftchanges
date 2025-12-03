import React from 'react';

interface NotFoundProps {
    onReturnHome: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onReturnHome }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-8">
                    <div className="inline-block">
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-24 w-24 text-teal-500 animate-pulse mb-6"
                        >
                            <path d="M14.6 2.2c-.6-.4-1.4-.2-1.8.4l-4 6c-.3.5-.3 1.1 0 1.6l4 6c.4.6 1.2.8 1.8.4.6-.4.8-1.2.4-1.8L11.8 10l3.2-4.8c.4-.6.2-1.4-.4-1.8z" opacity="0.5"/>
                            <path d="M9.4 21.8c.6.4 1.4.2 1.8-.4l4-6c.3-.5.3-1.1 0-1.6l-4-6c-.4-.6-1.2-.8-1.8-.4-.6.4-.8 1.2-.4 1.8l3.2 4.8-3.2 4.8c-.4.6-.2 1.4.4 1.8z"/>
                        </svg>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-2xl border border-white/20">
                    <h1 className="text-8xl font-bold text-white mb-4 font-brand">404</h1>
                    <h2 className="text-3xl font-bold text-teal-400 mb-6">Page Not Found</h2>

                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                        <br />
                        Let's get you back on track.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onReturnHome}
                            className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 uppercase tracking-wide"
                        >
                            Return to Home
                        </button>

                        <button
                            onClick={() => window.history.back()}
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg shadow-lg transition-all border border-white/30 uppercase tracking-wide"
                        >
                            Go Back
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/20">
                        <p className="text-slate-400 text-sm">
                            Need help? Contact support or visit our help center.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-slate-400 text-sm">
                    <p>Error Code: 404 | Page Not Found</p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
