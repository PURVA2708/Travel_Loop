import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Heart,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  Star,
  Clock,
  ArrowUpDown,
  X,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { City, Activity } from '../../types';

const REGIONS = ['All', 'Europe', 'Asia', 'North America', 'Middle East', 'Oceania'];

export const CitySearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const searchParam = searchParams.get('search') || '';
  const regionParam = searchParams.get('region') || 'All';
  const sortParam = searchParams.get('sort') || 'popularity';
  const selectedCityId = searchParams.get('selected') || null;

  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedRegion, setSelectedRegion] = useState(regionParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeCityModal, setActiveCityModal] = useState<City | null>(null);

  // Sync state when URL params change
  useEffect(() => {
    setSearchInput(searchParam);
    setSelectedRegion(regionParam);
    setSelectedSort(sortParam);
  }, [searchParam, regionParam, sortParam]);

  // Fetch Cities with TanStack Query
  const { data: citiesResponse, isLoading, isError } = useQuery({
    queryKey: ['cities', { search: searchParam, region: regionParam, sort: sortParam }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParam) params.set('search', searchParam);
      if (regionParam && regionParam !== 'All') params.set('region', regionParam);
      if (sortParam) params.set('sort', sortParam);

      const res = await api.get(`/cities?${params.toString()}`);
      return res.data;
    },
  });

  const cities: City[] = citiesResponse?.data || [];

  // Fetch Single City Detail if selected in URL or state
  const { data: cityDetailData, isLoading: cityDetailLoading } = useQuery({
    queryKey: ['city-detail', selectedCityId],
    queryFn: async () => {
      if (!selectedCityId) return null;
      const res = await api.get(`/cities/${selectedCityId}`);
      return res.data.data as City;
    },
    enabled: Boolean(selectedCityId),
  });

  // Toggle Save Mutation
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

  const handleApplyFilters = (newRegion: string, newSort: string, newSearch: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newRegion && newRegion !== 'All') params.set('region', newRegion);
    if (newSort) params.set('sort', newSort);
    setSearchParams(params);
    setMobileFiltersOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilters(selectedRegion, selectedSort, searchInput);
  };

  const handleBookmarkClick = (e: React.MouseEvent, city: City) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleSaveMutation.mutate({ cityId: city.id, isSaved: Boolean(city.isSaved) });
  };

  const openCityDetail = (city: City) => {
    setActiveCityModal(city);
    const params = new URLSearchParams(searchParams);
    params.set('selected', city.id);
    setSearchParams(params);
  };

  const closeCityDetail = () => {
    setActiveCityModal(null);
    const params = new URLSearchParams(searchParams);
    params.delete('selected');
    setSearchParams(params);
  };

  const currentCityForModal = cityDetailData || activeCityModal;

  return (
    <div className="space-y-8">
      {/* 1. Header & TripAdvisor Mega Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Explore World Destinations
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Search top travel hubs, compare cost indexes, and bookmark cities to your travel wishlist.
          </p>
        </div>

        {/* Mega Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="w-full bg-surface-white border-2 border-ink-border/40 hover:border-brand focus-within:border-brand rounded-full p-2 pl-4 flex items-center shadow-card-rest transition-all">
            <Search className="w-5 h-5 text-ink-muted shrink-0 mr-3" />
            <input
              type="text"
              placeholder="Search by city name, country, or keyword (e.g. Tokyo, Rome, Spain)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-ink-muted focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  handleApplyFilters(selectedRegion, selectedSort, '');
                }}
                className="p-1 rounded-full hover:bg-surface text-ink-muted mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button type="submit" variant="primary" size="sm" pill className="font-bold shrink-0">
              Search
            </Button>
          </div>
        </form>

        {/* Region Filter Chips & Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Region Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSelectedRegion(r);
                  handleApplyFilters(r, selectedSort, searchInput);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap select-none ${
                  selectedRegion === r
                    ? 'bg-ink text-surface-white shadow-sm'
                    : 'bg-surface-white border border-ink-border/40 text-ink hover:border-brand hover:bg-surface'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Sort Dropdown & Filter Toggle on Mobile */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 bg-surface-white border border-ink-border/40 rounded-full px-3 py-1.5 text-xs font-semibold text-ink">
              <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted" />
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value);
                  handleApplyFilters(selectedRegion, e.target.value, searchInput);
                }}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="popularity">Most Popular</option>
                <option value="cost_asc">Cost: Budget First</option>
                <option value="cost_desc">Cost: Luxury First</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Results Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-ink-muted">
            Showing <span className="text-ink font-bold">{cities.length}</span> destinations
            {searchParam && <span> matching &ldquo;{searchParam}&rdquo;</span>}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-surface-white rounded-2xl border border-ink-border/30 p-8">
            <p className="text-sm font-bold text-danger">Failed to load destinations.</p>
            <Button
              variant="outline"
              size="sm"
              pill
              className="mt-3"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['cities'] })}
            >
              Retry
            </Button>
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-16 bg-surface-white rounded-2xl border border-ink-border/30 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand/20 text-brand-dark flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink">No destinations found</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Try adjusting your search keywords or clearing region filters to discover other world cities.
            </p>
            <Button
              variant="secondary"
              size="sm"
              pill
              onClick={() => {
                setSearchInput('');
                setSelectedRegion('All');
                handleApplyFilters('All', 'popularity', '');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cities.map((city) => (
              <div
                key={city.id}
                onClick={() => openCityDetail(city)}
                className="group relative bg-surface-white rounded-2xl border border-ink-border/30 shadow-card-rest hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* City Image with Scrim */}
                <div className="relative h-48 overflow-hidden bg-ink/5">
                  <img
                    src={
                      city.imageUrl ||
                      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Region Badge Top Left */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="ink">{city.region}</Badge>
                  </div>

                  {/* Floating Heart Bookmark Button Top Right */}
                  <button
                    onClick={(e) => handleBookmarkClick(e, city)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-surface-white/90 backdrop-blur-sm border border-ink-border/30 hover:scale-110 shadow-sm transition-all duration-200 z-10"
                    aria-label="Save Destination"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        city.isSaved ? 'fill-danger text-danger' : 'text-ink'
                      }`}
                    />
                  </button>

                  {/* Popularity indicator */}
                  <div className="absolute bottom-3 right-3 bg-brand text-ink text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                    ★ {city.popularityScore}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-ink-muted font-medium mb-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-dark" />
                      <span>{city.country}</span>
                    </div>

                    <h3 className="text-lg font-extrabold text-ink group-hover:text-brand-dark transition-colors">
                      {city.name}
                    </h3>

                    <p className="text-xs text-ink-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {city.description || 'Explore scenic sights, historic quarters, and activities.'}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="mt-4 pt-3 border-t border-ink-border/20 flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-muted">
                      {city.activityCount || 4} Activities
                    </span>
                    <span className="font-bold text-ink">
                      Cost: {'$'.repeat(Math.min(Math.max(Math.round(city.costIndex), 1), 4))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. City Detail Modal / Sheet */}
      <Modal
        isOpen={Boolean(selectedCityId || activeCityModal)}
        onClose={closeCityDetail}
        title={currentCityForModal?.name ? `${currentCityForModal.name}, ${currentCityForModal.country}` : 'Destination Details'}
        maxWidth="xl"
      >
        {cityDetailLoading && !currentCityForModal ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : currentCityForModal ? (
          <div className="space-y-6">
            {/* Header Media */}
            <div className="relative h-56 rounded-2xl overflow-hidden shadow-card-rest">
              <img
                src={
                  currentCityForModal.imageUrl ||
                  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'
                }
                alt={currentCityForModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-surface-white">
                <Badge variant="brand" className="mb-2">
                  {currentCityForModal.region}
                </Badge>
                <h2 className="text-2xl font-extrabold">{currentCityForModal.name}</h2>
                <p className="text-xs text-surface/90 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  {currentCityForModal.country} • Lat: {currentCityForModal.lat || '48.85'}, Lng: {currentCityForModal.lng || '2.35'}
                </p>
              </div>

              <button
                onClick={(e) => handleBookmarkClick(e, currentCityForModal)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-surface-white/90 backdrop-blur-sm border border-ink-border/30 hover:scale-110 shadow-md transition-all z-10"
              >
                <Heart
                  className={`w-5 h-5 ${
                    currentCityForModal.isSaved ? 'fill-danger text-danger' : 'text-ink'
                  }`}
                />
              </button>
            </div>

            {/* Overview Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                About Destination
              </h4>
              <p className="text-sm text-ink leading-relaxed font-normal">
                {currentCityForModal.description}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface rounded-xl p-3 text-center border border-ink-border/30">
                <p className="text-[11px] font-medium text-ink-muted">Popularity</p>
                <p className="text-base font-extrabold text-ink mt-0.5">
                  {currentCityForModal.popularityScore}/100
                </p>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center border border-ink-border/30">
                <p className="text-[11px] font-medium text-ink-muted">Cost Index</p>
                <p className="text-base font-extrabold text-ink mt-0.5">
                  {currentCityForModal.costIndex.toFixed(1)} / 5.0
                </p>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center border border-ink-border/30">
                <p className="text-[11px] font-medium text-ink-muted">Experiences</p>
                <p className="text-base font-extrabold text-ink mt-0.5">
                  {currentCityForModal.activities?.length || currentCityForModal.activityCount || 4} Available
                </p>
              </div>
            </div>

            {/* Nested Activities Catalog */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-ink">
                  Top Activities in {currentCityForModal.name}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  pill
                  onClick={() => {
                    closeCityDetail();
                    navigate(`/activities?cityId=${currentCityForModal.id}`);
                  }}
                >
                  View All Activities
                </Button>
              </div>

              <div className="space-y-2.5">
                {currentCityForModal.activities?.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-ink-border/30 bg-surface flex items-center justify-between gap-3 hover:border-brand transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={act.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200'}
                        alt={act.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-ink line-clamp-1">{act.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-ink-muted mt-0.5">
                          <span className="text-amber-500 font-bold">★ {act.rating}</span>
                          <span>•</span>
                          <span>{act.durationMinutes} mins</span>
                          <span>•</span>
                          <span className="font-bold text-ink">${act.cost}</span>
                        </div>
                      </div>
                    </div>

                    <Badge variant="brand" size="sm">
                      {act.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-ink-border/20 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" pill onClick={closeCityDetail}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill
                onClick={() => {
                  closeCityDetail();
                  navigate(`/activities?cityId=${currentCityForModal.id}`);
                }}
              >
                Explore City Activities
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
