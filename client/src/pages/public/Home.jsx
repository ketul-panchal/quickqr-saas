import { Link } from 'react-router-dom';
import { 
  QrCode, 
  Smartphone, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  Check,
  Star,
  Zap,
  Globe,
  CreditCard
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: 'Dynamic QR Menus',
      description: 'Create beautiful, scannable QR codes that link to your digital menu. Update anytime without reprinting.',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile Optimized',
      description: 'Stunning menus that look perfect on any device. Fast loading and easy to navigate.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Real-time Analytics',
      description: 'Track views, popular items, and customer behavior with detailed insights.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Contactless & Safe',
      description: 'Reduce physical contact with digital ordering. Safer for staff and customers.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      features: ['1 Restaurant', '1 QR Code', 'Basic Menu', 'Email Support'],
      popular: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      features: ['3 Restaurants', 'Unlimited QR Codes', 'Online Ordering', 'Analytics Dashboard', 'Priority Support'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      features: ['Unlimited Restaurants', 'Custom Branding', 'API Access', 'Dedicated Account Manager', '24/7 Support'],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">QuickQR</span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/onboarding"
                className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-2.5 rounded-xl font-medium hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-sky-50 rounded-full text-sky-600 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                #1 QR Menu Platform for Restaurants
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Transform Your Menu Into a{' '}
                <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
                  Digital Experience
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Create stunning QR code menus in minutes. Enable contactless ordering, 
                boost sales, and delight your customers with a modern dining experience.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/onboarding"
                  className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>View Demo</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Setup in 5 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Illustration */}
            <div className="relative">
              <div className="relative z-10">
                {/* Phone Mockup */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl max-w-sm mx-auto">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Phone Screen Content */}
                    <div className="bg-gradient-to-br from-sky-500 to-emerald-500 p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">The Good Fork</h3>
                          <p className="text-sm text-white/80">Italian Restaurant</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <QrCode className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Menu Items */}
                      {['Margherita Pizza', 'Pasta Carbonara', 'Tiramisu'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg"></div>
                            <div>
                              <p className="font-medium text-gray-900">{item}</p>
                              <p className="text-sm text-gray-500">Delicious & Fresh</p>
                            </div>
                          </div>
                          <span className="font-bold text-sky-600">${(12 + index * 4).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-10 -left-10 w-72 h-72 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
              <div className="absolute bottom-10 -right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-200"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Restaurants' },
              { value: '2M+', label: 'QR Scans' },
              { value: '50+', label: 'Countries' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Go Digital
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to transform your restaurant&apos;s ordering experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 ${
                  plan.popular
                    ? 'ring-2 ring-sky-500 shadow-xl scale-105'
                    : 'shadow-lg border border-gray-100'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-end justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/onboarding"
                  className={`block w-full py-3 rounded-xl font-medium text-center transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 shadow-lg'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-sky-500 hover:text-sky-600'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Restaurant Owners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our customers have to say about QuickQR
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Owner, The Good Fork',
                content: 'QuickQR transformed our restaurant. Customers love the easy ordering and we have reduced wait times by 40%.',
                rating: 5,
              },
              {
                name: 'Michael Chen',
                role: 'Manager, Dragon Palace',
                content: 'The analytics dashboard helps us understand which dishes are popular. Setup was incredibly easy!',
                rating: 5,
              },
              {
                name: 'Emma Williams',
                role: 'Owner, Café Bliss',
                content: 'We went from paper menus to digital in one afternoon. The support team is amazing and always helpful.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-sky-600 to-emerald-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/4 translate-y-1/4"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Modernize Your Menu?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of restaurants already using QuickQR. Start your free trial today.
              </p>
              <Link
                to="/onboarding"
                className="inline-flex items-center space-x-2 bg-white text-sky-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">QuickQR</span>
              </div>
              <p className="text-gray-400">
                The modern way to create digital menus and enable contactless ordering.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 QuickQR. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <CreditCard className="w-8 h-8 text-gray-400" />
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;