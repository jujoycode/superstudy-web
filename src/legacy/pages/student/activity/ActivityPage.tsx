import { ErrorBlank } from '@/legacy/components'
import { Blank, Chip, HorizontalScrollView, List, ListItem, Section, TopNavbar } from '@/legacy/components/common'
import { FeedsItem } from '@/legacy/components/common/FeedsItem'
import { Tabs } from '@/legacy/components/common/Tabs'
import { ActivityFilterEnum } from '@/legacy/constants/activity-filter.enum'
import { useStudentActivity } from '@/legacy/container/student-activity'
import { ActivityType } from '@/legacy/generated/model'
import { DateFormat, DateUtil } from '@/legacy/util/date'

export function ActivityPage() {
  const {
    activities,
    isLoading,
    isError,
    blankOpen,
    setBlankOpen,
    subject,
    setSubject,
    filter,
    setFilter,
    uniqueSubjects,
  } = useStudentActivity()

  if (isError) {
    return <ErrorBlank />
  }

  return (
    <>
      {isLoading && <Blank />}
      {isError && <ErrorBlank />}
      <TopNavbar
        title="활동"
        left={<div className="h-15 w-10" />}
        right={
          <div
            onClick={() => {
              setBlankOpen(true)
              window?.location?.reload()
            }}
            className="text-primary-800"
          >
            새로고침
          </div>
        }
      />

      {blankOpen && <Blank />}
      <Section className="px-0">
        <HorizontalScrollView>
          <Chip
            children="전체"
            onClick={() => setSubject('all')}
            selected={!subject || subject === 'all'}
            className="min-w-max rounded-md py-2"
          />
          {uniqueSubjects?.map((uniqueSubject) => (
            <Chip
              key={uniqueSubject}
              children={uniqueSubject}
              selected={uniqueSubject === subject}
              onClick={() => setSubject(uniqueSubject)}
              className="min-w-max rounded-md py-3"
            />
          ))}
        </HorizontalScrollView>
      </Section>
      <Tabs>
        {[
          { name: '전체', filter: ActivityFilterEnum.All },
          { name: '공지', filter: ActivityFilterEnum.Notice },
          { name: '과제', filter: ActivityFilterEnum.Post },
          { name: '설문', filter: ActivityFilterEnum.Survey },
          { name: '마감전', filter: ActivityFilterEnum.Before },
        ].map((tab) => (
          <Tabs.Button
            key={tab.name}
            children={tab.name}
            selected={filter === tab.filter}
            onClick={() => setFilter(tab.filter)}
          />
        ))}
      </Tabs>
      <List className="mt-2">
        {activities?.map(
          (a) =>
            a.id && (
              <>
                <FeedsItem
                  key={a.id}
                  id={a.id}
                  to={'student'}
                  pageType={'activity'}
                  category1={a.subject}
                  category2={a.type === ActivityType.POST ? '과제' : a.type === ActivityType.NOTICE ? '공지' : '설문'}
                  title={a.title}
                  //newYN={a.}
                  submitDate={
                    a.type === ActivityType.NOTICE
                      ? undefined
                      : a.endDate && DateUtil.formatDate(a.endDate, DateFormat['YYYY.MM.DD HH:mm'])
                  }
                  submitYN={a.type === ActivityType.NOTICE ? undefined : a.studentActivitySubmitted}
                  contentText={(a.type !== ActivityType.SURVEY && a.content) || undefined}
                  contentImages={a.images}
                  contentFiles={a.files}
                  //writer={notice.user.name}
                  createAt={DateUtil.formatDate(a.createdAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
                />
              </>
            ),
        )}
        {!activities?.length && <ListItem>과제가 없습니다.</ListItem>}
      </List>
    </>
  )
}
