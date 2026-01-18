import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  GripVertical,
  Coffee,
  Pizza,
  Salad,
  Cake,
  Wine,
  Soup
} from 'lucide-react';

const suggestedCategories = [
  { name: 'Appetizers', icon: Salad },
  { name: 'Main Courses', icon: Pizza },
  { name: 'Soups', icon: Soup },
  { name: 'Desserts', icon: Cake },
  { name: 'Beverages', icon: Coffee },
  { name: 'Drinks', icon: Wine },
];

const MenuSetupStep = ({ data, updateData, onNext, onBack }) => {
  const [newCategory, setNewCategory] = useState('');
  const [errors, setErrors] = useState({});

  const addCategory = (name) => {
    if (!name.trim()) return;
    
    const exists = data.categories?.some(
      cat => cat.name.toLowerCase() === name.toLowerCase()
    );
    
    if (exists) {
      setErrors({ category: 'This category already exists' });
      return;
    }

    updateData({
      categories: [
        ...(data.categories || []),
        { name: name.trim(), description: '', order: (data.categories?.length || 0) + 1 }
      ]
    });
    setNewCategory('');
    setErrors({});
  };

  const removeCategory = (index) => {
    const updated = data.categories.filter((_, i) => i !== index);
    updateData({ categories: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!data.categories?.length) {
      setErrors({ categories: 'Please add at least one category' });
      return;
    }
    
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl mb-4">
          <UtensilsCrossed className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Set up your menu categories
        </h2>
        <p className="text-gray-600">
          Create categories to organize your menu items
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quick Add Suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Add Popular Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedCategories.map((cat) => {
              const Icon = cat.icon;
              const isAdded = data.categories?.some(c => c.name === cat.name);
              
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => !isAdded && addCategory(cat.name)}
                  disabled={isAdded}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isAdded
                      ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-sky-100 hover:text-sky-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                  {isAdded && <span className="text-xs">(Added)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Category Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Custom Category
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
                setErrors({});
              }}
              placeholder="e.g., Chef's Special"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCategory(newCategory);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addCategory(newCategory)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add</span>
            </button>
          </div>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Categories List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Your Categories ({data.categories?.length || 0})
            </label>
          </div>
          
          {data.categories?.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {data.categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl group hover:border-sky-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
                      <span className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No categories added yet</p>
              <p className="text-gray-400 text-sm">
                Add categories using the suggestions above or create your own
              </p>
            </div>
          )}
          {errors.categories && (
            <p className="text-red-500 text-sm mt-2">{errors.categories}</p>
          )}
        </div>

        {/* Sample Items Toggle */}
        <div className="bg-sky-50 p-6 rounded-2xl">
          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              id="sampleItems"
              checked={data.sampleItems || false}
              onChange={(e) => updateData({ sampleItems: e.target.checked })}
              className="mt-1 w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="sampleItems" className="cursor-pointer">
              <span className="font-medium text-gray-900 block">
                Add sample menu items
              </span>
              <span className="text-gray-600 text-sm">
                We&apos;ll add some example items to each category to help you get started faster. 
                You can edit or remove them later.
              </span>
            </label>
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

export default MenuSetupStep;