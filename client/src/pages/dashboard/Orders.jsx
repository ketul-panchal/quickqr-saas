
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Plus } from 'lucide-react';
import { restaurantApi } from '../../api/restaurant.api';
import OrderManagement from './OrderManagement';
import toast from 'react-hot-toast';

const Orders = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await restaurantApi.getMyRestaurants();
            const restaurantList = res.data.restaurants || [];
            setRestaurants(restaurantList);

            // Auto-select first restaurant if available
            if (restaurantList.length > 0) {
                setSelectedRestaurantId(restaurantList[0]._id);
            }
        } catch (error) {
            toast.error('Failed to load restaurants');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    // No restaurants state
    if (restaurants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="p-4 bg-sky-50 rounded-full mb-4">
                    <Store className="w-12 h-12 text-sky-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Restaurants Found</h2>
                <p className="text-gray-500 max-w-md mb-6">
                    You need to create a restaurant before you can manage orders.
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
            {/* Restaurant Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Restaurant</label>
                            <p className="text-xs text-gray-500">Manage orders for:</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md">
                        <select
                            value={selectedRestaurantId}
                            onChange={(e) => setSelectedRestaurantId(e.target.value)}
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
            </div>

            {/* Order Management Component */}
            {selectedRestaurantId && (
                <OrderManagement restaurantId={selectedRestaurantId} />
            )}
        </div>
    );
};

export default Orders;
