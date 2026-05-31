import { createContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { sanitizeEmail } from '../utils/sanitize';
import { setUnauthorizedHandler } from '../services/api';
import { marketplaceService } from '../services/marketplaceService';
import { getToken, setToken } from '../utils/tokenStorage';

export const AuthContext = createContext(null);

function getUserType(nextUser, nextProfile) {
  if (nextUser?.role === 'ADMIN') return 'ADMIN';
  if (nextProfile?.isVendor) return 'VENDOR';
  return 'CLIENT';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const mergeProfile = (baseProfile = {}, extraProfile = {}) => ({
    isVendor: Boolean(extraProfile?.isVendor ?? baseProfile?.isVendor),
    subscriptionActive: Boolean(extraProfile?.subscriptionActive ?? baseProfile?.subscriptionActive),
    profileCompleted: Boolean(extraProfile?.profileCompleted ?? baseProfile?.profileCompleted),
    subscriptionPlanCode: extraProfile?.subscriptionPlanCode ?? baseProfile?.subscriptionPlanCode ?? '',
    subscriptionPlanName: extraProfile?.subscriptionPlanName ?? baseProfile?.subscriptionPlanName ?? '',
    subscriptionPlanPriceFcfa: Number(extraProfile?.subscriptionPlanPriceFcfa ?? baseProfile?.subscriptionPlanPriceFcfa ?? 0),
    vendorVerified: Boolean(extraProfile?.vendorVerified ?? baseProfile?.vendorVerified),
    profession: extraProfile?.profession ?? baseProfile?.profession ?? '',
    skills: extraProfile?.skills ?? baseProfile?.skills ?? '',
    experience: extraProfile?.experience ?? baseProfile?.experience ?? '',
    bio: extraProfile?.bio ?? baseProfile?.bio ?? '',
    description: extraProfile?.description ?? baseProfile?.description ?? '',
    phone: extraProfile?.phone ?? baseProfile?.phone ?? '',
    location: extraProfile?.location ?? baseProfile?.location ?? '',
    portfolioUrl: extraProfile?.portfolioUrl ?? baseProfile?.portfolioUrl ?? '',
    socialLinks: extraProfile?.socialLinks ?? baseProfile?.socialLinks ?? '',
    avatar: extraProfile?.avatar ?? baseProfile?.avatar ?? '',
    rating: Number(extraProfile?.rating ?? baseProfile?.rating ?? 0),
    totalReviews: Number(extraProfile?.totalReviews ?? baseProfile?.totalReviews ?? 0)
  });

  const resolveDashboardPath = (nextUser, nextProfile) => {
    if (!nextUser) return '/login';
    const type = getUserType(nextUser, nextProfile);
    if (type === 'ADMIN') return '/dashboard/admin';
    if (type === 'VENDOR') return '/dashboard/vendor';
    // Par défaut, rediriger les clients directement vers leurs demandes
    return '/account/requests';
  };

  const hydrateProfile = async (nextUser) => {
    if (!nextUser) return null;
    let resolved = mergeProfile(nextUser.profile || {}, nextUser || {});
    try {
      const vendorStatus = await userService.vendorStatus();
      resolved = mergeProfile(resolved, vendorStatus);
    } catch (_) {
      // fallback en cas de session invalide ou endpoint indisponible
    }
    setProfile(resolved);
    return resolved;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    userService.me()
      .then(async (data) => {
        setUser(data);
        await hydrateProfile(data);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const payload = await authService.login(sanitizeEmail(email), password);
    setToken(payload.token);
    setUser(payload.user);
    const resolvedProfile = await hydrateProfile(payload.user);
    return { ...payload, profile: resolvedProfile, dashboardPath: resolveDashboardPath(payload.user, resolvedProfile) };
  };

  const register = async (registerPayload) => {
    const payload = await authService.register({
      ...registerPayload,
      email: sanitizeEmail(registerPayload.email)
    });
    setToken(payload.token);
    setUser(payload.user);
    const resolvedProfile = await hydrateProfile(payload.user);
    setProfile(resolvedProfile);
    return { ...payload, profile: resolvedProfile, dashboardPath: resolveDashboardPath(payload.user, resolvedProfile) };
  };

  const becomeVendor = async (request) => {
    return marketplaceService.becomeVendor(request);
  };

  const refreshVendorStatus = async () => {
    const latest = await userService.vendorStatus();
    const merged = mergeProfile(profile || user?.profile || {}, latest);
    setProfile(merged);
    setUser((prev) => (prev ? { ...prev, profile: merged } : prev));
    return merged;
  };

  const isVendor = Boolean(profile?.isVendor);
  const subscriptionActive = Boolean(profile?.subscriptionActive);
  const profileCompleted = Boolean(profile?.profileCompleted);
  const vendorVerified = Boolean(profile?.vendorVerified);
  const isAuthenticated = Boolean(user);

  const value = useMemo(() => ({
    user,
    profile,
    isVendor,
    subscriptionActive,
    profileCompleted,
    vendorVerified,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    becomeVendor,
    refreshVendorStatus,
    getUserType,
    resolveDashboardPath
  }), [user, profile, isVendor, subscriptionActive, profileCompleted, vendorVerified, isAuthenticated, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
