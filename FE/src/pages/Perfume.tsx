import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { perfumeApi, brandApi } from '../services/api';
import type { AxiosError } from 'axios';

export interface BrandData {
    _id: string;
    brandName: string;
}

export interface PerfumeData {
    _id: string;
    perfumeName: string;
    brand: BrandData | string; // backend might return populated or just id
    price: number;
    concentration: string;
    volume: number;
    targetAudience: string;
    uri: string;
    createdAt?: string;
    updatedAt?: string;
}

const Perfume: React.FC = () => {
    const [perfumes, setPerfumes] = useState<PerfumeData[]>([]);
    const [brands, setBrands] = useState<BrandData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        perfumeName: '',
        uri: '',
        price: '',
        concentration: '',
        description: '',
        ingredients: '',
        volume: '',
        targetAudience: '',
        brand: ''
    });

    const navigate = useNavigate();

    const fetchPerfumesAndBrands = async () => {
        try {
            setLoading(true);
            const [perfumesRes, brandsRes] = await Promise.all([
                perfumeApi.getAllPerfumes(),
                brandApi.getAllBrands()
            ]);

            const perfumesData = perfumesRes.data?.data || perfumesRes.data?.perfumes || [];
            const brandsData = brandsRes.data?.data || brandsRes.data?.brands || [];

            setPerfumes(perfumesData);
            setBrands(brandsData);
            setError(null);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || 'Failed to resync data.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerfumesAndBrands();
    }, []);

    const filteredPerfumes = perfumes.filter(perfume => {
        const perfumeName = perfume.perfumeName.toLowerCase();
        const brandName = (perfume.brand as BrandData)?.brandName?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return perfumeName.includes(query) || brandName.includes(query);
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSubmit = async () => {
        const { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand } = formData;

        if (!perfumeName.trim() || !uri.trim() || !price || !concentration.trim() || !description.trim() || !ingredients.trim() || !volume || !targetAudience.trim() || !brand) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setIsCreating(true);
            await perfumeApi.createPerfume({
                ...formData,
                price: Number(price),
                volume: Number(volume)
            });
            await fetchPerfumesAndBrands(); // Refresh list
            setIsCreateModalOpen(false); // Close Modal
            setFormData({
                perfumeName: '', uri: '', price: '', concentration: '', description: '', ingredients: '', volume: '', targetAudience: '', brand: ''
            });
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || 'Failed to create perfume';
            alert(message);
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
                    Perfumes Management
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
                                    Perfumes List
                                    <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                                        Total: {filteredPerfumes.length}
                                    </span>
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view all registered perfumes.</p>
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
                                Create Perfume
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search by perfume name or brand..."
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
                        {filteredPerfumes.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                <p className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">{searchQuery ? 'No perfumes match your search' : 'No perfumes found'}</p>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{searchQuery ? 'Try adjusting your search terms.' : 'There are currently no perfumes registered in the system. Click "Create Perfume" to add one.'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Perfume Name
                                            </th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Brand
                                            </th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Price
                                            </th>
                                            <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right w-32">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700/60">
                                        {filteredPerfumes.map((perfume) => (
                                            <tr
                                                key={perfume._id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                                            >
                                                {/* Name */}
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-50 md:max-w-62.5 lg:max-w-xs">
                                                        {perfume.perfumeName}
                                                    </div>
                                                </td>
                                                {/* Brand */}
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                                                        {(perfume.brand as BrandData)?.brandName || 'Unknown'}
                                                    </span>
                                                </td>
                                                {/* Price */}
                                                <td className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    ${perfume.price}
                                                </td>
                                                {/* Actions */}
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => navigate(`/perfumes/${perfume._id}`)}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all scale-100">

                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Perfume</h3>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="px-6 py-6 overflow-y-auto grow space-y-5 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Perfume Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="perfumeName" value={formData.perfumeName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Enter perfume name" />
                                    </div>
                                    {/* URI */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Image URL (URI) <span className="text-red-500">*</span></label>
                                        <input type="text" name="uri" value={formData.uri} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="https://..." />
                                    </div>
                                    {/* Brand */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Brand <span className="text-red-500">*</span></label>
                                        <select name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none">
                                            <option value="">Select a brand</option>
                                            {brands.map(b => (
                                                <option key={b._id} value={b._id}>{b.brandName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price ($) <span className="text-red-500">*</span></label>
                                        <input type="number" name="price" min="0" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="0.00" />
                                    </div>
                                    {/* Volume */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Volume (ml) <span className="text-red-500">*</span></label>
                                        <input type="number" name="volume" min="0" value={formData.volume} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="100" />
                                    </div>
                                    {/* Audience */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target Audience <span className="text-red-500">*</span></label>
                                        <input type="text" name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Unisex, Male, Female..." />
                                    </div>
                                    {/* Concentration */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Concentration <span className="text-red-500">*</span></label>
                                        <input type="text" name="concentration" value={formData.concentration} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Eau de Parfum, Extrait..." />
                                    </div>
                                    {/* Description */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500">*</span></label>
                                        <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Perfume description..."></textarea>
                                    </div>
                                    {/* Ingredients */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ingredients <span className="text-red-500">*</span></label>
                                        <textarea name="ingredients" rows={2} value={formData.ingredients} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" placeholder="Alcohol, Water, Fragrance..."></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                                <button
                                    onClick={() => { setIsCreateModalOpen(false); }}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateSubmit}
                                    disabled={isCreating}
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

export default Perfume;