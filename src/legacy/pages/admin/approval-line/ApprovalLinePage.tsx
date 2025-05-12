import { range } from 'lodash'
import { Fragment, useContext, useEffect, useMemo, useState } from 'react'
import { CoachMark } from 'react-coach-mark'
import { useSetRecoilState } from 'recoil'
import { Label, Select } from '@/legacy/components/common'
import { Admin } from '@/legacy/components/common/Admin'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { CoachPosition, type Guide, useCoachMark } from '@/legacy/components/common/CoachMark'
import { TextInput } from '@/legacy/components/common/TextInput'
import { useCodeByCategoryName } from '@/legacy/container/category'
import {
  approvalLineCreateApprovalLines,
  approvalLineDeleteTeacher,
  approvalLineUpdateFieldTripApprovalLines,
  approvalLineUpdateOutingApprovalLines,
  approvalLineUpdateabsentApprovalLines,
  useAdminCommonFindAllKlassBySchool,
  useAdminCommonSearchTeachers,
  useApprovalLineGetApprovalLineByType2,
  useSchoolManagementGetSchoolInfo,
} from '@/legacy/generated/endpoint'
import {
  type ApprovalLine,
  Category,
  type ResponseApprovalLineDto,
  type ResponseTeacherInfoDto,
  Role,
} from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { toastState } from '@/stores'
import { getNickName } from '@/legacy/util/status'
import { AdminContext } from '../AdminMainPage'

const steps = range(1, 6) as (1 | 2 | 3 | 4 | 5)[]

