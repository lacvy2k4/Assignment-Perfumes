import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { userApi } from '../services/api';

interface UserProfileData {
    _id: string;
    email: string;
    name: string;
    YOB: number;
    gender: boolean;
    isAdmin: boolean;
    updatedAt: string;
}

const defaultUserData: UserProfileData = {
    _id: "",
    email: "",
    name: "",
    YOB: 1990,
    gender: true,
    isAdmin: false,
    updatedAt: new Date().toISOString()
};

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfileData>(defaultUserData);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await userApi.profile();
                if (response.data) {
                    // Adapt to your backend's specific response structure if needed
                    const data = response.data.data || response.data;
                    setUser(data);
                    setFormData({
                        name: data.name || '',
                        YOB: data.YOB || 1990,
                        gender: data.gender ?? true
                    });
                }
            } catch (err) {
                const error = err as AxiosError<{ message: string }>;
                const message = error.response?.data?.message || "Failed to load profile.";
                setError(message);
                toast.error(message)
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Form state (used while editing)
    const [formData, setFormData] = useState<{ name: string, YOB: number, gender: boolean }>({
        name: user.name,
        YOB: user.YOB,
        gender: user.gender
    });

    // Handle Edit click
    const handleEdit = () => {
        setFormData({
            name: user.name,
            YOB: user.YOB,
            gender: user.gender
        });
        setIsEditing(true);
        setError('');
    };

    // Handle Cancel click
    const handleCancel = () => {
        setIsEditing(false);
        setError('');
    };

    // Handle Save click
    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            // Assuming required payload: { name, YOB, gender }
            const payload = {
                name: formData.name,
                YOB: formData.YOB,
                gender: String(formData.gender) // The backend expects a string "true" or "false"
            };

            const response = await userApi.editProfile(payload);

            // Assuming the backend returns the updated user inside response.data.data or response.data.user
            const updatedData = response.data?.data || response.data?.user || response.data;

            setUser({
                ...user,
                name: formData.name,
                YOB: formData.YOB,
                gender: formData.gender,
                updatedAt: updatedData?.updatedAt || new Date().toISOString()
            });
            setIsEditing(false);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || "Failed to save changes";
            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // Handle Password Change Inputs
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle Password Submit
    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }
        try {
            setPasswordSaving(true);
            await userApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setIsChangePasswordOpen(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const errorMsg = error.response?.data?.message || 'Failed to change password';
            setPasswordError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setPasswordSaving(false);
        }
    };

    // Handle Input Changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: string | number | boolean = value;
        if (type === 'number') {
            parsedValue = parseInt(value, 10) || 0;
        } else if (name === 'gender') {
            parsedValue = value === 'true'; // Convert 'true'/'false' string back to boolean
        }

        setFormData(prev => ({
            ...prev,
            [name]: parsedValue
        }));
    };

    // Render Avatar Placeholder Generator
    const getInitials = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 transition-colors duration-500 font-sans">
            <div className="max-w-5xl mx-auto px-6">

                {/* Header title */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
                    Account Profile
                </h1>

                {/* Main Card Container */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">

                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    {/* Layout flexbox: single column on mobile, row on tablet/desktop */}
                    <div className="flex flex-col md:flex-row relative z-10 w-full">

                        {/* ----------------- LEFT COLUMN (30%): Account Summary ----------------- */}
                        <div className="w-full md:w-[30%] bg-gray-50/50 dark:bg-gray-800/50 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center">

                            {/* Avatar */}
                            <div className="w-32 h-32 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-lg border-4 border-white dark:border-gray-800 mb-6">
                                {getInitials(user.name)}
                            </div>

                            {/* Name & Badge */}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                                {user.name}
                            </h2>

                            <div className="mb-6">
                                {user.isAdmin ? (
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-sm">
                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                        Admin
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                        Member
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ----------------- RIGHT COLUMN (70%): User Details ----------------- */}
                        <div className="w-full md:w-[70%] p-8 md:p-10 relative">

                            {/* Section Header & Action Buttons */}
                            <div className="flex flex-wrap gap-4 justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">Profile Details</h3>

                                <div className="flex gap-3">
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPasswordError('');
                                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                setIsChangePasswordOpen(true);
                                            }}
                                            className="px-6 py-2.5 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            Change Password
                                        </button>
                                    )}
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleCancel}
                                                className="px-6 py-2.5 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="px-6 py-2.5 text-sm font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition duration-300 flex items-center gap-2"
                                            >
                                                {saving && (
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                )}
                                                {saving ? 'Saving...' : 'Save Settings'}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleEdit}
                                            className="px-6 py-2.5 text-sm font-semibold rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Details Grid Form */}
                            <form className="space-y-6"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSave(); // hàm save profile của bạn
                                    }
                                    if (e.key === "Escape") {
                                        e.preventDefault();
                                        handleCancel(); // hàm cancel edit
                                    }
                                }}>
                                {/* Row 1: Readonly ID & Email */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium outline-none"
                                    />
                                </div>

                                {/* Row 2: Editable Name */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-500/50 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-gray-900 dark:text-white outline-none transition-all duration-300 font-semibold shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold flex items-center min-h-13">
                                            {user.name}
                                        </div>
                                    )}
                                </div>

                                {/* Row 3: Editable YOB & Gender */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Year of Birth */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Year of Birth</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                name="YOB"
                                                value={formData.YOB}
                                                onChange={handleChange}
                                                required
                                                min="1900"
                                                max={new Date().getFullYear()}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-500/50 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-gray-900 dark:text-white outline-none transition-all duration-300 font-semibold shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold flex items-center min-h-13">
                                                {user.YOB}
                                            </div>
                                        )}
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Gender</label>
                                        {isEditing ? (
                                            <div className="flex gap-6 h-13 items-center px-2">
                                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="true"
                                                        checked={formData.gender === true}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 transition-all"
                                                    />
                                                    <span className="text-gray-900 dark:text-gray-200 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Male</span>
                                                </label>
                                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="false"
                                                        checked={formData.gender === false}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 transition-all"
                                                    />
                                                    <span className="text-gray-900 dark:text-gray-200 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Female</span>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold flex items-center gap-2 min-h-13">
                                                {user.gender ? (
                                                    <>
                                                        <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#2b7fff" d="M320 32c0-17.7 14.3-32 32-32L480 0c17.7 0 32 14.3 32 32l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-50.7-95 95c19.5 28.4 31 62.7 31 99.8 0 97.2-78.8 176-176 176S32 401.2 32 304 110.8 128 208 128c37 0 71.4 11.4 99.8 31l95-95-50.7 0c-17.7 0-32-14.3-32-32zM208 416a112 112 0 1 0 0-224 112 112 0 1 0 0 224z" /></svg>
                                                        Male
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 text-pink-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#f7359b" d="M80 176a112 112 0 1 1 224 0 112 112 0 1 1 -224 0zM223.9 349.1C305.9 334.1 368 262.3 368 176 368 78.8 289.2 0 192 0S16 78.8 16 176c0 86.3 62.1 158.1 144.1 173.1-.1 1-.1 1.9-.1 2.9l0 64-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-64c0-1 0-1.9-.1-2.9z" /></svg>
                                                        Female
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h3>
                            <button
                                onClick={() => setIsChangePasswordOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleChangePasswordSubmit(e);
                            }
                            if (e.key === "Escape") {
                                e.preventDefault();
                                setIsChangePasswordOpen(false);
                            }
                        }} onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
                            {passwordError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md text-sm">
                                    {passwordError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordSaving}
                                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition flex items-center"
                                >
                                    {passwordSaving ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
