import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  UtensilsCrossed,
  Package,
  DollarSign,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
  Check,
  Flame,
  Leaf,
  Star,
  Clock,
  Tag,
} from 'lucide-react';
import { restaurantApi } from '../../api/restaurant.api';
import { menuApi } from '../../api/menu.api';

// Category icons
const categoryIcons = [
  { id: 'utensils', icon: '🍴', label: 'Utensils' },
  { id: 'pizza', icon: '🍕', label: 'Pizza' },
  { id: 'burger', icon: '🍔', label: 'Burger' },
  { id: 'salad', icon: '🥗', label: 'Salad' },
  { id: 'soup', icon: '🍲', label: 'Soup' },
  { id: 'dessert', icon: '🍰', label: 'Dessert' },
  { id: 'drink', icon: '🍹', label: 'Drinks' },
  { id: 'coffee', icon: '☕', label: 'Coffee' },
  { id: 'sushi', icon: '🍣', label: 'Sushi' },
  { id: 'taco', icon: '🌮', label: 'Taco' },
  { id: 'pasta', icon: '🍝', label: 'Pasta' },
  { id: 'chicken', icon: '🍗', label: 'Chicken' },
];

const MenuManagement = () => {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'create', data: null });
  const [itemModal, setItemModal] = useState({ open: false, mode: 'create', data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, data: null });
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch restaurant and categories
  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  // Fetch items when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchItems(selectedCategory._id);
    }
  }, [selectedCategory]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [restaurantRes, categoriesRes] = await Promise.all([
        restaurantApi.getRestaurant(restaurantId),
        menuApi.getCategories(restaurantId),
      ]);
      
      setRestaurant(restaurantRes.data);
      setCategories(categoriesRes.data.categories || []);
      
      // Select first category by default
      if (categoriesRes.data.categories?.length > 0) {
        setSelectedCategory(categoriesRes.data.categories[0]);
      }
    } catch (error) {
      toast.error('Failed to load menu data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = async (categoryId) => {
    setIsLoadingItems(true);
    try {
      const response = await menuApi.getItemsByCategory(restaurantId, categoryId);
      setItems(response.data.items || []);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Category CRUD
  const handleSaveCategory = async (formData) => {
    setIsSaving(true);
    try {
      if (categoryModal.mode === 'create') {
        const response = await menuApi.createCategory(restaurantId, formData);
        setCategories([...categories, response.data]);
        toast.success('Category created successfully');
      } else {
        const response = await menuApi.updateCategory(
          restaurantId,
          categoryModal.data._id,
          formData
        );
        setCategories(categories.map((c) =>
          c._id === response.data._id ? response.data : c
        ));
        toast.success('Category updated successfully');
      }
      setCategoryModal({ open: false, mode: 'create', data: null });
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteModal.data) return;
    
    setIsDeleting(true);
    try {
      await menuApi.deleteCategory(restaurantId, deleteModal.data._id);
      setCategories(categories.filter((c) => c._id !== deleteModal.data._id));
      if (selectedCategory?._id === deleteModal.data._id) {
        setSelectedCategory(categories[0] || null);
      }
      toast.success('Category deleted successfully');
      setDeleteModal({ open: false, type: null, data: null });
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  // Item CRUD
  const handleSaveItem = async (formData) => {
    setIsSaving(true);
    try {
      if (itemModal.mode === 'create') {
        const response = await menuApi.createItem(
          restaurantId,
          selectedCategory._id,
          formData
        );
        setItems([...items, response.data]);
        // Update category item count
        setCategories(categories.map((c) =>
          c._id === selectedCategory._id
            ? { ...c, itemCount: (c.itemCount || 0) + 1 }
            : c
        ));
        toast.success('Item created successfully');
      } else {
        const response = await menuApi.updateItem(
          restaurantId,
          itemModal.data._id,
          formData
        );
        setItems(items.map((i) =>
          i._id === response.data._id ? response.data : i
        ));
        toast.success('Item updated successfully');
      }
      setItemModal({ open: false, mode: 'create', data: null });
    } catch (error) {
      toast.error(error.message || 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteModal.data) return;
    
    setIsDeleting(true);
    try {
      await menuApi.deleteItem(restaurantId, deleteModal.data._id);
      setItems(items.filter((i) => i._id !== deleteModal.data._id));
      // Update category item count
      setCategories(categories.map((c) =>
        c._id === selectedCategory._id
          ? { ...c, itemCount: Math.max((c.itemCount || 1) - 1, 0) }
          : c
      ));
      toast.success('Item deleted successfully');
      setDeleteModal({ open: false, type: null, data: null });
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleItemAvailability = async (item) => {
    try {
      const response = await menuApi.toggleAvailability(restaurantId, item._id);
      setItems(items.map((i) =>
        i._id === item._id ? { ...i, isAvailable: response.data.isAvailable } : i
      ));
      toast.success(response.data.isAvailable ? 'Item available' : 'Item unavailable');
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  // Filter items by search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard/restaurants')}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Restaurants</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Menu Management
          </h1>
          <p className="text-gray-500 mt-1">
            {restaurant?.name} - Manage categories and menu items
          </p>
        </div>
        <Link
          to={`/menu/${restaurant?.slug}`}
          target="_blank"
          className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Preview Menu</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Categories</h2>
                <button
                  onClick={() => setCategoryModal({ open: true, mode: 'create', data: null })}
                  className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                {categories.length} categories
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="p-8 text-center">
                <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No categories yet</p>
                <button
                  onClick={() => setCategoryModal({ open: true, mode: 'create', data: null })}
                  className="mt-3 text-sky-600 text-sm font-medium hover:text-sky-700"
                >
                  Create your first category
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {categories.map((category) => (
                  <motion.div
                    key={category._id}
                    className={`p-4 cursor-pointer transition-colors group ${
                      selectedCategory?._id === category._id
                        ? 'bg-sky-50 border-l-4 border-sky-500'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {categoryIcons.find((i) => i.id === category.icon)?.icon || '📁'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">
                            {category.itemCount || 0} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryModal({ open: true, mode: 'edit', data: category });
                          }}
                          className="p-1.5 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ open: true, type: 'category', data: category });
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items Section */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Items Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCategory?.name || 'Select a Category'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {items.length} items in this category
                  </p>
                </div>
                {selectedCategory && (
                  <button
                    onClick={() => setItemModal({ open: true, mode: 'create', data: null })}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2 rounded-xl font-medium hover:from-sky-600 hover:to-sky-700 transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              {/* Search */}
              {selectedCategory && items.length > 0 && (
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="p-4 sm:p-6">
              {!selectedCategory ? (
                <div className="text-center py-12">
                  <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a category to view items</p>
                </div>
              ) : isLoadingItems ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No items in this category</p>
                  <button
                    onClick={() => setItemModal({ open: true, mode: 'create', data: null })}
                    className="text-sky-600 font-medium hover:text-sky-700"
                  >
                    Add your first item
                  </button>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No items match your search</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center space-x-4 p-4 rounded-xl border transition-all group ${
                        item.isAvailable
                          ? 'bg-white border-gray-100 hover:border-gray-200'
                          : 'bg-gray-50 border-gray-100 opacity-60'
                      }`}
                    >
                      {/* Drag Handle */}
                      <div className="cursor-grab text-gray-300 hover:text-gray-400">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.image?.url ? (
                          <img
                            src={item.image.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          {item.badges?.isBestseller && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              Best
                            </span>
                          )}
                          {item.badges?.isSpicy && (
                            <span className="text-red-500">
                              <Flame className="w-4 h-4" />
                            </span>
                          )}
                          {item.badges?.isVegetarian && (
                            <span className="text-emerald-500">
                              <Leaf className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="font-semibold text-gray-900">
                            ${item.price?.toFixed(2)}
                          </span>
                          {item.salePrice && item.salePrice < item.price && (
                            <>
                              <span className="text-sm text-gray-400 line-through">
                                ${item.price?.toFixed(2)}
                              </span>
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                                {Math.round(((item.price - item.salePrice) / item.price) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleItemAvailability(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.isAvailable
                              ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                              : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                          title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                        >
                          {item.isAvailable ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => setItemModal({ open: true, mode: 'edit', data: item })}
                          className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, type: 'item', data: item })}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={categoryModal.open}
        mode={categoryModal.mode}
        data={categoryModal.data}
        isSaving={isSaving}
        onClose={() => setCategoryModal({ open: false, mode: 'create', data: null })}
        onSave={handleSaveCategory}
      />

      {/* Item Modal */}
      <ItemModal
        isOpen={itemModal.open}
        mode={itemModal.mode}
        data={itemModal.data}
        isSaving={isSaving}
        onClose={() => setItemModal({ open: false, mode: 'create', data: null })}
        onSave={handleSaveItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        type={deleteModal.type}
        data={deleteModal.data}
        isDeleting={isDeleting}
        onClose={() => setDeleteModal({ open: false, type: null, data: null })}
        onConfirm={deleteModal.type === 'category' ? handleDeleteCategory : handleDeleteItem}
      />
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ isOpen, mode, data, isSaving, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'utensils',
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        icon: data.icon || 'utensils',
      });
    } else {
      setFormData({ name: '', description: '', icon: 'utensils' });
    }
  }, [data, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Create Category' : 'Edit Category'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryIcons.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: icon.id })}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    formData.icon === icon.id
                      ? 'bg-sky-100 ring-2 ring-sky-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {icon.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Appetizers"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors disabled:opacity-70 flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Create' : 'Update'}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Item Modal Component
const ItemModal = ({ isOpen, mode, data, isSaving, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    badges: {
      isNew: false,
      isBestseller: false,
      isSpicy: false,
      isVegetarian: false,
      isVegan: false,
    },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        salePrice: data.salePrice?.toString() || '',
        badges: data.badges || {
          isNew: false,
          isBestseller: false,
          isSpicy: false,
          isVegetarian: false,
          isVegan: false,
        },
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        badges: {
          isNew: false,
          isBestseller: false,
          isSpicy: false,
          isVegetarian: false,
          isVegan: false,
        },
      });
    }
  }, [data, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
    });
  };

  const toggleBadge = (badge) => {
    setFormData({
      ...formData,
      badges: {
        ...formData.badges,
        [badge]: !formData.badges[badge],
      },
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full my-8"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Add Menu Item' : 'Edit Menu Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Margherita Pizza"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your item..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badges
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleBadge('isNew')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors ${
                  formData.badges.isNew
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>New</span>
              </button>
              <button
                type="button"
                onClick={() => toggleBadge('isBestseller')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors ${
                  formData.badges.isBestseller
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Bestseller</span>
              </button>
              <button
                type="button"
                onClick={() => toggleBadge('isSpicy')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors ${
                  formData.badges.isSpicy
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Spicy</span>
              </button>
              <button
                type="button"
                onClick={() => toggleBadge('isVegetarian')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors ${
                  formData.badges.isVegetarian
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Leaf className="w-4 h-4" />
                <span>Vegetarian</span>
              </button>
              <button
                type="button"
                onClick={() => toggleBadge('isVegan')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1 transition-colors ${
                  formData.badges.isVegan
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Leaf className="w-4 h-4" />
                <span>Vegan</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors disabled:opacity-70 flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Add Item' : 'Update Item'}</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Delete Modal Component
const DeleteModal = ({ isOpen, type, data, isDeleting, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete {type === 'category' ? 'Category' : 'Item'}
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{data?.name}</span>?
            {type === 'category' && (
              <span className="block mt-2 text-sm text-red-500">
                This will also delete all items in this category.
              </span>
            )}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
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
  );
};

export default MenuManagement;