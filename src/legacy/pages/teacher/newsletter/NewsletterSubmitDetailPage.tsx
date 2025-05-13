import { useParams } from 'react-router';
import { Blank } from 'src/components/common';
import { Time } from 'src/components/common/Time';
import { SuperSurveyComponent } from 'src/components/survey/SuperSurveyComponent';
import { useTeacherNewsletterSubmitDetail } from 'src/container/teacher-newsletter-submit-detail';

export function NewsletterSubmitDetailPage() {
  const { id, snid } = useParams<{ id: string; snid: string }>();

  const { newsletter, studentNewsletter, isLoading } = useTeacherNewsletterSubmitDetail(+id, +snid);

  return (
    <>
      {isLoading && <Blank reversed />}
      <div className="relative h-screen-4.5 overflow-x-hidden overflow-y-scroll border border-gray-100">
        <div className="bg-gray-50 p-4">
          <div className="space-y-0.5">
            <div className="mt-2 text-lg font-semibold">{newsletter?.title}</div>
            <Time date={newsletter?.createdAt} />
          </div>
        </div>
        {newsletter?.surveyContent && studentNewsletter?.content && (
          <SuperSurveyComponent
            surveyContent={newsletter?.surveyContent || ''}
            setContent={(c: any) => {}}
            content={JSON.parse(studentNewsletter?.content || '{}')}
            readOnly={true}
          />
        )}

        {newsletter?.updatedAt &&
          studentNewsletter?.updatedAt &&
          studentNewsletter?.isSubmitted &&
          studentNewsletter.updatedAt !== newsletter?.updatedAt && (
            <div className="mt-3 pl-4 text-brandblue-1">
              제출 완료 일시 : <Time date={studentNewsletter.updatedAt} className="text-16 text-inherit" /> (
              <Time date={studentNewsletter.updatedAt} formatDistanceToNow className="text-16 text-inherit" />)
            </div>
          )}
      </div>
    </>
  );
}
