import { useNavigate } from 'react-router-dom'

const useHistory = () => {
  const navigate = useNavigate()

  const push = (url: string) => {
    navigate(url)
  }

  const goBack = () => {
    navigate(-1)
  }

  const replace = (url: string) => {
    navigate(url, { replace: true })
  }

  return { push, goBack, replace }
}

export default useHistory
