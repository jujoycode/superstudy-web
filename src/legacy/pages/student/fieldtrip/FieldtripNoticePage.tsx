import { useParams } from 'react-router'
import { ErrorBlank } from '@/legacy/components'
import { BackButton, Blank, TopNavbar } from '@/legacy/components/common'
import { FieldtripPaper } from '@/legacy/components/fieldtrip/FieldtripPaper'
import { useStudentFieldtripNotice } from '@/legacy/container/student-fieldtrip-notice'

export function FieldtripNoticePage() {
  const { id } = useParams<{ id: string }>()
  const { fieldtrip, isLoading, error, me } = useStudentFieldtripNotice(Number(id))

  return (
    <>
      {isLoading && <Blank />}
      {error && <ErrorBlank />}
      <TopNavbar
        title="통보서"
        left={
          <div className="h-15">
            <BackButton className="h-15" />
          </div>
        }
      />
      <div className="w-full bg-white p-5">
        <FieldtripPaper school={me?.school} fieldtrip={fieldtrip} type="통보서" />
      </div>
    </>
  )
}
