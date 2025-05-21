import { useOutletContext } from 'react-router'
import { ResponsePaginatedOutingDto, ResponseUserDto } from '@/legacy/generated/model'
import { HistoryAbsentDetailPage } from './HistoryAbsentDetailPage'
import { HistoryFieldtripDetailPage } from './HistoryFieldtripDetailPage'
import { HistoryOutingDetailPage } from './HistoryOutingDetailPage'

interface HistoryContext {
  selectedDocType: number
  outings?: ResponsePaginatedOutingDto
  setOutingId: (id: number) => void
  setOpen: (open: boolean) => void
  setAgreeAll: (agree: boolean) => void
  userId?: number
  setAbsentId: (id: number) => void
  setFieldtripId: (id: number) => void
  me?: ResponseUserDto
}

export function HistoryDetailPage() {
  const { selectedDocType, outings, setOutingId, setOpen, setAgreeAll, userId, setAbsentId, setFieldtripId, me } =
    useOutletContext<HistoryContext>()

  if (selectedDocType === 0) {
    return (
      <HistoryOutingDetailPage
        outings={outings}
        setOutingId={setOutingId}
        setOpen={setOpen}
        setAgreeAll={setAgreeAll}
      />
    )
  }

  if (selectedDocType === 1) {
    return <HistoryAbsentDetailPage userId={userId} setAbsentId={setAbsentId} />
  }

  if (selectedDocType === 2) {
    return (
      <HistoryFieldtripDetailPage setOpen={setOpen} setFieldtripId={setFieldtripId} setAgreeAll={setAgreeAll} me={me} />
    )
  }

  return null
}
