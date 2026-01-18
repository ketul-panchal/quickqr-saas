import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Search,
  Grid3X3,
  Edit,
  Trash2,
  QrCode,
  Users,
  MapPin,
  Loader2,
  X,
  Download,
  Check,
  MoreVertical,
  Copy,
  Eye,
  Settings,
} from 'lucide-react';
import { tableApi } from '../../api/table.api';
import { restaurantApi } from '../../api/restaurant.api';
import QRCodeGenerator from '../../components/qr/QRCodeGenerator';

const locationOptions = [
  { value: 'indoor', label: 'Indoor', icon: '🏠' },
  { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
  { value: 'terrace', label: 'Terrace', icon: '☀️' },
  { value: 'private', label: 'Private Room', icon: '🚪' },
  { value: 'bar', label: 'Bar', icon: '🍸' },
];

const TablesManagement = () => {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTables, setSelectedTables] = useState([]);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [qrTable, setQrTable] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchTables();
  }, [restaurantId]);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await tableApi.getTables(restaurantId);
      setTables(response.data.tables || []);
      setRestaurant(response.data.restaurant);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async (data) => {
    try {
      const response = await tableApi.createTable(restaurantId, data);
      setTables([...tables, response.data]);
      toast.success('Table created successfully');
      setShowAddModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create table');
    }
  };

  const handleCreateBulk = async (data) => {
    try {
      const response = await tableApi.createBulkTables(restaurantId, data);
      setTables([...tables, ...response.data.tables]);
      toast.success(`${response.data.count} tables created`);
      setShowBulkModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to create tables');
    }
  };

  const handleUpdateTable = async (tableId, data) => {
    try {
      const response = await tableApi.updateTable(restaurantId, tableId, data);
      setTables(tables.map(t => t._id === tableId ? response.data : t));
      toast.success('Table updated');
      setEditTable(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update table');
    }
  };

  const handleDeleteTable = async (tableId) => {
    try {
      await tableApi.deleteTable(restaurantId, tableId);
      setTables(tables.filter(t => t._id !== tableId));
      toast.success('Table deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await tableApi.deleteBulkTables(restaurantId, selectedTables);
      setTables(tables.filter(t => !selectedTables.includes(t._id)));
      setSelectedTables([]);
      toast.success('Tables deleted');
    } catch (error) {
      toast.error('Failed to delete tables');
    }
  };

  const toggleSelectTable = (tableId) => {
    setSelectedTables(prev =>
      prev.includes(tableId)
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tables.map(t => t._id));
    }
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    table.number.toString().includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
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
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tables</h1>
          <p className="text-gray-500">{restaurant?.name} - {tables.length} tables</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
          >
            Bulk Add
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600"
          >
            <Plus className="w-4 h-4" />
            Add Table
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {selectedTables.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{selectedTables.length} selected</span>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tables yet</h3>
          <p className="text-gray-500 mb-4">Add tables to generate QR codes</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600"
          >
            Add First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <TableCard
              key={table._id}
              table={table}
              restaurantSlug={restaurant?.slug}
              isSelected={selectedTables.includes(table._id)}
              onSelect={() => toggleSelectTable(table._id)}
              onEdit={() => setEditTable(table)}
              onDelete={() => setDeleteConfirm(table)}
              onQR={() => setQrTable(table)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddTableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateTable}
        existingNumbers={tables.map(t => t.number)}
      />

      <BulkAddModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSubmit={handleCreateBulk}
      />

      <EditTableModal
        table={editTable}
        onClose={() => setEditTable(null)}
        onSubmit={(data) => handleUpdateTable(editTable._id, data)}
      />

      <QRCodeModal
        table={qrTable}
        restaurantSlug={restaurant?.slug}
        restaurantId={restaurantId}
        onClose={() => setQrTable(null)}
      />

      <DeleteConfirmModal
        table={deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeleteTable(deleteConfirm._id)}
      />
    </div>
  );
};

// Table Card Component
const TableCard = ({ table, restaurantSlug, isSelected, onSelect, onEdit, onDelete, onQR }) => {
  const location = locationOptions.find(l => l.value === table.location);
  const menuUrl = `${window.location.origin}/menu/${restaurantSlug}?table=${table.number}`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(menuUrl);
    toast.success('URL copied!');
  };

  return (
    <motion.div
      layout
      className={`bg-white rounded-2xl border-2 p-4 transition-all ${
        isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-sky-500 rounded"
          />
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-sky-600">{table.number}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          table.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {table.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900">{table.name}</h3>
      
      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {table.capacity}
        </span>
        <span className="flex items-center gap-1">
          {location?.icon} {location?.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={onQR}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 text-sm font-medium"
        >
          <QrCode className="w-4 h-4" />
          QR Code
        </button>
        <button
          onClick={copyUrl}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Add Table Modal
const AddTableModal = ({ isOpen, onClose, onSubmit, existingNumbers }) => {
  const [formData, setFormData] = useState({
    name: '',
    number: 1,
    capacity: 4,
    location: 'indoor',
  });

  useEffect(() => {
    if (isOpen) {
      const nextNumber = existingNumbers.length > 0 
        ? Math.max(...existingNumbers) + 1 
        : 1;
      setFormData(prev => ({ ...prev, number: nextNumber, name: `Table ${nextNumber}` }));
    }
  }, [isOpen, existingNumbers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal title="Add Table" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value), name: `Table ${e.target.value}` })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="grid grid-cols-3 gap-2">
            {locationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ ...formData, location: opt.value })}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  formData.location === opt.value
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{opt.icon}</span>
                <span className="text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600">
            Add Table
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Bulk Add Modal
const BulkAddModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    startNumber: 1,
    endNumber: 10,
    prefix: 'Table',
    location: 'indoor',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal title="Bulk Add Tables" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Number</label>
            <input
              type="number"
              value={formData.startNumber}
              onChange={(e) => setFormData({ ...formData, startNumber: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Number</label>
            <input
              type="number"
              value={formData.endNumber}
              onChange={(e) => setFormData({ ...formData, endNumber: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name Prefix</label>
          <input
            type="text"
            value={formData.prefix}
            onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
            placeholder="Table"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <p className="text-sm text-gray-500">
          This will create {Math.max(0, formData.endNumber - formData.startNumber + 1)} tables
          ({formData.prefix} {formData.startNumber} to {formData.prefix} {formData.endNumber})
        </p>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600">
            Create Tables
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Edit Table Modal
const EditTableModal = ({ table, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    number: 1,
    capacity: 4,
    location: 'indoor',
    isActive: true,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        name: table.name,
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        isActive: table.isActive,
      });
    }
  }, [table]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!table) return null;

  return (
    <Modal title="Edit Table" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-sky-500 rounded"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="flex-1 px-4 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Delete Confirm Modal
const DeleteConfirmModal = ({ table, onClose, onConfirm }) => {
  if (!table) return null;

  return (
    <Modal title="Delete Table" onClose={onClose}>
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{table.name}</strong>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Modal Wrapper
const Modal = ({ title, children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl w-full max-w-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

// QR Code Modal - Will be in next part
const QRCodeModal = ({ table, restaurantSlug, restaurantId, onClose }) => {
  // This will be the full QR generator
  if (!table) return null;
  
  return (
    <QRCodeGenerator
      table={table}
      restaurantSlug={restaurantSlug}
      restaurantId={restaurantId}
      onClose={onClose}
    />
  );
};

export default TablesManagement;