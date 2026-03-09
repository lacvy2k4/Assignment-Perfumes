import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { brandApi } from '../services/api';
import toast from 'react-hot-toast';

interface PerfumeDetail {
    _id: string;
    perfumeName: string;
    uri: string;
    price: number;
    concentration: string;
    description: string;
    ingredients: string;
    volume: number;
    targetAudience: string;
    brand: {
        _id: string;
        brandName: string;
    } | string;
    brandName?: string;
    comments?: any[];
}

const AdminPerfumeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [perfume, setPerfume] = useState<PerfumeDetail | null>(null);
    const [brands, setBrands] = useState<{ _id: string, brandName: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
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

    useEffect(() => {
        const fetchPerfumeAndBrands = async () => {
            try {
                setLoading(true);
                const [perfumeRes, brandRes] = await Promise.all([
                    api.get(`/api/perfumes/${id}`),
                    brandApi.getAllBrands()
                ]);

                if (perfumeRes.data && perfumeRes.data.status) {
                    setPerfume(perfumeRes.data.data);
                } else {
                    setError('Failed to fetch perfume details.');
                }

                if (brandRes.data && brandRes.data.status) {
                    setBrands(brandRes.data.data);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || 'Error fetching perfume.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPerfumeAndBrands();
        }
    }, [id]);

    const triggerDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true);
            const res = await api.delete(`/api/perfumes/${id}`);
            if (res.data && res.data.status) {
                toast.success('Perfume deleted successfully.');
                setIsDeleteModalOpen(false);
                navigate(-1);
            } else {
                toast.error('Failed to delete perfume.');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error deleting perfume.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleEdit = () => {
        if (perfume) {
            setFormData({
                perfumeName: perfume.perfumeName,
                uri: perfume.uri,
                price: perfume.price.toString(),
                concentration: perfume.concentration,
                description: perfume.description,
                ingredients: perfume.ingredients,
                volume: perfume.volume.toString(),
                targetAudience: perfume.targetAudience,
                brand: perfume.brand ? (typeof perfume.brand === 'object' ? perfume.brand._id : perfume.brand) : ''
            });
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateSubmit = async () => {
        const { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand } = formData;

        if (!perfumeName.trim() || !uri.trim() || !price || !concentration.trim() || !description.trim() || !ingredients.trim() || !volume || !targetAudience.trim() || !brand) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setIsUpdating(true);
            const res = await api.put(`/api/perfumes/${id}`, {
                ...formData,
                price: Number(price),
                volume: Number(volume)
            });

            if (res.data && res.data.status) {
                toast.success('Perfume updated successfully!');
                const updatedPerfumeRes = await api.get(`/api/perfumes/${id}`);
                if (updatedPerfumeRes.data && updatedPerfumeRes.data.status) {
                    setPerfume(updatedPerfumeRes.data.data);
                }
                setIsEditing(false);
            } else {
                toast.error('Failed to update perfume.');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error updating perfume.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !perfume) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center">
                <p className="text-red-500 text-xl font-semibold">{error || 'Perfume not found'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const displayBrandStr = (perfume.brand && typeof perfume.brand === 'object' && perfume.brand.brandName) ? perfume.brand.brandName : (perfume.brandName || 'N/A');

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 mt-16 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to List
                    </button>
                    <div className="flex space-x-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-6 py-2 rounded-lg font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateSubmit}
                                    disabled={isUpdating}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleEdit}
                                    disabled={isDeleting}
                                    className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 border border-indigo-200 dark:border-indigo-800 px-6 py-2 rounded-lg font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={triggerDelete}
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </span>
                                    ) : 'Delete'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row">
                        {/* Left Side: Image */}
                        <div className="md:w-2/5 md:flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 p-8 flex justify-center items-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <img
                                src={perfume.uri}
                                alt={perfume.perfumeName}
                                className="w-full max-w-[280px] rounded-2xl object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 relative z-10"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600';
                                }}
                            />
                        </div>

                        {/* Right Side: Details */}
                        <div className="md:w-3/5 p-8 sm:p-12 flex flex-col justify-center">
                            {isEditing ? (
                                <div className="mb-4">
                                    <select
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer min-w-[200px]"
                                    >
                                        <option value="" className="bg-white dark:bg-gray-800">Select Brand</option>
                                        {brands.map((b: any) => (
                                            <option key={b._id} value={b._id} className="bg-white dark:bg-gray-800">{b.brandName}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest rounded-full mb-4 w-max">
                                    {displayBrandStr}
                                </div>
                            )}

                            {isEditing ? (
                                <input
                                    type="text"
                                    name="perfumeName"
                                    value={formData.perfumeName}
                                    onChange={handleInputChange}
                                    className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight bg-transparent border-b-2 border-indigo-500 focus:outline-none focus:border-indigo-600 w-full"
                                    placeholder="Perfume Name"
                                />
                            ) : (
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                    {perfume.perfumeName}
                                </h1>
                            )}

                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <div className="flex items-center">
                                    <span className="text-3xl text-white font-bold mr-1">$</span>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none w-24"
                                            placeholder="Price"
                                        />
                                    ) : (
                                        <span className="text-3xl font-bold text-white">
                                            {perfume.price}
                                        </span>
                                    )}
                                </div>
                                <span className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></span>
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="number"
                                                name="volume"
                                                value={formData.volume}
                                                onChange={handleInputChange}
                                                className="px-4 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-full border border-indigo-300 dark:border-indigo-600 focus:outline-none w-20"
                                                placeholder="Vol"
                                            />
                                            <input
                                                type="text"
                                                name="concentration"
                                                value={formData.concentration}
                                                onChange={handleInputChange}
                                                className="px-4 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-full border border-indigo-300 dark:border-indigo-600 focus:outline-none w-32"
                                                placeholder="Concentration"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <span className="px-4 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                                                {perfume.volume}ml
                                            </span>
                                            <span className="px-4 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                                                {perfume.concentration}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                    Description
                                </h3>
                                {isEditing ? (
                                    <textarea
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Description"
                                    />
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400 text-justify leading-relaxed">
                                        {perfume.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                                        Target Audience
                                    </h3>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="targetAudience"
                                            value={formData.targetAudience}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="Target Audience"
                                        />
                                    ) : (
                                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                                            {perfume.targetAudience}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                                        Ingredients
                                    </h3>
                                    {isEditing ? (
                                        <textarea
                                            name="ingredients"
                                            rows={2}
                                            value={formData.ingredients}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                            placeholder="Ingredients (comma separated)"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {(perfume.ingredients || '').split(',').map((ingredient, index) => {
                                                const trimmed = ingredient.trim();
                                                if (!trimmed) return null;
                                                return (
                                                    <span key={index} className="px-3 py-1 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm">
                                                        {trimmed}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                                        Image URL (URI)
                                    </h3>
                                    <input
                                        type="text"
                                        name="uri"
                                        value={formData.uri}
                                        onChange={handleInputChange}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>



            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-6 text-center">
                            <svg className="mx-auto mb-4 text-red-500 w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <h3 className="mb-5 text-lg font-bold text-gray-900 dark:text-gray-100">Are you sure you want to delete this perfume?</h3>
                            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">This action cannot be undone. All data related to this perfume will be permanently removed.</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : 'Yes, delete it'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPerfumeDetail;