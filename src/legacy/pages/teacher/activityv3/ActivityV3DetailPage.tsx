import { useEffect, useMemo, useRef, useState } from 'react'
import { differenceInDays, format } from 'date-fns'
import _, { sortBy } from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useLocation, useParams } from 'react-router-dom'
import Viewer from 'react-viewer'
import { ImageDecorator } from 'react-viewer/lib/ViewerProps'
import { twMerge } from 'tailwind-merge'
import { ReactComponent as FileItemIcon } from '@/assets/svg/file-item-icon.svg'
import { useHistory } from '@/hooks/useHistory'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { Button } from '@/atoms/Button'
import { Radio } from '@/atoms/Radio'
import { Activityv3SubmitterItem } from '@/legacy/components/activityv3/ActivityV3SubmitterItem'
import { SessionDownloadModal } from '@/legacy/components/activityv3/SessionDownloadModal'
import { SessionTable } from '@/legacy/components/activityv3/SessionTable'
import { BackButton, Label, Select, TopNavbar } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Coachmark2 } from '@/legacy/components/common/CoachMark2'
import ConfirmDialog from '@/legacy/components/common/ConfirmDialog'
import { Icon } from '@/legacy/components/common/icons'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { Constants } from '@/legacy/constants'
import { ACTIVITYV3_TYPE_KOR } from '@/legacy/constants/activityv3.enum'
import {
  useAchievementCriteriaGetByIds,
  useActivityV3Delete,
  useActivityV3FindByGroupIds,
  useActivityV3FindOne,
} from '@/legacy/generated/endpoint'
import { Role, StudentGroup, SubjectType } from '@/legacy/generated/model'
import { checkSubmitted } from '@/legacy/util/activityv3'
import { getFileNameFromUrl, isPdfFile } from '@/legacy/util/file'

interface ActivityV3DetailPageProps {}

const SELECT_FILTERS = [
  // { value: '', label: '전체' },
  { value: 'studentText', label: '학생 활동 보고서' },
  { value: 'record', label: '관찰 기록' },
  { value: 'summary', label: '활동 요약' },
]

const SELECT_VIEWS = [
  { value: 'student', label: '학생별 보기' },
  { value: 'group', label: '그룹별 보기' },
]

const SELECT_SUBMITTED = [
  { value: 'all', label: '전체' },
  { value: 'IS_SUBMITTED', label: '제출' },
  { value: 'NOT_SUBMITTED', label: '미제출' },
]

