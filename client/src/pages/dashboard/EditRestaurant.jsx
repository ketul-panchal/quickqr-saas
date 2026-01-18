import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
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
  Save,
  Trash2,
  Eye,
  Globe,
} from 'lucide-react';
import { restaurantApi } from '../../api/restaurant.api';

const templates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design',
    colors: ['#0ea5e9', '#f8fafc', '#1e293b'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional elegant look',
    colors: ['#854d0e', '#fef3c7', '#1c1917'],
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated style',
    colors: ['#059669', '#ecfdf5', '#064e3b'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean',
    colors: ['#171717', '#ffffff', '#525252'],
  },
];

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [errors, setErrors] = useState({});
  const [originalSlug, setOriginalSlug] = useState('');

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
    isPublished: false,
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [currentCover, setCurrentCover] = useState(null);

  // Fetch restaurant data
  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    setIsLoading(true);
    try {
      const response = await restaurantApi.getRestaurant(id);
      const data = response.data;
      
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        subtitle: data.subtitle || '',
        timing: data.timing || '',
        phone: data.phone || '',
        description: data.description || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          zipCode: data.address?.zipCode || '',
          country: data.address?.country || '',
        },
        template: data.template || 'modern',
        isPublished: data.isPublished || false,
      });
      
      setOriginalSlug(data.slug);
      setCurrentLogo(data.logo?.url || null);
      setCurrentCover(data.coverImage?.url || null);
      setSlugAvailable(true);
    } catch (error) {
      toast.error('Failed to load restaurant');
      navigate('/dashboard/restaurants');
    } finally {
      setIsLoading(false);
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
    }

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

    if (value && value !== originalSlug) {
      checkSlugAvailability(value);
    } else if (value === originalSlug) {
      setSlugAvailable(true);
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
        const response = await restaurantApi.checkSlug(slug, id);
        setSlugAvailable(response.data.isAvailable);
      } catch (error) {
        console.error('Error checking slug:', error);
      } finally {
        setSlugChecking(false);
      }
    },
    [id]
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
      toast.error('Please fix the errors');
      return;
    }

    setIsSaving(true);

    try {
      // Update restaurant data
      await restaurantApi.update(id, formData);

      // Upload new logo if changed
      if (logo) {
        try {
          await restaurantApi.uploadLogo(id, logo);
        } catch (error) {
          console.error('Error uploading logo:', error);
        }
      }

      // Upload new cover if changed
      if (coverImage) {
        try {
          await restaurantApi.uploadCover(id, coverImage);
        } catch (error) {
          console.error('Error uploading cover:', error);
        }
      }

      toast.success('Restaurant updated successfully!');
      navigate('/dashboard/restaurants');
    } catch (error) {
      toast.error(error.message || 'Failed to update restaurant');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async () => {
    try {
      const response = await restaurantApi.togglePublish(id);
      setFormData((prev) => ({ ...prev, isPublished: response.data.isPublished }));
      toast.success(response.data.isPublished ? 'Restaurant published!' : 'Restaurant unpublished');
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  // Cleanup previews
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [logoPreview, coverPreview]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate('/dashboard/restaurants')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Restaurants</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Restaurant</h1>
          <p className="text-gray-500 mt-1">Update your restaurant details</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Publish Toggle */}
          <button
            onClick={handleTogglePublish}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              formData.isPublished
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            {formData.isPublished ? 'Published' : 'Draft'}
          </button>

          {/* Preview */}
          <a
            href={`/menu/${formData.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            Preview
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Store className="w-5 h-5 text-sky-500" />
            Basic Information
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
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <span>Slug *</span>
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-gray-400 text-sm">/menu/</span>
                </div>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="your-restaurant"
                  className={`w-full pl-16 pr-12 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                    errors.slug
                      ? 'border-red-500'
                      : slugAvailable === false
                      ? 'border-red-500'
                      : slugAvailable === true
                      ? 'border-emerald-500'
                      : 'border-gray-200'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {slugChecking && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                  {!slugChecking && slugAvailable === true && <Check className="w-5 h-5 text-emerald-500" />}
                  {!slugChecking && slugAvailable === false && <X className="w-5 h-5 text-red-500" />}
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                This is your menu URL. Use lowercase letters, numbers, and hyphens only.
              </p>
              {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="e.g., Authentic Italian Cuisine"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Timing & Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
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
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
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
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
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
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            Address
          </h2>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  placeholder="NY"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  placeholder="United States"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-sky-500" />
            Images
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="relative">
                {logoPreview || currentLogo ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={logoPreview || currentLogo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <label className="absolute bottom-2 right-2 p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload logo</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <div className="relative">
                {coverPreview || currentCover ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={coverPreview || currentCover}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <label className="absolute bottom-2 right-2 p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload cover</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
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
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-500" />
            Menu Template
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, template: template.id }))}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                  formData.template === template.id
                    ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-100'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {formData.template === template.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className="h-20 rounded-xl mb-3"
                  style={{
                    background:
                      template.id === 'modern'
                        ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)'
                        : template.id === 'classic'
                        ? 'linear-gradient(135deg, #854d0e 0%, #a16207 100%)'
                        : template.id === 'elegant'
                        ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                        : 'linear-gradient(135deg, #171717 0%, #404040 100%)',
                  }}
                />

                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{template.description}</p>

                <div className="flex gap-1 mt-3">
                  {template.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submit Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4"
        >
          <button
            type="button"
            onClick={() => navigate('/dashboard/restaurants')}
            className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || slugAvailable === false}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default EditRestaurant;