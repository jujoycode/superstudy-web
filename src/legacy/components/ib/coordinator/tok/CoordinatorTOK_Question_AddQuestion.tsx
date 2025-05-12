import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Blank } from 'src/components/common';
import { Input } from 'src/components/common/Input';
import {
  useThemeQuestionGetThemeQuestionItemsByType,
  useThemeQuestionSaveThemeQuestions,
} from 'src/generated/endpoint';
import { ThemeQuestionGetThemeQuestionItemsByTypeType } from 'src/generated/model';
import { meState } from 'src/store';
import AlertV2 from '../../../common/AlertV2';
import { ButtonV2 } from '../../../common/ButtonV2';
import { Typography } from '../../../common/Typography';
import ColorSVGIcon from '../../../icon/ColorSVGIcon';
import SVGIcon from '../../../icon/SVGIcon';
import { FormInputField } from '../../FormInputField';
import { THEME_QUESTION_TYPE_KOR } from './CoordinatorTOK_Question';

interface CoordinatorTOK_Question_AddQuestionProps {
  type: ThemeQuestionGetThemeQuestionItemsByTypeType;
  modalOpen: boolean;
  setModalClose: () => void;
  onSuccess: () => void;
  handleBack?: () => void;
}

export interface QA {
  id: number; // 각 질문/답변을 고유하게 식별하기 위한 ID
  question: string;
  answer: string;
}

export function CoordinatorTOK_Question_AddQuestion({
  type,
  modalOpen,
  setModalClose,
  onSuccess,
  handleBack,
}: PropsWithChildren<CoordinatorTOK_Question_AddQuestionProps>) {
  const me = useRecoilValue(meState);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState<string>('');
  const [questions, setQuestions] = useState<string[]>(['']);

  const { data } = useThemeQuestionGetThemeQuestionItemsByType({ type });

  const { mutate: saveThemeQuestion, isLoading } = useThemeQuestionSaveThemeQuestions();

  const reset = () => {
    setTitle('');
    setQuestions([]);
  };

  useEffect(() => {
    if (data?.[0]) {
      setTitle(data[0].title);
      setQuestions(data[0].questions);
    }
  }, [data]);

  return (
    <>
      {isLoading && <Blank />}
      <div
        className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black bg-opacity-50 ${
          !modalOpen && 'hidden'
        }`}
      >
        <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white px-8`}>
          <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pb-6 pt-8 backdrop-blur-[20px]">
            <Typography variant="title1">{THEME_QUESTION_TYPE_KOR[type]} 프롬프트</Typography>
            <ColorSVGIcon.Close
              color="gray700"
              size={32}
              onClick={() => {
                setModalClose();
                reset();
              }}
            />
          </div>

          <div ref={scrollRef} className="scroll-box flex max-h-[608px] flex-col gap-6 overflow-auto pb-8 pt-4">
            <Input.Basic
              className="bg-white"
              placeholder={'제목을 입력해주세요.'}
              size={40}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {questions.map((question, index) => (
              <FormInputField
                key={index}
                index={index}
                label="항목"
                question={question}
                setQuestion={(value: string) => setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)))}
                deleteQuestion={() =>
                  setQuestions((prev) => {
                    const newQuestions = structuredClone(prev);
                    newQuestions.splice(index, 1);
                    return newQuestions;
                  })
                }
              />
            ))}

            <div className="flex justify-center">
              <ButtonV2
                variant="outline"
                size={40}
                color="gray400"
                className="flex flex-row items-center gap-1"
                onClick={() => setQuestions(questions.concat(''))}
              >
                <SVGIcon.Plus color="gray700" size={16} weight="bold" />
                항목 추가하기
              </ButtonV2>
            </div>
          </div>

          <div
            className={
              'sticky bottom-0 flex h-[104px] justify-end gap-4 border-t border-t-primary-gray-100 bg-white/70 pb-8 pt-6 backdrop-blur-[20px]'
            }
          >
            <div className="flex justify-end gap-3">
              <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
                이전
              </ButtonV2>
              <ButtonV2
                type="submit"
                variant="solid"
                color="orange800"
                size={48}
                disabled={!(questions.filter((el) => !!el).length && title)}
                onClick={() => {
                  saveThemeQuestion({ data: { title, questions }, params: { type } });
                  onSuccess();
                  reset();
                }}
              >
                저장하기
              </ButtonV2>
            </div>
          </div>
        </div>
        {isOpen && (
          <AlertV2 confirmText="확인" message={`참고자료가 \n저장되었습니다`} onConfirm={() => setIsOpen(!isOpen)} />
        )}
      </div>
    </>
  );
}
