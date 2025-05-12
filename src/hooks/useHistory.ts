import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';

export function useHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  const push = useCallback(
    (path: string, state?: any) => {
      navigate(path, { state });
    },
    [navigate]
  );

  const replace = useCallback((path: string) => {
    navigate(path, { replace: true });
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    push,
    replace,
    goBack,
    location,
  };
}
