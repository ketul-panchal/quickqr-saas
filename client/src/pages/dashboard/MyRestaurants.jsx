import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Store,
    Plus,
    Search,
    MoreVertical,
    QrCode,
    UtensilsCrossed,
    Eye,
    Edit,
    Trash2,
    ExternalLink,
    Calendar,
    BarChart3,
    Grid3X3,
    Loader2,
    AlertCircle,
    ChevronDown,
    Copy,
    Check,
    Globe,
    X,
} from 'lucide-react';
import { restaurantApi } from '../../api/restaurant.api';
import MobilePreviewModal from '../../components/common/MobilePreviewModal';
import { ShoppingBag } from 'lucide-react';
import { getImageUrl } from '../../utils/getImageUrl';


const MyRestaurants = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, restaurant: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState(null);
    const [previewModal, setPreviewModal] = useState({ open: false, restaurant: null });


    // Fetch restaurants
    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        setIsLoading(true);
        try {
            const response = await restaurantApi.getMyRestaurants();
            setRestaurants(response.data.restaurants || []);
        } catch (error) {
            toast.error('Failed to load restaurants');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter restaurants by search
    const filteredRestaurants = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Copy menu URL
    const copyMenuUrl = async (slug) => {
        const url = `${window.location.origin}/menu/${slug}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedSlug(slug);
            toast.success('Menu URL copied to clipboard!');
            setTimeout(() => setCopiedSlug(null), 2000);
        } catch (error) {
            toast.error('Failed to copy URL');
        }
    };

    // Open public view in new tab
    const openPublicView = (slug) => {
        window.open(`/menu/${slug}`, '_blank');
    };

    // Toggle publish status
    const togglePublish = async (id) => {
        try {
            const response = await restaurantApi.togglePublish(id);
            setRestaurants((prev) =>
                prev.map((r) =>
                    r._id === id ? { ...r, isPublished: response.data.isPublished } : r
                )
            );
            toast.success(
                response.data.isPublished
                    ? 'Restaurant published successfully!'
                    : 'Restaurant unpublished'
            );
        } catch (error) {
            toast.error('Failed to update status');
        }
        setActiveDropdown(null);
    };

    // Delete restaurant
    const handleDelete = async () => {
        if (!deleteModal.restaurant) return;

        setIsDeleting(true);
        try {
            await restaurantApi.delete(deleteModal.restaurant._id);
            setRestaurants((prev) =>
                prev.filter((r) => r._id !== deleteModal.restaurant._id)
            );
            toast.success('Restaurant deleted successfully');
            setDeleteModal({ open: false, restaurant: null });
        } catch (error) {
            toast.error('Failed to delete restaurant');
        } finally {
            setIsDeleting(false);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        My Restaurants
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage all your restaurants and menus
                    </p>
                </div>
                <Link
                    to="/dashboard/restaurants/new"
                    className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg shadow-sky-500/25"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Restaurant</span>
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search restaurants..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading restaurants...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && restaurants.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
                >
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No restaurants yet
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Create your first restaurant to start building your digital menu and QR code system.
                    </p>
                    <Link
                        to="/dashboard/restaurants/new"
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-medium hover:from-sky-600 hover:to-sky-700 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Restaurant</span>
                    </Link>
                </motion.div>
            )}

            {/* No Results */}
            {!isLoading && restaurants.length > 0 && filteredRestaurants.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No restaurants found
                    </h3>
                    <p className="text-gray-500">
                        Try a different search term
                    </p>
                </div>
            )}

            {/* Restaurant Grid */}
            {!isLoading && filteredRestaurants.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredRestaurants.map((restaurant, index) => (
                            <motion.div
                                key={restaurant._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
                            >
                                {/* Cover Image */}
                                <div className="relative h-32 bg-gradient-to-br from-sky-400 to-emerald-400">
                                    {restaurant.coverImage?.url && (
                                        <img
                                            src={getImageUrl(restaurant.coverImage.url)}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${restaurant.isPublished
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${restaurant.isPublished ? 'bg-emerald-500' : 'bg-gray-400'
                                                    }`}
                                            />
                                            {restaurant.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </div>

                                    {/* More Options */}
                                    <div className="absolute top-3 right-3">
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setActiveDropdown(
                                                        activeDropdown === restaurant._id ? null : restaurant._id
                                                    )
                                                }
                                                className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-600" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            <AnimatePresence>
                                                {activeDropdown === restaurant._id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20"
                                                    >
                                                        <button
                                                            onClick={() => togglePublish(restaurant._id)}
                                                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Globe className="w-4 h-4" />
                                                            <span>
                                                                {restaurant.isPublished ? 'Unpublish' : 'Publish'}
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigate(`/dashboard/restaurants/${restaurant._id}/edit`);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            <span>Edit Details</span>
                                                        </button>
                                                        <hr className="my-2 border-gray-100" />
                                                        <button
                                                            onClick={() => {
                                                                setDeleteModal({ open: true, restaurant });
                                                                setActiveDropdown(null);
                                                            }}
                                                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div className="absolute -bottom-8 left-4">
                                        <div className="w-16 h-16 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                                            {restaurant.logo?.url ? (
                                                <img
                                                    src={getImageUrl(restaurant.logo.url)}
                                                    alt={restaurant.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                                                    <span className="text-xl font-bold text-white">
                                                        {restaurant.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="pt-10 pb-4 px-4">
                                    {/* Name & Subtitle */}
                                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                                        {restaurant.name}
                                    </h3>
                                    {restaurant.subtitle && (
                                        <p className="text-gray-500 text-sm truncate mt-0.5">
                                            {restaurant.subtitle}
                                        </p>
                                    )}

                                    {/* Slug/URL */}
                                    <div className="flex items-center space-x-2 mt-2">
                                        <span className="text-xs text-gray-400 truncate">
                                            /menu/{restaurant.slug}
                                        </span>
                                        <button
                                            onClick={() => copyMenuUrl(restaurant.slug)}
                                            className="p-1 text-gray-400 hover:text-sky-500 transition-colors"
                                            title="Copy URL"
                                        >
                                            {copiedSlug === restaurant.slug ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center space-x-4 mt-4 text-sm">
                                        <div className="flex items-center space-x-1.5 text-gray-500">
                                            <BarChart3 className="w-4 h-4" />
                                            <span>{restaurant.stats?.totalScans || 0} scans</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5 text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(restaurant.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 pb-4">
                                    <div className="grid grid-cols-5 gap-2">
                                        {/* Menu */}
                                        <Link
                                            to={`/dashboard/restaurants/${restaurant._id}/menu`}
                                            className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-sky-50 rounded-xl transition-colors group/btn"
                                            title="Menu"
                                        >
                                            <UtensilsCrossed className="w-5 h-5 text-gray-400 group-hover/btn:text-sky-500" />
                                            <span className="text-xs text-gray-500 mt-1 group-hover/btn:text-sky-600">
                                                Menu
                                            </span>
                                        </Link>

                                        {/* QR Code */}
                                        {/* <Link
                                            to={`/dashboard/restaurants/${restaurant._id}/qr-code`}
                                            className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors group/btn"
                                            title="QR Code"
                                        >
                                            <QrCode className="w-5 h-5 text-gray-400 group-hover/btn:text-emerald-500" />
                                            <span className="text-xs text-gray-500 mt-1 group-hover/btn:text-emerald-600">
                                                QR
                                            </span>
                                        </Link> */}

                                        {/* Tables */}
                                        <Link
                                            to={`/dashboard/restaurants/${restaurant._id}/tables`}
                                            className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-violet-50 rounded-xl transition-colors group/btn"
                                            title="Tables"
                                        >
                                            <Grid3X3 className="w-5 h-5 text-gray-400 group-hover/btn:text-violet-500" />
                                            <span className="text-xs text-gray-500 mt-1 group-hover/btn:text-violet-600">
                                                Tables
                                            </span>
                                        </Link>

                                        {/* Orders - Add this between QR and Tables */}
                                        <Link
                                            to={`/dashboard/restaurants/${restaurant._id}/orders`}
                                            className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group/btn"
                                            title="Orders"
                                        >
                                            <ShoppingBag className="w-5 h-5 text-gray-400 group-hover/btn:text-orange-500" />
                                            <span className="text-xs text-gray-500 mt-1 group-hover/btn:text-orange-600">
                                                Orders
                                            </span>
                                        </Link>

                                        {/* Public View */}
                                        {/* <button
                      onClick={() => openPublicView(restaurant.slug)}
                      className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-amber-50 rounded-xl transition-colors group/btn"
                      title="Public View"
                    >
                      <Eye className="w-5 h-5 text-gray-400 group-hover/btn:text-amber-500" />
                      <span className="text-xs text-gray-500 mt-1 group-hover/btn:text-amber-600">
                        View
                      </span>
                    </button> */}
                                        {/* Public View - Update this button */}
                                        <button
                                            onClick={() => setPreviewModal({ open: true, restaurant })}
                                            className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-amber-50 rounded-xl transition-colors group/btn"
                                            title="Public View"
                                        >
                                            <Eye className="w-5 h-5 text-gray-400 group-hover/btn:text-amber-500" />
                                            <span className="text-xs text-gray-500 mt-1 group-hover/btn:text-amber-600">
                                                View
                                            </span>
                                        </button>

                                        {/* Edit */}
                                        <Link
                                            to={`/dashboard/restaurants/${restaurant._id}/edit`}
                                            className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-rose-50 rounded-xl transition-colors group/btn"
                                            title="Edit"
                                        >
                                            <Edit className="w-5 h-5 text-gray-400 group-hover/btn:text-rose-500" />
                                            <span className="text-xs text-gray-500 mt-1 group-hover/btn:text-rose-600">
                                                Edit
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteModal({ open: false, restaurant: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Delete Restaurant
                                </h3>
                                <button
                                    onClick={() => setDeleteModal({ open: false, restaurant: null })}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-gray-600 text-center">
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold text-gray-900">
                                        {deleteModal.restaurant?.name}
                                    </span>
                                    ? This action cannot be undone. All menus, categories, items, and orders will be permanently deleted.
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setDeleteModal({ open: false, restaurant: null })}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center space-x-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5" />
                                            <span>Delete</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside to close dropdown */}
            {activeDropdown && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveDropdown(null)}
                />
            )}

            {/* Mobile Preview Modal */}
            <MobilePreviewModal
                isOpen={previewModal.open}
                onClose={() => setPreviewModal({ open: false, restaurant: null })}
                url={`${window.location.origin}/menu/${previewModal.restaurant?.slug}`}
                title={previewModal.restaurant?.name}
            />
        </div>
    );
};

export default MyRestaurants;