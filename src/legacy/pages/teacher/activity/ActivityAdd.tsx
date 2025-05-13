import { useEffect } from 'react'

import Close from '@/assets/svg/close.svg'
import { ErrorBlank } from '@/legacy/components'
import { AllSelectCheckbox } from '@/legacy/components/AllSelectCheckbox'
import { Blank, Label, Section, Select, Textarea } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { FileUpload } from '@/legacy/components/common/FileUpload'
import { ImageUpload } from '@/legacy/components/common/ImageUpload'
import { TextInput } from '@/legacy/components/common/TextInput'
import { ToggleSwitch } from '@/legacy/components/common/ToggleSwitch'
import { DocumentObjectComponent } from '@/legacy/components/DocumentObjectComponent'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { SuperSurveyAddComponent } from '@/legacy/components/survey/SuperSurveyAddComponent'
import { useTeacherActivityAdd } from '@/legacy/container/teacher-activity-add'
import { ActivityType, Group, RequestCreateActivityDto } from '@/legacy/generated/model'

interface ActivityAddProps {
  refetch: () => void
  activityId?: number
}

export function ActivityAddPage({ refetch, activityId }: ActivityAddProps) {
  const {
    teacherGroupSubjects,
    title,
    subject,
    content,
    type,
    endDate,
    endDateOff,
    isPhrase,
    explainText,
    phrase,
    isImage,
    isFile,
    isContent,
    selectedGroups,
    firstGroup,
    secondGroup,
    thirdGroup,
    restGroup,
    imageObjectMap,
    documentObjectMap,
    buttonDisabled,
    errorMessage,
    isLoading,
    setTitle,
    setSubject,
    setContent,
    setType,
    setEndDate,
    setEndDateOff,
    setIsPhrase,
    setExplainText,
    setPhrase,
    setIsImage,
    setIsFile,
    setIsContent,
    setSelectedGroups,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    handleSubmit,
  } = useTeacherActivityAdd(activityId)

  const handleSubmitButton = async () => {
    const payload = {
      title,
      content,
      subject,
      type,
      endDate: endDateOff ? null : endDate,
      groupIds: selectedGroups.map((el) => el.id) || [],
      isRecord: isPhrase,
      commonText: phrase,
      isImage,
      isFile,
      isContent,
      explainText,
    } as RequestCreateActivityDto

    await handleSubmit({ activityPayload: payload, imageObjectMap, documentObjectMap })

    const typeName = type === ActivityType.NOTICE ? '공지' : type === ActivityType.SURVEY ? '설문' : '과제'

    if (activityId) {
      alert(`활동(${typeName})가 수정되었습니다. 확인하려면 해당 반을 선택 후 확인해주세요.`)
    } else {
      alert(`활동(${typeName})가 추가되었습니다. 확인하려면 해당 반을 선택 후 확인해주세요.`)
    }

    refetch()
    setSelectedGroups([])
    setTitle('')
    setContent('')
    setSubject('')
  }

  useEffect(() => {
    if (!activityId) {
      setContent('')
    }
  }, [type])

  if (errorMessage) {
    return <ErrorBlank />
  }

  return (
    <div className="h-screen-6 overflow-auto p-4 md:h-screen">
      {isLoading && <Blank reversed />}
      <div>
        <h3 className="text-xl font-semibold">{activityId ? '활동기록부 수정하기' : '활동기록부 추가하기'}</h3>
        <div className="mt-3 rounded-md border bg-white p-4">
          <Label.Text>
            *<span className="text-red-500">(필수)</span> 과목
          </Label.Text>
          <Select.lg
            placeholder="과목을 선택해주세요"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value)
              setSelectedGroups([])
            }}
          >
            {teacherGroupSubjects?.map((subject: string) => (
              <option value={subject} key={subject}>
                {subject}
              </option>
            ))}
          </Select.lg>
        </div>
        <div className="mt-3 rounded-md border bg-white p-4">
          <Label.Text>
            *<span className="text-red-500">(필수)</span> 전달 대상 선택
          </Label.Text>

          <div className="mt-1 flex w-full justify-between">
            <div>
              {firstGroup.length > 0 && (
                <Label.row>
                  <AllSelectCheckbox
                    groups={firstGroup}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={(groups: Group[]) => setSelectedGroups(groups)}
                  />
                  <p className="font-bold">1학년 해당 반 전체</p>
                </Label.row>
              )}
              {firstGroup.map((el) => (
                <Label.row key={el.id}>
                  <Checkbox
                    checked={selectedGroups.map((el) => el.id).includes(el.id)}
                    onChange={() =>
                      setSelectedGroups(
                        selectedGroups.map((el) => el.id).includes(el.id)
                          ? selectedGroups.filter((g) => g.id !== el.id)
                          : selectedGroups.concat(el),
                      )
                    }
                  />
                  <p>{el.name}</p>
                </Label.row>
              ))}
            </div>
            <div>
              {secondGroup.length > 0 && (
                <Label.row>
                  <AllSelectCheckbox
                    groups={secondGroup}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={(groups: Group[]) => setSelectedGroups(groups)}
                  />
                  <p className="font-bold">2학년 해당 반 전체</p>
                </Label.row>
              )}
              {secondGroup.map((el) => (
                <Label.row key={el.id}>
                  <Checkbox
                    checked={selectedGroups.map((el) => el.id).includes(el.id)}
                    onChange={() =>
                      setSelectedGroups(
                        selectedGroups.map((el) => el.id).includes(el.id)
                          ? selectedGroups.filter((g) => g.id !== el.id)
                          : selectedGroups.concat(el),
                      )
                    }
                  />
                  <p>{el.name}</p>
                </Label.row>
              ))}
            </div>
            <div>
              {!!thirdGroup.length && (
                <Label.row>
                  <AllSelectCheckbox
                    groups={thirdGroup}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={(groups: Group[]) => setSelectedGroups(groups)}
                  />
                  <p className="font-bold">3학년 해당 반 전체</p>
                </Label.row>
              )}
              {thirdGroup.map((el) => (
                <Label.row key={el.id}>
                  <Checkbox
                    checked={selectedGroups.map((el) => el.id).includes(el.id)}
                    onChange={() =>
                      setSelectedGroups(
                        selectedGroups.map((el) => el.id).includes(el.id)
                          ? selectedGroups.filter((g) => g.id !== el.id)
                          : selectedGroups.concat(el),
                      )
                    }
                  />
                  <p>{el.name}</p>
                </Label.row>
              ))}
            </div>
          </div>
          <div>
            {restGroup.map((el) => (
              <Label.row key={el.id}>
                <Checkbox
                  checked={selectedGroups.map((el) => el.id).includes(el.id)}
                  onChange={() =>
                    setSelectedGroups(
                      selectedGroups.map((el) => el.id).includes(el.id)
                        ? selectedGroups.filter((g) => g.id !== el.id)
                        : selectedGroups.concat(el),
                    )
                  }
                />
                <p>{el.name}</p>
              </Label.row>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap">
            {selectedGroups
              ?.slice()
              .sort((a, b) => {
                const aData = a?.name?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)
                const bData = b?.name?.match(`([0-9]|[0-9][0-9])학년 ([0-9]|[0-9][0-9])반`)
                if (!aData || !bData) {
                  return 0
                }

                if (aData[1] && bData[1]) {
                  if (aData[1] === bData[1]) {
                    return Number(aData[2]) - Number(bData[2])
                  } else {
                    return Number(aData[1]) - Number(bData[1])
                  }
                } else {
                  return 0
                }
              })
              .map((group: Group) => (
                <div
                  key={group.id}
                  className="m-1s border-brand-1 text-brand-1 mt-2 mr-2 flex w-max cursor-pointer items-center rounded-full border px-2.5 py-1.5"
                  onClick={() => setSelectedGroups(selectedGroups.filter((el) => el.id !== group.id))}
                >
                  {group.name}
                  <Close className="ml-2" />
                </div>
              ))}
          </div>
        </div>

        <div>
          <Section className="px-0">
            <Label.col>
              <Label.Text>
                *<span className="text-red-500">(필수)</span> 제목
              </Label.Text>
              <TextInput placeholder="제목을 입력해주세요" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Label.col>
            <Label.col>
              <Label.Text>
                *<span className="text-red-500">(필수)</span> 타입
              </Label.Text>
              <Select.lg
                placeholder="타입을 선택해주세요"
                value={type}
                disabled={!!activityId}
                onChange={(e) => {
                  setContent('')
                  setType(e.target.value as ActivityType)
                }}
              >
                <option value={ActivityType.POST}>과제</option>
                <option value={ActivityType.NOTICE}>공지</option>
                <option value={ActivityType.SURVEY}>설문</option>
              </Select.lg>
            </Label.col>

            {type !== ActivityType.NOTICE && (
              <Label.row>
                <Checkbox checked={isPhrase} onChange={() => setIsPhrase(!isPhrase)} />
                <Label.Text children="생활 기록부 상태 추가" />
              </Label.row>
            )}

            <div>
              <Label.Text children="마감기한" />
              <div className="flex items-center space-x-2">
                <ToggleSwitch
                  checked={!endDateOff}
                  onChange={() => {
                    setEndDateOff(!endDateOff)
                    if (!endDateOff) {
                      setEndDate('')
                    }
                  }}
                />
                <div className="focus:border-brand-1 flex h-12 w-full appearance-none items-center rounded-none border border-gray-200 px-4 placeholder-gray-400 outline-none focus:appearance-none focus:no-underline focus:ring-0 focus:outline-none sm:text-sm">
                  <input
                    type="datetime-local"
                    className="ring-0 outline-none focus:ring-0 focus:outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    pattern="\d{4}-\d{2}-\d{2}"
                    disabled={endDateOff}
                  />
                </div>
              </div>
            </div>
            {isPhrase && type !== ActivityType.NOTICE && (
              <Label.col>
                <Label.Text children="공통문구" />
                <TextInput
                  placeholder="내용을 입력해주세요."
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                />
              </Label.col>
            )}
            {isPhrase && type !== ActivityType.NOTICE && (
              <Label.col>
                <Label.Text children="학생 활동 보고서 설명" />
                <TextInput
                  placeholder="활동요약에 대한 설명/예시 등을 입력합니다."
                  value={explainText}
                  onChange={(e) => setExplainText(e.target.value)}
                />
              </Label.col>
            )}

            {type === ActivityType.SURVEY ? (
              <SuperSurveyAddComponent content={content} setContent={(c: string) => setContent(JSON.stringify(c))} />
            ) : (
              <>
                <div>
                  <Label.Text children="이미지" />
                  <div className="mt-1 grid w-full grid-flow-row grid-cols-3 gap-2">
                    {[...imageObjectMap].map(([key, value]) => (
                      <ImageObjectComponent key={key} id={key} imageObjet={value} onDeleteClick={toggleImageDelete} />
                    ))}
                    <ImageUpload onChange={handleImageAdd} />
                  </div>
                </div>
                <div>
                  <Label.Text children="파일" />
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
                <Label.col>
                  <Label.Text>
                    *<span className="text-red-500">(필수)</span> 내용
                  </Label.Text>
                  <Textarea
                    placeholder="내용을 입력해주세요."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border"
                  />
                </Label.col>
              </>
            )}
            {type === ActivityType.POST && (
              <div>
                <div className="text-lg font-bold">과제제출방식</div>
                <div className="mt-2 flex w-full space-x-4">
                  <Label.row>
                    <Checkbox checked={isImage} onChange={() => setIsImage(!isImage)} />
                    <p>이미지 업로드</p>
                  </Label.row>
                  <Label.row>
                    <Checkbox checked={isFile} onChange={() => setIsFile(!isFile)} />
                    <p>파일 업로드</p>
                  </Label.row>
                  <Label.row>
                    <Checkbox checked={isContent} onChange={() => setIsContent(!isContent)} />
                    <p>내용 입력</p>
                  </Label.row>
                </div>
              </div>
            )}
          </Section>
        </div>
        <div className="mt-6 flex flex-row justify-center">
          <Button.lg
            children={activityId ? '수정하기' : '등록하기'}
            disabled={buttonDisabled}
            onClick={handleSubmitButton}
            className="filled-primary w-[45%]"
          />
        </div>
      </div>
    </div>
  )
}
