import ReactResponsive from 'react-responsive'

interface MediaRendererProps {
  default?: React.ReactNode
  mobile?: React.ReactNode
  //   tablet?: React.ReactNode
}

export function MediaRenderer({ default: defaultComponent, mobile }: MediaRendererProps) {
  return (
    <>
      {defaultComponent && <ReactResponsive minWidth={771}>{defaultComponent}</ReactResponsive>}
      {mobile && <ReactResponsive maxWidth={770}>{mobile}</ReactResponsive>}
    </>
  )
}
