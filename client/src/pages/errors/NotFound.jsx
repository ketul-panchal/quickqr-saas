import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-medium hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;