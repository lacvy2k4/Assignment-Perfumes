import React from 'react';
import { useNavigate } from 'react-router-dom';

const Error: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-6 transition-colors duration-500">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="text-center z-10 w-full max-w-md">
                <h1 className="text-9xl text-white font-extrabold drop-shadow-sm">
                    404
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
                    Page Not Found
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Oops! The page you are looking for doesn't exist or has been moved.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default Error;