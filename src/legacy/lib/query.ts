import { QueryClient, useQuery } from 'react-query';
import { api } from './axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

export function useSignedUrl(key?: string | null) {
  const queryKey = `/api/images/presigned-url?url=${key}`;
  return useQuery({
    queryKey,
    queryFn: () => (key?.startsWith('data:image') ? key : api.get<string>(queryKey).then(({ data }) => data)),
    enabled: !!key,
  });
}
