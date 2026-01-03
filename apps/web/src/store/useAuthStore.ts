/**
 * Authentication Store
 * 
 * Security: Uses httpOnly cookies managed by the backend.
 * No JWT tokens are stored in frontend memory or localStorage.
 * The backend sets secure httpOnly cookies on signin/refresh.
 */

import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";
import { UserDto } from "@raven/types";

export interface AuthState {
  // User data only - no tokens in frontend
  user: UserDto | null;
  loading: boolean;
  hasCheckedAuth: boolean; // Track if we've already checked auth on startup
  isAuthenticated: boolean;

  // Actions
  signUp: (username: string, password: string, email: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearState: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        loading: false,
        hasCheckedAuth: false,
        isAuthenticated: false,

        clearState: () => {
          set({ user: null, loading: false, hasCheckedAuth: true, isAuthenticated: false });
        },

        signUp: async (username, password, email) => {
          try {
            set({ loading: true });
            await authService.signUp({ username, password, email });
            toast.success("Registration successful! Please sign in.");
            return true;
          } catch (error) {
            console.error(error);
            toast.error("Registration failed. Please try again.");
            return false;
          } finally {
            set({ loading: false });
          }
        },

        signIn: async (email, password) => {
          try {
            set({ loading: true });
            const response = await authService.signIn({ email, password });

            if (!response.success) {
              toast.error(response.message || "Sign in failed");
              return false;
            }

            // Get user profile after successful login
            await get().getProfile();
            toast.success("Welcome back! 🎉");
            return true;
          } catch (error) {
            console.error(error);
            toast.error("Sign in failed. Please check your credentials.");
            return false;
          } finally {
            set({ loading: false });
          }
        },

        signOut: async () => {
          try {
            await authService.signOut();
            get().clearState();
            toast.success("Signed out successfully!");
          } catch (error) {
            console.error(error);
            // Clear state anyway on signout
            get().clearState();
            toast.error("Error during sign out.");
          }
        },

        getProfile: async () => {
          try {
            set({ loading: true });
            const response = await authService.getProfile();
            set({ user: response.data, hasCheckedAuth: true, isAuthenticated: true });
          } catch (error) {
            console.error(error);
            set({ user: null, hasCheckedAuth: true, isAuthenticated: false });
          } finally {
            set({ loading: false });
          }
        },

        /**
         * Check if user is authenticated
         * Called on app startup to restore session from httpOnly cookie
         * Only runs once per app session
         */
        checkAuth: async () => {
          const state = get();

          // Prevent multiple calls - strict check
          if (state.loading) {
            console.log("[Auth] Skipping checkAuth - already loading");
            return;
          }

          if (state.hasCheckedAuth) {
            console.log("[Auth] Skipping checkAuth - already checked");
            return;
          }

          try {
            set({ loading: true, hasCheckedAuth: true }); // Set hasCheckedAuth immediately to prevent re-entry
            const response = await authService.getProfile();
            set({ user: response.data, isAuthenticated: true, loading: false });
          } catch (error) {
            // Not authenticated - this is normal for unauthenticated users
            console.log("[Auth] Not authenticated");
            set({ user: null, isAuthenticated: false, loading: false });
          }
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        // Only persist user data for quick UI display
        // loading, hasCheckedAuth, isAuthenticated are intentionally NOT persisted
        // They start fresh on each app load
        partialize: (state) => ({
          user: state.user,
        }),
      }
    ),
    { name: "auth-store" }
  )
);

// Alias for backward compatibility
export { useAuthStore as useAuthStoreNew };
