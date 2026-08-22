import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  MapPin,
  X,
  Compass,
  ArrowUpDown,
  Tag,
  DollarSign,
  Utensils,
  Camera,
  Mountain,
  Landmark,
  Moon,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { api } from '../../lib/api';
import { Activity, ActivityCategory } from '../../types';

const CATEGORIES: Array<{
  id: string;
  label: string;
  icon: any;
  image: string;
}> = [
  {
    id: 'all',
    label: 'All Experiences',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'SIGHTSEEING',
    label: 'Sightseeing',
    icon: Camera,
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'FOOD',
    label: 'Food & Culinary',
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'ADVENTURE',
    label: 'Adventure',
    icon: Mountain,
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'CULTURE',
    label: 'Culture & Arts',
    icon: Landmark,
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'NIGHTLIFE',
    label: 'Nightlife',
    icon: Moon,
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=80',
  },
];

export const ActivitySearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const cityIdParam = searchParams.get('cityId') || '';
  const sortParam = searchParams.get('sort') || 'rating';
  const maxCostParam = searchParams.get('maxCost') || '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [maxCost, setMaxCost] = useState(maxCostParam);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    setSearchInput(searchParam);
    setSelectedCategory(categoryParam);
    setSelectedSort(sortParam);
    setMaxCost(maxCostParam);
  }, [searchParam, categoryParam, sortParam, maxCostParam]);

  // Fetch Activities
  const { data: activitiesResponse, isLoading, isError } = useQuery({
    queryKey: ['activities', { search: searchParam, category: categoryParam, cityId: cityIdParam, sort: sortParam, maxCost: maxCostParam }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParam) params.set('search', searchParam);
      if (categoryParam && categoryParam !== 'all') params.set('category', categoryParam);
      if (cityIdParam) params.set('cityId', cityIdParam);
      if (sortParam) params.set('sort', sortParam);
      if (maxCostParam) params.set('maxCost', maxCostParam);

      const res = await api.get(`/activities?${params.toString()}`);
      return res.data;
    },
  });

  const activities: Activity[] = activitiesResponse?.data || [];

  const handleApplyFilters = (
    newCategory: string,
    newSort: string,
    newSearch: string,
    newMaxCost: string
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCategory && newCategory !== 'all') params.set('category', newCategory);
    if (cityIdParam) params.set('cityId', cityIdParam);
    if (newSort) params.set('sort', newSort);
    if (newMaxCost) params.set('maxCost', newMaxCost);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyFilters(selectedCategory, selectedSort, searchInput, maxCost);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    handleApplyFilters(catId, selectedSort, searchInput, maxCost);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Discover City Activities & Tours
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Browse guided excursions, culinary adventures, cultural monuments, and nightlife.
          </p>
        </div>

        {/* Mega Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="w-full bg-surface-white border-2 border-ink-border/40 hover:border-brand focus-within:border-brand rounded-full p-2 pl-4 flex items-center shadow-card-rest transition-all">
            <Search className="w-5 h-5 text-ink-muted shrink-0 mr-3" />
            <input
              type="text"
              placeholder="Search experiences (e.g. Scuba diving, Eiffel Tower, Tea Ceremony)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink placeholder:text-ink-muted focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  handleApplyFilters(selectedCategory, selectedSort, '', maxCost);
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
      </div>

      {/* 2. TripAdvisor Category Visual Tiles Grid */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Browse by Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toUpperCase() === cat.id.toUpperCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`relative h-28 rounded-2xl overflow-hidden group shadow-card-rest transition-all duration-200 text-left ${
                  isSelected ? 'ring-4 ring-brand scale-[1.02]' : 'hover:scale-[1.02]'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
                <div className="absolute bottom-2.5 inset-x-2.5 text-surface-white">
                  <cat.icon className="w-4 h-4 mb-1 text-brand" />
                  <p className="text-xs font-extrabold leading-tight">{cat.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Controls & Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-ink-border/20">
        <p className="text-xs font-semibold text-ink-muted">
          Showing <span className="text-ink font-bold">{activities.length}</span> activities
          {cityIdParam && <span> for selected city</span>}
        </p>

        <div className="flex items-center gap-3 ml-auto flex-wrap">
          {/* Max Price Filter */}
          <div className="flex items-center gap-1.5 bg-surface-white border border-ink-border/40 rounded-full px-3 py-1.5 text-xs font-semibold text-ink">
            <DollarSign className="w-3.5 h-3.5 text-ink-muted" />
            <select
              value={maxCost}
              onChange={(e) => {
                setMaxCost(e.target.value);
                handleApplyFilters(selectedCategory, selectedSort, searchInput, e.target.value);
              }}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="">Any Budget</option>
              <option value="30">Under $30</option>
              <option value="50">Under $50</option>
              <option value="100">Under $100</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5 bg-surface-white border border-ink-border/40 rounded-full px-3 py-1.5 text-xs font-semibold text-ink">
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted" />
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                handleApplyFilters(selectedCategory, e.target.value, searchInput, maxCost);
              }}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="cost_asc">Price: Low to High</option>
              <option value="cost_desc">Price: High to Low</option>
              <option value="duration_asc">Shortest Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Activities Grid */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-surface-white rounded-2xl border border-ink-border/30 p-8">
            <p className="text-sm font-bold text-danger">Failed to load activities.</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 bg-surface-white rounded-2xl border border-ink-border/30 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand/20 text-brand-dark flex items-center justify-center mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink">No activities match your filters</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Try adjusting the price range or category to see more options.
            </p>
            <Button
              variant="secondary"
              size="sm"
              pill
              onClick={() => {
                setSearchInput('');
                setSelectedCategory('all');
                setMaxCost('');
                handleApplyFilters('all', 'rating', '', '');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <Card
                key={act.id}
                hoverable
                padded={false}
                onClick={() => setSelectedActivity(act)}
                className="flex flex-col justify-between h-full group"
              >
                {/* Media */}
                <div className="relative h-48 overflow-hidden bg-ink/5">
                  <img
                    src={
                      act.imageUrl ||
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="brand">{act.category}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 bg-surface-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-bold text-ink flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{act.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {act.city && (
                      <p className="text-xs font-semibold text-ink-muted mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-dark" />
                        <span>
                          {act.city.name}, {act.city.country}
                        </span>
                      </p>
                    )}

                    <h3 className="font-extrabold text-base text-ink group-hover:text-brand-dark transition-colors line-clamp-2 leading-snug">
                      {act.name}
                    </h3>

                    <p className="text-xs text-ink-muted mt-2 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Pricing & Duration footer */}
                  <div className="mt-5 pt-3 border-t border-ink-border/20 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-ink-muted font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {act.durationMinutes >= 60
                        ? `${(act.durationMinutes / 60).toFixed(1)} hrs`
                        : `${act.durationMinutes} mins`}
                    </span>
                    <span className="text-base font-extrabold text-ink">
                      ${Number(act.cost).toFixed(0)} <span className="text-xs font-normal text-ink-muted">/ person</span>
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 5. Activity Detail Modal */}
      <Modal
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        title={selectedActivity?.name || 'Activity Detail'}
        maxWidth="lg"
      >
        {selectedActivity && (
          <div className="space-y-5">
            <div className="relative h-56 rounded-2xl overflow-hidden shadow-card-rest">
              <img
                src={
                  selectedActivity.imageUrl ||
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
                }
                alt={selectedActivity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="brand">{selectedActivity.category}</Badge>
              </div>
              <div className="absolute top-3 right-3 bg-surface-white/95 rounded-full px-3 py-1 text-xs font-bold text-ink flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{selectedActivity.rating} (Verified rating)</span>
              </div>
            </div>

            {selectedActivity.city && (
              <p className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-dark" />
                <span>
                  Located in {selectedActivity.city.name}, {selectedActivity.city.country} ({selectedActivity.city.region})
                </span>
              </p>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Experience Overview
              </h4>
              <p className="text-sm text-ink leading-relaxed font-normal">
                {selectedActivity.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-xl p-3 text-center border border-ink-border/30">
                <p className="text-[11px] font-medium text-ink-muted">Duration</p>
                <p className="text-base font-extrabold text-ink mt-0.5">
                  {selectedActivity.durationMinutes} Minutes
                </p>
              </div>
              <div className="bg-surface rounded-xl p-3 text-center border border-ink-border/30">
                <p className="text-[11px] font-medium text-ink-muted">Price</p>
                <p className="text-base font-extrabold text-ink mt-0.5">
                  ${Number(selectedActivity.cost).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-ink-border/20 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" pill onClick={() => setSelectedActivity(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                pill
                onClick={() => {
                  if (selectedActivity.cityId) {
                    navigate(`/cities?selected=${selectedActivity.cityId}`);
                  }
                  setSelectedActivity(null);
                }}
              >
                View City Hub
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