export function ApprovalLinePage() {
  const { t } = useLanguage()

  const { data: school } = useSchoolManagementGetSchoolInfo()
  const { categoryData } = useCodeByCategoryName(Category.outingtype)
  const { categoryData: AbsentData } = useCodeByCategoryName(Category.absenttype)

  const types = useMemo(() => {
    const types = [
      { name: t('certificate'), subTypes: [{ name: t('basic') }] },
      { name: t('early_leave_certificate'), subTypes: [{ name: t('basic') }] },
      { name: t('outpass_certificate'), subTypes: [{ name: t('basic') }] },
      {
        name: t('experiential'),
        subTypes: [
          { name: t('basic') },
          // { name: '가정신청' },
          // { name: '교외신청' },
          // { name: '해외신청' },
          // { name: '가정결과' },
          // { name: '교외결과' },
          // { name: '해외결과' },
        ],
      },
      { name: t('attendance_report'), subTypes: [{ name: t('basic') }] },
    ]

    if (!categoryData) return
    types[0].subTypes = [
      { name: t('basic') },
      ...categoryData.sort((a, b) => a.name.localeCompare(b.name)).map(({ name }) => ({ name })),
    ]

    if (!AbsentData) return
    types[4].subTypes = [
      { name: t('basic') },
      ...AbsentData.sort((a, b) => a.name.localeCompare(b.name)).map(({ name }) => ({ name })),
    ]

    if (school && school.fieldtripType.length === 1) {
      if (school.fieldtripType.includes('suburb')) {
        types[3].subTypes = [
          { name: '기본' },
          { name: '교외신청' },
          { name: '해외신청' },
          { name: '교외결과' },
          { name: '해외결과' },
        ]
      } else if (school.fieldtripType.includes('home')) {
        types[3].subTypes = [{ name: '기본' }, { name: '가정신청' }, { name: '가정결과' }]
      }
    } else {
      types[3].subTypes = [
        { name: '기본' },
        { name: '가정신청' },
        { name: '교외신청' },
        { name: '해외신청' },
        { name: '가정결과' },
        { name: '교외결과' },
        { name: '해외결과' },
      ]
    }

    return types
  }, [categoryData, AbsentData, school])

  const [type1, setType1] = useState((types && types[0].name) || '')
  const [type2, setType2] = useState((types && types[0].subTypes[0].name) || '')

  useEffect(() => {
    if (types && (type1 === '' || type2 === '')) {
      setType1(types[0].name)
      setType2(types[0].subTypes[0].name)
    }
  }, [types])

  const { year } = useContext(AdminContext)

  const [modified, setModified] = useState(false)
  const [toggle, setToggle] = useState(false)
  const [enabledStep, setEnabledStep] = useState(1)
  const [titles, setTitles] = useState(new Map<number, string>())
  const [tree, setTree] = useState(new Map<number, Map<number, ResponseApprovalLineDto>>())

  const { data: klasses } = useAdminCommonFindAllKlassBySchool({ year })
  const { data: approvalLines } = useApprovalLineGetApprovalLineByType2({ type1, type2, year: String(year) })
  const { data: allTeachers } = useAdminCommonSearchTeachers({ year })

  const setToastMsg = useSetRecoilState(toastState)

  // Initialization
  useEffect(() => {
    if (!school || !klasses || !approvalLines) return
    const newTitles = new Map(steps.map((step) => [step, approvalLines[0]?.[`approver${step}Title`] ?? '']))
    setEnabledStep([...newTitles.values()].filter((v) => !!v).length)
    setTitles(newTitles)
    setTree(
      klasses?.reduce((prev, k) => {
        const approvalLine = approvalLines.find((al) => al.groupId === k.id) ?? {
          schoolId: school.id,
          groupId: k.id,
          type1,
          type2,
        }
        return prev.set(k.grade, (prev.get(k.grade) ?? new Map()).set(k.klass, approvalLine))
      }, new Map<number, Map<number, ResponseApprovalLineDto>>()),
    )
    setModified(false)
  }, [type1, type2, toggle, school, klasses, approvalLines])

  const idMap = allTeachers?.items.reduce(
    (acc: Record<number, ResponseTeacherInfoDto>, cur: ResponseTeacherInfoDto) => {
      acc[cur.id] = cur
      return acc
    },
    {},
  )

  // idMap의 값들을 배열로 변환합니다.
  let uniqueTeachers: ResponseTeacherInfoDto[] = []

  if (idMap) {
    uniqueTeachers = Object.values(idMap)
  }

  const teachers = uniqueTeachers?.sort((a, b) => a.name.localeCompare(b.name)) ?? []

  function save() {
    if (!school) return
    setToastMsg('결재라인을 저장 중입니다.')
    const payloads = [...tree].reduce((prev, [, als]) => {
      const payloads = [...als].map(([, al]) => {
        return {
          id: al.id,
          schoolId: al.schoolId,
          groupId: al.groupId,
          type1: type1,
          type2: type2,
          approver1Id: 1 <= enabledStep ? al.approver1Id : 0,
          approver2Id: 2 <= enabledStep ? al.approver2Id : 0,
          approver3Id: 3 <= enabledStep ? al.approver3Id : 0,
          approver4Id: 4 <= enabledStep ? al.approver4Id : 0,
          approver5Id: 5 <= enabledStep ? al.approver5Id : 0,
          approver1Title: 1 <= enabledStep && al.approver1Id > 0 ? titles.get(1) : '',
          approver2Title: 2 <= enabledStep && al.approver2Id > 0 ? titles.get(2) : '',
          approver3Title: 3 <= enabledStep && al.approver3Id > 0 ? titles.get(3) : '',
          approver4Title: 4 <= enabledStep && al.approver4Id > 0 ? titles.get(4) : '',
          approver5Title: 5 <= enabledStep && al.approver5Id > 0 ? titles.get(5) : '',
        } as ApprovalLine
      })
      return [...prev, ...payloads]
    }, [] as ApprovalLine[])
    approvalLineCreateApprovalLines(payloads)
    setToastMsg('결재라인을 저장했습니다.')
  }

  function reSetApprovalLine() {
    if (['확인증', '외출증', '조퇴증'].includes(type1)) {
      approvalLineUpdateOutingApprovalLines().then(() => {
        setToastMsg('결재중인 확인증(확인,외출,조퇴)의 결재라인을 갱신했습니다.')
      })
    } else if (['결석신고서'].includes(type1)) {
      approvalLineUpdateabsentApprovalLines().then(() => {
        setToastMsg('결재중인 결석신고서의 결재라인을 갱신했습니다.')
      })
    } else if (['체험', '체험학습'].includes(type1)) {
      approvalLineUpdateFieldTripApprovalLines().then(() => {
        setToastMsg('결재중인 체험학습 서류의 결재라인을 갱신했습니다.')
      })
    }
  }

  function deleteApprovalLine() {
    approvalLineDeleteTeacher({ type1, type2 })
  }

  const coachList: Array<Guide> = [
    {
      comment: <div>{t('set_approval_for_documents')}</div>,
      location: CoachPosition.BOTTOM,
    },
    {
      comment: <div>{t('select_document_type')}</div>,
    },
    {
      comment: (
        <div>
          {t('select_document_category')}
          <br />
          {t('set_approval_line_for_all')}
          {t('approval_line_applies_to_all')}
          <br />
          <span className="text-red-400">{t('tip_for_health_office')}</span>
        </div>
      ),
    },
    {
      comment: (
        <div>
          {t('select_approval_stage')}
          <br />
          {t('click_circle_to_select_stage')}
        </div>
      ),
    },
    {
      comment: (
        <div>
          {t('select_teachers_for_stages')}
          <br />
          {t('homeroom_grade_lead_principal')}
          <br />
          {t('choose_specific_teacher')}
          <br />
          <span className="text-red-400">
            {t('tip_assign_all_class_teachers')}
            <br />
            &nbsp;&nbsp;&nbsp;{t('assign_teachers_to_all_classes')}
            <br />
            &nbsp;&nbsp;&nbsp; {t('assign_teachers_per_grade')}
          </span>
        </div>
      ),
    },
    {
      comment: (
        <div>
          {t('refresh_pending_documents_desc')}
          <br />
          <span className="text-red-400">{t('pending_document_warning')}</span>
          <br />
          <br />
          {t('revert_changes_desc')}
          <br />
          <br />
          {t('save_changes_desc')}
        </div>
      ),
    },
  ]
  const { coach, refs, reOpenCoach } = useCoachMark('approvalLineAdmin', coachList)

  return (
    <>
      {<CoachMark {...coach} />}
      <Admin.Section>
        <Admin.H2>
          <div className="flex space-x-2" ref={refs[0]}>
            <span>{t('approval_line')}</span>
            <div
              className="cursor-pointer rounded-full border border-gray-500 px-2 text-sm text-gray-500"
              onClick={reOpenCoach}
            >
              ?
            </div>
          </div>
        </Admin.H2>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Select
              value={type1}
              onChange={(e) => {
                setType2('기본')
                setType1(e.target.value)
              }}
              ref={refs[1]}
            >
              {types?.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name}
                </option>
              ))}
            </Select>
            <Select
              value={type2}
              onChange={(e) => {
                if (type2 === '기본' && approvalLines && approvalLines?.length === 0) {
                  alert('기본 결재라인을 먼저 설정해주세요.')
                } else {
                  setType2(e.target.value)
                }
              }}
              ref={refs[2]}
            >
              {types
                ?.find((t) => t.name === type1)
                ?.subTypes?.map((subType) => (
                  <option key={subType.name} value={subType.name}>
                    {subType.name}
                  </option>
                ))}
            </Select>

            {type2 &&
              type2 !== '기본' &&
              approvalLines &&
              (type2 === approvalLines[0].type2 ? (
                <Button children="기본 결재라인 적용하기" onClick={deleteApprovalLine} className="filled-gray ml-4" />
              ) : (
                <div className="ml-4 flex items-center text-sm"> * 기본 결재라인 적용됨</div>
              ))}
            {school?.ooeCode === 'T10' && type1 === '체험' && (
              <div className="ml-4 flex items-center text-sm"> * 제주의 경우, 교외=도내, 해외=도외</div>
            )}
          </div>
          <div className="flex gap-2" ref={refs[5]}>
            <Button children={t('refresh_pending_documents')} onClick={reSetApprovalLine} className="outlined-gray" />

            <Button
              children={t('revert_changes')}
              disabled={!modified}
              onClick={() => {
                setToastMsg('원래대로 되돌립니다.')
                setToggle((prev) => !prev)
              }}
              className="outlined-gray"
            />
            <Button
              children={t('save_changes')}
              disabled={!modified || [...titles].slice(0, enabledStep).some(([, t]) => !t)}
              onClick={save}
              className="filled-gray"
            />
          </div>
        </div>

        <div ref={refs[3]}>
          <Admin.H3>{t('select_stage_position_directly')}</Admin.H3>
          <div className="mt-1 grid grid-cols-[60px_repeat(5,minmax(0,1fr))] gap-1">
            <div></div>
            {steps.map((step) => (
              <Label.row key={step} htmlFor={`step-${step}`} className="h-9 rounded-md px-1 hover:bg-gray-50">
                <TextInput
                  className="h-7"
                  disabled={step > enabledStep}
                  value={titles.get(step)}
                  maxLength={6}
                  onChange={(e) => {
                    setTitles((prev) => new Map(prev.set(step, e.target.value)))
                    setModified(true)
                  }}
                />
                <Checkbox
                  id={`step-${step}`}
                  checked={step <= enabledStep}
                  onChange={(e) => {
                    const newStep = !e.target.checked && step === enabledStep ? Math.max(1, step - 1) : step
                    setEnabledStep(newStep)
                    if (newStep < enabledStep) setModified(true)
                  }}
                  className="mr-1 rounded-full"
                />
              </Label.row>
            ))}
          </div>
        </div>

        <div ref={refs[4]}>
          <div>
            <Admin.H3>{t('all_grades')}</Admin.H3>
          </div>
          <div className="mt-1 grid grid-cols-[60px_repeat(5,minmax(0,1fr))] gap-1">
            <div className="grid place-items-center">*</div>
            {steps.map((step) => (
              <Select
                disabled={step > enabledStep}
                value={`${t('select_teacher')}`}
                onChange={(e) => {
                  setTree((prev) => {
                    let teacher = teachers.find((t) => t.id === Number(e.target.value))
                    ;[...prev].forEach(([grade, als]) => {
                      ;[...als].forEach(([klass, al]) => {
                        if (e.target.value.includes('담임')) {
                          teacher = teachers.find((t) => t.klassGroupId === al.groupId)
                        } else if (e.target.value === '학년계') {
                          teacher = teachers.find((t) => t.role === Role.PRE_HEAD && t.headNumber === grade)
                        } else if (e.target.value === '학년부장') {
                          teacher = teachers.find((t) => t.role === Role.HEAD && t.headNumber === grade)
                        }
                        if (!teacher) return
                        prev.get(grade)?.set(klass, {
                          ...al,
                          [`approver${step}Id`]: teacher.id,
                          [`approver${step}Name`]: teacher.name,
                          [`approver${step}Role`]: teacher.role,
                        })
                      })
                    })
                    return new Map(prev)
                  })
                  setModified(true)
                }}
              >
                <option>{t('select_teacher')}</option>
                <option>{t('homeroom_teacher')}</option>
                <option>{t('Role.PRE_HEAD')}</option>
                <option>{t('Role.HEAD')}</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {getNickName(t.nickName)} {t.email}
                  </option>
                ))}
              </Select>
            ))}
          </div>
        </div>
        {[...tree].map(([grade, als]) => (
          <div>
            <div>
              <Admin.H3>
                {grade}&nbsp;
                {t('grade')}
              </Admin.H3>
            </div>
            <div className="mt-1 grid grid-cols-[60px_repeat(5,minmax(0,1fr))] gap-1">
              <div className="grid place-items-center">*</div>
              {steps.map((step) => (
                <Select
                  disabled={step > enabledStep}
                  value={`${t('select_teacher')}`}
                  onChange={(e) => {
                    setTree((prev) => {
                      let teacher = teachers.find((t) => t.id === Number(e.target.value))
                      ;[...(prev.get(grade) ?? [])].forEach(([klass, al]) => {
                        if (e.target.value === t('homeroom_teacher')) {
                          teacher = teachers.find((t) => t.klassGroupId === al.groupId)
                        } else if (e.target.value === t('Role.PRE_HEAD')) {
                          teacher = teachers.find((t) => t.role === Role.PRE_HEAD && t.headNumber === grade)
                        } else if (e.target.value === t('Role.HEAD')) {
                          teacher = teachers.find((t) => t.role === Role.HEAD && t.headNumber === grade)
                        }
                        //if (!teacher) return;
                        prev.get(grade)?.set(klass, {
                          ...al,
                          [`approver${step}Id`]: teacher ? teacher.id : 0,
                          [`approver${step}Name`]: teacher ? teacher.name : null,
                          [`approver${step}Role`]: teacher ? teacher.role : null,
                        })
                      })
                      return new Map(prev)
                    })
                    setModified(true)
                  }}
                >
                  <option>{t('select_teacher')}</option>
                  <option>{t('not_specified')}</option>
                  <option>{t('homeroom_teacher')}</option>
                  <option>{t('Role.PRE_HEAD')}</option>
                  <option>{t('Role.HEAD')}</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {getNickName(t.nickName)} {t.email}
                    </option>
                  ))}
                </Select>
              ))}
              {[...als].map(([klass, al]) => (
                <Fragment key={al.id}>
                  <div className="grid place-items-center">
                    {klass}&nbsp;
                    {t('class_section')}
                  </div>
                  {steps.map((step) => (
                    <Select
                      disabled={step > enabledStep}
                      value={al[`approver${step}Id`]}
                      onChange={(e) => {
                        setTree((prev) => {
                          const prevAl = prev.get(grade)?.get(klass)
                          const teacher = teachers.find((t) => t.id === Number(e.target.value))
                          if (!prevAl || !teacher) return prev
                          prev.get(grade)?.set(klass, {
                            ...prevAl,
                            [`approver${step}Id`]: teacher.id,
                            [`approver${step}Name`]: teacher.name,
                            [`approver${step}Role`]: teacher.role,
                          })
                          return new Map(prev)
                        })
                        setModified(true)
                      }}
                    >
                      <option>{t('select_teacher')}</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {getNickName(t.nickName)} {t.email}
                        </option>
                      ))}
                    </Select>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </Admin.Section>
    </>
  )
}
