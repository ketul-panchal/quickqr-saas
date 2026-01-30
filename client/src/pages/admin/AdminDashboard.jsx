import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Store,
    Users,
    QrCode,
    DollarSign,
    TrendingUp,
    UserPlus,
    Calendar,
    ArrowUpRight,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { adminApi } from '../../api/admin.api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [earningsData, setEarningsData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, earningsRes, usersRes, recentUsersRes, transactionsRes] = await Promise.all([
                adminApi.getStats(),
                adminApi.getEarningsChart(),
                adminApi.getUsersChart(),
                adminApi.getRecentUsers(),
                adminApi.getRecentTransactions(),
            ]);

            setStats(statsRes.data);
            setEarningsData(earningsRes.data);
            setUsersData(usersRes.data);
            setRecentUsers(recentUsersRes.data);
            setTransactions(transactionsRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Restaurants', value: stats?.totalRestaurants || 0, icon: Store, color: 'sky', bg: 'bg-sky-50', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
        { title: 'Current Month Restaurants', value: stats?.currentMonthRestaurants || 0, icon: Store, color: 'rose', bg: 'bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
        { title: 'Total Scans', value: formatNumber(stats?.totalScans || 0), icon: QrCode, color: 'amber', bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
        { title: 'Current Month Scans', value: stats?.currentMonthScans || 0, icon: QrCode, color: 'amber', bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
        { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'sky', bg: 'bg-sky-50', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
        { title: 'Current Month Users', value: stats?.currentMonthUsers || 0, icon: UserPlus, color: 'rose', bg: 'bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
        { title: 'Total Earnings', value: `$${(stats?.totalEarnings || 0).toFixed(2)}`, icon: DollarSign, color: 'emerald', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { title: 'Current Month Earnings', value: `$${(stats?.currentMonthEarnings || 0).toFixed(2)}`, icon: DollarSign, color: 'emerald', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">ADMIN PANEL</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`${card.bg} rounded-2xl p-5 border border-white shadow-sm`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${card.iconBg}`}>
                                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                                <p className="text-sm text-slate-500 mt-1">{card.title}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Earnings Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Earnings Statistics</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={earningsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    formatter={(value) => [`$${value}`, 'Earnings']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Users Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Weekly Users</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usersData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    formatter={(value) => [value, 'Users']}
                                />
                                <Bar dataKey="users" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900">Recent Registered</h2>
                        <button className="px-4 py-1.5 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors">
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-slate-500 border-b border-slate-100">
                                    <th className="pb-4 font-medium">NAME</th>
                                    <th className="pb-4 font-medium">EMAIL</th>
                                    <th className="pb-4 font-medium">DATE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentUsers.map((user) => (
                                    <tr key={user._id} className="text-sm">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium">
                                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-900">{user.firstName} {user.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-500">{user.email}</td>
                                        <td className="py-4 text-slate-500">{dayjs(user.createdAt).fromNow()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>
                        <button className="px-4 py-1.5 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{tx.restaurant?.name || 'Order'}</p>
                                        <p className="text-sm text-slate-500">{dayjs(tx.createdAt).fromNow()}</p>
                                    </div>
                                </div>
                                <span className="font-semibold text-slate-900">${tx.total?.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export default AdminDashboard;
