import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    X,
    User,
    Mail,
    Phone,
    Lock,
    Shield,
    Calendar,
    Building2,
    Eye,
    EyeOff,
    Save,
    Camera,
    Trash2,
} from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import dayjs from 'dayjs';

const UserModal = ({ isOpen, onClose, onSuccess, user, mode }) => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
    });

    useEffect(() => {
        if (user && (mode === 'edit' || mode === 'view')) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                password: '',
                phone: user.phone || '',
                role: user.role || 'user',
            });
            setAvatarPreview(user.avatar || null);
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phone: '',
                role: 'user',
            });
            setAvatarPreview(null);
        }
        setAvatarFile(null);
    }, [user, mode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setAvatarFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'create') {
                if (!formData.password) {
                    toast.error('Password is required');
                    setLoading(false);
                    return;
                }
                await adminApi.createUser(formData);
                toast.success('User created successfully');
            } else if (mode === 'edit') {
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await adminApi.updateUser(user._id, updateData);
                toast.success('User updated successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getInitials = () => {
        const first = formData.firstName?.[0] || user?.firstName?.[0] || '';
        const last = formData.lastName?.[0] || user?.lastName?.[0] || '';
        return (first + last).toUpperCase() || 'U';
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
                    className="bg-slate-800 rounded-lg w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-700">
                        <h2 className="text-lg font-semibold text-white">
                            {mode === 'create' && 'Add New User'}
                            {mode === 'edit' && 'Edit User'}
                            {mode === 'view' && 'User Details'}
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
                                {/* Avatar and Name */}
                                <div className="flex items-center gap-4">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.firstName}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">
                                            {user?.firstName} {user?.lastName}
                                        </h3>
                                        <p className="text-gray-400">{user?.email}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <Phone className="w-4 h-4" />
                                            Phone
                                        </div>
                                        <p className="text-white">{user?.phone || 'Not provided'}</p>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <Shield className="w-4 h-4" />
                                            Role
                                        </div>
                                        <p className="text-white capitalize">{user?.role?.replace('_', ' ')}</p>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <Calendar className="w-4 h-4" />
                                            Joined
                                        </div>
                                        <p className="text-white">{dayjs(user?.createdAt).format('MMM D, YYYY')}</p>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                            <Building2 className="w-4 h-4" />
                                            Restaurants
                                        </div>
                                        <p className="text-white">{user?.restaurantCount || 0}</p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="bg-slate-900 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Status</span>
                                        <span className={`px-3 py-1 rounded-md text-sm font-medium ${user?.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user?.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Avatar Upload */}
                                <div className="flex justify-center">
                                    <div className="relative group">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar"
                                                className="w-20 h-20 rounded-full object-cover border-2 border-slate-600"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold border-2 border-slate-600">
                                                {getInitials()}
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute inset-0 bg-black/50 rounded-full" />
                                            <div className="flex gap-1 z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-1.5 bg-orange-500 hover:bg-orange-600 rounded-full text-white transition-colors"
                                                    title="Upload"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                                {avatarPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveAvatar}
                                                        className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                <p className="text-center text-xs text-gray-500">Hover to change photo</p>

                                {/* Name Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1.5">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">
                                        Password {mode === 'edit' && <span className="text-gray-600">(leave empty to keep)</span>}
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={mode === 'create'}
                                            className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                            placeholder={mode === 'create' ? '••••••••' : 'Leave empty'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">
                                        Phone <span className="text-gray-600">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 appearance-none"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                {mode === 'create' ? 'Create User' : 'Save Changes'}
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

export default UserModal;
