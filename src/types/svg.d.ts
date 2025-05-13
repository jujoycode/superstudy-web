// 기본 내보내기는 React 컴포넌트 (vite-plugin-svgr 설정에 따라)
declare module '*.svg' {
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  export { ReactComponent }
  export default ReactComponent
}
