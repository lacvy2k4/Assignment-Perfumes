import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [YOB, setYOB] = useState('');
    const [gender, setGender] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Year of birth validation based on previous conversation requirements
        const yobNum = parseInt(YOB);
        const currentYear = new Date().getFullYear();
        if (yobNum < 1900 || yobNum > currentYear) {
            setError(`Year of Birth must be between 1900 and ${currentYear}`);
            return;
        }

        setLoading(true);

        try {
            const formData = {
                name,
                email,
                password,
                YOB: yobNum,
                gender: gender === 'true' // converting string to boolean
            };

            const res = await userApi.register(formData);
            if (res.data.status || res.status === 201) {
                toast.success('Registration successful! Welcome to StorePerfume.');
                window.dispatchEvent(new Event("auth-change"));
                navigate('/');
            } else {
                setError(res.data.message || 'Registration failed.');
                toast.error(res.data.message || 'Registration failed.');
            }
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || "An error occurred during login.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 pt-32 pb-12">
            <div className="w-full max-w-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl p-8 transition-all duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Join StorePerfume today
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md text-sm transition-all">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Year of Birth
                            </label>
                            <input
                                type="number"
                                value={YOB}
                                onChange={(e) => setYOB(e.target.value)}
                                placeholder="Year"
                                min="1900"
                                max={new Date().getFullYear()}
                                required
                                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Gender
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none"
                            >
                                <option value="" disabled>Select gender</option>
                                <option value="true">Male</option>
                                <option value="false">Female</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-all">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
