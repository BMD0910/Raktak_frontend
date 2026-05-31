import { useEffect, useState } from 'react';

export function useAsyncData(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await loader();
      setData(result);
      return result;
    } catch (err) {
      setError(err?.userMessage || err?.message || 'Erreur de chargement');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    loader()
      .then((result) => {
        if (!mounted) return;
        setData(result);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.userMessage || err?.message || 'Erreur de chargement');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, deps);

  return { data, loading, error, setData, setError, refetch };
}
