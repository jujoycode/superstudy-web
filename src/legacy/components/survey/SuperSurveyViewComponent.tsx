import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { Label, Radio, RadioGroup, Section, Textarea } from 'src/components/common';
import { Constants } from 'src/constants';
import { Question } from 'src/types';
import { downloadFile } from 'src/util/download-image';
import { getFileNameFromUrl } from 'src/util/file';
import { DocumentObjectComponentDel } from '../DocumentObjectComponentDel';
import { ImageObjectComponentDel } from '../ImageObjectComponentDel';
import { Checkbox } from '../common/Checkbox';
import { TextInput } from '../common/TextInput';
import { Icon } from '../common/icons';

interface SuperSurveyViewComponentProps {
  surveyContent?: string;
  setContent: (content: any) => void;
  content: any;
  readOnly?: boolean;
}

export function SuperSurveyViewComponent({
  surveyContent,
  setContent,
  content = {},
  readOnly,
}: SuperSurveyViewComponentProps) {
  const [survey, setSurvey] = useState<Question[]>([]);
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
    <Section className="w-full pb-5">
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
        const value = content[question.id] || '';

        switch (question.type) {
          case 'image':
            return (
              <div className="flex w-full flex-col space-y-2" key={question.id}>
                <div className="text-lg font-bold">{question.title}</div>
                {value && <ImageObjectComponentDel id={question.id} imageObjet={{ image: value, isDelete: false }} />}
              </div>
            );
          case 'file':
            return (
              <div className="flex w-full flex-col space-y-2" key={question.id}>
                <div className="flex w-full items-center justify-between">
                  <div className="text-lg font-bold">{question.title}</div>
                  <button
                    className="hidden h-8 w-max items-center justify-center gap-1 rounded border border-zinc-300 bg-white px-3 py-1 text-center text-xs text-zinc-800 md:flex"
                    onClick={() => downloadFile(Constants.imageUrl + value, getFileNameFromUrl(value))}
                  >
                    <Icon.Download /> 첨부파일 다운로드
                  </button>
                </div>
                {value &&
                  (value.includes('image') ? (
                    <ImageObjectComponentDel id={question.id} imageObjet={{ image: value, isDelete: false }} cardType />
                  ) : (
                    <DocumentObjectComponentDel id={question.id} documentObjet={{ document: value, isDelete: false }} />
                  ))}
              </div>
            );
          case 'text':
            return (
              <div className="flex w-full flex-col space-y-2" key={question.id}>
                <div className="text-lg font-bold">{question.title}</div>
                <TextInput
                  onChange={(e) => onChangeValue(e.target.value)}
                  value={value}
                  disabled={readOnly}
                  readOnly={readOnly}
                />
              </div>
            );
          case 'longtext':
            return (
              <div className="flex w-full flex-col space-y-2" key={question.id}>
                <div className="text-lg font-bold">{question.title}</div>
                <Textarea
                  className="h-24 resize-none"
                  onChange={(e) => onChangeValue(e.target.value)}
                  value={value}
                  disabled={readOnly}
                  readOnly={readOnly}
                />
              </div>
            );
          case 'checkbox':
            return (
              <div className="flex flex-col space-y-2" key={question.id}>
                <div className="text-lg font-bold">{question.title}</div>
                {question?.choices?.map((c: any, index: number) => (
                  <Label.row key={index}>
                    <Checkbox
                      name={String(question.id)}
                      disabled={readOnly}
                      readOnly={readOnly}
                      checked={value?.includes(c)}
                      onChange={() => onChangeCheckboxValue(c)}
                    />
                    <p className={` ${value?.includes(c) ? 'font-bold text-red-400' : ''}`}>{c}</p>
                  </Label.row>
                ))}
              </div>
            );
          case 'radiobutton':
            return (
              <div className="flex flex-col space-y-2" key={question.id}>
                <div className="text-lg font-bold">{question.title}</div>
                <RadioGroup className="space-y-2" onChange={(e) => onChangeValue(e.target.value)}>
                  {question?.choices?.map((c: any, index: number) => (
                    <Label.row key={index}>
                      <Radio
                        name={String(question.id)}
                        value={c}
                        checked={value === c}
                        disabled={readOnly}
                        readOnly={readOnly}
                        onChange={(e) => onChangeValue(e.target.value)}
                      />
                      <p className={` ${value === c ? 'font-bold text-red-400' : ''}`}>{c}</p>
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
