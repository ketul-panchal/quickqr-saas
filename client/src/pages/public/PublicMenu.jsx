import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Clock,
  MapPin,
  Search,
  X,
  Star,
  Flame,
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Check,
  User,
  MessageSquare,
  Hash,
  ChevronUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { publicMenuApi } from '../../api/publicMenu.api';
import { orderApi } from '../../api/order.api';

// Category Icons
const categoryIcons = {
  utensils: '🍴', pizza: '🍕', burger: '🍔', salad: '🥗',
  soup: '🍲', dessert: '🍰', drink: '🍹', coffee: '☕',
  sushi: '🍣', taco: '🌮', pasta: '🍝', chicken: '🍗',
};

const PublicMenu = () => {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const categoryRefs = useRef({});

  useEffect(() => {
    fetchMenu();
  }, [slug]);

  // Intersection Observer for active category
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace('category-', ''));
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [categories]);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const response = await publicMenuApi.getMenu(slug);
      setRestaurant(response.data.restaurant);
      setCategories(response.data.categories);
      if (response.data.categories.length > 0) {
        setActiveCategory(response.data.categories[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load menu');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    categoryRefs.current[categoryId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // Cart functions
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === itemId);
      if (existing?.quantity === 1) {
        return prev.filter((i) => i._id !== itemId);
      }
      return prev.map((i) =>
        i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const getCartQuantity = (itemId) => {
    return cart.find((i) => i._id === itemId)?.quantity || 0;
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.salePrice || item.price;
      return sum + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);
  };

  // Filter items
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return categories;
    
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  };

  const filteredCategories = getFilteredCategories();
  const primaryColor = restaurant?.theme?.primaryColor || '#0ea5e9';

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
          </div>
          <p className="text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Menu Not Available</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative bg-white">
        {/* Cover */}
        <div className="h-44 relative overflow-hidden">
          {restaurant?.coverImage?.url ? (
            <img
              src={restaurant.coverImage.url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Restaurant Info Card */}
        <div className="relative px-4 -mt-20 pb-4">
          <div className="bg-white rounded-3xl shadow-xl p-5 max-w-md mx-auto">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-20 h-20 rounded-2xl shadow-lg overflow-hidden flex-shrink-0 border-4 border-white -mt-10">
                {restaurant?.logo?.url ? (
                  <img
                    src={restaurant.logo.url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {restaurant?.name?.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {restaurant?.name}
                </h1>
                {restaurant?.subtitle && (
                  <p className="text-gray-500 text-sm mt-0.5">{restaurant.subtitle}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
                  {restaurant?.timing && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                      {restaurant.timing}
                    </span>
                  )}
                  {restaurant?.phone && (
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                      {restaurant.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            {restaurant?.address?.city && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                <span>
                  {[restaurant.address.street, restaurant.address.city, restaurant.address.state]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Search & Categories */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full pl-11 pr-10 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
              style={{ '--tw-ring-color': primaryColor }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {!searchQuery && categories.length > 1 && (
          <div className="px-4 py-2 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 max-w-md mx-auto">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => scrollToCategory(cat._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat._id
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: activeCategory === cat._id ? primaryColor : undefined,
                  }}
                >
                  <span className="text-base">{categoryIcons[cat.icon] || '📁'}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Menu Content */}
      <main className="px-4 py-6 pb-32 max-w-md mx-auto">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No items found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <section
                key={category._id}
                id={`category-${category._id}`}
                ref={(el) => (categoryRefs.current[category._id] = el)}
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{categoryIcons[category.icon] || '📁'}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                    <p className="text-sm text-gray-500">{category.items.length} items</p>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item._id}
                      item={item}
                      primaryColor={primaryColor}
                      quantity={getCartQuantity(item._id)}
                      onAdd={() => addToCart(item)}
                      onRemove={() => removeFromCart(item._id)}
                      onView={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && !showCart && !showCheckout && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-40"
          >
            <button
              onClick={() => setShowCart(true)}
              className="w-full max-w-md mx-auto flex items-center justify-between p-4 rounded-2xl text-white shadow-2xl"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full text-xs font-bold flex items-center justify-center"
                    style={{ color: primaryColor }}
                  >
                    {getCartCount()}
                  </span>
                </div>
                <span className="font-medium">View Cart</span>
              </div>
              <span className="text-xl font-bold">${getCartTotal().toFixed(2)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        primaryColor={primaryColor}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        restaurantName={restaurant?.name}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        primaryColor={primaryColor}
        restaurantId={restaurant?._id}
        onSuccess={(orderData) => {
          clearCart();
          setOrderSuccess(orderData);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={!!orderSuccess}
        orderData={orderSuccess}
        primaryColor={primaryColor}
        onClose={() => setOrderSuccess(null)}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        primaryColor={primaryColor}
        quantity={selectedItem ? getCartQuantity(selectedItem._id) : 0}
        onAdd={() => selectedItem && addToCart(selectedItem)}
        onRemove={() => selectedItem && removeFromCart(selectedItem._id)}
      />
    </div>
  );
};

// ==================== COMPONENTS ====================

// Menu Item Card
const MenuItemCard = ({ item, primaryColor, quantity, onAdd, onRemove, onView }) => {
  const price = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
  const hasDiscount = item.salePrice && item.salePrice < item.price;
  const discount = hasDiscount ? Math.round(((item.price - item.salePrice) / item.price) * 100) : 0;

  return (
    <motion.div
      layout
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 ${
        !item.isAvailable ? 'opacity-50' : ''
      }`}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div
          className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={onView}
        >
          {item.image?.url ? (
            <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
              -{discount}%
            </div>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Sold Out</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-1">
            {item.badges?.isBestseller && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                <Star className="w-3 h-3" /> Best
              </span>
            )}
            {item.badges?.isSpicy && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                <Flame className="w-3 h-3" /> Spicy
              </span>
            )}
            {item.badges?.isVegetarian && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                <Leaf className="w-3 h-3" /> Veg
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-1">{item.name}</h3>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
          )}

          {/* Price & Add */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold" style={{ color: primaryColor }}>
                ${price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">${item.price.toFixed(2)}</span>
              )}
            </div>

            {item.isAvailable && (
              <div>
                {quantity > 0 ? (
                  <div
                    className="flex items-center gap-2 px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <button
                      onClick={onRemove}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-5 text-center font-semibold text-gray-900">{quantity}</span>
                    <button
                      onClick={onAdd}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onAdd}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-transform active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Add
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Cart Drawer
const CartDrawer = ({ isOpen, onClose, cart, primaryColor, onAdd, onRemove, onCheckout, restaurantName }) => {
  const total = cart.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                  <p className="text-sm text-gray-500">{restaurantName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image?.url ? (
                      <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                      ${(item.salePrice || item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRemove(item._id)}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onAdd(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Checkout Modal
const CheckoutModal = ({ isOpen, onClose, cart, primaryColor, restaurantId, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    tableNumber: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const total = cart.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0);

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.tableNumber.trim()) newErrors.tableNumber = 'Table number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await orderApi.placeOrder({
        restaurantId,
        customerName: formData.customerName,
        tableNumber: formData.tableNumber,
        phone: formData.phone,
        message: formData.message,
        items: cart.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
        })),
      });

      onSuccess(response.data);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to place order' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Complete Your Order</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter your name"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.customerName ? 'ring-2 ring-red-500' : ''
                  }`}
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Table Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Table Number *
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  placeholder="e.g., Table 5"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.tableNumber ? 'ring-2 ring-red-500' : ''
                  }`}
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
              {errors.tableNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.tableNumber}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Your phone number"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
            </div>

            {/* Message (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Special Instructions <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Any allergies or special requests?"
                  rows={3}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 resize-none"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errors.submit}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white p-5 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Place Order</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Order Success Modal
const OrderSuccessModal = ({ isOpen, orderData, primaryColor, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl max-w-sm w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <CheckCircle className="w-10 h-10" style={{ color: primaryColor }} />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
        <p className="text-gray-500 mb-6">
          Your order has been received and is being prepared.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Order Number</p>
          <p className="text-xl font-bold text-gray-900">{orderData?.orderNumber}</p>
          {orderData?.estimatedTime && (
            <p className="text-sm text-gray-500 mt-2">
              Estimated time: ~{orderData.estimatedTime} minutes
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl text-white font-semibold"
          style={{ backgroundColor: primaryColor }}
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
};

// Item Detail Modal
const ItemDetailModal = ({ item, onClose, primaryColor, quantity, onAdd, onRemove }) => {
  if (!item) return null;

  const price = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden"
        >
          {/* Image */}
          <div className="relative h-64">
            {item.image?.url ? (
              <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.badges?.isBestseller && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                  <Star className="w-4 h-4" /> Bestseller
                </span>
              )}
              {item.badges?.isVegetarian && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  <Leaf className="w-4 h-4" /> Vegetarian
                </span>
              )}
              {item.badges?.isSpicy && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                  <Flame className="w-4 h-4" /> Spicy
                </span>
              )}
            </div>

            {/* Name & Price */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              <div className="text-right">
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                  ${price.toFixed(2)}
                </span>
                {item.salePrice && item.salePrice < item.price && (
                  <span className="block text-sm text-gray-400 line-through">
                    ${item.price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && <p className="text-gray-600 mb-6">{item.description}</p>}

            {/* Add to Cart */}
            {item.isAvailable ? (
              quantity > 0 ? (
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-4 px-4 py-2 rounded-full"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <button
                      onClick={onRemove}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-8 text-center">{quantity}</span>
                    <button
                      onClick={onAdd}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl text-white font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onAdd();
                    onClose();
                  }}
                  className="w-full py-4 rounded-2xl text-white font-semibold text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Add to Cart - ${price.toFixed(2)}
                </button>
              )
            ) : (
              <button
                disabled
                className="w-full py-4 rounded-2xl bg-gray-200 text-gray-500 font-semibold text-lg cursor-not-allowed"
              >
                Currently Unavailable
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PublicMenu;