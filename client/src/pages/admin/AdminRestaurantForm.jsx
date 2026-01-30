import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Store,
    Link as LinkIcon,
    FileText,
    Clock,
    Phone,
    Mail,
    MapPin,
    Upload,
    X,
    Check,
    Loader2,
    AlertCircle,
    Image as ImageIcon,
    Palette,
    Eye,
    ArrowLeft,
    Save,
    User,
    BarChart3,
    Smartphone,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { restaurantApi } from '../../api/restaurant.api';
import dayjs from 'dayjs';

// Template options
const templates = [
    { id: 'modern', name: 'Modern', colors: ['#0ea5e9', '#f8fafc', '#1e293b'] },
    { id: 'classic', name: 'Classic', colors: ['#854d0e', '#fef3c7', '#1c1917'] },
    { id: 'elegant', name: 'Elegant', colors: ['#059669', '#ecfdf5', '#064e3b'] },
    { id: 'minimal', name: 'Minimal', colors: ['#171717', '#ffffff', '#525252'] },
];

const AdminRestaurantForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEditing);
    const [slugChecking, setSlugChecking] = useState(false);
    const [slugAvailable, setSlugAvailable] = useState(null);
    const [errors, setErrors] = useState({});
    const [owner, setOwner] = useState(null);
    const [stats, setStats] = useState(null);

    const logoInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        subtitle: '',
        timing: '',
        phone: '',
        email: '',
        description: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
        },
        template: 'modern',
        isActive: true,
        isPublished: false,
    });

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    // Fetch restaurant data for editing
    useEffect(() => {
        if (isEditing) {
            fetchRestaurant();
        }
    }, [id, isEditing]);

    const fetchRestaurant = async () => {
        try {
            setFetchLoading(true);
            const response = await adminApi.getRestaurant(id);
            const restaurant = response.data;

            setFormData({
                name: restaurant.name || '',
                slug: restaurant.slug || '',
                subtitle: restaurant.subtitle || '',
                timing: restaurant.timing || '',
                phone: restaurant.phone || '',
                email: restaurant.email || '',
                description: restaurant.description || '',
                address: {
                    street: restaurant.address?.street || '',
                    city: restaurant.address?.city || '',
                    state: restaurant.address?.state || '',
                    zipCode: restaurant.address?.zipCode || '',
                    country: restaurant.address?.country || '',
                },
                template: restaurant.template || 'modern',
                isActive: restaurant.isActive ?? true,
                isPublished: restaurant.isPublished ?? false,
            });

            setOwner(restaurant.owner);
            setStats(restaurant.stats);

            // Set existing images
            if (restaurant.logo?.url) {
                setLogoPreview(restaurant.logo.url);
            }
            if (restaurant.coverImage?.url) {
                setCoverPreview(restaurant.coverImage.url);
            }

            setSlugAvailable(true);
        } catch (error) {
            toast.error('Failed to load restaurant');
            navigate('/admin/restaurants');
        } finally {
            setFetchLoading(false);
        }
    };

    // Generate slug from name
    const generateSlug = useCallback((name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    }, []);

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));

            // Auto-generate slug from name (only for new restaurants)
            if (name === 'name' && !isEditing) {
                const newSlug = generateSlug(value);
                setFormData((prev) => ({ ...prev, slug: newSlug }));
                if (newSlug) {
                    checkSlugAvailability(newSlug);
                }
            }
        }

        // Clear error
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Handle slug change
    const handleSlugChange = (e) => {
        let value = e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-');

        setFormData((prev) => ({ ...prev, slug: value }));

        if (value) {
            checkSlugAvailability(value);
        } else {
            setSlugAvailable(null);
        }

        if (errors.slug) {
            setErrors((prev) => ({ ...prev, slug: '' }));
        }
    };

    // Check slug availability
    const checkSlugAvailability = useCallback(
        async (slug) => {
            if (!slug || slug.length < 3) {
                setSlugAvailable(null);
                return;
            }

            setSlugChecking(true);
            try {
                const response = await restaurantApi.checkSlug(slug, isEditing ? id : undefined);
                setSlugAvailable(response.data.isAvailable);
            } catch (error) {
                console.error('Error checking slug:', error);
            } finally {
                setSlugChecking(false);
            }
        },
        [isEditing, id]
    );

    // Handle logo upload
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    // Handle cover image upload
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    // Remove images
    const removeLogo = () => {
        setLogo(null);
        setLogoPreview(null);
    };

    const removeCover = () => {
        setCoverImage(null);
        setCoverPreview(null);
    };

    // Validate form
    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Restaurant name is required';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug is required';
        } else if (formData.slug.length < 3) {
            newErrors.slug = 'Slug must be at least 3 characters';
        } else if (slugAvailable === false) {
            newErrors.slug = 'This slug is already taken';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        setLoading(true);

        try {
            if (isEditing) {
                await adminApi.updateRestaurant(id, formData);
                toast.success('Restaurant updated successfully!');
            } else {
                // For new restaurants, use the restaurant API
                const response = await restaurantApi.create(formData);
                const restaurantId = response.data._id;

                // Upload images if exists
                if (logo) {
                    await restaurantApi.uploadLogo(restaurantId, logo);
                }
                if (coverImage) {
                    await restaurantApi.uploadCover(restaurantId, coverImage);
                }
                toast.success('Restaurant created successfully!');
            }
            navigate('/admin/restaurants');
        } catch (error) {
            toast.error(error.message || 'Failed to save restaurant');
        } finally {
            setLoading(false);
        }
    };

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            if (logoPreview && logo) URL.revokeObjectURL(logoPreview);
            if (coverPreview && coverImage) URL.revokeObjectURL(coverPreview);
        };
    }, [logoPreview, coverPreview, logo, coverImage]);

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex gap-6">
            {/* Form Section */}
            <div className="flex-1 max-w-3xl space-y-6">
                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate('/admin/restaurants')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Restaurants</span>
                    </button>
                    <h1 className="text-2xl font-bold text-white">
                        {isEditing ? 'Edit Restaurant' : 'Add Restaurant'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {isEditing ? 'Update restaurant details' : 'Create a new restaurant'}
                    </p>
                </div>

                {/* Owner Info (Edit mode) */}
                {isEditing && owner && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                                {owner.firstName?.[0]}{owner.lastName?.[0]}
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {owner.firstName} {owner.lastName}
                                </p>
                                <p className="text-gray-400 text-sm">{owner.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats (Edit mode) */}
                {isEditing && stats && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                            <BarChart3 className="w-4 h-4" />
                            Statistics
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xl font-bold text-white">{stats.totalMenuItems || 0}</p>
                                <p className="text-xs text-gray-400">Menu Items</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-white">{stats.totalOrders || 0}</p>
                                <p className="text-xs text-gray-400">Orders</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-white">{stats.totalScans || 0}</p>
                                <p className="text-xs text-gray-400">QR Scans</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-blue-400" />
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    Restaurant Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., The Good Fork"
                                    className={`w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-slate-700'
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    Slug * (Menu URL)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                        /menu/
                                    </span>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleSlugChange}
                                        placeholder="your-restaurant"
                                        className={`w-full pl-16 pr-10 py-2.5 bg-slate-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.slug ? 'border-red-500' : slugAvailable === false ? 'border-red-500' : slugAvailable === true ? 'border-green-500' : 'border-slate-700'
                                            }`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {slugChecking && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                                        {!slugChecking && slugAvailable === true && <Check className="w-4 h-4 text-green-500" />}
                                        {!slugChecking && slugAvailable === false && <X className="w-4 h-4 text-red-500" />}
                                    </div>
                                </div>
                                {errors.slug && (
                                    <p className="text-red-400 text-sm mt-1">{errors.slug}</p>
                                )}
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Subtitle</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    placeholder="e.g., Authentic Italian Cuisine"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Timing & Phone */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> Timing
                                    </label>
                                    <input
                                        type="text"
                                        name="timing"
                                        value={formData.timing}
                                        onChange={handleChange}
                                        placeholder="Mon-Sun: 9AM - 10PM"
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                                        <Phone className="w-4 h-4" /> Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                                    <Mail className="w-4 h-4" /> Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contact@restaurant.com"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-1">
                                    <FileText className="w-4 h-4" /> Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Tell customers what makes this restaurant special..."
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            Address
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    placeholder="123 Main Street"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        placeholder="New York"
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">State</label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        placeholder="NY"
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        placeholder="10001"
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Country</label>
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        placeholder="United States"
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-400" />
                            Images
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Logo */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Logo</label>
                                {logoPreview ? (
                                    <div className="relative h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                                        <img
                                            src={logoPreview}
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-sm text-gray-400">Upload Logo</span>
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Cover */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Cover Image</label>
                                {coverPreview ? (
                                    <div className="relative h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                                        <img
                                            src={coverPreview}
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeCover}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-sm text-gray-400">Upload Cover</span>
                                        <input
                                            ref={coverInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Template */}
                    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-blue-400" />
                            Template
                        </h2>

                        <div className="grid grid-cols-4 gap-3">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => setFormData((prev) => ({ ...prev, template: template.id }))}
                                    className={`p-3 rounded-lg border-2 text-center transition-all ${formData.template === template.id
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex justify-center gap-1 mb-2">
                                        {template.colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-white">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer flex-1">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded"
                                />
                                <div>
                                    <p className="text-white text-sm font-medium">Active</p>
                                    <p className="text-gray-400 text-xs">Restaurant is operational</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer flex-1">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded"
                                />
                                <div>
                                    <p className="text-white text-sm font-medium">Published</p>
                                    <p className="text-gray-400 text-xs">Visible to public</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/restaurants')}
                            className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {isEditing ? 'Save Changes' : 'Create Restaurant'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Mobile Preview */}
            <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <Smartphone className="w-4 h-4" />
                        Mobile Preview
                    </div>
                    <div className="bg-slate-900 rounded-3xl p-3 border border-slate-700">
                        <div className="bg-slate-800 rounded-2xl overflow-hidden" style={{ height: '500px' }}>
                            {/* Phone Header */}
                            <div className="bg-black h-6 flex items-center justify-center">
                                <div className="w-16 h-3 bg-slate-800 rounded-full" />
                            </div>

                            {/* Cover Image */}
                            <div className="h-32 bg-slate-700 relative">
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}

                                {/* Logo */}
                                <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl bg-slate-800 border-4 border-slate-800 overflow-hidden">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                                            {formData.name?.[0] || '?'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 pt-10">
                                <h3 className="text-white font-bold text-lg">
                                    {formData.name || 'Restaurant Name'}
                                </h3>
                                {formData.subtitle && (
                                    <p className="text-gray-400 text-sm mt-0.5">{formData.subtitle}</p>
                                )}

                                {/* Info */}
                                <div className="mt-4 space-y-2 text-sm">
                                    {formData.timing && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{formData.timing}</span>
                                        </div>
                                    )}
                                    {formData.phone && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Phone className="w-4 h-4" />
                                            <span>{formData.phone}</span>
                                        </div>
                                    )}
                                    {formData.address.city && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{formData.address.city}{formData.address.state ? `, ${formData.address.state}` : ''}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Menu Preview */}
                                <div className="mt-6">
                                    <div className="text-white font-semibold mb-3">Menu</div>
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-slate-700 rounded-lg p-3">
                                                <div className="flex justify-between">
                                                    <div className="w-2/3 h-3 bg-slate-600 rounded" />
                                                    <div className="w-1/6 h-3 bg-slate-600 rounded" />
                                                </div>
                                                <div className="w-1/2 h-2 bg-slate-600 rounded mt-2" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRestaurantForm;
