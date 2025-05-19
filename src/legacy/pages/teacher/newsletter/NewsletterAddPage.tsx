import _ from 'lodash'
import { useState } from 'react'
import { useParams } from 'react-router'

import { Blank, Label, Select, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { FeedsDetail } from '@/legacy/components/common/FeedsDetail'
import { FileUpload } from '@/legacy/components/common/FileUpload'
import { Icon } from '@/legacy/components/common/icons'
import { ImageUpload } from '@/legacy/components/common/ImageUpload'
import { SearchInput } from '@/legacy/components/common/SearchInput'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import { DocumentObjectComponent } from '@/legacy/components/DocumentObjectComponent'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { SuperSurveyAddComponent } from '@/legacy/components/survey/SuperSurveyAddComponent'
import { GroupContainer } from '@/legacy/container/group'
import { MergedGroupType, useTeacherChatUserList } from '@/legacy/container/teacher-chat-user-list'
import { useTeacherNewsletterAdd } from '@/legacy/container/teacher-newsletter-add'
import { GroupType, Newsletter, NewsletterCategoryEnum, NewsletterType, Role } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { MenuType, UserDatas } from '@/legacy/types'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getExtOfFilename } from '@/legacy/util/file'
import { useUserStore } from '@/stores/user'

export function NewsletterAddPage() {
  const { t } = useLanguage()
  const { me: meRecoil } = useUserStore()
  const { id = '' } = useParams<{ id: string }>()

  const { allKlassGroups } = GroupContainer.useContext()
  const gradeChunks = _.chunk(_.uniq(_.map(allKlassGroups, 'grade')), 3)

  const [_studentName, set_studentName] = useState('')
  const [, setStudentName] = useState('')

  const {
    newsletter,
    surveyContent,
    imageObjectMap,
    documentObjectMap,
    buttonDisabled,
    endAt,
    endDateOff,
    toStudent,
    toParent,
    //toTeacher,
    toPerson,
    toPersonalSection,
    isLoading,
    setNewsletter,
    setCategory,
    setSurveyContent,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    handleCheckboxToggle,
    handleSubmit,
    setEndAt,
    //selectedUserType,
    //setPreview,
    setEndDateOff,
    setToStudent,
    setToParent,
    //setToTeacher,
    setToPerson,
    setToPersonalSection,
    selectedUsers,
    setSelectedUsers,
    loading,
    setLoading,
  } = useTeacherNewsletterAdd(id || '')

  const {
    allGroups,
    selectedGroup,
    setSelectedGroup,
    selectedUserType,
    setSelectedUserType,
    selectedUserDatas,
    reSearch,
  } = useTeacherChatUserList(MenuType.List)

  const [selectedGroupType, setSelectedGroupType] = useState<GroupType>()

  let recvuserIds = selectedUsers.map((el: { id: any }) => el.id)

  const getTitle = (ud: any) => {
    if (ud.role === '') {
      return '직접입력 : ' + ud.name + ' ' + ud.title
    } else if (ud.role === Role.USER) {
      return ud.klass + ' ' + (ud.studentNumber ? ud.studentNumber : ud.studNum) + '번 '
    } else if (ud.role === Role.PARENT) {
      return ud.title ? ud.title : ud.children?.[0].name + '보호자'
    } else {
      return ud.klass ? '선생님 : ' + ud.klass : '선생님'
    }
  }

  const imageObjectMapPaths = (): string[] => {
    // imageObjectMap의 값들을 배열로 변환 후 filter와 map 함수를 사용하여 조건을 충족하는 imageObject의 image만 추출하여 string[]로 반환
    const pathsArray: string[] = Array.from(imageObjectMap.values())
      .filter((imageObject) => !imageObject.isDelete)
      .map((imageObject) => {
        if (typeof imageObject.image === 'string') {
          return imageObject.image
        } else {
          return URL.createObjectURL(imageObject.image) + '?ext=' + getExtOfFilename(imageObject.image.name)
        }
      })

    return pathsArray
  }

  const documentObjectMapPaths = (): string[] => {
    // imageObjectMap의 값들을 배열로 변환 후 filter와 map 함수를 사용하여 조건을 충족하는 imageObject의 image만 추출하여 string[]로 반환
    const pathsArray: string[] = Array.from(documentObjectMap.values())
      .filter((documentObject) => !documentObject.isDelete)
      .map((documentObject) => {
        if (typeof documentObject?.document === 'string') {
          return documentObject?.document
        } else {
          return documentObject.document.name
        }
      })

    return pathsArray
  }

  return (
    <div className="h-screen-8 md:h-screen-3">
      {(loading || isLoading) && <Blank />}
      <div className="flex space-x-3">
        <div className="scroll-box md:h-screen-3 flex w-full flex-col space-y-2 overflow-y-scroll">
          {/* 구분 */}
          <Label.col>
            <Label.Text>
              *<span className="text-red-500">({t('required')}) </span> {t('required_category')}
            </Label.Text>
            <Select.lg
              value={newsletter.category}
              onChange={(e) => {
                setNewsletter((prevState) => ({ ...prevState, category: e.target.value }) as Newsletter)
                setCategory(e.target.value as NewsletterCategoryEnum)
              }}
            >
              <option selected hidden>
                구분을 선택해주세요
              </option>
              {Object.keys(NewsletterCategoryEnum).map((el) => (
                <option id={el} value={el} key={el}>
                  {t(el)}
                </option>
              ))}
            </Select.lg>
          </Label.col>

          {/* 타입 선택 */}
          <Label.col>
            <Label.Text>
              *<span className="text-red-500">({t('required')})</span> {t('type')}
            </Label.Text>
            <Select.lg
              placeholder={`${t('required_select_type')}`}
              value={newsletter.type}
              onChange={(e) => {
                if (e.target.value === NewsletterType.NOTICE) {
                  setEndDateOff(false)
                  setEndAt(null)
                }
                setNewsletter((prevState) => ({ ...prevState, type: e.target.value as NewsletterType }))
              }}
            >
              <option value={NewsletterType.NOTICE}>{t('notice_type')}</option>
              <option value={NewsletterType.STUDENT_PARENTS_SURVEY}>{t('survey_type_students_parents')}</option>
              {/* <option value={NewsletterType.SECRET_SURVEY}>{`무기명 설문 타입 - 학생&학부모(서명)`}</option> */}
            </Select.lg>
          </Label.col>

          {/* 마감기한 */}
          {newsletter.type !== 'NOTICE' && (
            <div>
              <Label.col htmlFor="end_date">
                <Label.Text>{t('deadline')}</Label.Text>
              </Label.col>
              <div className="scroll-box flex items-center space-x-2 overflow-x-scroll">
                <ToggleSwitch
                  checked={endDateOff}
                  onChange={() => {
                    setEndDateOff(!endDateOff)
                    if (endDateOff) {
                      setEndAt('')
                    }
                  }}
                />
                <label
                  htmlFor="end_date"
                  className="focus:border-brand-1 flex h-12 w-full appearance-none items-center rounded-none border border-gray-200 bg-white px-4 placeholder-gray-400 outline-none focus:appearance-none focus:no-underline focus:ring-0 focus:outline-none sm:text-sm"
                >
                  <input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    className="border-0 ring-0 outline-none focus:ring-0 focus:outline-none"
                    value={endAt as string}
                    onChange={(e) => {
                      if (e.target.value > new Date().toISOString()) {
                        setEndAt(e.target.value)
                      } else {
                        alert('마감기한으로 적절하지 않으므로 설정할 수 없습니다.')
                      }
                    }}
                    pattern="\d{4}-\d{2}-\d{2}"
                    disabled={!endDateOff}
                  />
                </label>
              </div>
            </div>
          )}

          {/* 전달 대상 선택 */}
          <Label.Text>
            *<span className="text-red-500">({t('required')})</span> {t('required_select_recipients')}
          </Label.Text>
          <>
            <div className="flex space-x-4 px-4">
              <Checkbox
                checked={toStudent}
                onChange={() => {
                  setToStudent(!toStudent)
                  if (toStudent && !toParent) {
                    setToPerson(true)
                    setToPersonalSection(!toPersonalSection)
                  }
                  if (!toStudent) {
                    setToPerson(false)
                    setToPersonalSection(false)
                  }
                }}
              />
              <p className="text-sm">{t('student')}</p>
              <Checkbox
                checked={toParent}
                onChange={() => {
                  setToParent(!toParent)
                  if (!toStudent && toParent) {
                    setToPerson(true)
                    setToPersonalSection(!toPersonalSection)
                  }
                  if (!toParent) {
                    setToPerson(false)
                    setToPersonalSection(false)
                  }
                }}
              />
              <p className="text-sm">{t('parent')}</p>
              <Checkbox
                checked={toPerson}
                onChange={() => {
                  setToPersonalSection(!toPersonalSection)
                  setToPerson(!toPerson)
                  if (!toPerson) {
                    setToStudent(false)
                    setToParent(false)
                    setToPersonalSection(true)
                  }
                }}
              />
              <p className="text-sm">{t('individual')}</p>
            </div>
            <div className="pl-5 text-sm text-red-500">
              {newsletter.type !== 'NOTICE' &&
                (!toStudent && toParent
                  ? '* 보호자가 설문을 작성합니다. 학생에게는 보이지 않습니다.'
                  : toStudent && !toParent
                    ? '* 학생이 설문을 작성합니다. 보호자에게는 보이지 않습니다.'
                    : toStudent && toParent
                      ? '* 보호자가 설문을 작성하거나, 학생 작성 후 보호자가 승인합니다.'
                      : '* 학생 또는 보호자를 선택하세요.')}
            </div>
          </>
          {!toPersonalSection && (
            <>
              <div className="rounded-md border bg-white px-4 py-2 text-sm">
                {gradeChunks.map((gradeGroup, index) => (
                  <div key={index} className="flex justify-evenly space-x-2 py-1">
                    {gradeGroup.map((grade) => (
                      <Label.row key={grade}>
                        <Checkbox
                          checked={newsletter.klasses.includes(grade.toString())}
                          onChange={() => handleCheckboxToggle(grade)}
                        />
                        <p>{`${grade}학년`}</p>
                      </Label.row>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
          {toPersonalSection && (
            <>
              <div className="rounded-md border bg-white px-4 py-2 text-sm">
                <div>
                  <div className="mt-1 min-w-max cursor-pointer">
                    <Select.lg
                      placeholder={t('group_type', '인원구분')}
                      value={selectedUserType}
                      onChange={(e) => {
                        setSelectedUserType(Number(e.target.value))
                        if (e.target.value === '2') {
                          setSelectedGroup(null)
                        }

                        reSearch(Number(e.target.value), _studentName, selectedGroup?.id)
                      }}
                    >
                      <option value={-1}>{t('group_type', '인원구분')}</option>
                      <option value={0}>{t('students', '학생')}</option>
                      <option value={1}>{t('guardian', '보호자')}</option>
                    </Select.lg>{' '}
                    {(meRecoil?.schoolId === 111 || meRecoil?.schoolId === 2) && (
                      <Select.lg
                        value={selectedGroupType}
                        disabled={selectedUserType === 2}
                        onChange={(e) => {
                          setSelectedGroupType(e.target.value as GroupType)
                        }}
                      >
                        <option selected disabled value={undefined}>
                          {t('type', '유형')}
                        </option>
                        <option value={GroupType.KLASS}>{t('klass_group', '학급소속 그룹')}</option>
                        <option value={GroupType.KLUB}>{t('klub_group', '사용자정의 그룹')}</option>
                      </Select.lg>
                    )}
                    <Select.lg
                      value={selectedGroup?.id || ''}
                      disabled={selectedUserType === 2}
                      onChange={(e) => {
                        setSelectedGroup(
                          allGroups?.find((tg: MergedGroupType) => tg.id === Number(e.target.value)) || null,
                        )
                        reSearch(selectedUserType, _studentName, Number(e.target.value))
                      }}
                    >
                      <option value={-1}>{t('select_class', '반 선택')}</option>
                      {allGroups
                        ?.filter((g) => (selectedGroupType ? g.type === selectedGroupType : true))
                        ?.map((group: MergedGroupType) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                    </Select.lg>
                  </div>
                  <div className="w-full cursor-pointer text-sm">
                    <div className="flex items-center space-x-2 pt-3 pb-2">
                      <SearchInput
                        placeholder="이름"
                        value={_studentName}
                        onChange={(e) => {
                          set_studentName(e.target.value)
                          if (e.target.value === '') setStudentName('')
                        }}
                        onSearch={() => {
                          //setKeyword(_studentName);
                          reSearch(selectedUserType, _studentName, selectedGroup?.id)
                        }}
                        className="w-full"
                      />
                      <Icon.Search
                        className="cursor-pointer"
                        onClick={() => {
                          //setKeyword(_studentName);
                          reSearch(selectedUserType, _studentName, selectedGroup?.id)
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    {' '}
                    {selectedUserDatas && selectedUserDatas.length > 0 && (
                      <Label.Text className="pb-2">
                        <Checkbox
                          checked={!selectedUserDatas?.filter((el) => !recvuserIds.includes(el.id)).length}
                          onChange={() =>
                            !selectedUserDatas?.filter((el) => !recvuserIds.includes(el.id)).length
                              ? setSelectedUsers(
                                  selectedUsers.filter(
                                    (el: { id: number }) => !selectedUserDatas?.map((sg) => sg.id).includes(el.id),
                                  ),
                                )
                              : setSelectedUsers(
                                  selectedUsers.concat(
                                    selectedUserDatas
                                      ?.filter((el) => !selectedUsers.map((u: { id: any }) => u.id).includes(el.id))
                                      .map((el) => el) || [],
                                  ),
                                )
                          }
                        />{' '}
                        {t('select_all', '전체 선택')}
                      </Label.Text>
                    )}
                  </div>
                </div>

                {selectedUserType !== 3 && (
                  <>
                    {selectedUserDatas.length > 0 && (
                      <div className="grid w-full grid-cols-1 gap-1 px-1 pr-3 pb-4 lg:grid-cols-2">
                        {selectedUserDatas?.map((item) => (
                          <div
                            key={item.id}
                            title={getTitle(item)}
                            className={`flex w-full cursor-pointer items-center justify-between rounded-lg border-2 px-3 py-1 ${
                              recvuserIds.includes(item.id) ? 'border-brand-1 bg-light_orange' : 'border-gray-6'
                            }`}
                            onClick={() => {
                              if (recvuserIds.includes(item.id)) {
                                setSelectedUsers(selectedUsers.filter((u: { id: number }) => u.id !== item.id))
                              } else {
                                setSelectedUsers(selectedUsers.concat(item))
                              }
                            }}
                          >
                            <div className="text-sm font-bold">{item.title}</div>
                            <div className="font-base text-sm">{item.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* 제목 */}
          <Label.col>
            <Label.Text>
              *<span className="text-red-500">({t('required')})</span> {t('title')}
            </Label.Text>
            <TextInput
              id="title"
              placeholder={`${t('enter_title')}`}
              value={newsletter.title}
              onChange={(e) => setNewsletter((prevState) => ({ ...prevState, title: e.target.value }))}
            />
          </Label.col>

          {/* 내용 */}
          <Label.col>
            <Label.Text>
              *<span className="text-red-500">({t('required')})</span> {t('content')}
            </Label.Text>
            <Textarea
              placeholder={`${t('enter_content')}`}
              value={newsletter.content}
              onChange={(e) => setNewsletter((prevState) => ({ ...prevState, content: e.target.value }))}
              className="border"
            />
          </Label.col>

          {/* 이미지 */}
          <div>
            <Label.Text children={t('image')} />
            <div className="mt-1 grid w-full grid-flow-row grid-cols-3 gap-2">
              {[...imageObjectMap].map(([key, value]) => (
                <ImageObjectComponent
                  key={key}
                  id={key}
                  imageObjet={value}
                  onDeleteClick={toggleImageDelete}
                  cardType={true}
                />
              ))}
              <ImageUpload accept=".pdf, .png, .jpeg, .jpg" onChange={handleImageAdd} />
            </div>
          </div>

          {/* 파일 */}
          <div>
            <Label.Text children={t('file')} />
            <FileUpload onChange={handleDocumentAdd} className="mt-1">
              {[...documentObjectMap].map(([key, value]) => (
                <DocumentObjectComponent
                  key={key}
                  id={key}
                  documentObjet={value}
                  onDeleteClick={toggleDocumentDelete}
                />
              ))}
            </FileUpload>
          </div>

          {/* 설문 */}
          {newsletter.type !== NewsletterType.NOTICE && (
            <div>
              <SuperSurveyAddComponent setContent={(c: any) => setSurveyContent(c)} content={surveyContent} />
            </div>
          )}
        </div>

        <div className="scroll-box h-screen-3 hidden overflow-scroll py-4 md:block md:w-full">
          <div className="mb-2 text-lg font-bold">{t('preview')}</div>
          <div className="w-full rounded-lg border p-3">
            <FeedsDetail
              category1={newsletter?.category || '가정통신문'}
              category1Color="light_golden"
              category2={newsletter?.type === NewsletterType.NOTICE ? '공지' : '설문'}
              category2Color="lavender_blue"
              sendTo={
                (toPerson ? t('individual') : '') +
                (toStudent ? t('student') : '') +
                (toStudent && toParent ? '/' : '') +
                (toParent ? t('parent') : '')
              }
              sendToColor="gray-100"
              useSubmit={endDateOff}
              submitDate={DateUtil.formatDate(endAt || '', DateFormat['YYYY.MM.DD HH:mm'])}
              submitYN={false}
              title={newsletter?.title}
              contentText={newsletter?.content}
              contentImages={imageObjectMapPaths()}
              contentFiles={documentObjectMapPaths()}
              contentSurvey={JSON.stringify(surveyContent)}
              surveyResult={{}}
              writer={meRecoil?.name}
              createAt={DateUtil.formatDate(new Date(), DateFormat['YYYY.MM.DD HH:mm'])}
              isPreview={true}
            />
          </div>
          {toPerson && (
            <>
              <Label.col>
                <Label.Text>* 수신자 확인</Label.Text>
                <div className="overflow-y-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="w-14 border border-gray-300">번호</th>
                        <th className="w-14 min-w-max border-gray-300">이름</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUsers.map((row: UserDatas | any) => (
                        <tr>
                          <td className="border border-gray-300 text-center">{getTitle(row)}</td>
                          <td className="border border-gray-300 text-center">{row.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Label.col>
            </>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button.lg
              children={t('save_draft', '임시저장')}
              disabled={buttonDisabled}
              onClick={() => {
                setLoading(true)
                handleSubmit({
                  newsletter,
                  surveyContent: JSON.stringify(surveyContent),
                  imageObjectMap,
                  documentObjectMap,
                  isTemp: true,
                  endDateOff,
                  recvuserIds,
                  toStudent,
                  toParent,
                  toPerson,
                })
              }}
              className="filled-primary"
            />
            <Button.lg
              children={t('publish', '발행하기')}
              disabled={buttonDisabled}
              onClick={() => {
                setLoading(true)
                handleSubmit({
                  newsletter,
                  surveyContent: JSON.stringify(surveyContent),
                  imageObjectMap,
                  documentObjectMap,
                  isTemp: false,
                  endDateOff,
                  recvuserIds,
                  toStudent,
                  toParent,
                  toPerson,
                })
                //handleNewsletterPublish();
              }}
              className="filled-primary"
            />
          </div>
          <div className="space-x-2 text-left text-sm font-bold text-red-400">
            * 발행하기를 해야 학생/보호자에게 전달됩니다.
          </div>
        </div>
      </div>
    </div>
  )
}
