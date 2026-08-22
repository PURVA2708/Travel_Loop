import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Calendar,
  MapPin,
  Clock,
  Check,
  Sparkles,
  Compass,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { apiClient, MOCK_SHARE_SLUG } from '../services/api.ts';
import { SharedItineraryData } from '../types/index.ts';
import { ShareModal } from '../components/common/ShareModal.tsx';
import { CategoryBadge } from '../components/common/Badge.tsx';

export const SharedItineraryPage: React.FC<{ slug?: string; onNavigate?: (tab: string, param?: string) => void }> = ({
  slug = MOCK_SHARE_SLUG,
  onNavigate,
}) => {
  const [data, setData] = useState<SharedItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getSharedTrip(slug);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSharedTrip();
  }, [slug]);

  const handleCopyTrip = async () => {
    setCopying(true);
    try {
      const res = await apiClient.copySharedTrip(slug);
      if (res.success) {
        setCopiedSuccess(true);
        setTimeout(() => {
          setCopiedSuccess(false);
          if (onNavigate) {
            onNavigate('budget', res.tripId);
          }
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCopying(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-brand animate-spin mb-4" />
        <p className="text-sm font-semibold text-ink">Loading Public Shared Itinerary...</p>
      </div>
    );
  }

  if (!data) return null;

  const trip = data.trip;

  return (
    <div className="min-h-screen bg-surface pb-16 animate-fade-in">
      {/* TripAdvisor-Style Split Hero Banner */}
      <div className="bg-surface-white border-b border-surface-subtle">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          {/* Left: Solid #00EB5B Color Block with High-Contrast Typography */}
          <div className="lg:col-span-6 bg-brand p-8 sm:p-12 flex flex-col justify-between text-ink">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-ink text-surface text-xs font-bold uppercase tracking-wider">
                  Public Itinerary · Screen #11
                </span>
                <span className="text-xs font-semibold text-ink/80 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Shared with you
                </span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight leading-tight">
                {trip.name}
              </h1>

              {trip.description && (
                <p className="text-ink/90 text-sm sm:text-base mt-4 leading-relaxed font-medium max-w-lg">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Author & Action Pill Buttons */}
            <div className="pt-8 mt-6 border-t border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {trip.author.avatarUrl ? (
                  <img
                    src={trip.author.avatarUrl}
                    alt={trip.author.name}
                    className="w-10 h-10 rounded-full ring-2 ring-ink object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-ink text-surface flex items-center justify-center font-bold">
                    {trip.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs text-ink/70 font-semibold">Planned by</p>
                  <p className="font-bold text-sm text-ink">{trip.author.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-3 rounded-full bg-ink/10 hover:bg-ink hover:text-surface text-ink transition-colors"
                  title="Share this itinerary"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopyTrip}
                  disabled={copying || copiedSuccess}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-ink hover:bg-black text-surface text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-75"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-brand" /> Copied to Account!
                    </>
                  ) : copying ? (
                    'Copying...'
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-brand" /> Copy Trip Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Cover Photo */}
          <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-full">
            <img
              src={
                trip.coverPhotoUrl ||
                'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80'
              }
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-ink/80 backdrop-blur-md text-surface px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand" />
                {new Date(trip.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
                {new Date(trip.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-gray-400">|</span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand" /> Est. ₹{trip.estimatedTotalCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-ink">
              <MapPin className="w-6 h-6 text-ink stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">Stops & Destinations</p>
              <p className="font-display font-bold text-xl text-ink mt-0.5">
                {trip.stops.length} Cities / Regions
              </p>
            </div>
          </div>

          <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">Curated Activities</p>
              <p className="font-display font-bold text-xl text-ink mt-0.5">
                {trip.stops.reduce((acc, s) => acc + s.activities.length, 0)} Handpicked Experiences
              </p>
            </div>
          </div>

          <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-800">
              <DollarSign className="w-6 h-6 text-success stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">Estimated Budget</p>
              <p className="font-display font-bold text-xl text-ink mt-0.5">
                ₹{trip.estimatedTotalCost.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Chronological Stops & Day Feed */}
        <div className="space-y-10">
          <div className="border-b border-surface-subtle pb-4">
            <h2 className="font-display font-bold text-2xl text-ink">Itinerary Highlights & Schedule</h2>
            <p className="text-xs text-ink-muted mt-1">
              Explore the city-by-city breakdown and planned activities for this trip
            </p>
          </div>

          {trip.stops.map((stop, idx) => (
            <div
              key={stop.id}
              className="bg-surface-white rounded-3xl p-6 sm:p-8 border border-surface-subtle shadow-card"
            >
              {/* Stop City Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-subtle gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-ink text-brand font-display font-extrabold text-xl flex items-center justify-center shadow-sm">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-ink">
                      {stop.city.name}
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand" /> {stop.city.country} ·{' '}
                      {new Date(stop.arrivalDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} to{' '}
                      {new Date(stop.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-brand-light text-ink border border-brand/40">
                    {stop.activities.length} Activities
                  </span>
                </div>
              </div>

              {/* Activities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {stop.activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-surface/70 border border-surface-subtle flex gap-4 items-start hover:bg-surface-white transition-all shadow-sm"
                  >
                    {act.imageUrl && (
                      <img
                        src={act.imageUrl}
                        alt={act.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 ring-1 ring-black/5"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <CategoryBadge category={act.category} size="sm" />
                        {act.scheduledTime && (
                          <span className="text-xs font-semibold text-ink-muted">
                            {act.scheduledTime}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-ink truncate">{act.name}</h4>
                      {act.description && (
                        <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">
                          {act.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200 text-xs">
                        <span className="text-ink-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {act.durationMinutes} mins
                        </span>
                        <span className="font-bold text-ink">₹{act.cost.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Sticky CTA */}
        <div className="mt-12 bg-ink text-surface rounded-3xl p-8 text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-modal">
          <div className="text-left">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-surface">
              Love this itinerary?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-md">
              Clone this entire trip into your account to customize dates, adjust budgets, and add your own favorite spots.
            </p>
          </div>
          <button
            onClick={handleCopyTrip}
            className="px-8 py-4 rounded-full bg-brand hover:bg-brand-dark text-ink font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg transition-transform active:scale-95 whitespace-nowrap"
          >
            <Copy className="w-5 h-5 text-ink stroke-[2.5]" />
            Copy Trip to My Account
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tripName={trip.name}
        slug={data.shareLink.slug}
      />
    </div>
  );
};
