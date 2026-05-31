import GuardedRoute from './GuardedRoute';

export default function VendorRoute({ children, requireSubscribed = false, requireServiceReady = false }) {
  return (
    <GuardedRoute requireVendor requireSubscribed={requireSubscribed} requireServiceReady={requireServiceReady}>
      {children}
    </GuardedRoute>
  );
}
