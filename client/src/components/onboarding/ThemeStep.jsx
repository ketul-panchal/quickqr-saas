import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Palette, Check } from 'lucide-react';

const themes = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary',
    colors: ['#0ea5e9', '#f8fafc', '#1e293b'],
    preview: 'bg-gradient-to-br from-sky-500 to-sky-600',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless elegance',
    colors: ['#854d0e', '#fef3c7', '#1c1917'],
    preview: 'bg-gradient-to-br from-amber-700 to-amber-800',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean',
    colors: ['#171717', '#ffffff', '#525252'],
    preview: 'bg-gradient-to-br from-gray-800 to-gray-900',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold and colorful',
    colors: ['#ec4899', '#fdf2f8', '#831843'],
    preview: 'bg-gradient-to-br from-pink-500 to-rose-500',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek dark mode',
    colors: ['#8b5cf6', '#1e1b4b', '#c4b5fd'],
    preview: 'bg-gradient-to-br from-violet-600 to-purple-700',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated style',
    colors: ['#059669', '#ecfdf5', '#064e3b'],
    preview: 'bg-gradient-to-br from-emerald-600 to-teal-700',
  },
];

const primaryColors = [
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Indigo', value: '#6366f1' },
];

const ThemeStep = ({ data, updateData, onNext, onBack }) => {

  const handleThemeSelect = (themeId) => {
    updateData({ theme: themeId });
  };

  const handleColorSelect = (color) => {
    updateData({ primaryColor: color });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl mb-4">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose your theme
        </h2>
        <p className="text-gray-600">
          Select a theme that matches your restaurant&apos;s brand
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select a Theme Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                type="button"
                onClick={() => handleThemeSelect(theme.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  data.theme === theme.id
                    ? 'border-sky-500 ring-4 ring-sky-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Theme Preview */}
                <div className={`h-20 rounded-xl mb-3 ${theme.preview}`}>
                  {data.theme === theme.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Theme Colors */}
                <div className="flex justify-center space-x-1 mb-2">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Theme Name */}
                <p className="font-medium text-gray-900 text-center">{theme.name}</p>
                <p className="text-xs text-gray-500 text-center">{theme.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Primary Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Primary Accent Color
          </label>
          <div className="flex flex-wrap gap-3">
            {primaryColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleColorSelect(color.value)}
                className={`w-12 h-12 rounded-xl transition-all ${
                  data.primaryColor === color.value
                    ? 'ring-4 ring-offset-2'
                    : 'hover:scale-110'
                }`}
                style={{ 
                  backgroundColor: color.value,
                  ringColor: color.value 
                }}
                title={color.name}
              >
                {data.primaryColor === color.value && (
                  <Check className="w-6 h-6 text-white mx-auto" />
                )}
              </button>
            ))}
            
            {/* Custom Color Picker */}
            <div className="relative">
              <input
                type="color"
                value={data.primaryColor || '#0ea5e9'}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer opacity-0 absolute inset-0"
              />
              <div 
                className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors"
              >
                <span className="text-xs font-medium">+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-gray-50 p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
          <div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            style={{ borderTop: `4px solid ${data.primaryColor}` }}
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  <span className="text-lg font-bold">R</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Restaurant Name</h4>
                  <p className="text-sm text-gray-500">Your tagline here</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  View Menu
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: data.primaryColor, color: data.primaryColor }}
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
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

export default ThemeStep;