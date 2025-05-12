import { forwardRef } from 'react'
import { useRecoilValue } from 'recoil'
import { Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { useSignedUrl } from '@/legacy/lib/query'
import { childState, meState } from '@/stores'
import { Time } from '@/legacy/components/common/Time'
import { SuperSurveyComponent } from '../survey/SuperSurveyComponent'

interface NewsletterPaperProps {
  newsletter?: any
  studentNewsletter?: any
  suid?: any
}

export const NewsletterPaper = forwardRef(({ newsletter, studentNewsletter }: NewsletterPaperProps, ref: any) => {
  const { data: studentSignature } = useSignedUrl(studentNewsletter?.studentSignature)
  const { data: parentSignature } = useSignedUrl(studentNewsletter?.parentSignature)

  const meRecoil = useRecoilValue(meState)
  const myChild = useRecoilValue(childState)
  const { t } = useLanguage()
  const schoolName = meRecoil?.role === Role.PARENT ? myChild?.school.name : meRecoil?.school.name
  const schoolMark = meRecoil?.role === Role.PARENT ? myChild?.school.mark : meRecoil?.school.mark

  return (
    <div ref={ref} className="w-full bg-white md:h-[1100px]">
      <div className="flex w-full flex-col space-y-2 p-5 md:p-20 md:pt-[67px]">
        <div className="w-full min-w-max text-center text-xl font-bold md:text-3xl">
          가정통신문
          {/* {t(`absentTitle`, '결석신고서')} */}
        </div>
        <>
          <div className="h-screen-4.5 relative overflow-x-hidden border border-gray-100 text-sm">
            <div className="bg-gray-50 p-4">
              <div className="space-y-0.5">
                <div className="mt-2 text-lg font-semibold">{newsletter?.title}</div>
                <Time date={newsletter?.createdAt} />
              </div>
            </div>
            {newsletter?.surveyContent && studentNewsletter?.content && (
              <div>
                <SuperSurveyComponent
                  surveyContent={newsletter?.surveyContent || ''}
                  setContent={(c: any) => {}}
                  content={JSON.parse(studentNewsletter?.content || '{}')}
                  id={studentNewsletter?.id}
                />
              </div>
            )}

            {/* <div className="mt-3 pl-4 text-brandblue-1">
              제출 완료 일시 : <Time date={studentNewsletter?.updatedAt} className="text-16 text-inherit" />
            </div>
            {newsletter?.updatedAt && newsletter?.isSubmitted && (
              <div className="mt-3 pl-4 text-brandblue-1">
                제출 완료 일시 : <Time date={newsletter.updatedAt} className="text-16 text-inherit" />
              </div>
            )} */}
          </div>
        </>

        <div>
          <div className="flex w-full items-center space-x-4">
            <div className="w-full min-w-max text-right text-gray-600">제출일 :</div>
            <div className="w-2/5 min-w-max text-right text-lg font-bold text-gray-800">
              <Time date={studentNewsletter?.updatedAt} className="text-16 text-inherit" />
            </div>
            <div className="min-w-[50px]" />
          </div>

          {newsletter?.toPerson ? (
            <div className="flex w-full items-start space-x-4">
              <div className="w-full min-w-max text-right text-gray-600">제출자 :</div>
              <div className="w-2/5 min-w-max text-right text-lg font-bold text-gray-800">
                {studentNewsletter?.studentGradeKlass} {studentNewsletter?.studentNumber}번 <br />
                {studentNewsletter?.student?.name}
                {studentNewsletter?.writer?.role === 'PARENT' ? '(보:' + studentNewsletter?.writer?.name + ')' : ''}
              </div>
              {studentSignature || parentSignature ? (
                <img src={studentSignature || parentSignature} alt="" className="w-[50px]" />
              ) : (
                <div className="h-[5px] min-w-[50px]" />
              )}
            </div>
          ) : (
            <>
              {!parentSignature ? (
                <div className="flex w-full items-start space-x-4">
                  <div className="w-full min-w-max text-right text-gray-600">학생 :</div>
                  <div className="w-2/5 min-w-max text-right text-lg font-bold text-gray-800">
                    {studentNewsletter?.studentGradeKlass} {studentNewsletter?.studentNumber}번 <br />
                    {studentNewsletter?.student?.name}
                  </div>
                  {studentSignature ? (
                    <img src={studentSignature} alt="" className="w-[50px]" />
                  ) : (
                    <div className="h-[5px] min-w-[50px]" />
                  )}
                </div>
              ) : (
                <>
                  <div className="flex w-full items-start space-x-4">
                    <div className="w-full min-w-max text-right text-gray-600">학생 :</div>
                    <div className="w-2/5 min-w-max text-right text-lg font-bold text-gray-800">
                      {studentNewsletter?.studentGradeKlass} {studentNewsletter?.studentNumber}번 <br />
                      {studentNewsletter?.student?.name}
                    </div>
                    {studentSignature ? (
                      <img src={studentSignature} alt="" className="w-[50px]" />
                    ) : (
                      <div className="h-[5px] min-w-[50px]" />
                    )}
                  </div>
                  <div className="flex w-full items-center space-x-4">
                    <div className="w-full min-w-max text-right text-gray-600">보호자 :</div>
                    <div className="w-2/5 min-w-max text-right text-lg font-bold text-gray-800">
                      {studentNewsletter?.student?.name}보호자
                    </div>
                    {parentSignature ? (
                      <img src={parentSignature} alt="" className="w-[50px]" />
                    ) : (
                      <div className="h-[5px] min-w-[50px]" />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="w-full min-w-max text-center text-xl font-bold md:text-3xl">
        {/* <img className="w-6 rounded-md" src={`${Constants.imageUrl}${schoolMark}`} /> */}
        {schoolName}장 귀하
      </div>
    </div>
  )
})
