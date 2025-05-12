import { Fieldtrip } from '@/legacy/generated/model'
import { makeStartEndToString } from '@/legacy/util/time'

interface FieldtripSuburbsTextSeparatePaperProps {
  fieldtrip: Fieldtrip
  studentName: string
  resultTextPage: string
}

export function FieldtripSuburbsTextSeparatePaper({
  fieldtrip,
  studentName,
  resultTextPage,
}: FieldtripSuburbsTextSeparatePaperProps) {
  return (
    <div>
      <div className="w-full text-center text-xl font-bold">「학교장허가 교외체험학습」 결과보고서(별지)</div>
      <div className="flex justify-center">
        <table className="w-full table-fixed border-2 border-black">
          <thead>
            <tr className="h-12">
              <th className="border border-black bg-gray-200" colSpan={3}>
                성명
              </th>
              <td className="border border-black text-center" colSpan={6}>
                {studentName}
              </td>
              <th className="border border-black bg-gray-200" colSpan={4}>
                학년 반
              </th>
              <th className="border border-black" colSpan={8}>
                {fieldtrip.studentGradeKlass}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="h-8 border border-dashed border-black px-4 text-center" colSpan={9}>
                교외체험학습 기간
              </td>
              <td className="h-8 border border-dashed border-black px-4 text-center" colSpan={12}>
                {makeStartEndToString(fieldtrip.startAt || '', fieldtrip.endAt || '')}
              </td>
            </tr>

            <tr>
              <td colSpan={21} className="relative border border-black whitespace-pre-line">
                <div className="h-[800px] overflow-y-auto px-4">{resultTextPage}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
