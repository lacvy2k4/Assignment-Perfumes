import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { userApi } from '../services/api';

interface User {
    _id: string;
    email: string;
    name: string;
    YOB: number;
    gender: boolean;
    isAdmin: boolean;
}

const Collector: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const response = await userApi.getMembers();
                const membersData = response.data?.members || response.data?.data || response.data;
                setUsers(membersData || []);
                setError(null);
            } catch (err) {
                const error = err as AxiosError<{ message: string }>;
                const message = error.response?.data?.message || 'Failed to fetch collectors';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 transition-colors duration-500 font-sans">
            <div className="max-w-6xl mx-auto px-6">

                {/* Header Area */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Collectors Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                            Manage user profiles, permissions, and details efficiently.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md font-medium text-sm">
                        {error}
                    </div>
                )}

                {/* Main Table Container with Glassmorphism / Shadow */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">

                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    {users.length === 0 && !error ? (
                        <div className="relative z-10 w-full p-16 text-center">
                            <p className="text-xl font-bold text-gray-600 dark:text-gray-300">No collectors found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto relative z-10 w-full">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collector Info</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year of Birth</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gender</th>
                                        <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {users.map((user) => (
                                        <tr
                                            key={user._id || user.email}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 group"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 py-1 px-3 rounded-md">
                                                    {user.YOB}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    {user.gender ? (
                                                        <span className="flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                            <svg className="w-4 h-4 text-blue-500 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#2b7fff" d="M320 32c0-17.7 14.3-32 32-32L480 0c17.7 0 32 14.3 32 32l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-50.7-95 95c19.5 28.4 31 62.7 31 99.8 0 97.2-78.8 176-176 176S32 401.2 32 304 110.8 128 208 128c37 0 71.4 11.4 99.8 31l95-95-50.7 0c-17.7 0-32-14.3-32-32zM208 416a112 112 0 1 0 0-224 112 112 0 1 0 0 224z" /></svg>
                                                            Male
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center text-sm font-semibold text-pink-600 dark:text-pink-400">
                                                            <svg className="w-4 h-4 text-pink-500 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#f7359b" d="M80 176a112 112 0 1 1 224 0 112 112 0 1 1 -224 0zM223.9 349.1C305.9 334.1 368 262.3 368 176 368 78.8 289.2 0 192 0S16 78.8 16 176c0 86.3 62.1 158.1 144.1 173.1-.1 1-.1 1.9-.1 2.9l0 64-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-64c0-1 0-1.9-.1-2.9z" /></svg>
                                                            Female
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {user.isAdmin ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                                        Member
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination / Footer Info */}
                <div className="mt-6 flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
                    <p>Showing {users.length} results</p>
                </div>

            </div>
        </div>
    );
};

export default Collector;