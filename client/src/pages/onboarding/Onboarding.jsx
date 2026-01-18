import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  QrCode, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Building2,
  UtensilsCrossed,
  Palette,
  Rocket,
  Sparkles
} from 'lucide-react';

// Step Components
import WelcomeStep from '../../components/onboarding/WelcomeStep';
import RestaurantInfoStep from '../../components/onboarding/RestaurantInfoStep';
import MenuSetupStep from '../../components/onboarding/MenuSetupStep';
import ThemeStep from '../../components/onboarding/ThemeStep';
import CompletionStep from '../../components/onboarding/CompletionStep';

const STEPS = [
  { id: 'welcome', label: 'Welcome', icon: Sparkles },
  { id: 'restaurant_info', label: 'Restaurant Info', icon: Building2 },
  { id: 'menu_setup', label: 'Menu Setup', icon: UtensilsCrossed },
  { id: 'theme_selection', label: 'Theme', icon: Palette },
  { id: 'completion', label: 'Complete', icon: Rocket },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantInfo: {
      restaurantName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      cuisineType: [],
      description: '',
    },
    menuSetup: {
      categories: [],
      sampleItems: false,
    },
    themeSettings: {
      theme: 'modern',
      primaryColor: '#0ea5e9',
      secondaryColor: '#22c55e',
      fontFamily: 'Inter',
    },
  });

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Restaurant setup completed successfully!');
      // Navigate to dashboard (when ready)
      // navigate('/dashboard');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} />;
      case 'restaurant_info':
        return (
          <RestaurantInfoStep
            data={formData.restaurantInfo}
            updateData={(data) => updateFormData('restaurantInfo', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'menu_setup':
        return (
          <MenuSetupStep
            data={formData.menuSetup}
            updateData={(data) => updateFormData('menuSetup', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'theme_selection':
        return (
          <ThemeStep
            data={formData.themeSettings}
            updateData={(data) => updateFormData('themeSettings', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'completion':
        return (
          <CompletionStep
            formData={formData}
            onComplete={handleComplete}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">QuickQR</span>
            </div>

            {/* Step Indicator - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-sky-500 text-white ring-4 ring-sky-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-12 h-1 mx-1 rounded transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Counter - Mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </div>

            {/* Skip Button */}
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Exit Setup
            </button>
          </div>
        </div>

        {/* Progress Bar - Mobile */}
        <div className="md:hidden h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;