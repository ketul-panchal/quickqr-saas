import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { settingsApi } from '../../api/settings.api';
import toast from 'react-hot-toast';
import {
    User,
    Shield,
    CreditCard,
    Camera,
    Trash2,
    Check,
    X,
    Eye,
    EyeOff,
    Loader2,
    Save,
    AlertCircle,
    CheckCircle,
    Building2,
    UserCircle,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get full image URL
const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
};

// Tab configuration
const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
];

// Countries list
const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
    'India', 'Japan', 'China', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands',
    'Sweden', 'Norway', 'Denmark', 'Finland', 'Singapore', 'United Arab Emirates',
    'Saudi Arabia', 'South Africa', 'New Zealand', 'Ireland', 'Belgium', 'Austria',
    'Switzerland', 'Portugal', 'Poland', 'Czech Republic', 'Other'
];

// ✅ MOVED OUTSIDE: Input component
const InputField = ({ label, type = 'text', value, onChange, placeholder, disabled, suffix, error, name }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-sky-500'} focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
            />
            {suffix && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {suffix}
                </div>
            )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
);

// ✅ MOVED OUTSIDE: Password input component
const PasswordField = ({ label, value, onChange, placeholder, showPassword, onToggleShow, name }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
            />
            <button
                type="button"
                onClick={onToggleShow}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
    </div>
);

