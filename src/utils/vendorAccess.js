export function canCreateService(profile) {
  return Boolean(
    profile?.isVendor
    && profile?.subscriptionActive
    && profile?.profileCompleted
  );
}

export function canAccessVendorSetup(profile) {
  return Boolean(profile?.isVendor && profile?.subscriptionActive && !profile?.profileCompleted);
}
