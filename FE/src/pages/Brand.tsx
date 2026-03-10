import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandApi } from '../services/api';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export interface BrandData {
    _id: string; // The backend uses _id for MongoDB documents
    brandName: string;
    createdAt?: string;
    updatedAt?: string;
}

const Brand: React.FC = () => {
    const [brands, setBrands] = useState<BrandData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [newBrandInput, setNewBrandInput] = useState<string>('');
    const navigate = useNavigate();

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await brandApi.getAllBrands();
            const data = response.data?.data || response.data;
            setBrands(data || []);
            setError(null);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || 'Failed to fetch brands';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const filteredBrands = brands.filter(brand =>
        brand.brandName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateBrandSubmit = async () => {
        if (!newBrandInput.trim()) return;

        try {
            setIsCreating(true);
            await brandApi.createBrand({ brandName: newBrandInput.trim() });
            await fetchBrands(); // Refresh list
            toast.success('Brand created successfully!');
            setIsCreateModalOpen(false); // Close Modal
            setNewBrandInput(''); // Reset Input
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || 'Failed to create brand'
            toast.error(message);
        } finally {
            setIsCreating(false);
        }
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
            <div className="max-w-6xl mx-auto px-6">

                {/* Header Title */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
                    Brand Management
                </h1>

                {/* Main Card Container */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">

                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="relative z-10 w-full p-8 md:p-10">

                        {/* Summary & Create Button Row */}
                        <div className="flex flex-wrap gap-4 items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    Brands List
                                    <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                                        Total: {filteredBrands.length}
                                    </span>
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view all registered brands.</p>
                            </div>

                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                disabled={isCreating}
                                className="px-6 py-2.5 text-sm font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition duration-300 flex items-center gap-2"
                            >
                                {isCreating ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                )}
                                Create Brand
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search by brand name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-shadow"
                            />
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-md font-medium text-sm">
                                {error}
                            </div>
                        )}

                        {/* List/Table content */}
                        {filteredBrands.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                <p className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">{searchQuery ? 'No brands match your search' : 'No brands found'}</p>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{searchQuery ? 'Try adjusting your search terms.' : 'There are currently no brands registered in the system. Click "Create Brand" to add one.'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24">
                                                No.
                                            </th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Brand Name
                                            </th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right w-32">
                                                Created At
                                            </th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right w-32">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                                        {filteredBrands.map((brand, index) => (
                                            <tr
                                                key={brand._id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                                            >
                                                {/* Index Number */}
                                                <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                                                    {index + 1}
                                                </td>
                                                {/* Brand Name (Handling Text Overflow) */}
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-50 md:max-w-md lg:max-w-xl">
                                                        {brand.brandName}
                                                    </div>
                                                </td>
                                                {/* Created At */}
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors text-right">
                                                        {new Date(brand.createdAt || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </td>
                                                {/* Actions */}
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => navigate(`/brands/${brand._id}`)}
                                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                </div>

                {/* Create Modal Overlay */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden transform transition-all scale-100">
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Brand</h3>
                            </div>
                            <div className="px-6 py-6">
                                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Brand Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="brandName"
                                    type="text"
                                    value={newBrandInput}
                                    onChange={(e) => setNewBrandInput(e.target.value)}
                                    placeholder="e.g. Chanel, Dior..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-shadow"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateBrandSubmit();
                                        if (e.key === 'Escape') {
                                            setIsCreateModalOpen(false);
                                            setNewBrandInput('');
                                        }
                                    }}
                                />
                            </div>
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                                <button
                                    onClick={() => { setIsCreateModalOpen(false); setNewBrandInput(''); }}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateBrandSubmit}
                                    disabled={isCreating || !newBrandInput.trim()}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex justify-center items-center min-w-25"
                                >
                                    {isCreating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Brand;