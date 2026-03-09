import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-white/40 dark:border-gray-700/50 shadow-[0_-8px_32px_0_rgba(31,38,135,0.05)] mt-auto transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 py-8 md:flex md:items-center md:justify-center">

                {/* Brand / CopyRight */}
                <div className="flex justify-center md:justify-center mb-6 md:mb-0">
                    <Link to="/" className="text-xl font-extrabold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        StorePerfume
                    </Link>
                    <span className="ml-4 text-gray-500 dark:text-gray-400 text-sm flex items-center">
                        © {new Date().getFullYear()} All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
