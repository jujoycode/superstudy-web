import { extendTailwindMerge } from 'tailwind-merge';

export const cn = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-10',
        'text-11',
        'text-12',
        'text-13',
        'text-14',
        'text-15',
        'text-16',
        'text-17',
        'text-18',
        'text-19',
        'text-20',
        'text-24',
        'text-28',
        'text-30',
        'text-36',
        'text-48',
        'text-60',
        'text-72',
        'text-96',
        'text-128',
      ],
    },
  },
});
