import { motion } from 'framer-motion';
import { ArrowRight, QrCode, Zap, Clock, Shield } from 'lucide-react';

const WelcomeStep = ({ onNext }) => {
  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Quick Setup',
      description: 'Get your digital menu ready in under 5 minutes',
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'Instant QR Codes',
      description: 'Generate scannable QR codes for every table',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-time Updates',
      description: 'Update your menu anytime, changes reflect instantly',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Contactless & Safe',
      description: 'Provide a safe dining experience for customers',
    },
  ];

  return (
    <div className="text-center">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl mb-6 shadow-lg">
          <QrCode className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
            QuickQR
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Let&apos;s set up your digital menu and QR ordering system. 
          This will only take a few minutes!
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-left hover:shadow-xl transition-shadow"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-xl flex items-center justify-center text-sky-600 mb-4">
              {benefit.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {benefit.title}
            </h3>
            <p className="text-gray-600">{benefit.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={onNext}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <span>Let&apos;s Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          Takes approximately 3-5 minutes to complete
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;