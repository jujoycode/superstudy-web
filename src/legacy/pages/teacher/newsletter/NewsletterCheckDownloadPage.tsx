import { useParams } from 'react-router'
import { Td } from '@/legacy/components'
import { Section } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { useTeacherNewsletterCheckDownload } from 'src/container/teacher-newsletter-checkDownload'
import { useTeacherNewsletterDetail } from 'src/container/teacher-newsletter-detail'

export function NewsletterCheckDownloadPage() {
  const { id } = useParams<{ id: string }>()

  const { newsletter: newData } = useTeacherNewsletterDetail({ id: +id })

  const { download, rows } = useTeacherNewsletterCheckDownload({
    newsletterId: +id,
    surveyTitle: newData?.title,
  })

  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex w-full items-center space-x-2 border-b border-gray-500 bg-white px-5 py-3">
        <Button.lg children="다운로드" onClick={download} className="filled-primary" />
      </div>
      <Section className="mt-2">
        <div className="text-xl font-bold">미확인자 미리보기</div>
        <table>
          <tbody>
            {rows?.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <Td key={j} innerClassName="min-w-max">
                    {cell}
                  </Td>
                ))}
              </tr>
            ))}
            {rows?.length === 0 && <span className="min-w-max">- 미확인자가 없습니다.</span>}
          </tbody>
        </table>
      </Section>
    </div>
  )
}
