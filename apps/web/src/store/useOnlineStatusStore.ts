/**
 * Online Status Store
 * 
 * Manages online/offline status for friends in the chat application.
 * Status is updated via API on initial load and through WebSocket events.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface OnlineStatusState {
  // Map of userId -> isOnline
  statuses: Record<string, boolean>;

  // Actions
  setUserStatus: (userId: string, isOnline: boolean) => void;
  setMultipleStatuses: (statuses: Record<string, boolean>) => void;
  isUserOnline: (userId: string) => boolean;
  reset: () => void;
}

export const useOnlineStatusStore = create<OnlineStatusState>()(
  devtools(
    (set, get) => ({
      statuses: {},

      /**
       * Set online status for a single user
       */
      setUserStatus: (userId: string, isOnline: boolean) => {
        set((state) => ({
          statuses: {
            ...state.statuses,
            [userId]: isOnline,
          },
        }));
      },

      /**
       * Set online status for multiple users at once
       * Used for initial hydration from API
       */
      setMultipleStatuses: (statuses: Record<string, boolean>) => {
        set((state) => ({
          statuses: {
            ...state.statuses,
            ...statuses,
          },
        }));
      },

      /**
       * Check if a user is online
       */
      isUserOnline: (userId: string) => {
        return get().statuses[userId] ?? false;
      },

      /**
       * Reset all status data
       */
      reset: () => {
        set({ statuses: {} });
      },
    }),
    {
      name: 'online-status-store',
    }
  )
);
