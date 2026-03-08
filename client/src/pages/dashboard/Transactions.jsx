import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Receipt,
    Filter,
    RefreshCw,
    Printer,
    ChevronLeft,
    ChevronRight,
    Store,
    Plus
} from 'lucide-react';
import { restaurantApi } from '../../api/restaurant.api';
import { orderApi } from '../../api/order.api';
import dayjs from 'dayjs';
import InvoiceModal from './components/InvoiceModal';
import { useNavigate } from 'react-router-dom';

const Transactions = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
    const [orders, setOrders] = useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters and Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Modals
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await restaurantApi.getMyRestaurants();
            const restaurantList = res.data.restaurants || [];
            setRestaurants(restaurantList);

            if (restaurantList.length > 0) {
                setSelectedRestaurantId(restaurantList[0]._id);
            }
        } catch (error) {
            toast.error('Failed to load restaurants');
            console.error(error);
        } finally {
            setLoadingRestaurants(false);
        }
    };

    const fetchOrders = useCallback(async (showRefresh = false) => {
        if (!selectedRestaurantId) return;
        
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await orderApi.getOrders(selectedRestaurantId, {
                page: pagination.page,
                limit: pagination.limit,
                status: statusFilter,
            });
            setOrders(res.data.orders);
            setPagination(prev => ({ ...prev, ...res.data.pagination }));
        } catch (error) {
            toast.error(error.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedRestaurantId, pagination.page, pagination.limit, statusFilter]);

    useEffect(() => {
        if (selectedRestaurantId) {
            fetchOrders();
        }
    }, [fetchOrders, selectedRestaurantId]);

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            preparing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            ready: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            served: 'bg-green-500/10 text-green-500 border-green-500/20',
            completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        const style = styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loadingRestaurants) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (restaurants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="p-4 bg-sky-50 rounded-full mb-4">
                    <Store className="w-12 h-12 text-sky-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Restaurants Found</h2>
                <p className="text-gray-500 max-w-md mb-6">
                    You need to create a restaurant before you can view transactions.
                </p>
                <button
                    onClick={() => navigate('/dashboard/restaurants/new')}
                    className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Restaurant</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-sky-500" />
                        </div>
                        Transactions Ledger
                    </h1>
                    <p className="text-gray-500 mt-1">View and manage your financial records and invoices</p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="p-2 bg-sky-100 rounded-lg text-sky-600 shrink-0">
                            <Store className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <select
                                value={selectedRestaurantId}
                                onChange={(e) => {
                                    setSelectedRestaurantId(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium text-gray-900"
                            >
                                {restaurants.map((restaurant) => (
                                    <option key={restaurant._id} value={restaurant._id}>
                                        {restaurant.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => fetchOrders(true)}
                            disabled={refreshing || !selectedRestaurantId}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors flex-1 md:flex-none justify-center ${
                                showFilters || statusFilter
                                    ? 'bg-sky-50 border-sky-200 text-sky-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Filter Options */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <div className="max-w-xs">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setPagination(prev => ({ ...prev, page: 1 }));
                                        }}
                                        className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-sky-500 text-gray-900"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="ready">Ready</option>
                                        <option value="served">Served</option>
                                        <option value="completed">Completed (Paid)</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Reference</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Receipt className="w-8 h-8 opacity-50" />
                                            <p>No transactions found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{dayjs(order.createdAt).format('MMM D, YYYY')}</span>
                                                <span className="text-xs text-gray-500">{dayjs(order.createdAt).format('h:mm A')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900 block">{order.orderNumber}</span>
                                            <span className="text-xs text-gray-500">{order.items?.length || 0} items</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 block">{order.customerName}</span>
                                            <span className="text-xs text-gray-500">Table {order.tableNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            ${(order.total || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowInvoiceModal(true);
                                                }}
                                                className="inline-flex items-center gap-2 p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                title="View & Print Invoice"
                                            >
                                                <Printer className="w-4 h-4" />
                                                <span className="text-sm font-medium hidden sm:inline-block">Invoice</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-gray-700 px-3 text-sm font-medium">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Modal */}
            <AnimatePresence>
                {showInvoiceModal && selectedOrder && (
                    <InvoiceModal
                        order={selectedOrder}
                        restaurant={selectedOrder.restaurant || restaurants.find(r => r._id === selectedRestaurantId)} // Fallback if order doesn't populate it
                        onClose={() => setShowInvoiceModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transactions;
