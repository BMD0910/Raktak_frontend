export function mapDashboardSummaryToModel(data) {
  return {
    totalUsers: Number(data?.totalUsers || 0),
    totalVendors: Number(data?.totalVendors || 0),
    totalCategories: Number(data?.totalCategories || 0),
    totalSubcategories: Number(data?.totalSubcategories || 0),
    currentRole: String(data?.currentRole || 'USER')
  };
}
