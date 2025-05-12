import _ from 'lodash'
import { FC, useState } from 'react'
import { GroupType, ResponseSubjectGroupDto, SubjectType } from '@/legacy/generated/model'
import { twMerge } from 'tailwind-merge'
import { Button } from '@/legacy/components/common/Button'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { Icon } from '@/legacy/components/common/icons'
import { SuperModal } from '../SuperModal'

interface ActivityGroupSelectModalProps {
  groups: ResponseSubjectGroupDto[]
  activityv3type: SubjectType
  modalOpen: boolean
  setModalOpen: (value: boolean) => void
  selectedGroupIds: number[]
  setSelectedGroupIds: (ids: number[]) => void
}

export const ActivityGroupSelectModal: FC<ActivityGroupSelectModalProps> = ({
  groups,
  activityv3type,
  modalOpen: selectGroupModalOpen,
  setModalOpen: setSelectGroupModalOpen,
  selectedGroupIds,
  setSelectedGroupIds,
}) => {
  const [modalGroupType, setModalGroupType] = useState<string>('KLASS')

  const klassGrades = _.uniqBy(groups, 'group.grade').map((el) => el.group.grade)

  return (
    <SuperModal
      className="3xl:h-2/3 h-3/4 w-[960px] max-w-7xl"
      modalOpen={selectGroupModalOpen}
      setModalClose={() => setSelectGroupModalOpen(false)}
    >
      <div className="flex h-full w-full flex-col space-y-4 p-10">
        <h1 className="text-xl font-bold">전달대상 선택</h1>

        {/* 전달대상 박스 */}
        <div className="flex h-full w-full gap-2 overflow-hidden">
          {/* 그룹 선택 박스 + 소속 그룹 선택 박스  */}
          <div className="flex w-full flex-row rounded border border-[#CCCCCC]">
            {/* 그룹 선택 박스 */}
            <div className="w-[300px] border-r border-[#CCCCCC] p-1">
              <div
                className={twMerge(
                  'flex cursor-pointer items-center justify-between space-x-4 rounded p-2',
                  modalGroupType === 'KLASS' && 'bg-orange-500 font-bold text-white',
                )}
                onClick={() => setModalGroupType('KLASS')}
              >
                <div>학급소속 그룹</div>
                <Icon.ChevronRight stroke={modalGroupType === 'KLASS' ? '#FFF' : '#333D4B'} />
              </div>
              <div
                className={twMerge(
                  'flex cursor-pointer items-center justify-between space-x-4 rounded p-2',
                  modalGroupType === 'LECTURE' && 'bg-orange-500 font-bold text-white',
                )}
                onClick={() => setModalGroupType('LECTURE')}
              >
                <div>강의 시간표 그룹</div>
                <Icon.ChevronRight stroke={modalGroupType === 'LECTURE' ? '#FFF' : '#333D4B'} />
              </div>
              <div
                className={twMerge(
                  'flex cursor-pointer items-center justify-between space-x-4 rounded p-2',
                  modalGroupType === 'KLUB' && 'bg-orange-500 font-bold text-white',
                )}
                onClick={() => setModalGroupType('KLUB')}
              >
                <div>사용자 정의 그룹</div>
                <Icon.ChevronRight />
              </div>
            </div>

            {/* 소속 그룹 선택 박스 */}
            <div className="w-full overflow-y-auto p-4">
              <div className="mb-2 font-bold">
                {modalGroupType === 'KLASS' && '학급소속 그룹'}
                {modalGroupType === 'LECTURE' && '강의 시간표 그룹'}
                {modalGroupType === 'KLUB' && '사용자 정의 그룹'}
              </div>
              {modalGroupType === 'KLASS' && (
                <div className="flex w-full items-start space-x-2 overflow-y-auto">
                  {klassGrades.map((grade) => {
                    const groupData = groups.filter((el) => el.group.type === 'KLASS' && el.group.grade === grade)
                    if (!groupData.length) return <></>

                    return (
                      <div className="w-full gap-2 space-y-2" key={grade}>
                        {groupData.length > 1 && (
                          <label
                            htmlFor={`check-all-${grade}`}
                            className="col-span-2 flex w-full items-center justify-start space-x-2 rounded border border-[#DDDDDD] p-2 text-sm"
                            onClick={() =>
                              groupData.filter((g) => selectedGroupIds.includes(g.group.id)).length === groupData.length
                                ? setSelectedGroupIds(
                                    _.chain(groups)
                                      .filter((el) => selectedGroupIds.includes(el.group.id))
                                      .filter((el) => el.group.grade !== grade)
                                      .map((el) => el.group.id)
                                      .value(),
                                  )
                                : setSelectedGroupIds(
                                    _.chain(selectedGroupIds)
                                      .concat(groupData.map((el) => el.group.id))
                                      .uniq()
                                      .value(),
                                  )
                            }
                          >
                            <Checkbox
                              id={`check-all-${grade}`}
                              checked={
                                groupData.filter((g) => selectedGroupIds.includes(g.group.id)).length ===
                                groupData.length
                              }
                              onChange={(e) => {
                                e.stopPropagation()
                                groupData.filter((g) => selectedGroupIds.includes(g.group.id)).length ===
                                groupData.length
                                  ? setSelectedGroupIds(
                                      _.chain(groups)
                                        .filter((el) => selectedGroupIds.includes(el.group.id))
                                        .filter((el) => el.group.grade !== grade)
                                        .map((el) => el.group.id)
                                        .value(),
                                    )
                                  : setSelectedGroupIds(
                                      _.chain(selectedGroupIds)
                                        .concat(groupData.map((el) => el.group.id))
                                        .uniq()
                                        .value(),
                                    )
                              }}
                            />
                            <div className="font-semibold whitespace-pre">{grade}학년 전체</div>
                          </label>
                        )}
                        {groupData?.map((el) => (
                          <label
                            htmlFor={'check-' + el.group?.id}
                            className="flex items-center justify-start space-x-2 rounded border border-[#DDDDDD] p-2 text-sm"
                            key={el.group?.id}
                            onClick={() =>
                              selectedGroupIds.includes(el.group?.id)
                                ? setSelectedGroupIds(selectedGroupIds.filter((id) => id !== el.group?.id))
                                : setSelectedGroupIds(selectedGroupIds.concat(el.group?.id))
                            }
                          >
                            <Checkbox
                              id={'check-' + el.group?.id}
                              checked={selectedGroupIds.includes(el.group?.id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                selectedGroupIds.includes(el.group?.id)
                                  ? setSelectedGroupIds(selectedGroupIds.filter((id) => id !== el.group?.id))
                                  : setSelectedGroupIds(selectedGroupIds.concat(el.group?.id))
                              }}
                            />
                            <div>{el.group?.name}</div>
                          </label>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}

              {modalGroupType === 'LECTURE' && activityv3type !== SubjectType.ACTIVITY && (
                <div className="grid w-full grid-cols-2 gap-2 overflow-y-auto">
                  {groups?.map(({ group: el }) => (
                    <label
                      htmlFor={'check-' + el.id}
                      className="flex items-center justify-start space-x-2 rounded border border-[#DDDDDD] p-2 text-sm"
                      key={el.id}
                      onClick={() =>
                        selectedGroupIds.includes(el.id)
                          ? setSelectedGroupIds(selectedGroupIds.filter((id) => id !== el.id))
                          : setSelectedGroupIds(selectedGroupIds.concat(el.id))
                      }
                    >
                      <Checkbox
                        id={'check-' + el.id}
                        checked={selectedGroupIds.includes(el.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          selectedGroupIds.includes(el.id)
                            ? setSelectedGroupIds(selectedGroupIds.filter((id) => id !== el.id))
                            : setSelectedGroupIds(selectedGroupIds.concat(el.id))
                        }}
                      />
                      <div>{el.name}</div>
                    </label>
                  ))}
                </div>
              )}
              {modalGroupType === 'KLUB' && (
                <div className="grid w-full grid-cols-2 gap-2 overflow-y-auto">
                  {groups
                    ?.filter((g) => g.group.type === GroupType.KLUB)
                    ?.map((el) => (
                      <label
                        htmlFor={'check-' + el.group?.id}
                        className="flex items-center justify-start space-x-2 rounded border border-[#DDDDDD] p-2 text-sm"
                        key={el.group?.id}
                        onClick={() =>
                          selectedGroupIds.includes(el.group?.id)
                            ? setSelectedGroupIds(selectedGroupIds.filter((id) => id !== el.group?.id))
                            : setSelectedGroupIds(selectedGroupIds.concat(el.group?.id))
                        }
                      >
                        <Checkbox
                          id={'check-' + el.group?.id}
                          checked={selectedGroupIds.includes(el.group?.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            selectedGroupIds.includes(el.group?.id)
                              ? setSelectedGroupIds(selectedGroupIds.filter((id) => id !== el.group?.id))
                              : setSelectedGroupIds(selectedGroupIds.concat(el.group?.id))
                          }}
                        />
                        <div>{el.group?.name}</div>
                      </label>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* 내가 선택한 그룹 박스 */}
          <div className="flex w-full max-w-[20%] min-w-[210px] flex-col rounded border border-[#777777] p-4">
            <div className="mb-2 font-bold">선택한 그룹</div>
            <div className="flex h-full w-full flex-col space-y-2 overflow-y-auto">
              {selectedGroupIds
                .slice()
                .sort((a, b) => a - b)
                .map((groupId) => (
                  <div
                    className="text-14 flex w-full items-center justify-between space-x-2 rounded border border-stone-300 p-2"
                    key={groupId}
                  >
                    {groups?.find((el) => el.group?.id === groupId)?.group?.name}
                    <Icon.Close
                      className="cursor-pointer rounded-full bg-zinc-100 p-1 text-zinc-400"
                      onClick={() => setSelectedGroupIds(selectedGroupIds.filter((id) => id !== groupId))}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Button
            className="h-12 w-28 rounded-lg border border-neutral-500 bg-white text-lg font-semibold"
            onClick={() => {
              setSelectGroupModalOpen(false)
              setSelectedGroupIds([])
            }}
          >
            취소
          </Button>
          <Button
            className="h-12 w-28 rounded-lg bg-orange-500 text-lg font-semibold text-white disabled:bg-gray-500"
            disabled={!selectedGroupIds.length}
            onClick={() => setSelectGroupModalOpen(false)}
          >
            확인
          </Button>
        </div>
      </div>
    </SuperModal>
  )
}
