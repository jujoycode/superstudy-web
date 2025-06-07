import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Flex } from '@/atoms/Flex'
import { Grid } from '@/atoms/Grid'
import { GridItem } from '@/atoms/GridItem'
import { IconButton } from '@/molecules/IconButton'
import { SearchInput } from '@/molecules/SearchInput'
import { ResponsiveRenderer } from '@/organisms/ResponsiveRenderer'
import { PageHeaderTemplate } from '@/templates/PageHeaderTemplate'
import { BackButton, TopNavbar } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Time } from '@/legacy/components/common/Time'
import { GroupContainer } from '@/legacy/container/group'
import { teacherPointLogGet, useStudentGroupsFindByGroupId, useTeacherPointLogGet } from '@/legacy/generated/endpoint'
import { PointLog, User } from '@/legacy/generated/model'
import { AssignPointModal } from '@/legacy/modals/AssignPointModal'
import { PointLogModal } from '@/legacy/modals/PointLogModal'
import { exportCSVToExcel } from '@/legacy/util/download-excel'
import { numberWithSign, roundToFirstDecimal } from '@/legacy/util/string'
import { getThisYear } from '@/legacy/util/time'

export function PointDashboard() {
  const { t: tt } = useTranslation('teacher', { keyPrefix: 'point_dashboard' })
  const [q, setQ] = useState('')
  const [groupId, setGroupId] = useState(0)
  const [openAssignPointModal, setOpenAssignPointModal] = useState(false)
  const [pointLogId, setPointLogId] = useState(0)
  const [openPointLogModal, setOpenPointLogModal] = useState(false)
  const { allKlassGroupsUnique } = GroupContainer.useContext()

  const { data: studentGroups } = useStudentGroupsFindByGroupId(groupId)
  const { data: pointLogs } = useTeacherPointLogGet(
    { size: 10000, studentIds: studentGroups?.map((sg) => sg.userId), join: ['teacher', 'student'] },
    { query: { enabled: !!studentGroups } },
  )

  const students = useMemo(() => {
    const grouped = pointLogs?.items.reduce(
      (acc, pointLog) => {
        const { studentId } = pointLog
        acc[studentId] ??= { ...pointLog.student, poingLogs: [], merits: 0, demerits: 0 }
        acc[studentId].poingLogs.push(pointLog)
        if (pointLog.value > 0) acc[studentId].merits += pointLog.value
        if (pointLog.value < 0) acc[studentId].demerits += pointLog.value
        return acc
      },
      {} as Record<number, User & { poingLogs: PointLog[]; merits: number; demerits: number }>,
    )
    return Object.entries(grouped ?? {}).map(([_, student]) => student)
  }, [pointLogs])
  const topMeritScorers = useMemo(
    () =>
      [...students]
        .filter((s) => s.merits > 0)
        .sort((a, b) => b.merits - a.merits)
        .slice(0, 5),
    [students],
  )
  const topDemeritReceivers = useMemo(
    () =>
      [...students]
        .filter((s) => s.demerits < 0)
        .sort((a, b) => a.demerits - b.demerits)
        .slice(0, 5),
    [students],
  )
  const filteredLogs = useMemo(() => {
    if (!q) return pointLogs?.items ?? []
    return (pointLogs?.items ?? []).filter(
      (pointLog) => pointLog.teacher.name.includes(q) || pointLog.student.name.includes(q),
    )
  }, [q, pointLogs])

  useEffect(() => {
    if (groupId > 0 || allKlassGroupsUnique.length === 0) return
    setGroupId(allKlassGroupsUnique[0].id)
  }, [allKlassGroupsUnique, groupId])

  async function downloadAsExcel() {
    const { items } = await teacherPointLogGet({
      size: 10000,
      studentIds: studentGroups?.map((sg) => sg.userId),
      join: ['student', 'student.studentGroups', 'teacher'],
    })
    const content =
      '학급,출석번호,이름,항목,점수,날짜,부여자\n' +
      items
        .sort((a, b) => a.student.name.localeCompare(b.student.name))
        .map((item) =>
          [
            item.student.studentGroups?.find((sg) => sg.group.type === 'KLASS' && sg.group.year === getThisYear())
              ?.group.name,
            item.student.studentGroups?.find((sg) => sg.group.type === 'KLASS' && sg.group.year === getThisYear())
              ?.studentNumber,
            item.student.name,
            item.title,
            numberWithSign(item.value),
            format(new Date(item.createdAt), 'yyyy.MM.dd HH:mm:ss'),
            item.teacher.name,
          ].join(),
        )
        .join('\n')
    const group = allKlassGroupsUnique.find((g) => g.id === groupId)
    exportCSVToExcel(content, `상벌점 ${group.name}`)
  }

  return (
    <>
      <ResponsiveRenderer
        mobile={
          <TopNavbar title={tt('title')} left={<BackButton />}>
            <h1 className="text-2xl font-semibold">{tt('title')}</h1>
          </TopNavbar>
        }
      />

      <Flex direction="col" items="center" justify="center" className="h-full">
        <PageHeaderTemplate
          title={tt('title')}
          config={{
            topBtn: {
              label: '상벌점 부여하기',
              color: 'primary',
              variant: 'solid',
              action: () => setOpenAssignPointModal(true),
              customWidth: '140px',
            },
            filters: [
              {
                items: allKlassGroupsUnique.map((k) => ({
                  label: k.name,
                  value: String(k.id),
                })),
                filterState: {
                  value: groupId > 0 ? String(groupId) : '',
                  setValue: (v) => setGroupId(Number(v)),
                },
              },
            ],
          }}
        />

        <Grid col={12} className="pr-8">
          <GridItem colSpan={6} className="w-full">
            <div className="flex flex-1 flex-col gap-4 p-8">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p>{tt('total_merits')}</p>
                  <p>{students.reduce((acc, s) => acc + s.merits, 0)}</p>
                </div>
                <div>
                  <p>{tt('total_demerits')}</p>
                  <p>{students.reduce((acc, s) => acc + s.demerits, 0)}</p>
                </div>
                <div>
                  <p>{tt('average')}</p>
                  <p>
                    {roundToFirstDecimal(
                      students.reduce((acc, s) => acc + s.merits + s.demerits, 0) / (studentGroups?.length || 1),
                    )}
                  </p>
                </div>
              </div>

              <div></div>

              <Admin.H2>{tt('top_merit_scorers')}</Admin.H2>

              <Admin.Table>
                <Admin.TableHead>
                  <Admin.TableRow>
                    <Admin.TableHCell children={tt('student_name')} />
                    <Admin.TableHCell children={tt('student_merits')} className="text-end" />
                    <Admin.TableHCell children={tt('student_demerits')} className="text-end" />
                    <Admin.TableHCell children={tt('student_total')} className="text-end" />
                  </Admin.TableRow>
                </Admin.TableHead>
                <Admin.TableBody>
                  {topMeritScorers.map((student) => (
                    <Admin.TableRow key={student.id}>
                      <Admin.TableCell children={student.name} />
                      <Admin.TableCell children={numberWithSign(student.merits)} className="text-end" />
                      <Admin.TableCell children={numberWithSign(student.demerits)} className="text-end" />
                      <Admin.TableCell
                        children={numberWithSign(student.merits + student.demerits)}
                        className="text-end"
                      />
                    </Admin.TableRow>
                  ))}
                  {topMeritScorers.length === 0 && (
                    <Admin.TableRow>
                      <Admin.TableCell
                        colSpan={4}
                        children={tt('no_items_found')}
                        className="text-15 py-8 text-center"
                      />
                    </Admin.TableRow>
                  )}
                </Admin.TableBody>
              </Admin.Table>

              <div></div>

              <Admin.H2>{tt('top_demerit_receivers')}</Admin.H2>

              <Admin.Table>
                <Admin.TableHead>
                  <Admin.TableRow>
                    <Admin.TableHCell children={tt('student_name')} />
                    <Admin.TableHCell children={tt('student_merits')} className="text-end" />
                    <Admin.TableHCell children={tt('student_demerits')} className="text-end" />
                    <Admin.TableHCell children={tt('student_total')} className="text-end" />
                  </Admin.TableRow>
                </Admin.TableHead>
                <Admin.TableBody>
                  {topDemeritReceivers.map((student) => (
                    <Admin.TableRow key={student.id}>
                      <Admin.TableCell children={student.name} />
                      <Admin.TableCell children={numberWithSign(student.merits)} className="text-end" />
                      <Admin.TableCell children={numberWithSign(student.demerits)} className="text-end" />
                      <Admin.TableCell
                        children={numberWithSign(student.merits + student.demerits)}
                        className="text-end"
                      />
                    </Admin.TableRow>
                  ))}
                  {topDemeritReceivers.length === 0 && (
                    <Admin.TableRow>
                      <Admin.TableCell
                        colSpan={4}
                        children={tt('no_items_found')}
                        className="text-15 py-8 text-center"
                      />
                    </Admin.TableRow>
                  )}
                </Admin.TableBody>
              </Admin.Table>
            </div>
          </GridItem>
          <GridItem colSpan={6} className="w-full">
            <Admin.H2>{tt('student_points_overview')}</Admin.H2>

            <Admin.Table className="w-full">
              <Admin.TableHead>
                <Admin.TableRow>
                  <Admin.TableHCell children={tt('student_name')} />
                  <Admin.TableHCell children={tt('student_merits')} className="text-end" />
                  <Admin.TableHCell children={tt('student_demerits')} className="text-end" />
                  <Admin.TableHCell children={tt('student_total')} className="text-end" />
                </Admin.TableRow>
              </Admin.TableHead>
              <Admin.TableBody>
                {Object.entries(students ?? {})?.map(([_, student]) => (
                  <Admin.TableRow key={student.id}>
                    <Admin.TableCell children={student.name} />
                    <Admin.TableCell children={numberWithSign(student.merits)} className="text-end" />
                    <Admin.TableCell children={numberWithSign(student.demerits)} className="text-end" />
                    <Admin.TableCell
                      children={numberWithSign(student.merits + student.demerits)}
                      className="text-end"
                    />
                  </Admin.TableRow>
                ))}
                {pointLogs?.total === 0 && (
                  <Admin.TableRow>
                    <Admin.TableCell colSpan={4} children={tt('no_items_found')} className="text-15 py-8 text-center" />
                  </Admin.TableRow>
                )}
              </Admin.TableBody>
            </Admin.Table>

            <div className="mt-6 flex w-full items-center justify-between gap-2">
              <Admin.H2>{tt('recent_logs')}</Admin.H2>
            </div>

            <Flex direction="row" justify="between" items="center" gap="2" className="my-4">
              <Flex width="fit-content">
                <SearchInput placeholder="이름" value={q} onChange={(e) => setQ(e.target.value)} className="h-9" />
              </Flex>
              <IconButton size="sm" color="tertiary" position="front" iconName="ssDownload" onClick={downloadAsExcel}>
                학급별상벌점현황
              </IconButton>
            </Flex>

            <Admin.Table className="w-full">
              <Admin.TableHead>
                <Admin.TableRow>
                  <Admin.TableHCell children={tt('point_log_created_at')} />
                  <Admin.TableHCell children={tt('point_log_assigner')} />
                  <Admin.TableHCell children={tt('point_log_assignee')} />
                  <Admin.TableHCell children={tt('point_log_title')} />
                  <Admin.TableHCell children={tt('point_log_value')} className="text-end" />
                </Admin.TableRow>
              </Admin.TableHead>
              <Admin.TableBody>
                {filteredLogs.map((pointLog) => (
                  <Admin.TableRow
                    key={pointLog.id}
                    onClick={() => {
                      setPointLogId(pointLog.id)
                      setOpenPointLogModal(true)
                    }}
                  >
                    <Admin.TableCell>
                      <Time date={pointLog.createdAt} format="MM.dd" />
                    </Admin.TableCell>
                    <Admin.TableCell children={pointLog.teacher.name} />
                    <Admin.TableCell children={pointLog.student.name} />
                    <Admin.TableCell children={pointLog.title} />
                    <Admin.TableCell children={numberWithSign(pointLog.value)} className="text-end" />
                  </Admin.TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <Admin.TableRow>
                    <Admin.TableCell colSpan={5} children={tt('no_items_found')} className="text-15 py-8 text-center" />
                  </Admin.TableRow>
                )}
              </Admin.TableBody>
            </Admin.Table>
          </GridItem>
        </Grid>
      </Flex>

      <AssignPointModal
        groupId={groupId}
        modalOpen={openAssignPointModal}
        setModalClose={() => setOpenAssignPointModal(false)}
      />
      <PointLogModal
        pointLogId={pointLogId}
        modalOpen={openPointLogModal}
        setModalClose={() => setOpenPointLogModal(false)}
      />
    </>
  )
}
