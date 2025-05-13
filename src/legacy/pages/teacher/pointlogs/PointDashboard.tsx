import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton, Select, TopNavbar } from 'src/components/common';
import { Admin } from 'src/components/common/Admin';
import { Button } from 'src/components/common/Button';
import { TextInput } from 'src/components/common/TextInput';
import { Time } from 'src/components/common/Time';
import SVGIcon from 'src/components/icon/SVGIcon';
import { GroupContainer } from 'src/container/group';
import { teacherPointLogGet, useStudentGroupsFindByGroupId, useTeacherPointLogGet } from 'src/generated/endpoint';
import { PointLog, User } from 'src/generated/model';
import { AssignPointModal } from 'src/modals/AssignPointModal';
import { useModals } from 'src/modals/ModalStack';
import { PointLogModal } from 'src/modals/PointLogModal';
import { exportCSVToExcel } from 'src/util/download-excel';
import { numberWithSign, roundToFirstDecimal } from 'src/util/string';
import { getThisYear } from 'src/util/time';

export function PointDashboard() {
  const { t: tt } = useTranslation('teacher', { keyPrefix: 'point_dashboard' });
  const { pushModal } = useModals();
  const [groupId, setGroupId] = useState(0);
  const [q, setQ] = useState('');

  const { allKlassGroupsUnique } = GroupContainer.useContext();

  const { data: studentGroups } = useStudentGroupsFindByGroupId(groupId);
  const { data: pointLogs } = useTeacherPointLogGet(
    { size: 10000, studentIds: studentGroups?.map((sg) => sg.userId), join: ['teacher', 'student'] },
    { query: { enabled: !!studentGroups } },
  );

  const students = useMemo(() => {
    const grouped = pointLogs?.items.reduce(
      (acc, pointLog) => {
        const { studentId } = pointLog;
        acc[studentId] ??= { ...pointLog.student, poingLogs: [], merits: 0, demerits: 0 };
        acc[studentId].poingLogs.push(pointLog);
        if (pointLog.value > 0) acc[studentId].merits += pointLog.value;
        if (pointLog.value < 0) acc[studentId].demerits += pointLog.value;
        return acc;
      },
      {} as Record<number, User & { poingLogs: PointLog[]; merits: number; demerits: number }>,
    );
    return Object.entries(grouped ?? {}).map(([_, student]) => student);
  }, [pointLogs]);
  const topMeritScorers = useMemo(
    () =>
      [...students]
        .filter((s) => s.merits > 0)
        .sort((a, b) => b.merits - a.merits)
        .slice(0, 5),
    [students],
  );
  const topDemeritReceivers = useMemo(
    () =>
      [...students]
        .filter((s) => s.demerits < 0)
        .sort((a, b) => a.demerits - b.demerits)
        .slice(0, 5),
    [students],
  );
  const filteredLogs = useMemo(() => {
    if (!q) return pointLogs?.items ?? [];
    return (pointLogs?.items ?? []).filter(
      (pointLog) => pointLog.teacher.name.includes(q) || pointLog.student.name.includes(q),
    );
  }, [q, pointLogs]);

  useEffect(() => {
    if (groupId || allKlassGroupsUnique.length === 0) return;
    setGroupId(allKlassGroupsUnique[0].id);
  }, [allKlassGroupsUnique]);

  async function downloadAsExcel() {
    const { items } = await teacherPointLogGet({
      size: 10000,
      studentIds: studentGroups?.map((sg) => sg.userId),
      join: ['student', 'student.studentGroups', 'teacher'],
    });
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
        .join('\n');
    const group = allKlassGroupsUnique.find((g) => g.id === groupId);
    exportCSVToExcel(content, `상벌점 ${group.name}`);
  }

  return (
    <>
      <TopNavbar title={tt('title')} left={<BackButton />} className="md:hidden" />
      <div className="scroll-box col-span-6 flex flex-col gap-4 overflow-y-auto px-3 py-2 md:px-6 md:py-4">
        <div className="max-md:hidden">
          <h1 className="text-2xl font-semibold">{tt('title')}</h1>
        </div>

        <div className="flex items-center justify-between">
          <Select value={groupId} onChange={(e) => setGroupId(Number(e.target.value))} className="max-w-[200px]">
            {allKlassGroupsUnique.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </Select>
          <Button
            children={tt('assign_points')}
            onClick={() => pushModal(<AssignPointModal groupId={groupId} />)}
            className="outlined-gray"
          />
        </div>

        <div className="scroll-box flex flex-col gap-8 overflow-y-auto pb-20 md:flex-row">
          <div className="flex flex-1 flex-col gap-4">
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
                    <Admin.TableCell colSpan={4} children={tt('no_items_found')} className="py-8 text-center text-15" />
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
                    <Admin.TableCell colSpan={4} children={tt('no_items_found')} className="py-8 text-center text-15" />
                  </Admin.TableRow>
                )}
              </Admin.TableBody>
            </Admin.Table>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <Admin.H2>{tt('student_points_overview')}</Admin.H2>

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
                    <Admin.TableCell colSpan={4} children={tt('no_items_found')} className="py-8 text-center text-15" />
                  </Admin.TableRow>
                )}
              </Admin.TableBody>
            </Admin.Table>

            <div></div>

            <div className="flex items-center justify-between gap-2">
              <Admin.H2>{tt('recent_logs')}</Admin.H2>
              <Button.sm children={tt('download_excel')} onClick={downloadAsExcel} className="outlined-gray" />
            </div>

            <div className="relative">
              <TextInput
                placeholder="이름"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-8 w-40 pl-7 pr-2"
              />
              <SVGIcon.Search className="absolute left-2 top-2" />
            </div>

            <Admin.Table>
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
                    onClick={() => pushModal(<PointLogModal pointLogId={pointLog.id} />)}
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
                    <Admin.TableCell colSpan={5} children={tt('no_items_found')} className="py-8 text-center text-15" />
                  </Admin.TableRow>
                )}
              </Admin.TableBody>
            </Admin.Table>
          </div>
        </div>
      </div>
    </>
  );
}
