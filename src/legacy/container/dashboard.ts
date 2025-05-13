import { t } from 'i18next'
import { useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useDashboardGetDashBoardData } from '@/legacy/generated/endpoint'
import { ResponseDashboardDto, ResponseParentApproveDto, Role } from '@/legacy/generated/model'
import { meState, newMsgCntState } from '@/stores'
import { dashboardNewItem } from '@/legacy/types'

export function useDashboard() {
  const me = useRecoilValue(meState)
  const [dashboardItem, setDashboardItem] = useState<dashboardNewItem[]>()
  const [toDoList, setToDoList] = useState<ResponseDashboardDto>()

  const setNewMsgCnt = useSetRecoilState(newMsgCntState)

  useDashboardGetDashBoardData<ResponseDashboardDto>({
    query: {
      onSuccess: (res) => {
        setToDoList(res)

        setNewMsgCnt(res?.unreadChatMessageCount || 0)

        setDashboardItem(makeDashboardItem(res))
      },
    },
  })

  const makeDashboardItem = (todo: ResponseDashboardDto) => {
    const items: dashboardNewItem[] = []

    if (todo?.unreadActivityNoticeCount) {
      items.push({
        messagePre: '확인하지 않은 활동이 ',
        count: todo?.unreadActivityNoticeCount.toString() + '건',
        messagePost: ' 있습니다.',
        url:
          me?.role === Role.USER
            ? '/student/activity'
            : me?.role === Role.PARENT
              ? '/student/activity'
              : // 선생님
                '/teacher/activity',
      })
    }

    if (todo?.unreadNoticeCount) {
      items.push({
        messagePre: '새로운 공지사항이 ',
        count: todo?.unreadNoticeCount.toString() + '건',
        messagePost: ' 있습니다.',
        url:
          me?.role === Role.USER
            ? '/student/notice'
            : me?.role === Role.PARENT
              ? '/student/notice'
              : // 선생님
                '/teacher/notice',
      })
    }

    if (todo?.unapprovedOutingsCount) {
      items.push({
        messagePre: '확인증 ',
        count: todo?.unapprovedOutingsCount.toString() + '건',
        messagePost: '이 결재 대기중입니다.',
        url:
          me?.role === Role.USER
            ? '/student/outing'
            : me?.role === Role.PARENT
              ? '/student/outing'
              : // 선생님
                '/teacher/outing',
      })
    }

    if (todo?.unapprovedAbsentCount) {
      items.push({
        messagePre: `${t(`absentTitle`, '결석신고서')} `,
        count: todo?.unapprovedAbsentCount.toString() + '건',
        messagePost: '이 결재 대기중입니다.',
        url:
          me?.role === Role.USER
            ? '/student/absent'
            : me?.role === Role.PARENT
              ? '/student/absent'
              : // 선생님
                '/teacher/absent',
      })
    }

    if (todo?.unapprovedFieldTripCount) {
      items.push({
        messagePre: '체험학습 신청서 ',
        count: todo?.unapprovedFieldTripCount.toString() + '건',
        messagePost: '이 결재 대기중입니다.',
        url:
          me?.role === Role.USER
            ? '/student/fieldtrip'
            : me?.role === Role.PARENT
              ? '/student/fieldtrip'
              : // 선생님
                '/teacher/fieldtrip',
      })
    }

    if (todo?.unapprovedFieldTripResultCount) {
      items.push({
        messagePre: '체험학습 결과보고서 ',
        count: todo?.unapprovedFieldTripResultCount.toString() + '건',
        messagePost: '이 결재 대기중입니다.',
        url:
          me?.role === Role.USER
            ? '/student/fieldtrip/result'
            : me?.role === Role.PARENT
              ? '/student/fieldtrip/result'
              : // 선생님
                '/teacher/fieldtrip/result',
      })
    }

    if (todo?.unreadChatMessageCount) {
      items.push({
        messagePre: '읽지 않은 메시지가 ',
        count: todo?.unreadChatMessageCount.toString() + '건',
        messagePost: ' 있습니다.',
        url:
          me?.role === Role.USER
            ? '/student/chat'
            : me?.role === Role.PARENT
              ? '/student/chat'
              : // 선생님
                '/teacher/chat',
      })
    }

    if (todo?.notSubmittedActivityCount) {
      items.push({
        messagePre: '제출하지 않은 활동이 ',
        count: todo?.notSubmittedActivityCount.toString() + '건',
        messagePost: ' 있습니다.',
        url:
          me?.role === Role.USER
            ? '/student/activity'
            : me?.role === Role.PARENT
              ? '/student/activity'
              : // 선생님
                '/teacher/activity',
      })
    }

    if (todo?.unreadBoardCount) {
      items.push({
        messagePre: '학급게시판에 새로운 글이 ',
        count: todo?.unreadBoardCount.toString() + '건',
        messagePost: ' 있습니다.',
        url:
          me?.role === Role.USER
            ? '/student/board'
            : me?.role === Role.PARENT
              ? '/student/board'
              : // 선생님
                '/teacher/board',
      })
    }

    if (todo?.unreadNewsletterNoticeCount) {
      items.push({
        messagePre: '읽지 않은 가정통신문이 ',
        count: todo?.unreadNewsletterNoticeCount.toString() + '건',
        messagePost: ' 있습니다.',
        url:
          me?.role === Role.USER
            ? '/student/newsletter'
            : me?.role === Role.PARENT
              ? '/student/newsletter'
              : // 선생님
                '/teacher/newsletter',
      })
    }

    if (todo?.notSubmittedNewsletterCount) {
      items.push({
        messagePre: '회신하지 않은 가정통신문이 ',
        count: todo?.notSubmittedNewsletterCount.toString() + '건',
        messagePost: ' 있습니다.',
        url:
          me?.role === Role.USER
            ? '/student/newsletter'
            : me?.role === Role.PARENT
              ? '/student/newsletter'
              : // 선생님
                '/teacher/newsletter',
      })
    }

    if (me?.role === Role.USER && todo?.remainFieldTripCount) {
      items.push({
        messagePre: '올해 남은 체험학습은 ',
        count: todo?.remainFieldTripCount.toString() + '일',
        messagePost: ' 입니다.',
        url: '',
      })
    }

    if (me?.role === Role.PARENT && todo?.absentData) {
      todo?.absentData?.map((item: ResponseParentApproveDto) =>
        items.push({
          messagePre: item.studentName || '',
          count: '',
          messagePost: ' 학생이 출결신청서의 승인을 요청했습니다.',
          url: item.url || '',
        }),
      )
    }

    if (me?.role === Role.PARENT && todo?.fieldTripData) {
      todo?.fieldTripData?.map((item: ResponseParentApproveDto) =>
        items.push({
          messagePre: item.studentName || '',
          count: '',
          messagePost: ' 학생이 체험학습 신청서의 승인을 요청했습니다.',
          url: item.url || '',
        }),
      )
    }

    if (me?.role === Role.PARENT && todo?.fieldTripResultData) {
      todo?.fieldTripResultData?.map((item: ResponseParentApproveDto) =>
        items.push({
          messagePre: item.studentName || '',
          count: '',
          messagePost: ' 학생이 체험학습 결과보고서의 승인을 요청했습니다.',
          url: item.url || '',
        }),
      )
    }

    if (me?.role === Role.PARENT && todo?.newsletterData) {
      todo?.newsletterData?.map((item: ResponseParentApproveDto) =>
        items.push({
          messagePre: item.studentName || '',
          count: '',
          messagePost: ' 학생이 가정통신문 회신의 승인을 요청했습니다.',
          url: item.url || '',
        }),
      )
    }

    return items
  }

  return {
    toDoList,
    dashboardItem,
  }
}
