import { useParams } from 'react-router'

import { ErrorBlank } from '@/legacy/components'
import { AllSelectCheckbox } from '@/legacy/components/AllSelectCheckbox'
import { BackButton, Blank, Label, Section, Select, Textarea, TopNavbar } from '@/legacy/components/common'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { FeedsDetail } from '@/legacy/components/common/FeedsDetail'
import { FileUpload } from '@/legacy/components/common/FileUpload'
import { ImageUpload } from '@/legacy/components/common/ImageUpload'
import { TextInput } from '@/legacy/components/common/TextInput'
import { DocumentObjectComponent } from '@/legacy/components/DocumentObjectComponent'
import { ImageObjectComponent } from '@/legacy/components/ImageObjectComponent'
import { useTeacherBoardAdd } from '@/legacy/container/teacher-board-add'
import { BoardCategoryEnum, Group, RequestCreateBoardDto } from '@/legacy/generated/model'
import { useLanguage } from '@/legacy/hooks/useLanguage'
import { DateFormat, DateUtil } from '@/legacy/util/date'
import { getExtOfFilename } from '@/legacy/util/file'
import { useUserStore } from '@/stores/user'

interface BoardAddProps {
  homeKlass?: Group
  groups?: Group[]
}

export function BoardAddPage({ homeKlass, groups }: BoardAddProps) {
  const { id } = useParams<{ id: string }>()
  const { me: meRecoil } = useUserStore()
  const { t } = useLanguage()

  const {
    title,
    content,
    selectedGroups,
    selectedCategory,
    firstGroup,
    secondGroup,
    thirdGroup,
    fourthGroup,
    fifthGroup,
    sixthGroup,
    restGroup,
    selectedGroupIds,
    imageObjectMap,
    documentObjectMap,
    buttonDisabled,
    errorMessage,
    isLoading,
    isSubmitLoading,
    toStudent,
    toParent,
    setTitle,
    setContent,
    setSelectedGroups,
    setSelectedCategory,
    handleImageAdd,
    toggleImageDelete,
    handleDocumentAdd,
    toggleDocumentDelete,
    handleSubmit,
    setToStudent,
    setToParent,
  } = useTeacherBoardAdd({ homeKlass, groups, boardId: Number(id) })

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
      {(isLoading || isSubmitLoading) && <Blank />}
      {errorMessage && <ErrorBlank text={errorMessage} />}

      <div className="block md:hidden">
        <TopNavbar title={`${t('class_bulletin_board')} ${t('add')}`} left={<BackButton />} />
      </div>
      <div className="flex space-x-3">
        <div className="scroll-box h-screen-8 md:h-screen-3 overflow-y-auto">
          <Section>
            <Label.col>
              <Label.Text>
                *<span className="text-red-500">({t('required')})</span> {t('required_select_recipients')}
              </Label.Text>
              <div className="rounded-md border bg-white p-4 text-sm">
                <Label.Text>
                  {/* 1. 대상 범주 선택 <span className="text-blue-500">(복수 선택 가능)</span> */}
                  {t('select_target_group')}
                </Label.Text>
                <>
                  <div className="flex items-center space-x-4 pt-3 pb-3 text-sm">
                    <Checkbox
                      checked={toStudent}
                      onChange={() => {
                        setToStudent(!toStudent)
                        if (toStudent && !toParent) {
                          setToParent(true)
                        }
                      }}
                    />
                    <p>{t('student')}</p>
                    <Checkbox
                      checked={toParent}
                      onChange={() => {
                        setToParent(!toParent)
                        if (!toStudent && toParent) {
                          setToStudent(true)
                        }
                      }}
                    />
                    <p>{t('parent')}</p>
                  </div>
                </>
                <Label.Text>{t('detailed_selection')}</Label.Text>
                <div>
                  <div className="mt-2 flex w-full justify-between">
                    <div>
                      {firstGroup.length > 0 && (
                        <Label.row>
                          <AllSelectCheckbox
                            groups={firstGroup}
                            selectedGroups={selectedGroups}
                            setSelectedGroups={(groups: Group[]) => setSelectedGroups(groups)}
                          />
                          <p className="font-bold">{t('entire_1st_grade')}</p>
                        </Label.row>
                      )}
                      {firstGroup.map((group: Group) => (
                        <Label.row key={group.id}>
                          <Checkbox
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={() =>
                              selectedGroupIds.includes(group.id)
                                ? setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
                                : setSelectedGroups(selectedGroups.concat(group))
                            }
                          />
                          <p>{group.name}</p>
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
                          <p className="font-bold">{t('entire_2nd_grade')}</p>
                        </Label.row>
                      )}
                      {secondGroup.map((group) => (
                        <Label.row key={group.id}>
                          <Checkbox
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={() =>
                              selectedGroupIds.includes(group.id)
                                ? setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
                                : setSelectedGroups(selectedGroups.concat(group))
                            }
                          />
                          <p>{group.name}</p>
                        </Label.row>
                      ))}
                    </div>
                    <div>
                      {thirdGroup.length > 0 && (
                        <Label.row>
                          <AllSelectCheckbox
                            groups={thirdGroup}
                            selectedGroups={selectedGroups}
                            setSelectedGroups={(groups: Group[]) => setSelectedGroups(groups)}
                          />
                          <p className="font-bold">{t('entire_3rd_grade')}</p>
                        </Label.row>
                      )}
                      {thirdGroup.map((group) => (
                        <Label.row key={group.id}>
                          <Checkbox
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={() =>
                              selectedGroupIds.includes(group.id)
                                ? setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
                                : setSelectedGroups(selectedGroups.concat(group))
                            }
                          />
                          <p>{group.name}</p>
                        </Label.row>
                      ))}
                    </div>
                  </div>
                  <div className="mt-1 flex w-full justify-between">
                    <div>
                      {fourthGroup.length > 0 && (
                        <Label.row>
                          <AllSelectCheckbox
                            groups={fourthGroup}
                            selectedGroups={selectedGroups}
                            setSelectedGroups={(groups: Group[]) => setSelectedGroups(groups)}
                          />
                          <p className="font-bold">{t('entire_4th_grade')}</p>
                        </Label.row>
                      )}
                      {fourthGroup.map((group: Group) => (
                        <Label.row key={group.id}>
                          <Checkbox
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={() =>
                              selectedGroupIds.includes(group.id)
                                ? setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
                                : setSelectedGroups(selectedGroups.concat(group))
                            }
                          />
                          <p>{group.name}</p>
                        </Label.row>
                      ))}
                    </div>
                    <div>
                      {fifthGroup.length > 0 && (
                        <Label.row>
                          <AllSelectCheckbox
                            groups={fifthGroup}
                            selectedGroups={selectedGroups}
                            setSelectedGroups={(groups: Group[]) => setSelectedGroups(groups)}
                          />
                          <p className="font-bold">{t('entire_5th_grade')}</p>
                        </Label.row>
                      )}
                      {fifthGroup.map((group) => (
                        <Label.row key={group.id}>
                          <Checkbox
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={() =>
                              selectedGroupIds.includes(group.id)
                                ? setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
                                : setSelectedGroups(selectedGroups.concat(group))
                            }
                          />
                          <p>{group.name}</p>
                        </Label.row>
                      ))}
                    </div>
                    <div>
                      {sixthGroup.length > 0 && (
                        <Label.row>
                          <AllSelectCheckbox
                            groups={sixthGroup}
                            selectedGroups={selectedGroups}
                            setSelectedGroups={(groups: Group[]) => setSelectedGroups(groups)}
                          />
                          <p className="font-bold">{t('entire_6th_grade')}</p>
                        </Label.row>
                      )}
                      {sixthGroup.map((group) => (
                        <Label.row key={group.id}>
                          <Checkbox
                            checked={selectedGroupIds.includes(group.id)}
                            onChange={() =>
                              selectedGroupIds.includes(group.id)
                                ? setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
                                : setSelectedGroups(selectedGroups.concat(group))
                            }
                          />
                          <p>{group.name}</p>
                        </Label.row>
                      ))}
                    </div>
                  </div>
                  <div>
                    {restGroup.map((group) => (
                      <Label.row key={group.id}>
                        <Checkbox
                          checked={selectedGroupIds.includes(group.id)}
                          onChange={() =>
                            selectedGroupIds.includes(group.id)
                              ? setSelectedGroups(selectedGroups.filter((g) => g.id !== group.id))
                              : setSelectedGroups(selectedGroups.concat(group))
                          }
                        />
                        <p>{group.name}</p>
                      </Label.row>
                    ))}
                  </div>
                </div>
              </div>
            </Label.col>
            <Label.col>
              <Label.Text>
                *<span className="text-red-500">({t('required')})</span> {t('required_category')}
              </Label.Text>
              <Select.lg
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as BoardCategoryEnum)}
              >
                <option selected hidden>
                  {t('selection')}
                </option>
                {Object.keys(BoardCategoryEnum).map((el) => (
                  <option id={el} value={el} key={el}>
                    {t(`${el}`)}
                  </option>
                ))}
              </Select.lg>
            </Label.col>

            <Label.col>
              <Label.Text>
                *<span className="text-red-500">({t('required')})</span> {t('title')}
              </Label.Text>
              <TextInput placeholder={`${t('enter_title')}`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Label.col>

            <Label.col>
              <Label.Text>
                *<span className="text-red-500">({t('required')})</span> {t('content')}
              </Label.Text>
              <Textarea
                placeholder={`${t('enter_content')}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Label.col>

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
            <div className="hidden md:block">
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
            <div className="ml-2 text-sm text-red-400 md:hidden">
              * {t('file_attachment_and_post_edit_delete_pc_only')}
            </div>
          </Section>
          <div className="mt-6 md:hidden">
            <Button.lg
              children={!!id && id !== 'add' ? '수정하기' : '등록하기'}
              disabled={buttonDisabled}
              onClick={() => {
                const board: RequestCreateBoardDto = {
                  title,
                  content,
                  category: selectedCategory!,
                  images: [],
                  files: [],
                  targetGroupIds: selectedGroupIds,
                  toStudent: false,
                  toParent: false,
                }
                handleSubmit({ boardPayload: board, imageObjectMap, documentObjectMap })
              }}
              className="filled-primary mx-auto w-[70%]"
            />
          </div>
        </div>
        <div className="scroll-box h-screen-3 hidden overflow-scroll py-4 md:block md:w-1/2">
          {/* <div className=" md:scroll-box hidden md:block md:h-screen-3 md:w-1/2 md:overflow-scroll md:py-4"> */}
          <div className="mb-3 text-lg font-bold">{t('preview')}</div>
          <div className="w-full rounded-lg border p-3">
            <FeedsDetail
              category1={selectedCategory || '학급게시판'}
              category1Color="mint_green"
              title={title}
              sendTo={
                (toStudent ? t('student') : '') + (toStudent && toParent ? '/' : '') + (toParent ? t('parent') : '')
              }
              sendToColor="gray-100"
              contentText={content}
              contentImages={imageObjectMapPaths()}
              contentFiles={documentObjectMapPaths()}
              writer={meRecoil?.name}
              createAt={DateUtil.formatDate(new Date(), DateFormat['YYYY.MM.DD HH:mm'])}
            />
          </div>
          <div className="mt-2">
            <Button.lg
              children={!!id && id !== 'add' ? t('edit_announcement') : t('register')}
              disabled={buttonDisabled}
              onClick={() => {
                const board: RequestCreateBoardDto = {
                  title,
                  content,
                  category: selectedCategory!,
                  images: [],
                  files: [],
                  toStudent: false,
                  toParent: false,
                  targetGroupIds: selectedGroupIds,
                }
                handleSubmit({ boardPayload: board, imageObjectMap, documentObjectMap })
              }}
              className="filled-primary mx-auto w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
