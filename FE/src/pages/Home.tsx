import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { brandApi } from '../services/api';

interface Brand {
    _id: string;
    brandName: string;
}

interface Perfume {
    _id: string;
    brandName: string;
    perfumeName: string;
    targetAudience: string;
    uri: string;
    price: number;
    concentration: string;
}

const Home: React.FC = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [brands, setBrands] = useState<Brand[]>([]);
    const [perfumes, setPerfumes] = useState<Perfume[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 16;

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        fetchPerfumes();
        // Reset current page when search or filter change
        setCurrentPage(1);
    }, [search, filter]);

    const fetchBrands = async () => {
        try {
            const res = await brandApi.getAllBrands();
            if (res.data.status) {
                setBrands(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch brands", error);
        }
    };

    const fetchPerfumes = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (filter) query.append('brand', filter);

            const res = await api.get(`/api/perfumes?${query.toString()}`);
            if (res.data && res.data.status) {
                setPerfumes(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch perfumes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPerfumes();
    };

    // Calculate pagination frontend-side for now since backend returns all matches
    const totalPages = Math.ceil(perfumes.length / limit) || 1;
    const paginatedPerfumes = perfumes.slice((currentPage - 1) * limit, currentPage * limit);

    // --- HELPER: Xử lý Style Card dựa trên Concentration ---
    const getConcentrationCardStyle = (concentration: string) => {
        const conc = concentration?.toLowerCase() || '';

        // 1. Oustanding Design cho Extrait (Màu Vàng Amber, có Glow Shadow)
        if (conc.includes('extrait') || conc.includes('parfum')) {
            return 'border-2 border-amber-400 dark:border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)] dark:shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-gradient-to-b from-amber-50/40 to-white dark:from-amber-900/20 dark:to-gray-800 scale-[1.02] z-10';
        }
        // 2. Màu Tím cho EDP
        if (conc.includes('edp') || conc.includes('eau de parfum')) {
            return 'border-[1.5px] border-purple-300 dark:border-purple-600 bg-purple-50/10 dark:bg-purple-900/10 bg-white dark:bg-gray-800';
        }
        // 3. Màu Xanh Dương cho EDT
        if (conc.includes('edt') || conc.includes('eau de toilette')) {
            return 'border-[1.5px] border-blue-300 dark:border-blue-600 bg-blue-50/10 dark:bg-blue-900/10 bg-white dark:bg-gray-800';
        }
        // 4. Màu Xanh Lá cho EDC hoặc các loại khác
        if (conc.includes('edc') || conc.includes('cologne')) {
            return 'border-[1.5px] border-emerald-300 dark:border-emerald-600 bg-emerald-50/10 dark:bg-emerald-900/10 bg-white dark:bg-gray-800';
        }

        // Mặc định
        return 'border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800';
    };

    // --- HELPER: Xử lý màu sắc cho Badge Nồng độ ---
    const getConcentrationBadgeStyle = (concentration: string) => {
        const conc = concentration?.toLowerCase() || '';
        if (conc.includes('extrait') || conc.includes('parfum')) return 'bg-amber-500 text-white shadow-amber-500/50';
        if (conc.includes('edp') || conc.includes('eau de parfum')) return 'bg-purple-500 text-white shadow-purple-500/50';
        if (conc.includes('edt') || conc.includes('eau de toilette')) return 'bg-blue-500 text-white shadow-blue-500/50';
        if (conc.includes('edc') || conc.includes('cologne')) return 'bg-emerald-500 text-white shadow-emerald-500/50';
        return 'bg-gray-600 text-white';
    };

    return (
        <div className={`min-h-screen antialiased relative overflow-x-hidden transition-colors duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
            {/* Main Content */}
            <main className="pt-32 px-6 max-w-5xl mx-auto flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-center relative z-50">
                    {/* Search Input */}
                    <form className="relative w-full" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search for favorite perfume..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-6 pr-14 py-3 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-sm rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
                        />
                        <button type="submit" className="absolute inset-y-0 right-0 pr-5 pl-2 flex items-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>

                    {/* Filter Dropdown */}
                    <div className="relative shrink-0">
                        {/* Dropdown code giữ nguyên... */}
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-sm rounded-full text-gray-900 dark:text-gray-100 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all duration-300"
                        >
                            <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            <span className="font-medium whitespace-nowrap">
                                {filter || 'All Brands'}
                            </span>
                        </button>

                        {isFilterOpen && (
                            <ul className="absolute right-0 top-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl z-50 w-52 p-2 shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto flex flex-col gap-1 font-medium">
                                <li>
                                    <button onClick={() => { setFilter(''); setIsFilterOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors">
                                        All Brands
                                    </button>
                                </li>
                                {brands.map((brand) => (
                                    <li key={brand._id}>
                                        <button
                                            onClick={() => { setFilter(brand.brandName); setIsFilterOpen(false); }}
                                            className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                                        >
                                            {brand.brandName}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Perfumes Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 mt-16 w-full">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : perfumes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 mt-16 text-gray-500 dark:text-gray-400">
                        <svg className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-xl font-medium">No perfumes found</p>
                        <p className="text-sm mt-2">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-16 pb-16">
                        {paginatedPerfumes.map((perfume) => (
                            <Link
                                to={`/perfumes/name/${perfume.perfumeName}`}
                                key={perfume._id}
                                /* Apply hàm helper getConcentrationCardStyle vào className */
                                className={`rounded-2xl hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col group/card ${getConcentrationCardStyle(perfume.concentration)}`}
                            >
                                <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                    <img
                                        src={perfume.uri}
                                        alt={perfume.perfumeName}
                                        loading="lazy"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop';
                                        }}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                    />
                                    {/* Badge Nồng độ (Bên Trái) */}
                                    <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm bg-opacity-90 border border-white/20 ${getConcentrationBadgeStyle(perfume.concentration)}`}>
                                        {perfume.concentration || 'N/A'}
                                    </span>

                                    {/* Badge Target Audience (Bên Phải) */}
                                    <span className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow-md">
                                        {perfume.targetAudience}
                                    </span>
                                </div>
                                <div className="p-5 flex flex-col items-center text-center grow relative z-10">
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2 font-semibold">
                                        {perfume.brandName}
                                    </p>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                                        {perfume.perfumeName}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        ${perfume.price}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 pb-16">
                        <div className="flex bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className={`px-4 py-2 font-medium transition-colors ${currentPage > 1 ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'}`}
                                disabled={currentPage <= 1}
                            >
                                «
                            </button>

                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-4 py-2 font-medium border-l border-gray-200 dark:border-gray-700 transition-colors ${i + 1 === currentPage
                                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className={`px-4 py-2 font-medium border-l border-gray-200 dark:border-gray-700 transition-colors ${currentPage < totalPages ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'}`}
                                disabled={currentPage >= totalPages}
                            >
                                »
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;