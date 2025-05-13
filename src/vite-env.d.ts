/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*.svg' {
  import * as React from 'react'

  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>

  const src: string
  export default src
}

// 전역 변수 선언
declare const __BUILD_TIME__: string
declare const __BUILD_VERSION__: string
