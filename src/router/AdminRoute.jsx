import GuardedRoute from './GuardedRoute';

export default function AdminRoute({ children }) {
  return <GuardedRoute requireAdmin>{children}</GuardedRoute>;
}
