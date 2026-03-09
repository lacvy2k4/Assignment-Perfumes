import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { brandApi } from '../services/api';
import toast from 'react-hot-toast';
import type { BrandData } from './Brand';
import type { AxiosError } from 'axios';

const BrandDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [brand, setBrand] = useState<BrandData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Edit state
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editName, setEditName] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchBrand = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await brandApi.getBrandById(id);
                // Based on backend returning `brand` object containing brand data
                const data: BrandData = response.data?.brand || response.data?.data || response.data;
                setBrand(data);
                setEditName(data.brandName || '');
                setError(null);
            } catch (err) {
                const error = err as AxiosError<{ message: string }>;
                const message = error.response?.data?.message || 'Failed to fetch brand details';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchBrand();
    }, [id]);

    const handleEditSave = async () => {
        if (!id || !editName?.trim()) return;

        try {
            setIsSaving(true);
            const response = await brandApi.updateBrand(id, { brandName: editName.trim() });
            const updatedData = response.data?.brand || response.data?.data || response.data;
            setBrand({
                ...brand!,
                brandName: updatedData.brandName || editName.trim(),
                updatedAt: updatedData.updatedAt || new Date().toISOString()
            });
            toast.success('Brand updated successfully!');
            setIsEditing(false);
            setError(null);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || 'Failed to update brand';
            setError(message);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!id) return;

        try {
            setIsDeleting(true);
            await brandApi.deleteBrand(id);
            toast.success('Brand deleted successfully!');
            navigate('/brands');
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || 'Failed to delete brand';
            setError(message);
            toast.error(message);
            setIsDeleting(false); // only toggle off if error, if success we navigate away
            setIsDeleteModalOpen(false);
        }
    };

    // Format Date string helper
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!brand && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Brand Not Found</h2>
                <button onClick={() => navigate('/brands')} className="text-indigo-600 hover:underline">
                    &larr; Return to Brands List
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 transition-colors duration-500 font-sans">
            <div className="max-w-4xl mx-auto px-6">

                {/* Back Link */}
                <button
                    onClick={() => navigate('/brands')}
                    className="mb-6 flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Brands
                </button>

                {/* Main Card Container */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative p-8 md:p-12">

                    {/* Decorative Blob */}
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10">

                        {/* Header & Actions */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-700 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate max-w-lg mb-2">
                                    {isEditing ? 'Editing Brand' : 'Brand Details'}
                                </h1>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">
                                    ID: {brand?._id}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => { setIsEditing(false); setEditName(brand?.brandName || ''); setError(''); }}
                                            className="px-5 py-2.5 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleEditSave}
                                            disabled={isSaving || !editName?.trim() || editName === brand?.brandName}
                                            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg transition flex items-center gap-2"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-md flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="px-5 py-2.5 text-sm font-semibold rounded-full text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition flex items-center gap-2"
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md font-medium text-sm">
                                {error}
                            </div>
                        )}

                        {/* Detailed Properties Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Brand Name */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Brand Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleEditSave();
                                            }
                                            if (e.key === "Escape") {
                                                setIsEditing(false);
                                                setEditName(brand?.brandName || "");
                                            }
                                        }}
                                        className="w-full px-5 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-500/50 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-gray-900 dark:text-white outline-none transition-all duration-300 font-bold text-xl shadow-sm"
                                        placeholder="Enter brand name"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold text-xl min-h-16 wrap-break-word">
                                        {brand?.brandName}
                                    </div>
                                )}
                            </div>

                            {/* Creation Date */}
                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Created At</label>
                                <div className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium">
                                    {formatDate(brand?.createdAt)}
                                </div>
                            </div>

                            {/* Updated Date */}
                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Last Updated</label>
                                <div className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium">
                                    {formatDate(brand?.updatedAt)}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Delete Confirmation Modal Overlay */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-sm overflow-hidden transform transition-all scale-100">
                            <div className="px-6 py-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Brand?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to delete <strong className="text-gray-700 dark:text-gray-300">"{brand?.brandName}"</strong>? This action cannot be undone.
                                </p>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-center gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex justify-center items-center w-full"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default BrandDetail;