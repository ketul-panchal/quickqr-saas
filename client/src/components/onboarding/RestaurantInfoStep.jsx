import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Building2, MapPin, Phone, Mail, User } from 'lucide-react';

const cuisineOptions = [
  'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 
  'Thai', 'American', 'French', 'Mediterranean', 'Korean',
  'Vietnamese', 'Greek', 'Spanish', 'Middle Eastern', 'Other'
];

const RestaurantInfoStep = ({ data, updateData, onNext, onBack }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      updateData({
        [parent]: {
          ...data[parent],
          [child]: value,
        },
      });
    } else {
      updateData({ [name]: value });
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCuisineToggle = (cuisine) => {
    const current = data.cuisineType || [];
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine];
    updateData({ cuisineType: updated });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!data.restaurantName?.trim()) {
      newErrors.restaurantName = 'Restaurant name is required';
    }
    if (!data.ownerName?.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!data.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!data.cuisineType?.length) {
      newErrors.cuisineType = 'Please select at least one cuisine type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Tell us about your restaurant
        </h2>
        <p className="text-gray-600">
          This information will be displayed on your digital menu
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Name *
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="restaurantName"
              value={data.restaurantName || ''}
              onChange={handleChange}
              placeholder="e.g., The Good Fork"
              className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                errors.restaurantName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.restaurantName && (
            <p className="text-red-500 text-sm mt-1">{errors.restaurantName}</p>
          )}
        </div>

        {/* Owner Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Owner/Manager Name *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="ownerName"
              value={data.ownerName || ''}
              onChange={handleChange}
              placeholder="e.g., John Smith"
              className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                errors.ownerName ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.ownerName && (
            <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={data.email || ''}
                onChange={handleChange}
                placeholder="hello@restaurant.com"
                className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={data.phone || ''}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Address (Optional)
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="address.street"
              value={data.address?.street || ''}
              onChange={handleChange}
              placeholder="Street Address"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
            <input
              type="text"
              name="address.city"
              value={data.address?.city || ''}
              onChange={handleChange}
              placeholder="City"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
            <input
              type="text"
              name="address.state"
              value={data.address?.state || ''}
              onChange={handleChange}
              placeholder="State/Province"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
            <input
              type="text"
              name="address.zipCode"
              value={data.address?.zipCode || ''}
              onChange={handleChange}
              placeholder="ZIP Code"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Cuisine Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cuisine Type * <span className="text-gray-400">(Select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                onClick={() => handleCuisineToggle(cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  data.cuisineType?.includes(cuisine)
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
          {errors.cuisineType && (
            <p className="text-red-500 text-sm mt-2">{errors.cuisineType}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description (Optional)
          </label>
          <textarea
            name="description"
            value={data.description || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Tell customers what makes your restaurant special..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl"
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantInfoStep;