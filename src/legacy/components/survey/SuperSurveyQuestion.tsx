import { cloneDeep } from 'lodash'
import React, { FC } from 'react'
import { ReactComponent as DeleteQuestionIcon } from '@/legacy/assets/icons/survey-delete.svg'
import { SelectValues } from '../SelectValues'
import { Radio } from '@/legacy/components/common'
import { Checkbox } from '@/legacy/components/common/Checkbox'
import { TextInput } from '@/legacy/components/common/TextInput'

interface SuperSurveyQuestionProps {
  question: any
  setContent: (content: any) => void
  content: any
  i: number
}

const questionTypes = [
  { value: 'text', text: '주관식 단답형' },
  { value: 'longtext', text: '주관식 서술형' },
  { value: 'checkbox', text: '중복선택형' },
  { value: 'radiobutton', text: '단일선택형' },
  { value: 'file', text: '파일형' },
]

export const SuperSurveyQuestion: FC<SuperSurveyQuestionProps> = ({ question, setContent, content = [], i }) => {
  const value = question.title
  const required = question.required || false

  const onChangeType = (value: string) => {
    const _content = cloneDeep(content)
    _content[i].type = value
    if (_content[i].title === '파일을 첨부해주세요.' || _content[i].title === '이미지를 첨부해주세요.') {
      _content[i].title = ''
    }
    switch (value) {
      case 'text':
        delete _content[i].choices
        break
      case 'longtext':
        delete _content[i].choices
        break
      case 'checkbox':
        _content[i].choices = ['']
        break
      case 'radiobutton':
        _content[i].choices = ['']
        break
      case 'file':
        _content[i].title = '파일을 첨부해주세요.'
        break
      case 'image':
        _content[i].title = '이미지를 첨부해주세요.'
        break
    }
    setContent(_content)
  }

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _content = cloneDeep(content)
    _content[i].title = e.target.value
    setContent(_content)
  }
  const onChangeRequired = (e: React.ChangeEvent<HTMLInputElement>) => {
    const _content = cloneDeep(content)
    _content[i].required = !required
    setContent(_content)
  }
  const onChangeChoices = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const _content = cloneDeep(content)
    _content[i].choices[index] = e.target.value
    setContent(_content)
  }

  const deleteChoice = (index: number) => {
    const _content = cloneDeep(content)
    _content[i].choices.splice(index, 1)
    setContent(_content)
  }
  const addChoice = () => {
    const _content = JSON.parse(JSON.stringify(content))
    _content[i].choices.push('')
    setContent(_content)
  }

  const deleteContent = (id: number) => {
    let _content = JSON.parse(JSON.stringify(content || []))
    _content = _content.filter((q: any) => q.id !== id)
    setContent(_content)
  }

  switch (question.type) {
    case 'file':
      return (
        <div className="border-b border-gray-300 py-2" key={question.id}>
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <SelectValues
                value={question.type}
                selectValues={questionTypes}
                onChange={onChangeType}
                className="my-0 px-4 py-1"
              />
            </div>
            <div className="flex w-16 items-center space-x-1">
              <Checkbox checked={required} onChange={onChangeRequired} />
              <p className="text-sm">필수</p>
            </div>
            <DeleteQuestionIcon
              className="h-8 w-8 cursor-pointer hover:bg-gray-50"
              title="질문 삭제"
              onClick={() => deleteContent(question.id)}
            />
          </div>
          <div className="flex items-center">
            {/* <div className="min-w-4">{i + 1}.</div> */}
            <TextInput
              className="my-2 w-full border-0 bg-gray-50 py-1"
              placeholder="번호와 질문을 입력해주세요."
              value={value}
              onChange={onChangeTitle}
            />
          </div>
        </div>
      )
    case 'image':
      return (
        <div className="border-b border-gray-300 py-2" key={question.id}>
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <SelectValues
                value={question.type}
                selectValues={questionTypes}
                onChange={onChangeType}
                className="my-0 px-4 py-1"
              />
            </div>
            <div className="flex w-16 items-center space-x-1">
              <Checkbox checked={required} onChange={onChangeRequired} />
              <p className="text-sm">필수</p>
            </div>
            <DeleteQuestionIcon
              className="h-8 w-8 cursor-pointer hover:bg-gray-50"
              title="질문 삭제"
              onClick={() => deleteContent(question.id)}
            />
          </div>
          <div className="flex items-center">
            {/* <div className="min-w-4">{i + 1}.</div> */}
            <TextInput
              className="my-2 w-full border-0 bg-gray-50 py-1"
              placeholder="번호와 질문을 입력해주세요."
              value={value}
              onChange={onChangeTitle}
            />
          </div>
        </div>
      )
    case 'text':
      return (
        <div className="border-b border-gray-300 py-2" key={question.id}>
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <SelectValues
                value={question.type}
                selectValues={questionTypes}
                onChange={onChangeType}
                className="my-0 px-4 py-1"
              />
            </div>
            <div className="flex w-16 items-center space-x-1">
              <Checkbox checked={required} onChange={onChangeRequired} />
              <p className="text-sm">필수</p>
            </div>
            <DeleteQuestionIcon
              className="h-8 w-8 cursor-pointer hover:bg-gray-50"
              title="질문 삭제"
              onClick={() => deleteContent(question.id)}
            />
          </div>
          <div className="flex items-center">
            {/* <div className="min-w-4">{i + 1}.</div> */}
            <TextInput
              className="my-2 w-full border-0 bg-gray-50 py-1"
              placeholder="번호와 질문을 입력해주세요."
              value={value}
              onChange={onChangeTitle}
            />
          </div>
        </div>
      )
    case 'longtext':
      return (
        <div className="border-b border-gray-300 py-2" key={question.id}>
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <SelectValues
                value={question.type}
                selectValues={questionTypes}
                onChange={onChangeType}
                className="my-0 px-4 py-1"
              />
            </div>
            <div className="flex w-16 items-center space-x-1">
              <Checkbox checked={required} onChange={onChangeRequired} />
              <p className="text-sm">필수</p>
            </div>
            <DeleteQuestionIcon
              className="h-8 w-8 cursor-pointer hover:bg-gray-50"
              title="질문 삭제"
              onClick={() => deleteContent(question.id)}
            />
          </div>
          <div className="flex items-center">
            {/* <div className="min-w-4">{i + 1}.</div> */}
            <TextInput
              className="my-2 w-full border-0 bg-gray-50 py-1"
              placeholder="번호와 질문을 입력해주세요."
              value={value}
              onChange={onChangeTitle}
            />
          </div>
        </div>
      )
    case 'checkbox':
      return (
        <div className="border-b border-gray-300 py-2" key={question.id}>
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <SelectValues
                value={question.type}
                selectValues={questionTypes}
                onChange={onChangeType}
                className="my-0 px-4 py-1"
              />
            </div>
            <div className="flex w-16 items-center space-x-1">
              <Checkbox checked={required} onChange={onChangeRequired} />
              <p className="text-sm">필수</p>
            </div>
            <DeleteQuestionIcon
              className="h-8 w-8 cursor-pointer hover:bg-gray-50"
              title="질문 삭제"
              onClick={() => deleteContent(question.id)}
            />
          </div>
          <div className="flex items-center">
            {/* <div className="min-w-4">{i + 1}.</div> */}
            <TextInput
              className="my-2 w-full border-0 bg-gray-50 py-1"
              placeholder="번호와 질문을 입력해주세요."
              value={value}
              onChange={onChangeTitle}
            />
          </div>
          {question?.choices?.map((c: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-2">
              <Checkbox />
              <TextInput
                className="my-2 w-full border-0 bg-gray-50 py-1"
                placeholder="항목 입력"
                onChange={(e) => onChangeChoices(e, index)}
                value={c}
              />
              {question?.choices?.length > 1 && (
                <DeleteQuestionIcon className="h-6 w-6 cursor-pointer" onClick={() => deleteChoice(index)} />
              )}
            </div>
          ))}
          <div
            className="hover:bg-brand-5 flex cursor-pointer items-center justify-center space-x-2 rounded-lg bg-gray-100 py-2"
            onClick={addChoice}
          >
            <div className="border-brand-1 text-brand-1 flex h-6 w-6 items-center justify-center rounded-full border-2 pb-0.5 text-2xl">
              +
            </div>
            <div className="text-brand-1">항목 추가</div>
          </div>
        </div>
      )
    case 'radiobutton':
      return (
        <div className="border-b border-gray-300 py-2" key={question.id}>
          <div className="flex items-center space-x-2">
            <div className="w-full">
              <SelectValues
                value={question.type}
                selectValues={questionTypes}
                onChange={onChangeType}
                className="my-0 px-4 py-1"
              />
            </div>
            <div className="flex w-16 items-center space-x-1">
              <Checkbox checked={required} onChange={onChangeRequired} />
              <p className="text-sm">필수</p>
            </div>
            <DeleteQuestionIcon
              className="h-8 w-8 cursor-pointer hover:bg-gray-50"
              title="질문 삭제"
              onClick={() => deleteContent(question.id)}
            />
          </div>
          <div className="flex items-center">
            {/* <div className="min-w-4">{i + 1}.</div> */}
            <TextInput
              className="my-2 w-full border-0 bg-gray-50 py-1"
              placeholder="번호와 질문을 입력해주세요."
              value={value}
              onChange={onChangeTitle}
            />
          </div>
          {question?.choices?.map((c: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-2">
              <Radio />
              <TextInput
                className="my-2 w-full border-0 bg-gray-50 py-1"
                placeholder="항목 입력"
                onChange={(e) => onChangeChoices(e, index)}
                value={c}
              />
              {question?.choices?.length > 1 && (
                <DeleteQuestionIcon className="h-6 w-6 cursor-pointer" onClick={() => deleteChoice(index)} />
              )}
            </div>
          ))}
          <div
            className="hover:bg-brand-5 flex cursor-pointer items-center justify-center space-x-2 rounded-lg bg-gray-100 py-2"
            onClick={addChoice}
          >
            <div className="border-brand-1 text-brand-1 flex h-6 w-6 items-center justify-center rounded-full border-2 pb-0.5 text-2xl">
              +
            </div>
            <div className="text-brand-1">항목 추가</div>
          </div>
        </div>
      )
  }
  return <></>
}