const Settings = () => {
    const { user, updateProfile: updateAuthProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Profile state
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        username: '',
        email: '',
        avatar: null,
    });
    const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

    // Billing state
    const [billingData, setBillingData] = useState({
        type: 'personal',
        name: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });

    // ✅ OPTIMIZED: Memoized handlers to prevent unnecessary re-renders
    const handleProfileChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            setProfileData(prev => ({ 
                ...prev, 
                [name]: value.toLowerCase().replace(/[^a-z0-9_]/g, '') 
            }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handlePasswordChange = useCallback((e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleBillingChange = useCallback((e) => {
        const { name, value } = e.target;
        setBillingData(prev => ({ ...prev, [name]: value }));
    }, []);

    const togglePasswordVisibility = useCallback((key) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    // Load initial data
    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                username: user.username || '',
                email: user.email || '',
                avatar: user.avatar || null,
            });
            setAvatarPreview(user.avatar ? getImageUrl(user.avatar) : null);
        }
    }, [user]);

    // Load billing data when tab changes
    useEffect(() => {
        if (activeTab === 'billing') {
            loadBillingData();
        }
    }, [activeTab]);

    const loadBillingData = async () => {
        try {
            setIsLoading(true);
            const response = await settingsApi.getBilling();
            if (response.data) {
                setBillingData({
                    type: response.data.type || 'personal',
                    name: response.data.name || '',
                    address: response.data.address || '',
                    city: response.data.city || '',
                    state: response.data.state || '',
                    postalCode: response.data.postalCode || '',
                    country: response.data.country || '',
                });
            }
        } catch (error) {
            console.error('Error loading billing data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Check password strength
    const checkPasswordStrength = useCallback((password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        const strengthMap = {
            0: { label: 'Very Weak', color: 'bg-red-500' },
            1: { label: 'Weak', color: 'bg-red-400' },
            2: { label: 'Fair', color: 'bg-orange-500' },
            3: { label: 'Good', color: 'bg-yellow-500' },
            4: { label: 'Strong', color: 'bg-green-400' },
            5: { label: 'Very Strong', color: 'bg-green-500' },
            6: { label: 'Excellent', color: 'bg-emerald-500' },
        };

        setPasswordStrength({ score, ...strengthMap[score] });
    }, []);

    // Check username availability
    const checkUsernameAvailability = useCallback(async (username) => {
        if (!username || username.length < 3) {
            setUsernameStatus({ checking: false, available: null, message: '' });
            return;
        }

        // Skip if it's current username
        if (username.toLowerCase() === user?.username?.toLowerCase()) {
            setUsernameStatus({ checking: false, available: true, message: 'Current username' });
            return;
        }

        setUsernameStatus({ checking: true, available: null, message: 'Checking...' });

        try {
            const response = await settingsApi.checkUsernameAvailability(username);
            setUsernameStatus({
                checking: false,
                available: response.data.isAvailable,
                message: response.data.isAvailable ? 'Available' : 'Already taken',
            });
        } catch (error) {
            setUsernameStatus({ checking: false, available: null, message: 'Error checking' });
        }
    }, [user?.username]);

    // Debounce username check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (profileData.username) {
                checkUsernameAvailability(profileData.username);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [profileData.username, checkUsernameAvailability]);

    // Debounce password strength check
    useEffect(() => {
        checkPasswordStrength(passwordData.newPassword);
    }, [passwordData.newPassword, checkPasswordStrength]);

    // Handle avatar selection
    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = async () => {
        if (!avatarFile) return;

        try {
            setIsSaving(true);
            const response = await settingsApi.uploadAvatar(avatarFile);
            const newAvatarUrl = response.data.avatar;
            setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
            setAvatarPreview(getImageUrl(newAvatarUrl));
            setAvatarFile(null);

            // Update auth context
            if (updateAuthProfile) {
                await updateAuthProfile({ avatar: newAvatarUrl });
            }

            toast.success('Avatar uploaded successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to upload avatar');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle avatar delete
    const handleAvatarDelete = async () => {
        try {
            setIsSaving(true);
            await settingsApi.deleteAvatar();
            setProfileData(prev => ({ ...prev, avatar: null }));
            setAvatarPreview(null);
            setAvatarFile(null);

            // Update auth context
            if (updateAuthProfile) {
                await updateAuthProfile({ avatar: null });
            }

            toast.success('Avatar removed successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to remove avatar');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle profile save
    const handleProfileSave = async () => {
        if (usernameStatus.checking || usernameStatus.available === false) {
            toast.error('Please choose a valid username');
            return;
        }

        try {
            setIsSaving(true);

            // Upload avatar first if there's a new one
            if (avatarFile) {
                await handleAvatarUpload();
            }

            // Update profile
            const response = await settingsApi.updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                username: profileData.username || null,
            });

            // Update auth context
            if (updateAuthProfile) {
                await updateAuthProfile(response.data);
            }

            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle password save
    const handlePasswordSave = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        try {
            setIsSaving(true);
            await settingsApi.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
            });

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            toast.success('Password updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle billing save
    const handleBillingSave = async () => {
        try {
            setIsSaving(true);
            await settingsApi.updateBilling(billingData);
            toast.success('Billing details updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update billing details');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 relative ${isActive
                                    ? 'text-sky-600 bg-sky-50/50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-gray-400'}`} />
                                <span>{tab.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-8"
                            >
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                                            {avatarPreview ? (
                                                <img
                                                    src={avatarPreview}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-3xl font-bold text-white">
                                                    {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                        >
                                            <Camera className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarSelect}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                                        <p className="text-sm text-gray-500 mb-3">
                                            Upload a photo to personalize your account. Max size 5MB.
                                        </p>
                                        <div className="flex gap-3">
                                            {avatarFile && (
                                                <button
                                                    onClick={handleAvatarUpload}
                                                    disabled={isSaving}
                                                    className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    Save Photo
                                                </button>
                                            )}
                                            {profileData.avatar && (
                                                <button
                                                    onClick={handleAvatarDelete}
                                                    disabled={isSaving}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label="First Name"
                                        name="firstName"
                                        value={profileData.firstName}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your first name"
                                    />
                                    <InputField
                                        label="Last Name"
                                        name="lastName"
                                        value={profileData.lastName}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your last name"
                                    />
                                    <InputField
                                        label="Username"
                                        name="username"
                                        value={profileData.username}
                                        onChange={handleProfileChange}
                                        placeholder="Enter a unique username"
                                        suffix={
                                            usernameStatus.checking ? (
                                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                            ) : usernameStatus.available === true ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : usernameStatus.available === false ? (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            ) : null
                                        }
                                        error={usernameStatus.available === false ? usernameStatus.message : null}
                                    />
                                    <InputField
                                        label="Phone"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your phone number"
                                    />
                                    <div className="md:col-span-2">
                                        <InputField
                                            label="Email"
                                            name="email"
                                            value={profileData.email}
                                            disabled={true}
                                            placeholder="Your email address"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">Email cannot be changed</p>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleProfileSave}
                                        disabled={isSaving || usernameStatus.available === false}
                                        className="px-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h3>
                                    <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                                </div>

                                <div className="space-y-4 max-w-md">
                                    <PasswordField
                                        label="Current Password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter current password"
                                        showPassword={showPasswords.current}
                                        onToggleShow={() => togglePasswordVisibility('current')}
                                    />
                                    <PasswordField
                                        label="New Password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter new password"
                                        showPassword={showPasswords.new}
                                        onToggleShow={() => togglePasswordVisibility('new')}
                                    />

                                    {/* Password Strength Indicator */}
                                    {passwordData.newPassword && (
                                        <div className="space-y-2">
                                            <div className="flex gap-1">
                                                {[...Array(6)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                                Password strength: {passwordStrength.label}
                                            </p>
                                        </div>
                                    )}

                                    <PasswordField
                                        label="Confirm New Password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm new password"
                                        showPassword={showPasswords.confirm}
                                        onToggleShow={() => togglePasswordVisibility('confirm')}
                                    />

                                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            Passwords do not match
                                        </p>
                                    )}
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handlePasswordSave}
                                        disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                        className="px-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                                        Update Password
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <motion.div
                                key="billing"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Billing Details</h3>
                                            <p className="text-sm text-gray-500">Manage your billing information for invoices and payments</p>
                                        </div>

                                        {/* Account Type */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700">Account Type</label>
                                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                                <button
                                                    onClick={() => setBillingData(prev => ({ ...prev, type: 'personal' }))}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${billingData.type === 'personal'
                                                        ? 'border-sky-500 bg-sky-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <UserCircle className={`w-6 h-6 ${billingData.type === 'personal' ? 'text-sky-600' : 'text-gray-400'}`} />
                                                    <span className={`font-medium ${billingData.type === 'personal' ? 'text-sky-600' : 'text-gray-700'}`}>
                                                        Personal
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setBillingData(prev => ({ ...prev, type: 'business' }))}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${billingData.type === 'business'
                                                        ? 'border-sky-500 bg-sky-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <Building2 className={`w-6 h-6 ${billingData.type === 'business' ? 'text-sky-600' : 'text-gray-400'}`} />
                                                    <span className={`font-medium ${billingData.type === 'business' ? 'text-sky-600' : 'text-gray-700'}`}>
                                                        Business
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Billing Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <InputField
                                                    label={billingData.type === 'business' ? 'Business Name' : 'Full Name'}
                                                    name="name"
                                                    value={billingData.name}
                                                    onChange={handleBillingChange}
                                                    placeholder={billingData.type === 'business' ? 'Enter business name' : 'Enter full name'}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputField
                                                    label="Address"
                                                    name="address"
                                                    value={billingData.address}
                                                    onChange={handleBillingChange}
                                                    placeholder="Street address"
                                                />
                                            </div>
                                            <InputField
                                                label="City"
                                                name="city"
                                                value={billingData.city}
                                                onChange={handleBillingChange}
                                                placeholder="Enter city"
                                            />
                                            <InputField
                                                label="State / Province"
                                                name="state"
                                                value={billingData.state}
                                                onChange={handleBillingChange}
                                                placeholder="Enter state or province"
                                            />
                                            <InputField
                                                label="Postal Code"
                                                name="postalCode"
                                                value={billingData.postalCode}
                                                onChange={handleBillingChange}
                                                placeholder="Enter postal code"
                                            />
                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                                <select
                                                    name="country"
                                                    value={billingData.country}
                                                    onChange={handleBillingChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-white"
                                                >
                                                    <option value="">Select country</option>
                                                    {countries.map((country) => (
                                                        <option key={country} value={country}>
                                                            {country}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        <div className="flex justify-end pt-6 border-t border-gray-200">
                                            <button
                                                onClick={handleBillingSave}
                                                disabled={isSaving}
                                                className="px-6 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                Save Billing Details
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;