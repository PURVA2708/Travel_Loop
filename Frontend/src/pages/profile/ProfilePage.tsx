import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User as UserIcon,
  Bookmark,
  Shield,
  Trash2,
  CheckCircle,
  AlertCircle,
  MapPin,
  Camera,
  Globe,
  Lock,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { User, SavedDestinationItem } from '../../types';

export const ProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { user: storeUser, setUser, logout } = useAuthStore();

  // Fetch full user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me/profile');
      return res.data.data as User;
    },
  });

  // Fetch Saved Destinations
  const { data: savedItems, isLoading: savedLoading } = useQuery({
    queryKey: ['saved-destinations'],
    queryFn: async () => {
      const res = await api.get('/users/me/saved-destinations');
      return res.data.data as SavedDestinationItem[];
    },
  });

  // Profile Form States
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [languagePref, setLanguagePref] = useState('en');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status banners
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Sync profile data into form when loaded
  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAvatarUrl(profile.avatarUrl || '');
      setLanguagePref(profile.languagePref || 'en');
    }
  }, [profile]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.patch('/users/me/profile', payload);
      return res.data.data as User;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccessMessage('Profile details updated successfully!');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile.');
      setSuccessMessage(null);
    },
  });

  // Remove Saved Destination Mutation
  const removeSavedMutation = useMutation({
    mutationFn: async (cityId: string) => {
      await api.delete(`/users/me/saved-destinations/${cityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-destinations'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setSuccessMessage('Destination removed from your wishlist.');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/users/me');
    },
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });

  const handleUpdateGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      avatarUrl,
      languagePref,
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }

    updateProfileMutation.mutate({
      currentPassword,
      newPassword,
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* 1. Header Banner */}
      <div className="relative bg-surface-white rounded-3xl p-6 sm:p-8 border border-ink-border/30 shadow-card-rest flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || 'User Avatar'}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-brand shadow-md"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand text-ink flex items-center justify-center font-extrabold text-3xl shadow-md">
              {(profile?.name || storeUser?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {profile?.name || storeUser?.name}
            </h1>
            <Badge variant="brand">{profile?.role || 'TRAVELER'}</Badge>
          </div>
          <p className="text-xs text-ink-muted">{profile?.email || storeUser?.email}</p>
          <p className="text-[11px] text-ink-muted pt-1">
            GlobeTrotter Explorer • Member since{' '}
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : '2026'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            pill
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-success/15 border border-success/30 flex items-center gap-3 text-success text-xs font-semibold animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-danger/15 border border-danger/30 flex items-center gap-3 text-danger text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-ink-border/30 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'general', label: 'Personal Details', icon: UserIcon },
          {
            id: 'saved',
            label: `Saved Wishlist (${savedItems?.length || 0})`,
            icon: Bookmark,
          },
          { id: 'security', label: 'Security & Password', icon: Shield },
          { id: 'danger', label: 'Account Management', icon: Trash2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap select-none ${
                isActive
                  ? 'bg-ink text-surface-white shadow-sm'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content Panels */}
      {activeTab === 'general' && (
        <Card className="space-y-6">
          <div className="border-b border-ink-border/20 pb-3">
            <h2 className="text-base font-bold text-ink">Personal Information</h2>
            <p className="text-xs text-ink-muted">
              Update your name, profile avatar photo, and app language preferences.
            </p>
          </div>

          <form onSubmit={handleUpdateGeneral} className="space-y-4 max-w-xl">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            <Input
              label="Profile Avatar URL (Unsplash or hosted image)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              leftIcon={<Camera className="w-4 h-4" />}
              helperText="Paste a direct image URL to update your profile photo."
            />

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">
                Preferred Language
              </label>
              <div className="relative">
                <select
                  value={languagePref}
                  onChange={(e) => setLanguagePref(e.target.value)}
                  className="w-full bg-surface-white text-ink text-sm border border-ink-border hover:border-ink-muted rounded-xl px-4 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                >
                  <option value="en">English (US / Global)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              pill
              isLoading={updateProfileMutation.isPending}
            >
              Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Saved Destination Wishlist</h2>
              <p className="text-xs text-ink-muted">
                Cities you have bookmarked for your upcoming trips and adventures.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              pill
              onClick={() => navigate('/cities')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Browse More Cities
            </Button>
          </div>

          {savedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : savedItems && savedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <Card key={item.savedId} padded={false} className="group overflow-hidden flex flex-col justify-between">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={
                        item.city.imageUrl ||
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
                      }
                      alt={item.city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge variant="ink">{item.city.region}</Badge>
                    </div>
                    <button
                      onClick={() => removeSavedMutation.mutate(item.city.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-surface-white text-danger hover:scale-110 shadow-md transition-transform"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-3 left-3 text-surface-white">
                      <p className="text-xs text-brand font-bold">{item.city.country}</p>
                      <h3 className="text-lg font-extrabold">{item.city.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink-muted">
                      {item.city.activityCount || 4} Activities
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      pill
                      onClick={() => navigate(`/cities?selected=${item.city.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface-white rounded-2xl border border-ink-border/30 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand/20 text-brand-dark flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ink">No saved destinations yet</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Click the heart icon on any city card while exploring to bookmark your dream destinations.
              </p>
              <Button
                variant="primary"
                size="sm"
                pill
                onClick={() => navigate('/cities')}
                leftIcon={<Compass className="w-4 h-4" />}
              >
                Explore Destinations
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <Card className="space-y-6">
          <div className="border-b border-ink-border/20 pb-3">
            <h2 className="text-base font-bold text-ink">Change Password</h2>
            <p className="text-xs text-ink-muted">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-type new password"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="secondary"
              size="md"
              pill
              isLoading={updateProfileMutation.isPending}
            >
              Update Password
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'danger' && (
        <Card className="space-y-6 border-danger/30">
          <div className="border-b border-ink-border/20 pb-3">
            <h2 className="text-base font-bold text-danger">Danger Zone</h2>
            <p className="text-xs text-ink-muted">
              Permanently delete your account and all associated itineraries, wishlist data, and preferences.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-danger">Delete Account</h4>
              <p className="text-xs text-ink-muted mt-0.5">
                Once deleted, your account cannot be recovered.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              pill
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </div>

          <Modal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            title="Confirm Account Deletion"
            maxWidth="md"
          >
            <div className="space-y-4">
              <p className="text-xs text-ink leading-relaxed">
                Are you sure you want to permanently delete your GlobeTrotter account? This will immediately remove all your personal profile details and saved destinations.
              </p>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-border/20">
                <Button variant="ghost" size="sm" pill onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  pill
                  isLoading={deleteAccountMutation.isPending}
                  onClick={() => deleteAccountMutation.mutate()}
                >
                  Yes, Delete My Account
                </Button>
              </div>
            </div>
          </Modal>
        </Card>
      )}
    </div>
  );
};
