import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    X,
    Store,
    Mail,
    Phone,
    Globe,
    MapPin,
    Calendar,
    User,
    Save,
    BarChart3,
    Eye,
    EyeOff,
} from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import dayjs from 'dayjs';

const RestaurantModal = ({ isOpen, onClose, onSuccess, restaurant, mode }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        subtitle: '',
        description: '',
        phone: '',
        email: '',
        isActive: true,
        isPublished: false,
    });

    useEffect(() => {
        if (restaurant && (mode === 'edit' || mode === 'view')) {
            setFormData({
                name: restaurant.name || '',
                subtitle: restaurant.subtitle || '',
                description: restaurant.description || '',
                phone: restaurant.phone || '',
                email: restaurant.email || '',
                isActive: restaurant.isActive ?? true,
                isPublished: restaurant.isPublished ?? false,
            });
        } else {
            setFormData({
                name: '',
                subtitle: '',
                description: '',
                phone: '',
                email: '',
                isActive: true,
                isPublished: false,
            });
        }
    }, [restaurant, mode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminApi.updateRestaurant(restaurant._id, formData);
            toast.success('Restaurant updated successfully');
            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getImageUrl = (imageObj) => {
        if (!imageObj) return null;
        if (typeof imageObj === 'string') return imageObj;
        return imageObj.url || null;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-800 rounded-lg w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-700">
                        <h2 className="text-lg font-semibold text-white">
                            {mode === 'edit' && 'Edit Restaurant'}
                            {mode === 'view' && 'Restaurant Details'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 overflow-y-auto max-h-[calc(90vh-120px)]">
                        {mode === 'view' ? (
                            <div className="space-y-5">
                                {/* Restaurant Header */}
                                <div className="flex items-center gap-4">
                                    {getImageUrl(restaurant?.logo) ? (
                                        <img
                                            src={getImageUrl(restaurant.logo)}
                                            alt={restaurant.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                                            {restaurant?.name?.[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{restaurant?.name}</h3>
                                        <p className="text-gray-400">/{restaurant?.slug}</p>
                                    </div>
                                </div>

                                {/* Owner Info */}
                                <div className="bg-slate-900 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Owner
                                    </h4>
                                    <p className="text-white">
                                        {restaurant?.owner?.firstName} {restaurant?.owner?.lastName}
                                    </p>
                                    <p className="text-gray-400 text-sm">{restaurant?.owner?.email}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <Phone className="w-4 h-4" /> Phone
                                        </div>
                                        <p className="text-white">{restaurant?.phone || 'Not set'}</p>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <Mail className="w-4 h-4" /> Email
                                        </div>
                                        <p className="text-white">{restaurant?.email || 'Not set'}</p>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <MapPin className="w-4 h-4" /> Location
                                        </div>
                                        <p className="text-white">
                                            {restaurant?.address?.city || restaurant?.address?.fullAddress || 'Not set'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <Calendar className="w-4 h-4" /> Created
                                        </div>
                                        <p className="text-white">{dayjs(restaurant?.createdAt).format('MMM D, YYYY')}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="bg-slate-900 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" /> Statistics
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{restaurant?.stats?.totalMenuItems || 0}</p>
                                            <p className="text-xs text-gray-400">Menu Items</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{restaurant?.stats?.totalOrders || 0}</p>
                                            <p className="text-xs text-gray-400">Orders</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{restaurant?.stats?.totalScans || 0}</p>
                                            <p className="text-xs text-gray-400">QR Scans</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Status</span>
                                            <span className={`px-3 py-1 rounded-md text-sm font-medium ${restaurant?.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {restaurant?.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Published</span>
                                            <span className={`px-3 py-1 rounded-md text-sm font-medium ${restaurant?.isPublished
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {restaurant?.isPublished ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Restaurant Name</label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Subtitle</label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                        placeholder="Short tagline..."
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                                        placeholder="Restaurant description..."
                                    />
                                </div>

                                {/* Contact Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-800"
                                        />
                                        <div>
                                            <p className="text-white text-sm font-medium">Active</p>
                                            <p className="text-gray-400 text-xs">Restaurant is operational</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isPublished"
                                            checked={formData.isPublished}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-800"
                                        />
                                        <div>
                                            <p className="text-white text-sm font-medium">Published</p>
                                            <p className="text-gray-400 text-xs">Visible to public</p>
                                        </div>
                                    </label>
                                </div>

                                {/* Submit */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RestaurantModal;
