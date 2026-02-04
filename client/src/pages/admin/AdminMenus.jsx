import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    UtensilsCrossed,
    Search,
    Edit2,
    Trash2,
    Plus,
    ChevronRight,
    ChevronDown,
    Loader2,
    RefreshCw,
    Store,
    Tag,
    DollarSign,
    Eye,
    EyeOff,
    X,
    Check,
    Image as ImageIcon,
    Building2,
    Flame,
    Leaf,
    Star,
    Sparkles,
    Menu,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { menuApi } from '../../api/menu.api';

// Badge icons mapping
const badgeIcons = {
    isNew: { icon: Sparkles, label: 'New', color: 'text-blue-400' },
    isBestseller: { icon: Star, label: 'Bestseller', color: 'text-yellow-400' },
    isSpicy: { icon: Flame, label: 'Spicy', color: 'text-red-400' },
    isVegetarian: { icon: Leaf, label: 'Vegetarian', color: 'text-green-400' },
};

const AdminMenus = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Modal states
    const [editItem, setEditItem] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [saving, setSaving] = useState(false);

    // Category modal states
    const [editCategory, setEditCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState(null);

    // Mobile responsiveness
    const [showMobileCategories, setShowMobileCategories] = useState(false);

    // Fetch restaurants on mount
    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getRestaurants({ limit: 100 });
            setRestaurants(response.data.restaurants || []);
            if (response.data.restaurants?.length > 0) {
                setSelectedRestaurant(response.data.restaurants[0]);
            }
        } catch (error) {
            toast.error('Failed to load restaurants');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories when restaurant changes
    useEffect(() => {
        if (selectedRestaurant) {
            fetchCategories();
        }
    }, [selectedRestaurant]);

    const fetchCategories = async () => {
        if (!selectedRestaurant) return;
        try {
            const response = await menuApi.getCategories(selectedRestaurant._id);
            const categoriesData = Array.isArray(response.data) ? response.data : (response.data?.categories || response.data || []);
            setCategories(categoriesData);
            if (categoriesData?.length > 0) {
                setSelectedCategory(categoriesData[0]);
            } else {
                setSelectedCategory(null);
                setItems([]);
            }
        } catch (error) {
            toast.error('Failed to load categories');
            setCategories([]);
        }
    };

    // Fetch items when category changes
    useEffect(() => {
        if (selectedCategory && selectedRestaurant) {
            fetchItems();
        }
    }, [selectedCategory, selectedRestaurant]);

    const fetchItems = async () => {
        if (!selectedCategory || !selectedRestaurant) return;
        try {
            setItemsLoading(true);
            const response = await menuApi.getItemsByCategory(selectedRestaurant._id, selectedCategory._id);
            const itemsData = Array.isArray(response.data) ? response.data : (response.data?.items || []);
            setItems(itemsData);
        } catch (error) {
            toast.error('Failed to load items');
            setItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    // Toggle item availability
    const handleToggleAvailability = async (item) => {
        try {
            await menuApi.toggleAvailability(selectedRestaurant._id, item._id);
            setItems(prev => prev.map(i =>
                i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i
            ));
            toast.success(`Item ${item.isAvailable ? 'hidden' : 'shown'}`);
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    // Delete item
    const handleDeleteItem = async () => {
        if (!deleteConfirm) return;
        try {
            setSaving(true);
            await menuApi.deleteItem(selectedRestaurant._id, deleteConfirm._id);
            setItems(prev => prev.filter(i => i._id !== deleteConfirm._id));
            toast.success('Item deleted');
            setDeleteConfirm(null);
        } catch (error) {
            toast.error('Failed to delete item');
        } finally {
            setSaving(false);
        }
    };

    // Save item
    const handleSaveItem = async (formData) => {
        try {
            setSaving(true);
            if (editItem?._id) {
                await menuApi.updateItem(selectedRestaurant._id, editItem._id, formData);
                toast.success('Item updated');
            } else {
                await menuApi.createItem(selectedRestaurant._id, selectedCategory._id, formData);
                toast.success('Item created');
            }
            fetchItems();
            setShowItemModal(false);
            setEditItem(null);
        } catch (error) {
            toast.error(error.message || 'Failed to save item');
        } finally {
            setSaving(false);
        }
    };

    // Save category
    const handleSaveCategory = async (formData) => {
        try {
            setSaving(true);
            if (editCategory?._id) {
                await menuApi.updateCategory(selectedRestaurant._id, editCategory._id, formData);
                toast.success('Category updated');
            } else {
                await menuApi.createCategory(selectedRestaurant._id, formData);
                toast.success('Category created');
            }
            fetchCategories();
            setShowCategoryModal(false);
            setEditCategory(null);
        } catch (error) {
            toast.error(error.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    // Delete category
    const handleDeleteCategory = async () => {
        if (!deleteCategoryConfirm) return;
        try {
            setSaving(true);
            await menuApi.deleteCategory(selectedRestaurant._id, deleteCategoryConfirm._id);
            setCategories(prev => prev.filter(c => c._id !== deleteCategoryConfirm._id));
            if (selectedCategory?._id === deleteCategoryConfirm._id) {
                setSelectedCategory(null);
                setItems([]);
            }
            toast.success('Category deleted');
            setDeleteCategoryConfirm(null);
        } catch (error) {
            toast.error('Failed to delete category');
        } finally {
            setSaving(false);
        }
    };

    // Get image URL
    const getImageUrl = (imageObj) => {
        if (!imageObj) return null;
        if (typeof imageObj === 'string') return imageObj;
        return imageObj.url || null;
    };

    // Filter items by search
    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        Menu Management
                    </h1>
                    <p className="text-gray-400 mt-1">View and manage restaurant menus</p>
                </div>

                {/* Restaurant Selector */}
                <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <select
                        value={selectedRestaurant?._id || ''}
                        onChange={(e) => {
                            const restaurant = restaurants.find(r => r._id === e.target.value);
                            setSelectedRestaurant(restaurant);
                            setSelectedCategory(null);
                            setItems([]);
                        }}
                        className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 min-w-[200px]"
                    >
                        {restaurants.map(restaurant => (
                            <option key={restaurant._id} value={restaurant._id}>
                                {restaurant.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Mobile Category Toggle */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setShowMobileCategories(!showMobileCategories)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                        <span className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            {selectedCategory?.name || 'Select Category'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showMobileCategories ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Mobile Categories Dropdown */}
                    <AnimatePresence>
                        {showMobileCategories && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
                            >
                                <div className="p-2 border-b border-slate-700 flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Categories</span>
                                    <button
                                        onClick={() => {
                                            setEditCategory({});
                                            setShowCategoryModal(true);
                                            setShowMobileCategories(false);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {categories.map(category => (
                                        <button
                                            key={category._id}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setShowMobileCategories(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left flex items-center justify-between ${selectedCategory?._id === category._id
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : 'text-gray-300 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {category.icon && <span>{category.icon}</span>}
                                                <span>{category.name}</span>
                                            </span>
                                            <span className="text-xs text-gray-500">{category.itemCount || 0}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Categories Sidebar - Desktop */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Categories
                            </h3>
                            <button
                                onClick={() => {
                                    setEditCategory({});
                                    setShowCategoryModal(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                title="Add Category"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {categories.length === 0 ? (
                                <div className="p-4 text-center">
                                    <Tag className="w-10 h-10 mx-auto mb-2 text-gray-500 opacity-50" />
                                    <p className="text-gray-400 text-sm mb-3">No categories yet</p>
                                    <button
                                        onClick={() => {
                                            setEditCategory({});
                                            setShowCategoryModal(true);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 mx-auto bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Category
                                    </button>
                                </div>
                            ) : (
                                categories.map(category => (
                                    <div
                                        key={category._id}
                                        className={`group relative ${selectedCategory?._id === category._id
                                            ? 'bg-blue-500/10 border-l-2 border-blue-500'
                                            : 'hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setSelectedCategory(category)}
                                            className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${selectedCategory?._id === category._id
                                                ? 'text-blue-400'
                                                : 'text-gray-300'
                                                }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {category.icon && <span>{category.icon}</span>}
                                                <span className="truncate">{category.name}</span>
                                            </span>
                                            <span className="text-xs text-gray-500 group-hover:hidden">
                                                {category.itemCount || 0}
                                            </span>
                                        </button>
                                        {/* Edit/Delete buttons on hover */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditCategory(category);
                                                    setShowCategoryModal(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteCategoryConfirm(category);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                <div className="flex-1 min-w-0">
                    {/* Search & Actions Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search items..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchItems()}
                                className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <RefreshCw className={`w-5 h-5 ${itemsLoading ? 'animate-spin' : ''}`} />
                            </button>
                            {selectedCategory && (
                                <button
                                    onClick={() => {
                                        setEditItem({});
                                        setShowItemModal(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="hidden sm:inline">Add Item</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Items Display */}
                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        {!selectedCategory ? (
                            <div className="py-12 text-center text-gray-400">
                                <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Select a category to view items</p>
                            </div>
                        ) : itemsLoading ? (
                            <div className="py-12 flex justify-center">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                                <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No items found</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Cards View */}
                                <div className="md:hidden divide-y divide-slate-700">
                                    {filteredItems.map(item => (
                                        <div key={item._id} className="p-4">
                                            <div className="flex gap-3">
                                                {/* Item Image */}
                                                {getImageUrl(item.image) ? (
                                                    <img
                                                        src={getImageUrl(item.image)}
                                                        alt={item.name}
                                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                                                        <ImageIcon className="w-6 h-6 text-gray-500" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h4 className="text-white font-medium truncate">{item.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-green-400 font-medium">
                                                                    {item.salePrice && item.salePrice < item.price
                                                                        ? `$${item.salePrice}`
                                                                        : `$${item.price}`}
                                                                </span>
                                                                {item.salePrice && item.salePrice < item.price && (
                                                                    <span className="text-gray-500 line-through text-sm">${item.price}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${item.isAvailable
                                                                ? 'bg-green-500/10 text-green-400'
                                                                : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                            {item.isAvailable ? 'Available' : 'Hidden'}
                                                        </span>
                                                    </div>
                                                    {/* Badges */}
                                                    <div className="flex items-center gap-1 mt-2">
                                                        {Object.entries(item.badges || {}).map(([key, value]) => {
                                                            if (!value || !badgeIcons[key]) return null;
                                                            const Badge = badgeIcons[key];
                                                            return (
                                                                <span key={key} className={`p-1 ${Badge.color}`} title={Badge.label}>
                                                                    <Badge.icon className="w-4 h-4" />
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-700">
                                                <button
                                                    onClick={() => handleToggleAvailability(item)}
                                                    className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                >
                                                    {item.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditItem(item);
                                                        setShowItemModal(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-400 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(item)}
                                                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-900">
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Item</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Badges</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {filteredItems.map(item => (
                                                <tr key={item._id} className="hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {getImageUrl(item.image) ? (
                                                                <img
                                                                    src={getImageUrl(item.image)}
                                                                    alt={item.name}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                                                                    <ImageIcon className="w-5 h-5 text-gray-500" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-white font-medium">{item.name}</p>
                                                                {item.description && (
                                                                    <p className="text-gray-400 text-sm truncate max-w-[200px]">
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-green-400" />
                                                            <span className="text-white font-medium">
                                                                {item.salePrice && item.salePrice < item.price ? (
                                                                    <>
                                                                        <span className="text-green-400">${item.salePrice}</span>
                                                                        <span className="text-gray-500 line-through text-sm ml-2">${item.price}</span>
                                                                    </>
                                                                ) : (
                                                                    `$${item.price}`
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            {Object.entries(item.badges || {}).map(([key, value]) => {
                                                                if (!value || !badgeIcons[key]) return null;
                                                                const Badge = badgeIcons[key];
                                                                return (
                                                                    <span
                                                                        key={key}
                                                                        className={`p-1 ${Badge.color}`}
                                                                        title={Badge.label}
                                                                    >
                                                                        <Badge.icon className="w-4 h-4" />
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${item.isAvailable
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {item.isAvailable ? 'Available' : 'Hidden'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => handleToggleAvailability(item)}
                                                                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                                title={item.isAvailable ? 'Hide' : 'Show'}
                                                            >
                                                                {item.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditItem(item);
                                                                    setShowItemModal(true);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(item)}
                                                                className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Item Modal */}
            <ItemModal
                isOpen={showItemModal}
                item={editItem}
                onClose={() => {
                    setShowItemModal(false);
                    setEditItem(null);
                }}
                onSave={handleSaveItem}
                saving={saving}
            />

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Delete Item</h3>
                            <p className="text-gray-400 mb-6">
                                Are you sure you want to delete{' '}
                                <span className="text-white font-medium">{deleteConfirm.name}</span>?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteItem}
                                    disabled={saving}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                                >
                                    {saving ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Modal */}
            <CategoryModal
                isOpen={showCategoryModal}
                category={editCategory}
                onClose={() => {
                    setShowCategoryModal(false);
                    setEditCategory(null);
                }}
                onSave={handleSaveCategory}
                saving={saving}
            />

            {/* Delete Category Confirmation */}
            <AnimatePresence>
                {deleteCategoryConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setDeleteCategoryConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Delete Category</h3>
                            <p className="text-gray-400 mb-2">
                                Are you sure you want to delete{' '}
                                <span className="text-white font-medium">{deleteCategoryConfirm.name}</span>?
                            </p>
                            <p className="text-red-400 text-sm mb-6">
                                ⚠️ This will also delete all {deleteCategoryConfirm.itemCount || 0} items in this category.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteCategoryConfirm(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteCategory}
                                    disabled={saving}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                                >
                                    {saving ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Item Modal Component
const ItemModal = ({ isOpen, item, onClose, onSave, saving }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        badges: { isNew: false, isBestseller: false, isSpicy: false, isVegetarian: false },
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                price: item.price || '',
                salePrice: item.salePrice || '',
                badges: item.badges || { isNew: false, isBestseller: false, isSpicy: false, isVegetarian: false },
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleBadge = (badge) => {
        setFormData(prev => ({
            ...prev,
            badges: { ...prev.badges, [badge]: !prev.badges[badge] }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) {
            toast.error('Name and price are required');
            return;
        }
        onSave({
            ...formData,
            price: parseFloat(formData.price),
            salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        });
    };

    if (!isOpen) return null;

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
                    className="bg-slate-800 rounded-lg w-full max-w-lg border border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">
                            {item?._id ? 'Edit Item' : 'Add Item'}
                        </h3>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Item name"
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Item description"
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Price *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Sale Price</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="number"
                                        name="salePrice"
                                        value={formData.salePrice}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Badges</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(badgeIcons).map(([key, badge]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggleBadge(key)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${formData.badges?.[key]
                                            ? 'border-blue-500 bg-blue-500/10 text-white'
                                            : 'border-slate-700 text-gray-400 hover:border-slate-600'
                                            }`}
                                    >
                                        <badge.icon className={`w-4 h-4 ${badge.color}`} />
                                        {badge.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Check className="w-5 h-5" />
                                )}
                                {item?._id ? 'Save Changes' : 'Add Item'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Category Modal Component
const CategoryModal = ({ isOpen, category, onClose, onSave, saving }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                icon: category.icon || '',
            });
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error('Category name is required');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

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
                    className="bg-slate-800 rounded-lg w-full max-w-md border border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">
                            {category?._id ? 'Edit Category' : 'Add Category'}
                        </h3>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Category name"
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Category description"
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Icon (emoji)</label>
                            <input
                                type="text"
                                name="icon"
                                value={formData.icon}
                                onChange={handleChange}
                                placeholder="🍕"
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Check className="w-5 h-5" />
                                )}
                                {category?._id ? 'Save Changes' : 'Add Category'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminMenus;
