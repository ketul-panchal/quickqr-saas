import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Store,
    LayoutDashboard,
    Settings,
    Crown,
    Receipt,
    Plus,
    Loader2,
    X,
} from 'lucide-react';
import { searchApi } from '../api/search.api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get full image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
};

// Icon mapping for navigation pages
const iconMap = {
    LayoutDashboard,
    Store,
    Plus,
    Crown,
    Receipt,
    Settings,
};

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState({ restaurants: [], tables: [], pages: [] });
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults({ restaurants: [], tables: [], pages: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await searchApi.search(query);
                setResults(response.data);
            } catch (error) {
                console.error('Search error:', error);
                setResults({ restaurants: [], tables: [], pages: [] });
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle result click
    const handleResultClick = (path) => {
        navigate(path);
        setIsOpen(false);
        setQuery('');
    };

    // Clear search
    const handleClear = () => {
        setQuery('');
        setResults({ restaurants: [], tables: [], pages: [] });
        inputRef.current?.focus();
    };

    const hasResults = results.restaurants.length > 0 || results.tables.length > 0 || results.pages.length > 0;
    const showDropdown = isOpen && (query.length >= 2 || hasResults);

    return (
        <div ref={containerRef} className="relative">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search restaurants, tables, pages..."
                    className="w-64 pl-10 pr-10 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
                            </div>
                        ) : !hasResults && query.length >= 2 ? (
                            <div className="py-8 text-center text-gray-500">
                                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No results found for "{query}"</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {/* Navigation Pages */}
                                {results.pages.length > 0 && (
                                    <div className="px-3 py-2">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Pages
                                        </h4>
                                        {results.pages.map((page) => {
                                            const Icon = iconMap[page.icon] || LayoutDashboard;
                                            return (
                                                <button
                                                    key={page.path}
                                                    onClick={() => handleResultClick(page.path)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                                                        <Icon className="w-4 h-4 text-sky-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{page.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Restaurants */}
                                {results.restaurants.length > 0 && (
                                    <div className="px-3 py-2 border-t border-gray-100">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Restaurants
                                        </h4>
                                        {results.restaurants.map((restaurant) => (
                                            <button
                                                key={restaurant._id}
                                                onClick={() => handleResultClick(restaurant.path)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {restaurant.logo ? (
                                                        <img
                                                            src={getImageUrl(restaurant.logo)}
                                                            alt={restaurant.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Store className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{restaurant.name}</p>
                                                    <p className="text-xs text-gray-500">/{restaurant.slug}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${restaurant.isPublished ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {restaurant.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Tables */}
                                {results.tables.length > 0 && (
                                    <div className="px-3 py-2 border-t border-gray-100">
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Tables
                                        </h4>
                                        {results.tables.map((table) => (
                                            <button
                                                key={table._id}
                                                onClick={() => handleResultClick(table.path)}
                                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                            >
                                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-sm font-bold text-emerald-600">#{table.number}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{table.name}</p>
                                                    <p className="text-xs text-gray-500">{table.restaurant?.name} • {table.location}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalSearch;
