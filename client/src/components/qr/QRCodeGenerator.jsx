import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  X,
  Download,
  Copy,
  Palette,
  Type,
  Square,
  Settings,
  Eye,
  Layers,
  RotateCcw,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { tableApi } from '../../api/table.api';

const QRCodeGenerator = ({ table, restaurantSlug, restaurantId, onClose }) => {
  const qrRef = useRef(null);
  const canvasRef = useRef(null);

  const [settings, setSettings] = useState({
    foregroundColor: table?.qrSettings?.foregroundColor || '#000000',
    backgroundColor: table?.qrSettings?.backgroundColor || '#FFFFFF',
    padding: table?.qrSettings?.padding || 2,
    cornerRadius: table?.qrSettings?.cornerRadius || 0,
    text: table?.qrSettings?.text || table?.name || '',
    textColor: table?.qrSettings?.textColor || '#000000',
    textSize: table?.qrSettings?.textSize || 14,
    textPositionX: table?.qrSettings?.textPositionX || 50,
    textPositionY: table?.qrSettings?.textPositionY || 95,
  });

  const [qrSize, setQrSize] = useState(280);
  const [activeTab, setActiveTab] = useState('colors');
  const [isSaving, setIsSaving] = useState(false);

  const menuUrl = `${window.location.origin}/menu/${restaurantSlug}?table=${table?.number}`;

  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await tableApi.updateQRSettings(restaurantId, table._id, settings);
      toast.success('QR settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setSettings({
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      padding: 2,
      cornerRadius: 0,
      text: table?.name || '',
      textColor: '#000000',
      textSize: 14,
      textPositionX: 50,
      textPositionY: 95,
    });
  };

  // Download QR as PNG
  const downloadQR = () => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    const padding = settings.padding * 20;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2 + (settings.text ? 60 : 0);
    const ctx = canvas.getContext('2d');

    // Background with rounded corners
    ctx.fillStyle = settings.backgroundColor;
    if (settings.cornerRadius > 0) {
      roundRect(ctx, 0, 0, canvas.width, canvas.height, settings.cornerRadius);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Get QR SVG and draw to canvas
    const svg = qrRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, padding, padding, size, size);

        // Add text
        if (settings.text) {
          ctx.fillStyle = settings.textColor;
          ctx.font = `bold ${settings.textSize * 3}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          const textX = (canvas.width * settings.textPositionX) / 100;
          const textY = (canvas.height * settings.textPositionY) / 100;
          ctx.fillText(settings.text, textX, textY);
        }

        // Download
        const link = document.createElement('a');
        link.download = `QR-${table?.name || 'code'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('QR Code downloaded');
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  // Copy URL
  const copyUrl = async () => {
    await navigator.clipboard.writeText(menuUrl);
    toast.success('URL copied!');
  };

  // Rounded rectangle helper
  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'style', label: 'Style', icon: Square },
    { id: 'text', label: 'Text', icon: Type },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">QR Code Generator</h2>
            <p className="text-sm text-gray-500">{table?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-2 gap-6 p-6">
            {/* QR Preview */}
            <div className="flex flex-col items-center">
              <div
                ref={qrRef}
                className="relative p-4 rounded-2xl shadow-lg"
                style={{
                  backgroundColor: settings.backgroundColor,
                  padding: `${settings.padding * 10}px`,
                  borderRadius: `${settings.cornerRadius}px`,
                }}
              >
                <QRCodeSVG
                  value={menuUrl}
                  size={qrSize}
                  level="H"
                  fgColor={settings.foregroundColor}
                  bgColor={settings.backgroundColor}
                  includeMargin={false}
                />
                
                {/* Text Overlay */}
                {settings.text && (
                  <div
                    className="absolute font-bold text-center w-full"
                    style={{
                      color: settings.textColor,
                      fontSize: `${settings.textSize}px`,
                      left: '50%',
                      top: `${settings.textPositionY}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {settings.text}
                  </div>
                )}
              </div>

              {/* URL Display */}
              <div className="mt-4 w-full max-w-sm">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="text"
                    value={menuUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                  />
                  <button onClick={copyUrl} className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={downloadQR}
                  className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download PNG
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <div>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'colors' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foreground Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.foregroundColor}
                          onChange={(e) => setSettings({ ...settings, foregroundColor: e.target.value })}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                        />
                        <input
                          type="text"
                          value={settings.foregroundColor}
                          onChange={(e) => setSettings({ ...settings, foregroundColor: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                        />
                        <input
                          type="text"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Preset Colors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { fg: '#000000', bg: '#FFFFFF' },
                          { fg: '#1e40af', bg: '#dbeafe' },
                          { fg: '#065f46', bg: '#d1fae5' },
                          { fg: '#9f1239', bg: '#ffe4e6' },
                          { fg: '#FFFFFF', bg: '#000000' },
                          { fg: '#6366f1', bg: '#eef2ff' },
                        ].map((preset, i) => (
                          <button
                            key={i}
                            onClick={() => setSettings({ ...settings, foregroundColor: preset.fg, backgroundColor: preset.bg })}
                            className="w-10 h-10 rounded-lg border-2 border-gray-200 overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)` }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'style' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Padding: {settings.padding}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="6"
                        value={settings.padding}
                        onChange={(e) => setSettings({ ...settings, padding: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Corner Radius: {settings.cornerRadius}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={settings.cornerRadius}
                        onChange={(e) => setSettings({ ...settings, cornerRadius: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        QR Size: {qrSize}px
                      </label>
                      <input
                        type="range"
                        min="150"
                        max="400"
                        value={qrSize}
                        onChange={(e) => setQrSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'text' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                      <input
                        type="text"
                        value={settings.text}
                        onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                        placeholder="e.g., Table 1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.textColor}
                          onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                        />
                        <input
                          type="text"
                          value={settings.textColor}
                          onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Size: {settings.textSize}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="30"
                        value={settings.textSize}
                        onChange={(e) => setSettings({ ...settings, textSize: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position Y: {settings.textPositionY}%
                      </label>
                      <input
                        type="range"
                        min="80"
                        max="105"
                        value={settings.textPositionY}
                        onChange={(e) => setSettings({ ...settings, textPositionY: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Save & Reset */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRCodeGenerator;