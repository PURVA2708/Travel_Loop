import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Twitter, QrCode } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripName: string;
  slug: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  tripName,
  slug,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/share/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out my travel plan for "${tripName}" on GlobeTrotter! 🌍✈️\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(
      `I just designed my dream itinerary for "${tripName}" with GlobeTrotter! 🗺️✨\n${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-modal border border-surface-subtle relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-ink-muted hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-light flex items-center justify-center text-ink border border-brand/50">
            <Share2 className="w-5 h-5 text-ink" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-ink">Share Itinerary</h3>
            <p className="text-xs text-ink-muted">Anyone with this link can view this trip</p>
          </div>
        </div>

        {/* Trip Title Pill */}
        <div className="my-4 p-3 bg-surface rounded-2xl border border-surface-subtle">
          <p className="text-xs text-ink-muted font-medium">Trip to Share</p>
          <p className="font-bold text-sm text-ink truncate">{tripName}</p>
        </div>

        {/* Copy Link Input Group */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
            Public Itinerary Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-surface px-4 py-3 rounded-2xl text-xs sm:text-sm font-mono border border-gray-200 text-ink focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                copied
                  ? 'bg-success text-white'
                  : 'bg-brand hover:bg-brand-dark text-ink'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Quick Share Channels
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold gap-1.5 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              WhatsApp
            </button>
            <button
              onClick={handleTwitter}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold gap-1.5 transition-colors"
            >
              <Twitter className="w-5 h-5 text-sky-600" />
              X / Twitter
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold gap-1.5 transition-colors"
            >
              <QrCode className="w-5 h-5 text-purple-600" />
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div className="mt-5 p-4 bg-surface rounded-2xl border border-surface-subtle flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  shareUrl
                )}`}
                alt="QR Code for Trip"
                className="w-32 h-32"
              />
            </div>
            <p className="text-[11px] text-ink-muted">Scan with phone camera to open instantly</p>
          </div>
        )}
      </div>
    </div>
  );
};
