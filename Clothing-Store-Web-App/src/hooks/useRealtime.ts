'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store Settings Interface
export interface StoreSettings {
  storeName: string;
  storeDescription: string | null;
  storeEmail: string | null;
  storePhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  openHour: string | null;
  closeHour: string | null;
  openDays: string | null;
  bannerEnabled: boolean;
  bannerText: string | null;
  bannerLink: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

// Social Handle Interface
export interface SocialHandle {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  isActive: boolean;
}

// Default settings
const defaultSettings: StoreSettings = {
  storeName: 'Clothing Ctrl',
  storeDescription: null,
  storeEmail: null,
  storePhone: null,
  addressLine1: null,
  addressLine2: null,
  city: 'Nairobi',
  country: 'Kenya',
  openHour: '12:00',
  closeHour: '18:00',
  openDays: 'Mon-Sat',
  bannerEnabled: false,
  bannerText: null,
  bannerLink: null,
  metaTitle: null,
  metaDescription: null,
};

// Settings Store
interface SettingsStore {
  settings: StoreSettings;
  socials: SocialHandle[];
  isLoading: boolean;
  lastUpdated: number | null;
  setSettings: (settings: Partial<StoreSettings>) => void;
  setSocials: (socials: SocialHandle[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      socials: [],
      isLoading: true,
      lastUpdated: null,
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          lastUpdated: Date.now(),
        })),
      setSocials: (socials) =>
        set({
          socials,
          lastUpdated: Date.now(),
        }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'clothing-ctrl-settings',
      partialize: (state) => ({
        settings: state.settings,
        socials: state.socials,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Hook for components that need live settings
export function useLiveSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const socials = useSettingsStore((state) => state.socials);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const setSocials = useSettingsStore((state) => state.setSocials);
  const setLoading = useSettingsStore((state) => state.setLoading);

  // Fetch settings on mount
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get banner settings
  const getBanner = () => {
    const { bannerEnabled, bannerText, bannerLink } = settings;
    if (!bannerEnabled || !bannerText) return null;
    return { enabled: bannerEnabled, text: bannerText, link: bannerLink };
  };

  // Get active socials
  const getActiveSocials = () => {
    return socials.filter((s) => s.isActive);
  };

  return {
    settings,
    socials,
    isLoading,
    getBanner,
    getActiveSocials,
    fetchSettings,
    setSettings,
    setSocials,
  };
}
