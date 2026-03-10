import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { perfumeApi, commentApi, userApi } from '../services/api';
import toast from 'react-hot-toast';

interface Comment {
    _id: string;
    rating: number;
    content: string;
    author: {
        _id: string;
        name: string;
    };
    createdAt?: string;
}

interface Perfume {
    _id: string;
    perfumeName: string;
    uri: string;
    price: number;
    concentration: string;
    description: string;
    ingredients: string;
    volume: number;
    targetAudience: string;
    comments: Comment[];
    brand: {
        _id: string;
        brandName: string;
    };
}

const PerfumeDetail: React.FC = () => {
    const { id, perfumeName } = useParams<{ id?: string, perfumeName?: string }>();
    const navigate = useNavigate();
    const [perfume, setPerfume] = useState<Perfume | null>(null);
    const [brandName, setBrandName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Comment states
    const [comments, setComments] = useState<Comment[]>([]);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [rating, setRating] = useState<number>(3);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Comment States
    const [editCommentId, setEditCommentId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState<number>(5);
    const [editCommentText, setEditCommentText] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Delete Comment States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dropdown States for comments
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchPerfumeDetail = async () => {
            try {
                if (!id && !perfumeName) return;
                setLoading(true);

                // Fetch current user
                try {
                    const userRes = await userApi.profile();
                    if (userRes.data?.status) {
                        setUser(userRes.data.data);
                    }
                } catch (e) {
                    console.log('User not logged in');
                }

                let res;
                if (perfumeName) {
                    res = await perfumeApi.getPerfumeByName(perfumeName);
                } else if (id) {
                    res = await perfumeApi.getPerfumeById(id);
                }

                if (res?.data && res.data.status) {
                    const data = res.data.data;
                    setPerfume(data);

                    if (data.brand && typeof data.brand === 'object' && data.brand.brandName) {
                        setBrandName(data.brand.brandName);
                    }

                    // Extract comments properly
                    if (data.comments && Array.isArray(data.comments)) {
                        setComments(data.comments);
                    }

                    // Extract member from root object if needed
                    // (if user is not fetched from userApi, we can use res.data.member)
                    if (res.data.member) {
                        setUser(res.data.member);
                    }
                }

            } catch (error) {
                console.error("Failed to fetch perfume details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfumeDetail();
        window.scrollTo(0, 0); // Scroll to top on load
    }, [id, perfumeName]);

    // Handle posting a new comment
    const handleCreateComment = async () => {
        if (!user) {
            toast.error('Please login to leave a review.');
            navigate('/login');
            return;
        }

        if (!commentText.trim()) {
            toast.error('Please enter your review text.');
            return;
        }

        if (!perfume?._id) return;

        try {
            setIsSubmitting(true);
            await commentApi.createComment(perfume._id, {
                rating,
                content: commentText
            });

            // Refresh list
            let refreshRes;
            if (perfumeName) {
                refreshRes = await perfumeApi.getPerfumeByName(perfumeName);
            } else if (id) {
                refreshRes = await perfumeApi.getPerfumeById(id);
            }

            if (refreshRes?.data && refreshRes.data.status) {
                const updatedPerfume = refreshRes.data.data;
                setPerfume(updatedPerfume);
                if (updatedPerfume.comments && Array.isArray(updatedPerfume.comments)) {
                    setComments(updatedPerfume.comments);
                }
            }

            // Close modal & reset
            setIsCommentModalOpen(false);
            setCommentText('');
            setRating(5);
            toast.success('Review submitted successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown && !(event.target as Element).closest('.comment-dropdown-container')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    const openEditModal = (comment: Comment) => {
        setActiveDropdown(null);
        setEditCommentId(comment._id);
        setEditRating(comment.rating);
        setEditCommentText(comment.content);
        // setIsEditModalOpen is removed because we edit inline
    };

    const handleCancelEdit = () => {
        setEditCommentId(null);
        setEditRating(3);
        setEditCommentText('');
    };

    const handleUpdateComment = async () => {
        if (!editCommentId || !editCommentText.trim()) {
            toast.error('Please enter your review text.');
            return;
        }

        try {
            setIsEditing(true);
            await commentApi.updateComment(editCommentId, {
                rating: editRating,
                content: editCommentText
            });

            // Update local state directly for faster UI reaction
            setComments(comments.map(c =>
                c._id === editCommentId ? { ...c, rating: editRating, content: editCommentText } : c
            ));

            setEditCommentId(null);
            toast.success('Review updated successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update review.');
        } finally {
            setIsEditing(false);
        }
    };

    const openDeleteModal = (commentId: string) => {
        setActiveDropdown(null);
        setCommentToDelete(commentId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteComment = async () => {
        if (!commentToDelete) return;

        try {
            setIsDeleting(true);
            await commentApi.deleteComment(commentToDelete);

            // Update local state directly
            setComments(comments.filter(c => c._id !== commentToDelete));

            setIsDeleteModalOpen(false);
            setCommentToDelete(null);
            toast.success('Review deleted successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete review.');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- HELPER: Xử lý Style Khung Detail Card dựa trên Concentration ---
    const getConcentrationDetailStyle = (concentration: string) => {
        const conc = concentration?.toLowerCase() || '';

        if (conc.includes('extrait') || conc.includes('parfum')) {
            return 'border-2 border-amber-400 dark:border-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.25)] dark:shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-900/30 dark:to-gray-800';
        }
        if (conc.includes('edp') || conc.includes('eau de parfum')) {
            return 'border-[1.5px] border-purple-300 dark:border-purple-600 shadow-xl bg-gradient-to-br from-purple-50/40 to-white dark:from-purple-900/20 dark:to-gray-800';
        }
        if (conc.includes('edt') || conc.includes('eau de toilette')) {
            return 'border-[1.5px] border-blue-300 dark:border-blue-600 shadow-xl bg-gradient-to-br from-blue-50/40 to-white dark:from-blue-900/20 dark:to-gray-800';
        }
        if (conc.includes('edc') || conc.includes('cologne')) {
            return 'border-[1.5px] border-emerald-300 dark:border-emerald-600 shadow-xl bg-gradient-to-br from-emerald-50/40 to-white dark:from-emerald-900/20 dark:to-gray-800';
        }

        return 'bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700';
    };

    // --- HELPER: Xử lý màu Text cho Concentration ---
    const getConcentrationTextStyle = (concentration: string) => {
        const conc = concentration?.toLowerCase() || '';
        if (conc.includes('extrait') || conc.includes('parfum')) return 'text-amber-600 dark:text-amber-400 font-bold';
        if (conc.includes('edp') || conc.includes('eau de parfum')) return 'text-purple-600 dark:text-purple-400 font-bold';
        if (conc.includes('edt') || conc.includes('eau de toilette')) return 'text-blue-600 dark:text-blue-400 font-bold';
        if (conc.includes('edc') || conc.includes('cologne')) return 'text-emerald-600 dark:text-emerald-400 font-bold';
        return 'text-gray-900 dark:text-gray-200 font-semibold';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!perfume) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 flex flex-col items-center justify-center text-gray-900 dark:text-gray-100">
                <h2 className="text-3xl font-bold mb-4">Perfume Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">The fragrance you are looking for doesn't exist or has been removed.</p>
                <Link to="/" className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-300">
                    Discover More
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 transition-colors duration-500 font-sans">
            <div className="max-w-6xl mx-auto px-6">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition duration-300 mb-8 font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to collection
                </button>

                {/* Main Card Container áp dụng dynamic style */}
                <div className={`rounded-[40px] overflow-hidden flex flex-col md:flex-row relative transition-all duration-500 ${getConcentrationDetailStyle(perfume.concentration)}`}>

                    {/* Artistic Background blobs for glass effect */}
                    <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-pink-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    {/* Left Column: Image Area */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-white/30 dark:bg-black/20 backdrop-blur-sm relative border-r border-white/20 dark:border-gray-700/50">
                        <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition duration-700">
                            <img
                                src={perfume.uri}
                                alt={perfume.perfumeName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop';
                                }}
                            />
                            {/* Glass overlay badge for Audience */}
                            <div className="absolute top-4 left-4 bg-white/40 dark:bg-black/50 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/30 text-xs font-bold tracking-wider uppercase text-gray-900 dark:text-white shadow-sm">
                                {perfume.targetAudience}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative z-10">

                        <div className="mb-2">
                            <span className="text-sm md:text-md uppercase tracking-[0.2em] font-bold text-indigo-600 dark:text-indigo-400">
                                {brandName || 'Exclusive Brand'}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
                            {perfume.perfumeName}
                        </h1>

                        <div className="flex items-end gap-3 mb-8">
                            <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
                                ${perfume.price}
                            </p>
                        </div>

                        <div className="space-y-6 flex-grow">
                            {/* About section */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">The Essence</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                    {perfume.description}
                                </p>
                            </div>

                            {/* Tags / Info badges */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Concentration</p>
                                    <p className={`text-lg ${getConcentrationTextStyle(perfume.concentration)}`}>
                                        {perfume.concentration}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-1">Volume</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-200">{perfume.volume}ml</p>
                                </div>
                            </div>

                            {/* Ingredients */}
                            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-3">Key Notes</p>
                                <div className="flex flex-wrap gap-2">
                                    {perfume.ingredients.split(',').map((ingredient, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 shadow-sm rounded-full text-sm font-medium text-gray-800 dark:text-gray-200 hover:scale-105 transition-transform cursor-default">
                                            {ingredient.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 bg-white dark:bg-gray-800 rounded-[40px] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 relative z-10">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                Customer Reviews
                                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-sm py-1 px-3 rounded-full font-bold">
                                    {comments.length}
                                </span>
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Discover what others think about this scent.</p>
                        </div>

                        {user?.isAdmin ? null : comments.some((c) => c.author?._id === user?._id) ? (
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-full font-semibold border border-emerald-100 dark:border-emerald-800 flex items-center gap-2 shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                You reviewed
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCommentModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                Write a Review
                            </button>
                        )}
                    </div>

                    {comments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No reviews yet</h3>
                            <p className="text-gray-500 dark:text-gray-400">Be the first to share your thoughts on this masterpiece.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {comments.map((comment) => (
                                <div key={comment._id} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100">{comment.author?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}</p>
                                            </div>
                                        </div>
                                        {/* Action Dropdown & Star Rating Display */}
                                        {editCommentId !== comment._id && (
                                            <div className="flex flex-col items-end gap-2">
                                                {(comment.author?._id === user?._id) && (
                                                    <div className="relative comment-dropdown-container">
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === comment._id ? null : comment._id)}
                                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                                        >
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            </svg>
                                                        </button>

                                                        {activeDropdown === comment._id && (
                                                            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 overflow-hidden transform origin-top-right">
                                                                {comment.author?._id === user?._id && (
                                                                    <button
                                                                        onClick={() => openEditModal(comment)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                                                                    >
                                                                        Edit Review
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => openDeleteModal(comment._id)}
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                                >
                                                                    Delete Review
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3].map((star) => (
                                                        <svg key={star} className={`w-4 h-4 ${star <= comment.rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {editCommentId === comment._id ? (
                                        <div className="mt-2 animate-in fade-in duration-200">
                                            {/* Inline Rating Input */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rating:</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setEditRating(star)}
                                                            className="focus:outline-none transform hover:scale-110 transition-transform"
                                                        >
                                                            <svg className={`w-6 h-6 ${star <= editRating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600 hover:text-amber-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <textarea
                                                rows={3}
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleUpdateComment();
                                                    }
                                                    if (e.key === "Escape") {
                                                        handleCancelEdit();
                                                    }
                                                }}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-400 text-gray-900 dark:text-white outline-none transition-all duration-300 resize-none mb-3 shadow-inner"
                                                placeholder="Edit your review..."
                                                autoFocus
                                            ></textarea>

                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdateComment}
                                                    disabled={isEditing || !editCommentText.trim() || (editCommentText === comment.content && editRating === comment.rating)}
                                                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-all flex items-center gap-2"
                                                >
                                                    {isEditing ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                            {comment.content}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comment Modal */}
                {isCommentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div
                            className="bg-white dark:bg-gray-800 rounded-[30px] shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden transform transition-all scale-100"
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setIsCommentModalOpen(false);
                            }}
                        >
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Write a Review</h3>
                                <button onClick={() => setIsCommentModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <div className="p-8">
                                {/* Rating Input */}
                                <div className="mb-6 flex flex-col items-center">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Your Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="focus:outline-none transform hover:scale-110 transition-transform"
                                            >
                                                <svg className={`w-10 h-10 ${star <= rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700 hover:text-amber-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Text Input */}
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Your Thoughts</label>
                                    <textarea
                                        rows={4}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleCreateComment();
                                            }
                                        }}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow resize-none"
                                        placeholder="What do you think about this fragrance?..."
                                    ></textarea>
                                </div>

                                <button
                                    onClick={handleCreateComment}
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="w-full py-4 text-white font-bold text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {isSubmitting ? 'Posting Review...' : 'Post Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirm Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Review?</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete this review? This action cannot be undone.</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteComment}
                                        disabled={isDeleting}
                                        className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-600/30 disabled:opacity-50 flex justify-center items-center"
                                    >
                                        {isDeleting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerfumeDetail;