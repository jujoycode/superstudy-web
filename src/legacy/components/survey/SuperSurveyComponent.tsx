import { cloneDeep } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import { Label, Radio, RadioGroup, Section, Textarea } from 'src/components/common';
import { UploadFileTypeEnum } from 'src/generated/model';
import { useFileUpload } from 'src/hooks/useFileUpload';
import { Question } from 'src/types';
import { DocumentObjectComponent } from '../DocumentObjectComponent';
import { ImageObjectComponent } from '../ImageObjectComponent';
import { Checkbox } from '../common/Checkbox';
import { ImageUpload } from '../common/ImageUpload';
import { TextInput } from '../common/TextInput';

interface SuperSurveyComponentProps {
  surveyContent?: string;
  setContent: (content: any) => void;
  content: any;
  readOnly?: boolean;
  id?: number;
}

export function SuperSurveyComponent({
  surveyContent,
  setContent,
  content = {},
  readOnly,
  id,
}: SuperSurveyComponentProps) {
  const [survey, setSurvey] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const { handleUploadFile } = useFileUpload();
  const [isDragIn, setDragIn] = useState(false);

  useEffect(() => {
    if (surveyContent) {
      try {
        setSurvey(JSON.parse(surveyContent));
      } catch (err) {
        console.error(err);
      }
    }
  }, [surveyContent]);
  if (survey.length === 0) {
    return null;
  }

  return (
    <Section>
      {survey?.map((question) => {
        const onChangeValue = (value: string) => {
          const _content = cloneDeep(content);
          _content[question.id] = value;
          setContent(_content);
        };
        const onChangeCheckboxValue = (value: string) => {
          const _content = cloneDeep(content);
          if (_content[question.id]) {
            if (_content[question.id].includes(value)) {
              _content[question.id] = _content[question.id].filter((v: string) => v !== value);
            } else {
              _content[question.id].push(value);
            }
          } else {
            _content[question.id] = [value];
          }
          setContent(_content);
        };
        const handleImageAdd = async (e: ChangeEvent<HTMLInputElement>) => {
          e.stopPropagation();
          e.preventDefault();
          if (loading) return;
          if (!e.target.files) return;
          setLoading(true);
          const _content = cloneDeep(content);
          const uploadedImageName = await handleUploadFile(UploadFileTypeEnum['activityv3/images'], [
            e.target.files[0],
          ]);
          _content[question.id] = uploadedImageName[0];
          setContent(_content);
          setLoading(false);
        };
        const handleFileAdd = async (e: ChangeEvent<HTMLInputElement>) => {
          e.stopPropagation();
          e.preventDefault();
          if (loading) return;
          if (!e.target.files) return;
          setLoading(true);
          const _content = cloneDeep(content);
          if (e.target.files[0].type.includes('image')) {
            const uploadedImageName = await handleUploadFile(UploadFileTypeEnum['activityv3/images'], [
              e.target.files[0],
            ]);
            _content[question.id] = uploadedImageName[0];
          } else {
            const uploadedFileName = await handleUploadFile(UploadFileTypeEnum['activityv3/files'], [
              e.target.files[0],
            ]);
            _content[question.id] = uploadedFileName[0];
          }
          setContent(_content);
          setLoading(false);
        };
        const deleteFile = () => {
          const _content = cloneDeep(content);
          _content[question.id] = '';
          setContent(_content);
        };
        const value = content[question.id];
        switch (question.type) {
          case 'image':
            return (
              <div className="flex w-full flex-col space-y-2" key={question.id}>
                <div>
                  <span className="w-10 flex-shrink-0 text-sm text-red-400">{question.required ? '[필수]' : ''}</span>
                  <div className="w-full whitespace-normal break-words text-lg font-bold">{question.title}</div>
                </div>
                {value && (
                  <ImageObjectComponent
                    id={question.id}
                    imageObjet={{ image: value, isDelete: false }}
                    {...(!readOnly && { onDeleteClick: deleteFile })}
                  />
                )}
                {!readOnly && <ImageUpload accept=".pdf, .png, .jpeg, .jpg" onChange={handleImageAdd} />}
              </div>
            );
          case 'file':
            return (
              <div className="flex w-full flex-col space-y-2" key={question.id}>
                <div>
                  <span className="w-10 flex-shrink-0 text-sm text-red-400">{question.required ? '[필수]' : ''}</span>
                  <div className="w-full whitespace-normal break-words text-lg font-bold">{question.title}</div>
                </div>
                {value &&
                  (value.includes('images') ? (
                    <ImageObjectComponent
                      id={question.id}
                      imageObjet={{ image: value, isDelete: false }}
                      {...(!readOnly && { onDeleteClick: deleteFile })}
                    />
                  ) : (
                    <DocumentObjectComponent
                      id={question.id}
                      documentObjet={{ document: value, isDelete: false }}
                      {...(!readOnly && { onDeleteClick: deleteFile })}
                    />
                  ))}
                {!value && (
                  <div className="file-upload">
                    <label
                      className={`flex h-12 items-center justify-center space-x-1 text-brand-1 ${
                        readOnly ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <span className="mb-1 text-2xl text-grey-3">+</span>
                      <span className="text-sm">첨부파일을 선택해주세요.</span>
                      <input type="file" multiple className="sr-only" onChange={handleFileAdd} disabled={readOnly} />
                    </label>
                  </div>
                )}
              </div>
            );
          case 'text':
            return (
              <div className="flex w-full flex-col space-y-2" key={question.id}>
                <div>
                  <span className="w-10 flex-shrink-0 text-sm text-red-400">{question.required ? '[필수]' : ''}</span>
                  <div className="w-full whitespace-normal break-words text-lg font-bold">{question.title}</div>
                </div>
                <TextInput
                  onChange={(e) => onChangeValue(e.target.value)}
                  value={content[question.id]}
                  readOnly={readOnly}
                />
              </div>
            );
          case 'longtext':
            return (
              <div className="flex w-full flex-col space-y-2" key={question.id}>
                <div>
                  <span className="w-10 flex-shrink-0 text-sm text-red-400">{question.required ? '[필수]' : ''}</span>
                  <div className="w-full whitespace-normal break-words text-lg font-bold">{question.title}</div>
                </div>
                <Textarea
                  className="h-24"
                  onChange={(e) => onChangeValue(e.target.value)}
                  value={content[question.id]}
                  readOnly={readOnly}
                />
              </div>
            );
          case 'checkbox':
            return (
              <div className="flex flex-col space-y-2" key={question.id}>
                <div>
                  <span className="w-10 flex-shrink-0 text-sm text-red-400">{question.required ? '[필수]' : ''}</span>
                  <div className="w-full whitespace-normal break-words text-lg font-bold">{question.title}</div>
                </div>
                {question?.choices?.map((c: any, index: number) => (
                  <Label.row key={index}>
                    {/* <Checkbox
                      name={String(question.id)}
                      readOnly={readOnly}
                      checked={value?.includes(c)}
                      onChange={() => onChangeCheckboxValue(c)}
                    />
                    <div className={` ${value?.includes(c) ? 'font-bold text-red-400' : ''}`}>{c}</div> */}
                    <Checkbox
                      name={String(question.id)}
                      checked={value?.includes(c) || false}
                      readOnly={readOnly}
                      onChange={() => onChangeCheckboxValue(c)}
                      className={value?.includes(c) ? 'font-bold text-red-400' : ''}
                    />
                    {c}
                  </Label.row>
                ))}
              </div>
            );
          case 'radiobutton':
            return (
              <div className="flex flex-col space-y-2" key={question.id}>
                <div>
                  <span className="w-10 flex-shrink-0 text-sm text-red-400">{question.required ? '[필수]' : ''}</span>
                  <div className="w-full whitespace-normal break-words text-lg font-bold">{question.title}</div>
                </div>
                <RadioGroup className="space-y-2" onChange={(e) => onChangeValue(e.target.value)}>
                  {question?.choices?.map((c: any, index: number) => (
                    <Label.row key={index}>
                      <Radio
                        name={`${id}-${question.title}-${question.id}`}
                        value={c}
                        checked={value === c}
                        readOnly={readOnly}
                        onChange={(e) => onChangeValue(e.target.value)}
                        className={value === c ? 'font-bold text-red-400' : ''}
                      />
                      {c}
                    </Label.row>
                  ))}
                </RadioGroup>
              </div>
            );
        }
      })}
    </Section>
  );
}
