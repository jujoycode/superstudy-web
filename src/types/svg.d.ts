declare module '*.svg' {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string; src?: string }>

  export { ReactComponent }
  // 기본 내보내기는 React 컴포넌트 (vite-plugin-svgr 설정에 따라)
  export default ReactComponent
}
