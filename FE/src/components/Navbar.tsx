import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

interface User {
    name: string;
    isAdmin: boolean;
}

const Navbar: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await userApi.profile();

                if (res.data && res.data.status) {
                    setUser(res.data.data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            }
        };

        loadUser();

        window.addEventListener("auth-change", loadUser);
        return () => window.removeEventListener("auth-change", loadUser);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await userApi.logout();
            window.dispatchEvent(new Event("auth-change"));
            setIsDropdownOpen(false);
            toast.success("Logout successfully!");
            navigate('/');
        } catch (error) {
            console.error("Logout error", error);
            // Even if API fails, clear client side state
            window.dispatchEvent(new Event("auth-change"));
            setIsDropdownOpen(false);
            toast.success("Logout successfully!");
            navigate('/');
        }
    };

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[849px] max-w-[95%] h-[80px] z-50 rounded-[40px] bg-white/40 dark:bg-gray-800/40 backdrop-blur-[2px] border border-white/40 dark:border-gray-700/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all duration-500 flex items-center px-8 z-100">
            <div className="flex justify-between items-center w-full relative z-10">
                {/* Brand */}
                <div className="relative text-2xl font-extrabold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    <Link to="/">StorePerfume</Link>
                </div>

                {/* Center - Admin Links */}
                {user?.isAdmin && (
                    <ul className="hidden md:flex items-center gap-6 font-semibold text-gray-700 dark:text-gray-300">
                        <li><Link to="/perfumes" className="relative group hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Perfumes<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span></Link></li>
                        <li><Link to="/brands" className="relative group hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Brands<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span></Link></li>
                        <li><Link to="/collectors" className="relative group hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Collectors<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span></Link></li>
                    </ul>
                )}

                {/* Right Actions */}
                <ul className="flex items-center gap-6 font-semibold">
                    {user ? (
                        <li className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 focus:outline-none"
                            >
                                Welcome, <span className="font-bold">{user.name}</span>
                                <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-4 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 overflow-hidden transform opacity-100 scale-100 transition-all duration-300 origin-top-right">
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                            <path fill="currentColor" fillRule="evenodd" d="M12 4a8 8 0 0 0-6.96 11.947A4.99 4.99 0 0 1 9 14h6a4.99 4.99 0 0 1 3.96 1.947A8 8 0 0 0 12 4Zm7.943 14.076A9.959 9.959 0 0 0 22 12c0-5.523-4.477-10-10-10S2 6.477 2 12a9.958 9.958 0 0 0 2.057 6.076l-.005.018l.355.413A9.98 9.98 0 0 0 12 22a9.947 9.947 0 0 0 5.675-1.765a10.055 10.055 0 0 0 1.918-1.728l.355-.413l-.005-.018ZM12 6a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z" clipRule="evenodd"></path>
                                        </svg>
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.023 5.5a9 9 0 1 0 9.953 0M12 2v8" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </li>
                    ) : (
                        <>
                            <li>
                                <Link
                                    to="/login"
                                    className="relative group text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
                                >
                                    Login
                                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="px-6 py-2 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    Register
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
