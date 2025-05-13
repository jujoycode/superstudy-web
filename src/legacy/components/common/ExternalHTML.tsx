import { createElement, useEffect, useRef, HTMLAttributes } from 'react'

// 외부 HTML 문자열을 받아서 렌더링하는 컴포넌트
// 참고1: https://github.com/christo-pr/dangerously-set-html-content/blob/main/src/index.js
// 참고2: https://stackoverflow.com/questions/35614809/react-script-tag-not-working-when-inserted-using-dangerouslysetinnerhtml

interface ExternalHTMLProps extends HTMLAttributes<HTMLDivElement> {
  html: string
  allowRerender?: boolean // 첫 렌더링 이후 리렌더링 허용 여부
}

export default function ExternalHTML({ html, allowRerender, ...rest }: ExternalHTMLProps) {
  const divRef = useRef<HTMLDivElement | null>(null)
  const isFirstRender = useRef<boolean>(true)

  useEffect(() => {
    if (!html || !divRef.current) throw new Error("html prop can't be null")
    if (!isFirstRender.current) return
    isFirstRender.current = Boolean(allowRerender)

    const slotHtml = document.createRange().createContextualFragment(html) // Create a 'tiny' document and parse the html string
    divRef.current.innerHTML = '' // Clear the container
    divRef.current.appendChild(slotHtml) // Append the new content

    // 외부 HTML 문자열에 스크립트 태그가 있는 경우, 스크립트 태그를 실행하기 위한 코드
    const scripts = divRef.current.querySelectorAll('script')
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
      newScript.textContent = oldScript.textContent
      oldScript.parentNode?.replaceChild(newScript, oldScript)
    })
  }, [html, divRef])

  return createElement('div', { ...rest, ref: divRef })
}
