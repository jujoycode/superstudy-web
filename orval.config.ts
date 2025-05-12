import { defineConfig } from 'orval';

export default defineConfig({
  superStudy: {
    input: {
      // target: 'https://web.dev.superschool.link/api/docs-json',
      target: 'http://localhost:8000/api/docs-json',
    },
    output: {
      mode: 'split',
      target: './src/generated/endpoint.ts',
      schemas: './src/generated/model',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: './src/lib/axios.ts',
          name: 'mutator',
        },
        useDates: false,
        query: {
          useQuery: true,
          useInfinite: false,
          useInfiniteQueryParam: 'page',
        },
      },
    },
  },
});
