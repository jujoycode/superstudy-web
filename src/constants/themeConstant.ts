export enum THEME_ENUM {
  SUPERSCHOOL = 'SUPERSCHOOL',
  LG = 'LG',
}

export class ThemeConstant {
  public static readonly Themes = {
    [THEME_ENUM.SUPERSCHOOL]: {
      'color-primary-50': '#FFF8F5',
      'color-primary-100': '#FFE8DB',
      'color-primary-200': '#FFD8C2',
      'color-primary-300': '#FFCBAD',
      'color-primary-400': '#FFBC99',
      'color-primary-700': '#FF803D',
      'color-primary-800': '#FF600C',
      'color-primary-850': '#CC4700',
      'color-primary-900': '#CC4700',
      'color-primary-950': '#A23800',
      'color-primary-999': '#501C00',
      // 2 degree 대응 컬러 (** 개선 필요)
      'color-secondary-400': '#FFFFFF',
      'color-secondary-800': '#4C5057',
      'color-secondary-850': '#24282D',
    },

    [THEME_ENUM.LG]: {
      'color-primary-50': '#FFF7FB',
      'color-primary-100': '#FCDAED',
      'color-primary-200': '#F8BFE0',
      'color-primary-300': '#EE96C9',
      'color-primary-400': '#E666B1',
      'color-primary-700': '#E63596',
      'color-primary-800': '#E6007E',
      'color-primary-850': '#B20068',
      'color-primary-900': '#8A0150',
      'color-primary-950': '#66003B',
      'color-primary-999': '#47002A',
      // 2 degree 대응 컬러 (** 개선 필요)
      'color-secondary-400': '#C7CBD1',
      'color-secondary-800': '#000000',
      'color-secondary-850': '#000000',
      // 4 degree 대응 컬러 (** 개선 필요)
      'color-tertiary-100': '#F3F5F6',
      'color-tertiary-300': '#D8DBDF',
      'color-tertiary-600': '#61656B',
    },
  }
}
