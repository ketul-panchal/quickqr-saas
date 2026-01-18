import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Store,
  Link as LinkIcon,
  FileText,
  Clock,
  Phone,
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
  Sparkles,
} from 'lucide-react';
import { restaurantApi } from '../../api/restaurant.api';

// Template options
const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with smooth animations',
    image: '/templates/modern.png',
    colors: ['#0ea5e9', '#f8fafc', '#1e293b'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional elegant look with warm colors',
    image: '/templates/classic.png',
    colors: ['#854d0e', '#fef3c7', '#1c1917'],
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated design for upscale dining',
    image: '/templates/elegant.png',
    colors: ['#059669', '#ecfdf5', '#064e3b'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, distraction-free menu experience',
    image: '/templates/minimal.png',
    colors: ['#171717', '#ffffff', '#525252'],
  },
];

const AddRestaurant = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subtitle: '',
    timing: '',
    phone: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    template: 'modern',
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

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
    const { name, value } = e.target;

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
        [name]: value,
      }));

      // Auto-generate slug from name
      if (name === 'name') {
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
        const response = await restaurantApi.checkSlug(slug);
        setSlugAvailable(response.data.isAvailable);
      } catch (error) {
        console.error('Error checking slug:', error);
      } finally {
        setSlugChecking(false);
      }
    },
    []
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

  // Remove logo
  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  // Remove cover
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

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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

    setIsLoading(true);

    try {
      // Create restaurant
      const response = await restaurantApi.create(formData);
      const restaurantId = response.data._id;

      // Upload logo if exists
      if (logo) {
        try {
          await restaurantApi.uploadLogo(restaurantId, logo);
        } catch (error) {
          console.error('Error uploading logo:', error);
        }
      }

      // Upload cover if exists
      if (coverImage) {
        try {
          await restaurantApi.uploadCover(restaurantId, coverImage);
        } catch (error) {
          console.error('Error uploading cover:', error);
        }
      }

      toast.success('Restaurant created successfully!');
      navigate('/dashboard/restaurants');
    } catch (error) {
      toast.error(error.message || 'Failed to create restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [logoPreview, coverPreview]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/restaurants')}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Restaurant</h1>
        <p className="text-gray-500 mt-1">Create a new restaurant and start building your digital menu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Store className="w-5 h-5 text-sky-500" />
            <span>Basic Information</span>
          </h2>

          <div className="grid gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., The Good Fork"
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <span>Slug *</span>
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-gray-400 text-sm">quickqr.com/menu/</span>
                </div>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="your-restaurant"
                  className={`w-full pl-40 pr-12 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                    errors.slug ? 'border-red-500' : slugAvailable === false ? 'border-red-500' : slugAvailable === true ? 'border-emerald-500' : 'border-gray-200'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {slugChecking && (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {!slugChecking && slugAvailable === true && (
                    <Check className="w-5 h-5 text-emerald-500" />
                  )}
                  {!slugChecking && slugAvailable === false && (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Use only lowercase letters, numbers, and hyphens. This will be your menu URL.
              </p>
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.slug}</span>
                </p>
              )}
              {!errors.slug && slugAvailable === false && (
                <p className="text-red-500 text-sm mt-1">This slug is already taken</p>
              )}
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="e.g., Authentic Italian Cuisine"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Timing & Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Timing</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="timing"
                  value={formData.timing}
                  onChange={handleChange}
                  placeholder="e.g., Mon-Sun: 9AM - 10PM"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>Phone</span>
                  </div>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Description</span>
                </div>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Tell customers what makes your restaurant special..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            <span>Address</span>
          </h2>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State / Province
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="NY"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  placeholder="United States"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-sky-500" />
            <span>Images</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="relative">
                {logoPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload logo</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="relative">
                {coverPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload cover</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                    <input
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
        </motion.div>

        {/* Template Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Palette className="w-5 h-5 text-sky-500" />
            <span>Restaurant Template</span>
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Choose how your menu will look when customers scan the QR code
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <motion.button
                key={template.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, template: template.id }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                  formData.template === template.id
                    ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Selected indicator */}
                {formData.template === template.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Template Preview */}
                <div className="h-32 rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {/* Mock preview based on template */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: template.id === 'modern'
                        ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
                        : template.id === 'classic'
                        ? 'linear-gradient(135deg, #854d0e 0%, #a16207 100%)'
                        : template.id === 'elegant'
                        ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                        : 'linear-gradient(135deg, #171717 0%, #404040 100%)',
                    }}
                  >
                    {/* Mock menu items */}
                    <div className="absolute inset-4 flex flex-col">
                      <div className="w-full h-3 bg-white/30 rounded mb-2" />
                      <div className="flex-1 flex flex-col justify-end space-y-1">
                        <div className="w-full h-6 bg-white/20 rounded" />
                        <div className="w-3/4 h-6 bg-white/20 rounded" />
                        <div className="w-5/6 h-6 bg-white/20 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Preview badge */}
                  <div className="absolute bottom-2 right-2">
                    <button
                      type="button"
                      className="flex items-center space-x-1 px-2 py-1 bg-white/90 rounded-lg text-xs font-medium text-gray-700"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {/* Template Info */}
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-xs text-gray-500">{template.description}</p>

                {/* Color swatches */}
                <div className="flex items-center space-x-1 mt-3">
                  {template.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Template Preview Modal Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-2xl p-6 border border-sky-100"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Don&apos;t worry, you can change it later!
              </h3>
              <p className="text-gray-600 text-sm">
                After creating your restaurant, you can customize the template, colors, fonts, and
                more from the restaurant settings. You can also preview how your menu looks to
                customers at any time.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4"
        >
          <button
            type="button"
            onClick={() => navigate('/dashboard/restaurants')}
            className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || slugAvailable === false}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Store className="w-5 h-5" />
                <span>Create Restaurant</span>
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default AddRestaurant;