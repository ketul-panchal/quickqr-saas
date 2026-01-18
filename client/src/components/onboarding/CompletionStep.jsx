import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Rocket, 
  Check, 
  QrCode, 
  Settings, 
  ChefHat,
  Loader2,
  PartyPopper,
  ExternalLink
} from 'lucide-react';

const CompletionStep = ({ formData, onComplete, onBack, isLoading }) => {
  const summaryItems = [
    {
      icon: <ChefHat className="w-5 h-5" />,
      label: 'Restaurant',
      value: formData.restaurantInfo.restaurantName || 'Not provided',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Categories',
      value: `${formData.menuSetup.categories?.length || 0} categories`,
    },
    {
      icon: <QrCode className="w-5 h-5" />,
      label: 'Theme',
      value: formData.themeSettings.theme?.charAt(0).toUpperCase() + formData.themeSettings.theme?.slice(1) || 'Modern',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="mb-8"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl mb-6 shadow-lg shadow-emerald-200">
          <PartyPopper className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          You&apos;re All Set! 🎉
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Your digital menu is ready to launch. Here&apos;s a summary of your setup:
        </p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
      >
        <h3 className="font-semibold text-gray-900 mb-4 text-left">Setup Summary</h3>
        <div className="space-y-4">
          {summaryItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sky-600 shadow-sm">
                  {item.icon}
                </div>
                <span className="text-gray-600">{item.label}</span>
              </div>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Color Preview */}
        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg shadow-sm"
              style={{ backgroundColor: formData.themeSettings.primaryColor }}
            />
            <span className="text-gray-600">Primary Color</span>
          </div>
          <span className="font-medium text-gray-900 font-mono">
            {formData.themeSettings.primaryColor}
          </span>
        </div>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-sky-50 rounded-2xl p-6 mb-8 text-left"
      >
        <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
        <ul className="space-y-3">
          {[
            'Your account will be created with a free trial',
            'You can add menu items and customize your menu',
            'Generate QR codes for each table',
            'Start accepting contactless orders!',
          ].map((text, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-gray-700">{text}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
      >
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <button
          onClick={onComplete}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating your menu...</span>
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              <span>Launch My Menu</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Terms */}
      <p className="text-gray-500 text-sm mt-6">
        By clicking &quot;Launch My Menu&quot;, you agree to our{' '}
        <a href="#" className="text-sky-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-sky-600 hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
};

export default CompletionStep;