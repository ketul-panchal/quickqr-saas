import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  CheckCircle2,
  AlertCircle,
  Star,
  Shield,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { settingsApi } from '../../api/settings.api';

const plans = [
  {
    id: 'free',
    name: 'Free',
    badge: 'Getting started',
    highlight: 'Best for testing',
    price: '₹0',
    description: 'Perfect to explore QuickQR and launch your first restaurant.',
    features: [
      '1 restaurant',
      'Up to 50 menu items',
      'Up to 500 scans / month',
      'Basic menu templates',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    badge: 'Popular',
    highlight: 'For small teams',
    price: 'Coming soon',
    description: 'Ideal for growing cafes and small restaurants.',
    features: [
      'Up to 3 restaurants',
      'Up to 200 menu items',
      'Up to 5,000 scans / month',
      'Menu analytics',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Recommended',
    highlight: 'For busy brands',
    price: 'Coming soon',
    description: 'Designed for restaurant groups and high traffic venues.',
    features: [
      'Up to 10 restaurants',
      'Up to 1,000 menu items',
      'Up to 50,000 scans / month',
      'Custom branding & advanced analytics',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Full access',
    highlight: 'Unlimited scale',
    price: 'Contact us',
    description: 'For chains and partners who need unlimited scale.',
    features: [
      'Unlimited restaurants (practical)',
      'Unlimited menu items (practical)',
      'Unlimited scans (practical)',
      'Custom SLAs & onboarding',
    ],
  },
];

const Membership = () => {
  const { user, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState(user?.subscription || null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const res = await settingsApi.getSubscription();
        setSubscription(res.data);
      } catch (error) {
        // Fallback to user context subscription
        setSubscription(user?.subscription || null);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  const handleChangePlan = async (planId) => {
    if (!user) return;

    // Admin / super admin already have full access
    if (user.role === 'admin' || user.role === 'super_admin') {
      toast('Admins already have full access to all features.', { icon: 'ℹ️' });
      return;
    }

    if (subscription?.plan === planId) {
      toast.success(`You are already on the ${planId} plan.`);
      return;
    }

    setIsLoading(true);
    try {
      await settingsApi.updateSubscription(planId);
      await refreshUser();
      const refreshed = await settingsApi.getSubscription();
      setSubscription(refreshed.data);
      toast.success(`Subscription updated to ${planId} plan.`);
    } catch (error) {
      toast.error(error.message || 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading membership...</span>
        </div>
      </div>
    );
  }

  const currentPlanId = subscription?.plan || 'free';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>Membership</span>
            <Crown className="w-7 h-7 text-amber-500" />
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Choose the subscription that matches your restaurant growth. You can switch plans
            anytime. **No payment is connected yet** – this is for access control only.
          </p>
        </div>
        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex items-center gap-3 max-w-sm">
          <Shield className="w-5 h-5 text-sky-600" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              Current plan:{' '}
              <span className="capitalize text-sky-600">{currentPlanId}</span>
            </p>
            <p className="text-gray-500 text-xs">
              Status: {subscription?.status || 'trial'}
            </p>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const isCurrent = plan.id === currentPlanId;
          const isEnterprise = plan.id === 'enterprise';

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative rounded-2xl border bg-white shadow-sm p-6 flex flex-col ${
                plan.id === 'professional'
                  ? 'border-sky-500 shadow-sky-100'
                  : 'border-gray-200'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  <Star className="w-3 h-3 text-amber-500" />
                  {plan.badge}
                </span>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Current
                  </span>
                )}
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {plan.name}
                </h2>
                <p className="text-sm text-sky-600 font-medium mt-1">
                  {plan.highlight}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900">{plan.price}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Billing integration coming soon – switching plans here only changes feature limits.
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-4 flex-1">{plan.description}</p>

              <ul className="space-y-2 mb-5 text-sm">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span className="text-gray-700">{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isLoading || isCurrent}
                onClick={() => !isEnterprise && handleChangePlan(plan.id)}
                className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors w-full ${
                  isCurrent
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : isEnterprise
                    ? 'bg-gray-100 text-gray-700 border border-gray-200 cursor-not-allowed'
                    : plan.id === 'professional'
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${isLoading && !isCurrent ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isCurrent ? (
                  'Current plan'
                ) : isEnterprise ? (
                  <>
                    Contact support
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {isLoading ? 'Updating...' : `Switch to ${plan.name}`}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800">
        <AlertCircle className="w-4 h-4 mt-0.5" />
        <p>
          Payments are <span className="font-semibold">not connected yet</span>. Changing plans here
          only affects limits like number of restaurants, menu items, and scans. When you&apos;re
          ready to go live, we&apos;ll plug in a real payment provider.
        </p>
      </div>
    </div>
  );
};

export default Membership;

