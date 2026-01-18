import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  ExternalLink,
  Wifi,
  Battery,
  Signal,
} from 'lucide-react';

const deviceSizes = {
  iphone: { width: 375, height: 812, name: 'iPhone 14', radius: '44px' },
  iphonePlus: { width: 428, height: 926, name: 'iPhone 14 Plus', radius: '44px' },
  android: { width: 360, height: 800, name: 'Android', radius: '24px' },
  ipad: { width: 768, height: 1024, name: 'iPad', radius: '24px' },
};

const MobilePreviewModal = ({ isOpen, onClose, url, title }) => {
  const [selectedDevice, setSelectedDevice] = useState('iphone');
  const [isRotated, setIsRotated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const device = deviceSizes[selectedDevice];
  const frameWidth = isRotated ? device.height : device.width;
  const frameHeight = isRotated ? device.width : device.height;

  // Scale to fit screen
  const maxHeight = window.innerHeight - 200;
  const maxWidth = window.innerWidth - 200;
  const scale = Math.min(
    maxHeight / frameHeight,
    maxWidth / frameWidth,
    1
  );

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center max-w-full"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between w-full max-w-2xl mb-4 px-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-medium">{title || 'Preview'}</h3>
              <span className="text-gray-400 text-sm">- {device.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Device Selector */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setSelectedDevice('iphone')}
                  className={`p-2 rounded-md transition-colors ${
                    selectedDevice === 'iphone'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="iPhone"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedDevice('android')}
                  className={`p-2 rounded-md transition-colors ${
                    selectedDevice === 'android'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Android"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedDevice('ipad')}
                  className={`p-2 rounded-md transition-colors ${
                    selectedDevice === 'ipad'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="iPad"
                >
                  <Tablet className="w-4 h-4" />
                </button>
              </div>

              {/* Rotate */}
              <button
                onClick={() => setIsRotated(!isRotated)}
                className={`p-2 rounded-lg transition-colors ${
                  isRotated
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
                title="Rotate"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Open in New Tab */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Device Frame */}
          <motion.div
            layout
            className="relative bg-gray-900 shadow-2xl"
            style={{
              width: frameWidth * scale + 24,
              height: frameHeight * scale + 24,
              borderRadius: device.radius,
              padding: '12px',
            }}
          >
            {/* Device Bezel */}
            <div
              className="relative bg-black overflow-hidden"
              style={{
                width: frameWidth * scale,
                height: frameHeight * scale,
                borderRadius: `calc(${device.radius} - 8px)`,
              }}
            >
              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 z-10 h-11 bg-gradient-to-b from-black/50 to-transparent flex items-center justify-between px-6 text-white text-xs">
                <span className="font-medium">{currentTime}</span>
                <div className="flex items-center space-x-1">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </div>
              </div>

              {/* Notch (iPhone) */}
              {(selectedDevice === 'iphone' || selectedDevice === 'iphonePlus') && !isRotated && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-20" />
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-gray-400 text-sm">Loading preview...</span>
                  </div>
                </div>
              )}

              {/* iFrame */}
              <iframe
                src={url}
                title="Menu Preview"
                className="w-full h-full border-0"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: frameWidth,
                  height: frameHeight,
                }}
                onLoad={() => setIsLoading(false)}
              />

              {/* Home Indicator */}
              {(selectedDevice === 'iphone' || selectedDevice === 'iphonePlus') && !isRotated && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
              )}
            </div>

            {/* Power Button */}
            <div
              className="absolute bg-gray-800 rounded-sm"
              style={{
                right: '-3px',
                top: '100px',
                width: '3px',
                height: '60px',
              }}
            />

            {/* Volume Buttons */}
            <div
              className="absolute bg-gray-800 rounded-sm"
              style={{
                left: '-3px',
                top: '80px',
                width: '3px',
                height: '30px',
              }}
            />
            <div
              className="absolute bg-gray-800 rounded-sm"
              style={{
                left: '-3px',
                top: '120px',
                width: '3px',
                height: '50px',
              }}
            />
          </motion.div>

          {/* URL Display */}
          <div className="mt-4 px-4 py-2 bg-gray-800 rounded-lg">
            <span className="text-gray-400 text-sm font-mono">{url}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobilePreviewModal;