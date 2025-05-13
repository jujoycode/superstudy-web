# SuperStury Web

SuperStury Web은 React와 TypeScript를 기반으로 한 현대적인 웹 애플리케이션입니다. 이 프로젝트는 Vite를 사용하여 빠른 개발 경험과 최적화된 빌드를 제공합니다.

## 기술 스택

### 핵심 기술
- **React 19**: 최신 React 기능을 활용한 컴포넌트 기반 UI 개발
- **TypeScript**: 정적 타입 검사를 통한 안정적인 코드베이스 구축
- **Vite**: 빠른 개발 환경과 최적화된 빌드 시스템
- **React Router 7**: 클라이언트 사이드 라우팅
- **Recoil**: 상태 관리 라이브러리

### UI/UX
- **TailwindCSS 4**: 유틸리티 우선 CSS 프레임워크
- **Swiper**: 터치 슬라이더 구현
- **React Beautiful DnD**: 드래그 앤 드롭 인터페이스
- **Chart.js & React-Chartjs-2**: 데이터 시각화

### API 통신
- **React Query**: 서버 상태 관리 및 캐싱
- **Axios**: HTTP 클라이언트
- **Socket.io-client**: 실시간 양방향 통신

### 개발 도구
- **Storybook**: UI 컴포넌트 개발 및 문서화
- **ESLint & Prettier**: 코드 품질 및 일관성 유지
- **Vitest**: 테스트 프레임워크
- **Orval**: API 코드 생성 도구

## 프로젝트 구조

프로젝트는 기능과 역할에 따라 명확하게 구분된 구조로 구성되어 있습니다:

```
src/
├── assets/      # 이미지, 아이콘, 폰트 등 정적 자산
├── hooks/       # 커스텀 React 훅
├── legacy/      # 이전 버전과의 호환성을 위한 코드
├── routers/     # 라우팅 설정
├── stories/     # Storybook 컴포넌트 스토리
└── types/       # TypeScript 타입 정의
```

## 아키텍처 및 패턴

### 컴포넌트 설계 원칙
- **아토믹 디자인**: 재사용 가능한 작은 컴포넌트부터 복잡한 페이지까지 계층적 구조
- **컴포지션 우선**: 상속보다는 컴포지션을 통한 컴포넌트 구성
- **Container/Presenter 패턴**: 로직과 UI의 분리

### 상태 관리
- **Recoil**: 전역 상태 관리를 위한 atom 및 selector 활용
- **React Query**: 서버 상태 관리 및 캐싱 전략

### 코딩 컨벤션
- **기능 중심 폴더 구조**: 관련 기능을 하나의 폴더에 그룹화
- **타입 우선 접근**: 인터페이스와 타입 정의를 통한 개발
- **조기 반환 패턴**: 가독성을 위한 조기 반환 패턴 적용
- **이벤트 핸들러 명명 규칙**: `handle` 접두사 사용

## 접근성 및 성능
- **웹 접근성 준수**: ARIA 속성, 키보드 내비게이션 지원
- **반응형 디자인**: 다양한 디바이스 지원
- **성능 최적화**: 코드 분할, 지연 로딩, 메모이제이션

## 개발 환경 설정

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 환경 설정
yarn env:dev  # 개발 환경
yarn env:prod # 프로덕션 환경

# API 코드 생성
yarn gen

# 테스트 실행
yarn test

# 프로덕션 빌드
yarn build
```

## Docker 지원
개발 및 프로덕션 환경을 위한 Docker 구성이 포함되어 있습니다:
- `Dockerfile.dev`: 개발 환경용
- `Dockerfile`: 프로덕션 환경용

## 향후 개발 계획
- 마이크로 프론트엔드 아키텍처 도입 검토
- 서버 사이드 렌더링(SSR) 지원 확대
- 자동화된 E2E 테스트 강화
- 국제화(i18n) 지원 개선
