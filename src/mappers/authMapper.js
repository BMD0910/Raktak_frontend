import { mapUserResponseToModel } from './userMapper';

export function mapAuthResponseToModel(data) {
  const mappedUser = mapUserResponseToModel(data?.user || {});
  const profile = {
    ...(mappedUser?.profile || {}),
    isVendor: Boolean(data?.profile?.isVendor ?? mappedUser?.profile?.isVendor),
    vendorVerified: Boolean(data?.profile?.vendorVerified ?? mappedUser?.profile?.vendorVerified)
  };

  return {
    token: String(data?.token || ''),
    profile,
    user: {
      ...mappedUser,
      profile
    }
  };
}
