// import { Routes, Route } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import Home from './pages/public/Home';
// import Onboarding from './pages/onboarding/Onboarding';
// import NotFound from './pages/errors/NotFound';

// function App() {
//   return (
//     <>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/onboarding" element={<Onboarding />} />
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//       <Toaster 
//         position="top-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#1e293b',
//             color: '#fff',
//             borderRadius: '12px',
//           },
//         }}
//       />
//     </>
//   );
// }

// export default App;

import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/public/Home';
import PublicMenu from './pages/public/PublicMenu';
import Onboarding from './pages/onboarding/Onboarding';
import { Login, Register } from './pages/auth';
import {
  Dashboard,
  AddRestaurant,
  EditRestaurant,
  MyRestaurants,
  MenuManagement,
  OrderManagement,
  TablesManagement,
  Settings,
  Orders,
} from './pages/dashboard';
import { AdminLogin, AdminDashboard, AdminUsers, AdminRestaurants, AdminRestaurantForm, AdminMenus, AdminTables } from './pages/admin';
import NotFound from './pages/errors/NotFound';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Public Menu */}
            <Route path="/menu/:slug" element={<PublicMenu />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="restaurants" element={<MyRestaurants />} />
              <Route path="restaurants/new" element={<AddRestaurant />} />
              <Route path="restaurants/:id/edit" element={<EditRestaurant />} />
              <Route path="restaurants/:id/menu" element={<MenuManagement />} />
              <Route path="restaurants/:id/orders" element={<OrderManagement />} />
              <Route path="restaurants/:id/tables" element={<TablesManagement />} />
              <Route path="orders" element={<Orders />} />
              <Route path="qr-codes" element={<PlaceholderPage title="QR Codes" />} />
              <Route path="membership" element={<PlaceholderPage title="Membership" />} />
              <Route path="transactions" element={<PlaceholderPage title="Transactions" />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="restaurants" element={<AdminRestaurants />} />
              <Route path="restaurants/new" element={<AdminRestaurantForm />} />
              <Route path="restaurants/:id/edit" element={<AdminRestaurantForm />} />
              <Route path="menus" element={<AdminMenus />} />
              <Route path="tables" element={<AdminTables />} />
              <Route path="transactions" element={<PlaceholderPage title="Transactions" />} />
              <Route path="settings" element={<PlaceholderPage title="Admin Settings" />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">This page is coming soon!</p>
    </div>
  </div>
);

export default App;