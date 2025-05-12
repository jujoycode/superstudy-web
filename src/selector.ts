import { selector } from 'recoil';
import { meState } from './store';
import { useSchoolPropertyGetProperties } from '@/legacy/generated/endpoint';

export const schoolPropertiesSelector = selector({
  key: 'schoolPropertiesSelector',
  get: async ({ get }) => {
    const me = get(meState);

    if (!me || !me.schoolId) {
      return {};
    }

    // API 호출로 학교 속성 정보 가져오기
    const { data } = useSchoolPropertyGetProperties({
      query: {
        enabled: !!me.schoolId,
      },
    });
    return data;
  },
});
