import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Table2,
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronDown,
    Loader2,
    Users,
    X,
    Check,
    MapPin,
    Hash,
    Copy,
    QrCode,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { tableApi } from '../../api/table.api';
import QRCodeGenerator from '../../components/qr/QRCodeGenerator';

const AdminTables = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTables, setLoadingTables] = useState(false);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    // Modals
    const [editTable, setEditTable] = useState(null);
    const [showTableModal, setShowTableModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [qrTable, setQrTable] = useState(null);

    // Fetch restaurants on mount
    useEffect(() => {
        fetchRestaurants();
    }, []);

    // Fetch tables when restaurant changes
    useEffect(() => {
        if (selectedRestaurant) {
            fetchTables();
        }
    }, [selectedRestaurant]);

    const fetchRestaurants = async () => {
        try {
            const response = await adminApi.getRestaurants();
            const data = response.data?.restaurants || response.data || [];
            setRestaurants(data);
            if (data.length > 0) {
                setSelectedRestaurant(data[0]);
            }
        } catch (error) {
            toast.error('Failed to load restaurants');
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async () => {
        if (!selectedRestaurant) return;
        setLoadingTables(true);
        try {
            const response = await tableApi.getTables(selectedRestaurant._id);
            setTables(response.data?.tables || []);
        } catch (error) {
            toast.error('Failed to load tables');
            setTables([]);
        } finally {
            setLoadingTables(false);
        }
    };

    // Save table
    const handleSaveTable = async (formData) => {
        try {
            setSaving(true);
            if (editTable?._id) {
                await tableApi.updateTable(selectedRestaurant._id, editTable._id, formData);
                toast.success('Table updated');
            } else {
                await tableApi.createTable(selectedRestaurant._id, formData);
                toast.success('Table created');
            }
            fetchTables();
            setShowTableModal(false);
            setEditTable(null);
        } catch (error) {
            toast.error(error.message || 'Failed to save table');
        } finally {
            setSaving(false);
        }
    };

    // Bulk create tables
    const handleBulkCreate = async (bulkData) => {
        try {
            setSaving(true);
            const response = await tableApi.createBulkTables(selectedRestaurant._id, bulkData);
            toast.success(response.message || `${response.data?.count || 0} tables created`);
            fetchTables();
            setShowBulkModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to create tables');
        } finally {
            setSaving(false);
        }
    };

    // Delete table
    const handleDeleteTable = async () => {
        if (!deleteConfirm) return;
        try {
            setSaving(true);
            await tableApi.deleteTable(selectedRestaurant._id, deleteConfirm._id);
            toast.success('Table deleted');
            setTables(tables.filter(t => t._id !== deleteConfirm._id));
            setDeleteConfirm(null);
        } catch (error) {
            toast.error('Failed to delete table');
        } finally {
            setSaving(false);
        }
    };

    // Filter tables
    const filteredTables = tables.filter(table =>
        table.name?.toLowerCase().includes(search.toLowerCase()) ||
        table.number?.toString().includes(search)
    );

    // Location labels
    const locationLabels = {
        indoor: { label: 'Indoor', color: 'bg-blue-500/10 text-blue-400' },
        outdoor: { label: 'Outdoor', color: 'bg-green-500/10 text-green-400' },
        terrace: { label: 'Terrace', color: 'bg-purple-500/10 text-purple-400' },
        private: { label: 'Private', color: 'bg-amber-500/10 text-amber-400' },
        bar: { label: 'Bar', color: 'bg-red-500/10 text-red-400' },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
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
                        <Table2 className="w-7 h-7 text-blue-400" />
                        Table Management
                    </h1>
                    <p className="text-gray-400 mt-1">View and manage restaurant tables</p>
                </div>

                {/* Restaurant Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white min-w-[200px] hover:bg-slate-700 transition-colors"
                    >
                        <span className="truncate">{selectedRestaurant?.name || 'Select Restaurant'}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRestaurantDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showRestaurantDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-64 overflow-auto"
                            >
                                {restaurants.map(restaurant => (
                                    <button
                                        key={restaurant._id}
                                        onClick={() => {
                                            setSelectedRestaurant(restaurant);
                                            setShowRestaurantDropdown(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedRestaurant?._id === restaurant._id ? 'bg-blue-500/10 text-blue-400' : 'text-white'
                                            }`}
                                    >
                                        {restaurant.name}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search tables..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={() => setShowBulkModal(true)}
                    disabled={!selectedRestaurant}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Copy className="w-5 h-5" />
                    Bulk Create
                </button>
                <button
                    onClick={() => {
                        setEditTable(null);
                        setShowTableModal(true);
                    }}
                    disabled={!selectedRestaurant}
                    className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <Plus className="w-5 h-5" />
                    Add Table
                </button>
            </div>

            {/* Tables Grid */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                {loadingTables ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : !selectedRestaurant ? (
                    <div className="text-center py-12">
                        <Table2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Select a restaurant to view tables</p>
                    </div>
                ) : filteredTables.length === 0 ? (
                    <div className="text-center py-12">
                        <Table2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">
                            {search ? 'No tables match your search' : 'No tables yet'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setShowBulkModal(true)}
                                className="text-blue-400 hover:text-blue-300 font-medium"
                            >
                                Create tables in bulk
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {filteredTables.map(table => (
                            <motion.div
                                key={table._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                            <Hash className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{table.name}</h3>
                                            <p className="text-sm text-gray-400">Table #{table.number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditTable(table);
                                                setShowTableModal(true);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(table)}
                                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {table.capacity} seats
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${locationLabels[table.location]?.color || 'bg-gray-500/10 text-gray-400'}`}>
                                        {locationLabels[table.location]?.label || table.location}
                                    </span>
                                </div>

                                {/* QR Button */}
                                <button
                                    onClick={() => setQrTable(table)}
                                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <QrCode className="w-4 h-4" />
                                    View QR Code
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Table Modal */}
            <TableModal
                isOpen={showTableModal}
                table={editTable}
                onClose={() => {
                    setShowTableModal(false);
                    setEditTable(null);
                }}
                onSave={handleSaveTable}
                saving={saving}
            />

            {/* Bulk Create Modal */}
            <BulkModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                onSave={handleBulkCreate}
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
                            <h3 className="text-xl font-bold text-white mb-2">Delete Table</h3>
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
                                    onClick={handleDeleteTable}
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

            {/* QR Code Modal */}
            {qrTable && (
                <QRCodeGenerator
                    table={qrTable}
                    restaurantSlug={selectedRestaurant?.slug}
                    restaurantId={selectedRestaurant?._id}
                    onClose={() => setQrTable(null)}
                />
            )}
        </div>
    );
};

// Table Modal Component
const TableModal = ({ isOpen, table, onClose, onSave, saving }) => {
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        capacity: 4,
        location: 'indoor',
    });

    useEffect(() => {
        if (table) {
            setFormData({
                name: table.name || '',
                number: table.number?.toString() || '',
                capacity: table.capacity || 4,
                location: table.location || 'indoor',
            });
        } else {
            setFormData({ name: '', number: '', capacity: 4, location: 'indoor' });
        }
    }, [table, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.number) {
            toast.error('Name and number are required');
            return;
        }
        onSave({
            ...formData,
            number: parseInt(formData.number),
            capacity: parseInt(formData.capacity),
        });
    };

    if (!isOpen) return null;

    const locations = ['indoor', 'outdoor', 'terrace', 'private', 'bar'];

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
                            {table?._id ? 'Edit Table' : 'Add Table'}
                        </h3>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Table 1"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Number *</label>
                                <input
                                    type="number"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    placeholder="1"
                                    min="1"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Capacity</label>
                                <input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    min="1"
                                    max="20"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                                <select
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>
                                            {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                        </option>
                                    ))}
                                </select>
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
                                {table?._id ? 'Save Changes' : 'Add Table'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Bulk Create Modal Component
const BulkModal = ({ isOpen, onClose, onSave, saving }) => {
    const [formData, setFormData] = useState({
        startNumber: 1,
        endNumber: 10,
        prefix: 'Table',
        location: 'indoor',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.startNumber > formData.endNumber) {
            toast.error('End number must be greater than start number');
            return;
        }
        onSave({
            startNumber: parseInt(formData.startNumber),
            endNumber: parseInt(formData.endNumber),
            prefix: formData.prefix,
            location: formData.location,
        });
    };

    if (!isOpen) return null;

    const locations = ['indoor', 'outdoor', 'terrace', 'private', 'bar'];

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
                        <h3 className="text-lg font-semibold text-white">Bulk Create Tables</h3>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Table Prefix</label>
                            <input
                                type="text"
                                value={formData.prefix}
                                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                placeholder="Table"
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Start Number</label>
                                <input
                                    type="number"
                                    value={formData.startNumber}
                                    onChange={(e) => setFormData({ ...formData, startNumber: e.target.value })}
                                    min="1"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">End Number</label>
                                <input
                                    type="number"
                                    value={formData.endNumber}
                                    onChange={(e) => setFormData({ ...formData, endNumber: e.target.value })}
                                    min="1"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>
                                        {loc.charAt(0).toUpperCase() + loc.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <p className="text-sm text-gray-400">
                            This will create tables numbered {formData.startNumber || '?'} to {formData.endNumber || '?'} with names like "{formData.prefix} 1", "{formData.prefix} 2", etc.
                        </p>

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
                                Create Tables
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminTables;