export const ActivityV3DetailPage: React.FC<ActivityV3DetailPageProps> = () => {
  const { id } = useParams<{ id: string }>()
  const { push, replace } = useHistory()
  const { pathname, search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const filter = searchParams.get('filter') || 'studentText'
  const view = searchParams.get('view') || 'group'
  const selectedFilter = searchParams.get('selectedFilter') || 'all'

  const { me } = useUserStore()
  const { setToast: setToastMsg } = useNotificationStore()

  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([])
  const [showDialog, setShowDialog] = useState(false)

  const handleConfirm = () => {
    deleteActivityV3({ id: Number(id) })
    setShowDialog(false)
  }

  const handleCancel = () => {
    setShowDialog(false)
  }
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<number>()
  const [searchedStudentname, setSearchedStudentName] = useState('')
  const [groupDatas, setGroupDatas] = useState<Record<number, StudentGroup[]>>({})
  const [hasImagesModalOpen, setImagesModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [coachmarkVisible, setCoachmarkVisible] = useState<boolean>(false)

  const { data: activityv3 } = useActivityV3FindOne(Number(id), undefined, {
    query: { enabled: !!id },
  })

  const { data: achievementCriterias } = useAchievementCriteriaGetByIds({
    ids: activityv3?.achievementCriteriaIds,
  })

  const { data, isLoading, refetch } = useActivityV3FindByGroupIds(
    Number(id),
    { ids: activityv3?.groupActivityV3s?.map((el) => el.group.id) || [] },
    { query: { enabled: !!activityv3?.groupActivityV3s?.length, staleTime: 100000 } },
  )

  const { mutate: deleteActivityV3 } = useActivityV3Delete({
    mutation: {
      onSuccess: () => {
        setToastMsg('활동이 삭제되었습니다.')
        push('/teacher/activityv3')
      },
      onError: (error) => setToastMsg(error.message),
    },
  })

  const studentGroups = useMemo(() => {
    if (!data) return []
    return _.chain(data).uniqBy('user.id').sortBy('groupId').value()
  }, [data])

  const submittedStudentAmount =
    studentGroups?.filter((sg) => checkSubmitted(sortBy(sg?.user?.studentActivityV3s, 'id')?.[0], filter))?.length || 0
  const unSubmittedStudentAmount = (studentGroups?.length || 0) - submittedStudentAmount

  const viewerImages: ImageDecorator[] = []
  if (activityv3) {
    for (const image of activityv3.images) {
      if (isPdfFile(image) === false) {
        viewerImages.push({
          src: `${Constants.imageUrl}${image}`,
        })
      }
    }
  }

  useEffect(() => {
    if (isLoading) return
    setGroupDatas(
      studentGroups?.reduce((acc: Record<number, StudentGroup[]>, cur: StudentGroup) => {
        return { ...acc, [cur.groupId]: [...(acc[cur.groupId] || []), cur] }
      }, {}) || {},
    )
  }, [studentGroups, isLoading])

  useEffect(() => {
    if (activityv3?.groupActivityV3s?.length) {
      setSelectedGroupIds(activityv3.groupActivityV3s.map((gav) => gav.groupId))
    }
  }, [activityv3])

  const addSessionButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (addSessionButtonRef.current) {
      addSessionButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activityv3])

  if (!activityv3) return <></>

  const sortStudentGroups = (studentGroups: StudentGroup[]) => {
    return studentGroups?.sort((a, b) => {
      const Agroup = a.user?.studentGroups?.[0]?.group
      const Bgroup = b.user?.studentGroups?.[0]?.group

      if (Agroup?.grade === Bgroup?.grade && Agroup?.klass === Bgroup?.klass) {
        return (a.user?.studentGroups?.[0]?.studentNumber || 0) - (b.user?.studentGroups?.[0]?.studentNumber || 0)
      } else if (Agroup?.grade === Bgroup?.grade) {
        return (a.user?.studentGroups?.[0]?.group?.klass || 0) - (b.user?.studentGroups?.[0]?.group?.klass || 0)
      } else {
        return (a.user?.studentGroups?.[0]?.group?.grade || 0) - (b.user?.studentGroups?.[0]?.group?.grade || 0)
      }
    })
  }

  return (
    <div className="col-span-6">
      <div className="md:hidden">
        <TopNavbar title={activityv3.title} left={<BackButton />} />
      </div>
      {/* 활동 상세페이지 배경 */}
      <div className="h-screen-6 3xl:px-[208px] 3xl:pb-[128px] 3xl:pt-[64px] flex flex-col bg-gray-50 p-2 md:h-screen md:px-10 md:pt-10 md:pb-20">
        {/* 활동 상세 박스 */}
        <div className="relative h-full">
          {/* 브레드크럼 */}
          <div className="absolute -top-6 left-0 flex h-6 items-center justify-evenly text-sm text-neutral-500">
            <p onClick={() => replace('/teacher/activityv3')} className="cursor-pointer">
              활동 기록
            </p>
            <div className="-rotate-90">
              <Icon.FillArrow />
            </div>
            <p className="cursor-pointer">
              {activityv3?.title?.length >= 15 ? activityv3.title?.slice(0, 15) + '...' : activityv3.title || '활동명'}
            </p>
          </div>

          <div className="3xl:px-30 3xl:py-20 h-full overflow-y-auto bg-white p-2 md:px-10 md:py-5">
            {/* 활동 정보 */}
            <div className="flex flex-col rounded-sm border-2 border-zinc-800">
              <div className="border-b border-neutral-200 px-10 pt-8 pb-8">
                <div className="flex items-baseline justify-between pb-4">
                  <h1 className="flex-1 text-2xl font-bold break-words whitespace-pre-line">
                    [{ACTIVITYV3_TYPE_KOR[activityv3.type]}] {activityv3.subject}: {activityv3.title}
                  </h1>
                  {(me?.role === Role.ADMIN || activityv3.writerId === me?.id) && (
                    <div className="ml-4 flex shrink-0 items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        children="수정"
                        onClick={() => push(`/teacher/activityv3/${activityv3.id}/update`)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500"
                        children="삭제"
                        onClick={() => setShowDialog(true)}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">활동 기간</div>
                    <div className="w-full text-sm">
                      {activityv3.startDate && format(new Date(activityv3.startDate), 'yyyy.MM.dd')} ~{' '}
                      {activityv3.endDate && format(new Date(activityv3.endDate), 'yyyy.MM.dd')}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">활동 설명</div>
                    <div className="w-full text-sm break-words whitespace-pre-line">{activityv3?.description}</div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-sm font-semibold whitespace-pre md:w-40">공통문구</div>
                    <div className="w-full text-sm break-words whitespace-pre-line">{activityv3?.commonText}</div>
                  </div>
                  {(activityv3.images?.length > 0 || activityv3.files?.length > 0) && (
                    <div className="flex items-start">
                      <div className="text-sm font-semibold whitespace-pre md:w-40">첨부파일</div>
                      <div className="w-full">
                        {!!activityv3.images?.length && (
                          <div className="grid w-full grid-flow-row grid-cols-6 gap-2 pb-2">
                            {activityv3.images?.map((image: string, i: number) => (
                              <div
                                key={i}
                                onClick={() => {
                                  setActiveIndex(i)
                                  setImagesModalOpen(true)
                                }}
                                className="w-full"
                              >
                                <div className="aspect-square cursor-pointer rounded-sm border border-neutral-200">
                                  <LazyLoadImage
                                    src={`${Constants.imageUrl}${image}`}
                                    alt=""
                                    loading="lazy"
                                    className="object-fit h-full w-full rounded"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {!!activityv3.files?.length && (
                          <div className="flex flex-col gap-1 pb-2">
                            {activityv3.files?.map((fileUrl: string, index) => (
                              <div
                                key={index}
                                className="flex h-8 w-max items-center space-x-2 rounded-sm bg-stone-50 px-3 py-1"
                              >
                                <FileItemIcon />
                                <a
                                  className="ml-2 text-xs text-neutral-500"
                                  href={`${Constants.imageUrl}${fileUrl}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={getFileNameFromUrl(fileUrl)}
                                >
                                  {getFileNameFromUrl(fileUrl)}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {activityv3.type === SubjectType.LECTURE && (
                <div className="flex items-center border-b border-neutral-200 px-10 py-5">
                  <div className="text-sm font-semibold whitespace-pre md:w-40">성취 기준</div>
                  <div className="flex w-full flex-wrap gap-1">
                    {achievementCriterias == undefined ? (
                      <div className="flex w-full justify-center rounded-sm px-4 py-2">
                        성취기준이 존재하지 않습니다.
                      </div>
                    ) : (
                      <div className="text-14 whitespace-pre-line">
                        {achievementCriterias?.map((ac) => (
                          <div className="flex flex-col gap-2">
                            [{ac.criteriaId}]&nbsp; {ac.criteria}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center px-10 py-5">
                <div className="text-sm font-semibold whitespace-pre md:w-40">전달 대상</div>
                <div className="flex w-full flex-wrap gap-1">
                  {_.chain(activityv3?.groupActivityV3s || [])
                    .sortBy(['group.grade', 'group.klass'])
                    .map((el) => (
                      <div
                        key={el.group?.id}
                        className="h-8 rounded-lg border border-stone-300 px-2 py-1 text-center whitespace-pre"
                      >
                        {el.group?.name}
                      </div>
                    ))
                    .value()}
                </div>
              </div>
            </div>

            {/* 차시 영역 */}
            <div className="mt-16">
              <div className="flex items-center justify-between pb-4">
                <div className="text-3xl font-bold whitespace-pre">활동 차시</div>
                {activityv3.activitySessions?.length !== 0 && (
                  <div className="relative">
                    <Button
                      size="lg"
                      className={activityv3.writerId !== me?.id ? 'bg-gray-500' : undefined}
                      onClick={() =>
                        activityv3.writerId === me?.id
                          ? push(`/teacher/activityv3/${activityv3.id}/session/add`)
                          : setCoachmarkVisible(!coachmarkVisible)
                      }
                      children="차시 추가하기"
                    />
                    {coachmarkVisible && (
                      <Coachmark2
                        steps={[
                          {
                            title: '차시 추가 권한',
                            description: `'내가 생성한 활동'에서만 차시 생성 권한 부여
(단, "공동활동"으로 활동 생성 시 권한 부여됨)`,
                            actions: [],
                          },
                        ]}
                        currentStep={1}
                        position="bottom"
                        arrowDirection="top"
                        positionClass="right-[150px]"
                      />
                    )}
                  </div>
                )}
              </div>
              {activityv3.activitySessions?.length === 0 ? (
                activityv3.writerId === me?.id && (
                  <div
                    className="relative flex flex-col items-center justify-center gap-4 border-t border-t-[#333333] pt-8"
                    ref={addSessionButtonRef}
                  >
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg">
                      <Button
                        size="lg"
                        onClick={() => push(`/teacher/activityv3/${activityv3.id}/session/add`)}
                        children="차시 추가하기"
                      />
                      <p className="text-gray-500">
                        <strong>차시 추가하기</strong> 버튼을 눌러 활동을 시작해 보세요.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <SessionTable
                  activityv3={activityv3}
                  setSelectedSessionId={setSelectedSessionId}
                  setDownloadModalOpen={setDownloadModalOpen}
                />
              )}
            </div>
            {!activityv3.hasStudentText ? (
              <div className="mt-16">
                <div className="flex items-center justify-between pb-4">
                  <div className="text-3xl font-bold whitespace-pre">활동 보고서</div>
                </div>
                <div className="border-t border-t-[#333333] py-8">
                  <p className="text-center text-neutral-500">활동 보고서를 요청하지 않는 활동입니다.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-16">
                  <div className="flex items-center justify-between">
                    <div className="text-24 font-bold whitespace-pre">활동 보고서</div>
                    <Button
                      children="새로고침"
                      className="border border-gray-600"
                      variant="outline"
                      disabled={isLoading}
                      onClick={() => refetch()}
                    />
                  </div>

                  {/* 제출자 목록 화면 */}
                  <div className="mt-4 flex rounded-sm border border-zinc-800 text-[#333333]">
                    <div className="text-16 flex w-full items-center justify-between border-r border-zinc-800 p-4 font-bold">
                      <div>제출</div>
                      <div className="flex items-center">
                        <span className="mr-1 text-3xl font-bold">{submittedStudentAmount}</span>명
                      </div>
                    </div>
                    <div className="text-16 flex w-full items-center justify-between border-r border-zinc-800 p-4 font-bold">
                      <div>미제출</div>
                      <div className="flex items-center">
                        <span className="mr-1 text-3xl font-bold">{unSubmittedStudentAmount}</span>명
                      </div>
                    </div>
                    <div className="text-16 flex w-full items-center justify-between p-4 font-bold">
                      <div>제출 마감</div>
                      {activityv3.studentTextEndDate ? (
                        <div className="text-3xl font-bold">
                          D{differenceInDays(new Date(activityv3.studentTextEndDate), new Date())}
                        </div>
                      ) : (
                        <div className="text-3xl font-bold">-</div>
                      )}
                    </div>
                  </div>

                  {/* 전달 대상, 제출 여부 화면 */}
                  <div className="mt-2 bg-gray-50 p-4">
                    <div className="flex space-x-6">
                      <div className="text-15 border-r border-[#DDD] px-2 whitespace-pre md:w-40">전달 대상</div>
                      <div className="w-full">
                        <div className="text-14 mb-2 flex items-center space-x-2">
                          <Checkbox
                            id="select-all"
                            checked={selectedGroupIds.length === activityv3?.groupActivityV3s?.length}
                            onChange={() =>
                              selectedGroupIds.length === activityv3?.groupActivityV3s?.length
                                ? setSelectedGroupIds([])
                                : setSelectedGroupIds(activityv3?.groupActivityV3s?.map((gav) => gav.groupId) || [])
                            }
                          />
                          <label htmlFor="select-all" className="cursor-pointer">
                            전체
                          </label>
                        </div>
                        {_.chain(activityv3?.groupActivityV3s || [])
                          .sortBy(['group.grade', 'group.klass'])
                          .map((el) => (
                            <div
                              key={el.groupId}
                              className="text-14 mr-4 mb-2 inline-block rounded-md bg-gray-50 whitespace-pre"
                            >
                              <div className="text-14 flex items-center space-x-2">
                                <Checkbox
                                  id={String(el.groupId)}
                                  checked={selectedGroupIds.includes(el.groupId)}
                                  onChange={() =>
                                    selectedGroupIds.includes(el.groupId)
                                      ? setSelectedGroupIds(selectedGroupIds.filter((id) => id !== el.groupId))
                                      : setSelectedGroupIds(selectedGroupIds.concat(el.groupId))
                                  }
                                />
                                <label htmlFor={String(el.groupId)} className="cursor-pointer">
                                  {el.group?.name || ''}
                                </label>
                              </div>
                            </div>
                          ))
                          .value()}
                      </div>
                    </div>
                    <div className="flex space-x-6">
                      <div className="text-15 border-r border-[#DDD] px-2 pt-2 whitespace-pre md:w-40">제출 여부</div>
                      <div className="flex w-full items-center space-x-4 pt-2">
                        {SELECT_SUBMITTED.map(({ value, label }) => (
                          <Label.row htmlFor={value} key={value}>
                            <Radio
                              id={value}
                              name="submitted-filter"
                              checked={selectedFilter === value}
                              onChange={() => {
                                searchParams.set('selectedFilter', value)
                                replace({
                                  pathname,
                                  search: searchParams.toString(),
                                })
                              }}
                            />
                            <div className="text-14">{label}</div>
                          </Label.row>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 필터 영역 + 검색 창 */}
                  <div className="mt-2 flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Select.lg
                        value={filter}
                        className="h-10 w-48 rounded-lg border border-neutral-200"
                        onChange={(e) => {
                          searchParams.set('filter', e.target.value)
                          replace({
                            pathname,
                            search: searchParams.toString(),
                          })
                        }}
                      >
                        {SELECT_FILTERS.map((filter) => (
                          <option key={filter.value} value={filter.value} className="text-sm text-zinc-800">
                            {filter.label}
                          </option>
                        ))}
                      </Select.lg>
                      <Select.lg
                        value={view}
                        className="h-10 w-48 rounded-lg border border-neutral-200"
                        onChange={(e) => {
                          searchParams.set('view', e.target.value)
                          replace({
                            pathname,
                            search: searchParams.toString(),
                          })
                        }}
                      >
                        {SELECT_VIEWS.map((filter) => (
                          <option key={filter.value} value={filter.value} className="text-sm text-zinc-800">
                            {filter.label}
                          </option>
                        ))}
                      </Select.lg>
                    </div>
                    <div className="relative flex items-center space-x-2">
                      <SearchInput
                        placeholder="학생 이름으로 검색해 보세요."
                        onChange={(e) => setSearchedStudentName(e.target.value)}
                        value={searchedStudentname}
                        className="h-10 w-80 rounded-lg border border-neutral-200 text-neutral-400"
                      />
                      <div className="absolute right-2">
                        <Icon.Search />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 학생 목록 */}
                <div className="min-h-screen-48 bg-white py-4 text-[#333]">
                  {view === 'student' && (
                    <div className="space-y-1 pb-2">
                      <div className="flex justify-between py-2">
                        <div className="flex w-full items-center justify-between">
                          <div className="text-xl font-bold">전체 학급</div>
                          <div className="text-lg">
                            제출&nbsp;
                            <span className="text-primary-800">{submittedStudentAmount || 0}</span>/
                            {studentGroups?.length || 0}명
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={
                      view === 'student' ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3' : ''
                    }
                  >
                    {_.chain(activityv3?.groupActivityV3s || [])
                      .sortBy(['group.grade', 'group.klass'])

                      .map((ga) => {
                        const studentGroups = groupDatas[ga.group.id]
                          ?.filter((sg) => !selectedGroupIds.length || selectedGroupIds.includes(sg.groupId))
                          ?.filter((sg) => !searchedStudentname || sg.user.name.includes(searchedStudentname))

                        const submittedStudentGroups = studentGroups?.filter((sg: any) =>
                          checkSubmitted(sortBy(sg?.user?.studentActivityV3s, 'id')?.[0], filter),
                        )
                        const unSubmittedStudentGroups = studentGroups?.filter((el: any) =>
                          submittedStudentGroups.every((sg: any) => sg.id !== el.id),
                        )
                        if (!studentGroups?.length) {
                          return <></>
                        }

                        if (view === 'student') {
                          return sortStudentGroups(studentGroups)
                            ?.filter((sg) => {
                              const studentActivity = sortBy(sg?.user?.studentActivityV3s, 'id')?.[0]

                              if (selectedFilter === 'NOT_SUBMITTED') {
                                return !checkSubmitted(studentActivity, filter)
                              }

                              if (selectedFilter === 'IS_SUBMITTED') {
                                return checkSubmitted(studentActivity, filter)
                              }

                              return true
                            })
                            ?.map((sg: any) => (
                              <Activityv3SubmitterItem
                                key={sg.id}
                                id={Number(id)}
                                studentGroup={sg}
                                submitted={checkSubmitted(sortBy(sg?.user?.studentActivityV3s, 'id')?.[0], filter)}
                              />
                            ))
                        }

                        return (
                          <div className="space-y-1 pb-2" key={ga.id}>
                            <div className="flex justify-between py-2">
                              <div className="flex w-full items-center justify-between">
                                <div className="text-xl font-bold">{ga.group?.name}</div>
                                <div className="text-lg">
                                  제출&nbsp;
                                  <span className="text-primary-800">{submittedStudentGroups.length || 0}</span>/
                                  {studentGroups?.length || 0}명
                                </div>
                              </div>
                            </div>
                            {selectedFilter === 'all' && (
                              <div className="grid grid-cols-2 gap-2 pb-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                                {sortStudentGroups(studentGroups).map((sg: any) => (
                                  <Activityv3SubmitterItem
                                    key={sg.id}
                                    id={Number(id)}
                                    studentGroup={sg}
                                    submitted={checkSubmitted(sortBy(sg?.user?.studentActivityV3s, 'id')?.[0], filter)}
                                  />
                                ))}
                              </div>
                            )}
                            {selectedFilter === 'IS_SUBMITTED' && (
                              <div className="grid grid-cols-2 gap-2 pb-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                                {sortStudentGroups(submittedStudentGroups).map((sg: StudentGroup) => (
                                  <Activityv3SubmitterItem
                                    key={sg.id}
                                    studentGroup={sg}
                                    id={Number(id)}
                                    submitted={checkSubmitted(sortBy(sg?.user?.studentActivityV3s, 'id')?.[0], filter)}
                                  />
                                ))}
                              </div>
                            )}
                            {selectedFilter === 'NOT_SUBMITTED' && (
                              <div className="grid grid-cols-2 gap-2 pb-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                                {sortStudentGroups(unSubmittedStudentGroups).map((sg: StudentGroup) => (
                                  <Activityv3SubmitterItem
                                    key={sg.id}
                                    studentGroup={sg}
                                    id={Number(id)}
                                    submitted={checkSubmitted(sortBy(sg?.user?.studentActivityV3s, 'id')?.[0], filter)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })
                      .value()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showDialog && (
        <ConfirmDialog
          message="활동을 삭제하시겠습니까 ?"
          description={`삭제된 내용은 다시 불러올 수 없습니다. \n한번 더 확인해 주세요.`}
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      <SessionDownloadModal
        sessionId={selectedSessionId}
        modalOpen={isDownloadModalOpen}
        setModalClose={() => setDownloadModalOpen(false)}
      />
      <div className="absolute">
        <Viewer
          visible={hasImagesModalOpen}
          rotatable
          noImgDetails
          scalable={false}
          images={viewerImages}
          onChange={(_, index) => setActiveIndex(index)}
          onClose={() => setImagesModalOpen(false)}
          activeIndex={activeIndex}
        />
      </div>
    </div>
  )
}
