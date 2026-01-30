import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Store,
    Search,
    Edit2,
    Trash2,
    Power,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Eye,
    RefreshCw,
    MapPin,
    ExternalLink,
    Plus,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import RestaurantModal from './components/RestaurantModal';
import MobilePreviewModal from '../../components/common/MobilePreviewModal';
import dayjs from 'dayjs';

const AdminRestaurants = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [publishedFilter, setPublishedFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [previewRestaurant, setPreviewRestaurant] = useState(null);

    const fetchRestaurants = useCallback(async (showRefresh = false) => {
        if (showRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const response = await adminApi.getRestaurants({
                page: pagination.page,
                limit: pagination.limit,
                search,
                status: statusFilter,
                published: publishedFilter,
            });
            setRestaurants(response.data.restaurants);
            setPagination(prev => ({
                ...prev,
                ...response.data.pagination,
            }));
        } catch (error) {
            toast.error('Failed to load restaurants');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter, publishedFilter]);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleEditRestaurant = (restaurant) => {
        navigate(`/admin/restaurants/${restaurant._id}/edit`);
    };

    const handleViewRestaurant = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setModalMode('view');
        setShowModal(true);
    };

    const handleToggleStatus = async (restaurantId) => {
        try {
            const response = await adminApi.toggleRestaurantStatus(restaurantId);
            toast.success(response.message);
            fetchRestaurants(true);
        } catch (error) {
            toast.error(error.message || 'Failed to toggle status');
        }
    };

    const handleDeleteRestaurant = async (restaurantId) => {
        try {
            await adminApi.deleteRestaurant(restaurantId);
            toast.success('Restaurant deleted successfully');
            setDeleteConfirm(null);
            fetchRestaurants(true);
        } catch (error) {
            toast.error(error.message || 'Failed to delete restaurant');
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedRestaurant(null);
    };

    const handleModalSuccess = () => {
        handleModalClose();
        fetchRestaurants(true);
    };

    const getImageUrl = (imageObj) => {
        if (!imageObj) return null;
        if (typeof imageObj === 'string') return imageObj;
        return imageObj.url || null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Store className="w-5 h-5 text-white" />
                        </div>
                        Restaurant Management
                    </h1>
                    <p className="text-gray-400 mt-1">View and manage all restaurants in the system</p>
                </div>
                <button
                    onClick={() => navigate('/admin/restaurants/new')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Restaurant
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, slug, or city..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </form>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchRestaurants(true)}
                            disabled={refreshing}
                            className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-gray-400 hover:text-white hover:border-slate-600 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${showFilters || statusFilter || publishedFilter
                                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                                : 'bg-slate-900 border-slate-700 text-gray-400 hover:text-white'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Filter Options */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-700">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Published</label>
                                    <select
                                        value={publishedFilter}
                                        onChange={(e) => {
                                            setPublishedFilter(e.target.value);
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">All</option>
                                        <option value="published">Published</option>
                                        <option value="unpublished">Unpublished</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            setStatusFilter('');
                                            setPublishedFilter('');
                                            setSearch('');
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Restaurants Table */}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-900">
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Restaurant</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Owner</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Published</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : restaurants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No restaurants found
                                    </td>
                                </tr>
                            ) : (
                                restaurants.map((restaurant) => (
                                    <tr key={restaurant._id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {getImageUrl(restaurant.logo) ? (
                                                    <img
                                                        src={getImageUrl(restaurant.logo)}
                                                        alt={restaurant.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                                                        {restaurant.name?.[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-white font-medium">{restaurant.name}</p>
                                                    <p className="text-sm text-gray-400">/{restaurant.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div>
                                                <p className="text-white text-sm">
                                                    {restaurant.owner?.firstName} {restaurant.owner?.lastName}
                                                </p>
                                                <p className="text-gray-400 text-xs">{restaurant.owner?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                                                <MapPin className="w-4 h-4" />
                                                {restaurant.address?.city || 'Not set'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${restaurant.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${restaurant.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {restaurant.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${restaurant.isPublished
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {restaurant.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setPreviewRestaurant(restaurant)}
                                                    className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                    title="Preview Menu"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewRestaurant(restaurant)}
                                                    className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditRestaurant(restaurant)}
                                                    className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(restaurant._id)}
                                                    className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                    title={restaurant.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(restaurant)}
                                                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                        <p className="text-sm text-gray-400">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 text-gray-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-white px-3">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 text-gray-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Restaurant Modal */}
            <RestaurantModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                restaurant={selectedRestaurant}
                mode={modalMode}
            />

            {/* Mobile Preview Modal */}
            <MobilePreviewModal
                isOpen={!!previewRestaurant}
                onClose={() => setPreviewRestaurant(null)}
                url={previewRestaurant ? `/menu/${previewRestaurant.slug}` : ''}
                title={previewRestaurant?.name || 'Menu Preview'}
            />

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Delete Restaurant</h3>
                            <p className="text-gray-400 mb-6">
                                Are you sure you want to delete{' '}
                                <span className="text-white font-medium">{deleteConfirm.name}</span>?
                                This will also delete all menus and orders. This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteRestaurant(deleteConfirm._id)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminRestaurants;
