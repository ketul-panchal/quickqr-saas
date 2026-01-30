
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const InvoiceModal = ({ order, restaurant, onClose }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    if (!order || !restaurant) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:max-w-none print:max-h-none print:rounded-none"
                >
                    {/* Header Actions - Hidden in Print */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 print:hidden">
                        <h2 className="text-lg font-semibold text-gray-900">Order Invoice</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Print Invoice</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="flex-1 overflow-y-auto p-8 print:p-8 print:overflow-visible" ref={componentRef}>
                        {/* Restaurant Info */}
                        <div className="text-center mb-8 border-b pb-8">
                            {restaurant.logo?.url && (
                                <img
                                    src={restaurant.logo.url}
                                    alt={restaurant.name}
                                    className="w-24 h-24 object-contain mx-auto mb-4 rounded-xl"
                                />
                            )}
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                            <div className="text-gray-500 space-y-1 text-sm">
                                {restaurant.address?.fullAddress && (
                                    <p className="flex items-center justify-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {restaurant.address.fullAddress}
                                    </p>
                                )}
                                <div className="flex items-center justify-center gap-4">
                                    {restaurant.phone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {restaurant.phone}
                                        </p>
                                    )}
                                    {restaurant.email && (
                                        <p className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {restaurant.email}
                                        </p>
                                    )}
                                </div>
                                {restaurant.website && (
                                    <p className="flex items-center justify-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        {restaurant.website}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-gray-500 font-medium mb-1">Bill To:</h3>
                                <p className="text-lg font-bold text-gray-900">{order.customerName}</p>
                                <p className="text-gray-600">Table: {order.tableNumber}</p>
                                {order.phone && <p className="text-gray-600">Phone: {order.phone}</p>}
                            </div>
                            <div className="text-right">
                                <h3 className="text-gray-500 font-medium mb-1">Order Details:</h3>
                                <p className="text-gray-900"><span className="font-medium">Order #:</span> {order.orderNumber}</p>
                                <p className="text-gray-600"><span className="font-medium">Date:</span> {formatDate(order.createdAt)}</p>
                                <p className="text-gray-600"><span className="font-medium">Status:</span> <span className="uppercase">{order.status}</span></p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full mb-8">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="text-left py-3 font-semibold text-gray-900">Item</th>
                                    <th className="text-center py-3 font-semibold text-gray-900">Qty</th>
                                    <th className="text-right py-3 font-semibold text-gray-900">Price</th>
                                    <th className="text-right py-3 font-semibold text-gray-900">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-4">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            {item.notes && <p className="text-sm text-gray-500 mt-1">Note: {item.notes}</p>}
                                        </td>
                                        <td className="text-center py-4 text-gray-600">{item.quantity}</td>
                                        <td className="text-right py-4 text-gray-600">${item.price.toFixed(2)}</td>
                                        <td className="text-right py-4 font-medium text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary */}
                        <div className="flex justify-end border-t pt-8">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${order.subtotal.toFixed(2)}</span>
                                </div>
                                {order.tax > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax</span>
                                        <span>${order.tax.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                                    <span>Total</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-16 pt-8 border-t text-gray-500 text-sm">
                            <p>Thank you for dining with us!</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InvoiceModal;
