import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Search,
  PlusCircle,
  Heart,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MapPin,
  Calendar,
  Flame,
  Star,
  Clock,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { City, Activity, SavedDestinationItem } from '../../types';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Recommended Cities
  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities', 'recommended'],
    queryFn: async () => {
      const res = await api.get('/cities?limit=8&sort=popularity');
      return res.data.data as City[];
    },
  });

  // Fetch Trending Activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', 'trending'],
    queryFn: async () => {
      const res = await api.get('/activities?limit=6&sort=rating');
      return res.data.data as Activity[];
    },
  });

  // Fetch User's Saved Destinations (if authenticated)
  const { data: savedDestinations } = useQuery({
    queryKey: ['saved-destinations'],
    queryFn: async () => {
      const res = await api.get('/users/me/saved-destinations');
      return res.data.data as SavedDestinationItem[];
    },
    enabled: isAuthenticated,
  });

  // Bookmark Toggle Mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async ({ cityId, isSaved }: { cityId: string; isSaved: boolean }) => {
      if (isSaved) {
        await api.delete(`/users/me/saved-destinations/${cityId}`);
      } else {
        await api.post(`/users/me/saved-destinations/${cityId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['saved-destinations'] });
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cities?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/cities');
    }
  };

  const handleToggleBookmark = (e: React.MouseEvent, city: City) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleSaveMutation.mutate({ cityId: city.id, isSaved: Boolean(city.isSaved) });
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = document.getElementById('destinations-carousel');
    if (el) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. TripAdvisor-Inspired Split Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden shadow-card-hover border border-ink-border/30 bg-ink text-surface-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand/20 text-brand text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 fill-brand" />
                Next-Gen AI Travel Platform
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-surface-white">
                Where to next,{' '}
                <span className="text-brand">
                  {user?.name ? user.name.split(' ')[0] : 'Traveler'}?
                </span>
              </h1>

              <p className="mt-3 text-sm sm:text-base text-surface/80 max-w-xl font-normal leading-relaxed">
                Discover world-class destinations, curate unmissable city activities, and orchestrate
                seamless itineraries in minutes.
              </p>
            </div>

            {/* Hero Mega Search Input */}
            <div className="mt-6">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-surface-white rounded-full p-1.5 sm:p-2 flex items-center shadow-lg border border-brand/40 gap-2 max-w-xl"
              >
                <div className="pl-3 sm:pl-4 text-ink-muted">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search cities, countries (e.g. Paris, Tokyo, Bali)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-ink placeholder:text-ink-muted text-sm font-medium focus:outline-none px-2"
                />
                <Button type="submit" variant="primary" size="sm" pill className="shrink-0 font-bold">
                  Search
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: Hero Visual with gradient scrim */}
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80"
              alt="Paris Eiffel Tower"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-ink via-ink/40 to-transparent" />
            <div className="absolute bottom-4 right-4 bg-surface-white/90 backdrop-blur-md rounded-2xl p-3 shadow-md border border-ink-border/30 max-w-[200px] hidden sm:block">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Featured: Paris, France</span>
              </div>
              <p className="text-[11px] text-ink-muted mt-0.5">Top trending destination of 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Topic Categories (Pill Tabs) */}
      <section className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        {[
          { label: 'All Cities', icon: Compass, path: '/cities' },
          { label: 'Europe Highlights', icon: MapPin, path: '/cities?region=Europe' },
          { label: 'Asian Getaways', icon: MapPin, path: '/cities?region=Asia' },
          { label: 'Food & Culinary', icon: Flame, path: '/activities?category=FOOD' },
          { label: 'Adventure Treks', icon: Compass, path: '/activities?category=ADVENTURE' },
        ].map((tag) => {
          const Icon = tag.icon;
          return (
            <Link
              key={tag.label}
              to={tag.path}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-white border border-ink-border/40 hover:border-brand text-xs font-semibold text-ink whitespace-nowrap shadow-sm hover:shadow transition-all"
            >
              <Icon className="w-3.5 h-3.5 text-brand-dark" />
              {tag.label}
            </Link>
          );
        })}
      </section>

      {/* 3. Recommended Destinations Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-brand-dark fill-brand" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
                Recommended Destinations
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted">
              Handpicked world-class cities with high popularity & rich itineraries
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-full border border-ink-border/40 bg-surface-white hover:bg-surface text-ink transition-colors shadow-sm hidden sm:inline-flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-full border border-ink-border/40 bg-surface-white hover:bg-surface text-ink transition-colors shadow-sm hidden sm:inline-flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link to="/cities">
              <Button variant="ghost" size="sm" pill rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View all
              </Button>
            </Link>
          </div>
        </div>

        {citiesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div
            id="destinations-carousel"
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2"
          >
            {citiesData?.map((city) => (
              <div
                key={city.id}
                className="snap-start shrink-0 w-[280px] sm:w-[300px] group relative"
              >
                <Link to={`/cities?selected=${city.id}`} className="block">
                  <div className="relative h-72 rounded-2xl overflow-hidden shadow-card-rest group-hover:shadow-card-hover transition-all duration-300">
                    <img
                      src={
                        city.imageUrl ||
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Scrim */}
                    <div className="absolute inset-0 scrim-gradient" />

                    {/* Floating Heart / Wishlist Icon */}
                    <button
                      onClick={(e) => handleToggleBookmark(e, city)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-surface-white/90 backdrop-blur-sm border border-ink-border/30 text-ink hover:text-danger hover:scale-110 shadow-sm transition-all duration-200"
                      aria-label="Save Destination"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          city.isSaved ? 'fill-danger text-danger' : 'text-ink'
                        }`}
                      />
                    </button>

                    {/* City Info Card Bottom */}
                    <div className="absolute bottom-3 inset-x-3 text-surface-white">
                      <div className="flex items-center gap-1.5 text-xs text-brand font-bold mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>
                          {city.country} • {city.region}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold tracking-tight text-surface-white leading-snug">
                        {city.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-white/20 text-xs">
                        <span className="font-semibold text-surface-white/90">
                          {city.activityCount || 4} Activities
                        </span>
                        <span className="inline-flex items-center gap-1 bg-surface-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-bold">
                          Score: {city.popularityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Trending Activities Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
                Top Rated Experiences & Tours
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted">
              Unforgettable sights, cuisine tours, and adventure excursions
            </p>
          </div>

          <Link to="/activities">
            <Button variant="ghost" size="sm" pill rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Explore all
            </Button>
          </Link>
        </div>

        {activitiesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activitiesData?.map((act) => (
              <Card key={act.id} hoverable padded={false} className="flex flex-col h-full group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={
                      act.imageUrl ||
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="brand">{act.category}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 bg-surface-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold text-ink flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{act.rating}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {act.city && (
                      <p className="text-xs font-semibold text-ink-muted mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-dark" />
                        {act.city.name}, {act.city.country}
                      </p>
                    )}
                    <h4 className="font-bold text-sm text-ink group-hover:text-brand-dark transition-colors line-clamp-2 leading-snug">
                      {act.name}
                    </h4>
                    <p className="text-xs text-ink-muted mt-1 line-clamp-2">{act.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ink-border/20 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-ink-muted font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {act.durationMinutes >= 60
                        ? `${(act.durationMinutes / 60).toFixed(1)} hrs`
                        : `${act.durationMinutes} mins`}
                    </span>
                    <span className="text-sm font-extrabold text-ink">
                      ${Number(act.cost).toFixed(0)} <span className="text-[11px] font-normal text-ink-muted">/ person</span>
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 5. Team Integration Showcase (Referencing Teammate Verticals) */}
      <section className="rounded-2xl p-6 bg-surface-white border border-ink-border/40 shadow-card-rest">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-ink text-base">Ready to build your next itinerary?</h3>
            <p className="text-xs text-ink-muted">
              Combine your saved destinations and activities into a structured, day-by-day travel plan.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/trips/new">
              <Button variant="primary" size="md" pill leftIcon={<PlusCircle className="w-4 h-4 stroke-[2.5]" />}>
                Plan a New Trip
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
