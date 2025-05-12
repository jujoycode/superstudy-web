import clsx from 'clsx';
import { PropsWithChildren, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { IBBlank } from 'src/components/common/IBBlank';
import { RadioV2 } from 'src/components/common/RadioV2';
import { EE_SUBJECT_CATEGORY_언어와문학, EE_SUBJECT_CATEGORY_영어B, EE_SUBJECTS_CREATE } from 'src/constants/ib';
import { useIBCreate } from 'src/container/ib-project';
import { useIBProposalCreate } from 'src/container/ib-proposal-create';
import { useIBProposalUpdate } from 'src/container/ib-proposal-update';
import { RequestIBDto, RequestIBProposalDto, ResponseIBProposalDto } from 'src/generated/model';
import { meState } from 'src/store';
import { ButtonV2 } from '../../common/ButtonV2';
import { Typography } from '../../common/Typography';
import ColorSVGIcon from '../../icon/ColorSVGIcon';
import { InputField } from '../InputField';

interface IbEeProposalProps {
  modalOpen: boolean;
  setModalClose?: () => void;
  size?: 'medium' | 'large';
  projectId?: number;
  handleBack?: () => void;
  proposalData?: ResponseIBProposalDto;
  onSuccess: (action: 'save' | 'requestApproval', data?: any) => void;
  // create : 프로젝트 생성 / update : 제안서 수정 / proposal : 후순위 제안서 생성
  type: 'create' | 'update' | 'proposal';
  ablePropragation?: boolean;
}

export function IbEeProposal({
  modalOpen,
  setModalClose,
  handleBack,
  type,
  projectId,
  onSuccess,
  proposalData,
  ablePropragation = false,
}: PropsWithChildren<IbEeProposalProps>) {
  const me = useRecoilValue(meState);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequestIBProposalDto>({
    defaultValues:
      type === 'update' && proposalData
        ? proposalData
        : {
            rank: 1,
            modelPaper: '',
            modelPaperSummary: '',
            researchTopic: '',
            researchQuestion: '',
            researchNeed: '',
            researchMethod: '',
            subject: '',
            category: '',
          },
    mode: 'onChange',
  });

  const selectedSubject = watch('subject');
  const selectedCategory = watch('category');

  // 저장 버튼 disabled 여부를 확인하는 함수
  // 언어와문학, 영어B 과목일 경우 category 선택 여부 확인
  const isSubmitDisabled = () => {
    if (selectedSubject === '언어와문학' || selectedSubject === '영어B') {
      return !selectedCategory;
    }
    return false;
  };

  const requiredFields = watch([
    'subject',
    'modelPaper',
    'modelPaperSummary',
    'researchTopic',
    'researchQuestion',
    'researchNeed',
    'researchMethod',
  ]);

  const areAllFieldsFilled = requiredFields.every((field) => field && field.trim() !== '');

  const { createIBProject, isLoading } = useIBCreate({
    onSuccess: (data) => {
      onSuccess('save', data);
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error);
    },
  });

  const { createIBProposal, isLoading: isCreatingProposal } = useIBProposalCreate({
    onSuccess: () => {
      onSuccess('save');
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error);
    },
  });

  const { updateIBProposal, isLoading: isUpdatingProposal } = useIBProposalUpdate({
    onSuccess: () => {
      onSuccess('save');
    },
    onError: (error) => {
      console.error('IB 프로젝트 생성 중 오류 발생:', error);
    },
  });

  const onSubmit = (formProposalData: RequestIBProposalDto) => {
    if (isLoading) return;

    const processedProposalData = {
      ...formProposalData,
      rank: type === 'create' ? 1 : type === 'proposal' ? undefined : formProposalData.rank,
    };

    if (type === 'proposal' && projectId !== undefined) {
      createIBProposal({ id: projectId, data: processedProposalData });
    } else if (type === 'update' && projectId !== undefined && proposalData) {
      const proposalId = proposalData.id;
      if (proposalId !== undefined) {
        updateIBProposal({ id: projectId, proposalId, data: processedProposalData });
      } else {
        console.error('수정할 제안서 ID가 없습니다.');
      }
    } else {
      if (!me?.id) {
        console.error('Leader ID가 없습니다. 로그인 상태를 확인하세요.');
        return;
      }
      const requestData: RequestIBDto = {
        title: 'EE 제안서',
        ibType: 'EE',
        description: 'EE 제안서입니다.',
        leaderId: me.id,
        proposals: [formProposalData],
      };

      createIBProject(requestData);
    }
  };

  // subject 변경 시 category 초기화
  useEffect(() => {
    setValue('category', '');
  }, [selectedSubject]);

  return (
    <div
      className={`fixed inset-0 z-60 flex h-screen w-full items-center justify-center bg-black bg-opacity-50 ${
        !modalOpen && 'hidden'
      }`}
      onClick={(e) => {
        if (!ablePropragation) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div className={`relative w-[848px] overflow-hidden rounded-xl bg-white px-8`}>
        {(isLoading || isCreatingProposal || isUpdatingProposal) && <IBBlank type="section-opacity" />}
        <div className="sticky top-0 z-10 flex h-[88px] items-center justify-between bg-white/70 pb-6 pt-8 backdrop-blur-[20px]">
          <Typography variant="title1">제안서 작성</Typography>
          <ColorSVGIcon.Close color="gray700" size={32} onClick={setModalClose} className="cursor-pointer" />
        </div>

        <div className="scroll-box flex max-h-[608px] flex-col gap-6 overflow-auto pb-8 pt-4">
          <InputField
            label="과목"
            name="subject"
            control={control}
            dropdownWidth="w-full"
            placeholder="과목을 선택해주세요"
            type="select"
            options={EE_SUBJECTS_CREATE}
            size={40}
            required
          />
          {(selectedSubject === '언어와문학' || selectedSubject === '영어B') && (
            <div className="flex flex-col gap-2 px-[1px]">
              <Typography variant="title3" className="font-semibold text-primary-gray-900">
                세부 카테고리<span className="text-primary-red-800">*</span>
              </Typography>
              <RadioV2.Group
                selectedValue={watch('category')}
                onChange={(value: string) => setValue('category', value)}
                className="flex flex-col gap-3"
              >
                {selectedSubject === '언어와문학' &&
                  EE_SUBJECT_CATEGORY_언어와문학.map((category) => (
                    <RadioV2.Box key={category.value} value={category.value} content={category.value} type="medium" />
                  ))}
                {selectedSubject === '영어B' &&
                  EE_SUBJECT_CATEGORY_영어B.map((category) => (
                    <RadioV2.Box key={category.value} value={category.value} content={category.value} type="medium" />
                  ))}
              </RadioV2.Group>
            </div>
          )}

          <InputField
            label="모델 논문"
            name="modelPaper"
            control={control}
            placeholder="모델 논문을 입력해주세요"
            required
          />
          <InputField
            label="모델 논문 요약"
            name="modelPaperSummary"
            control={control}
            placeholder="모델 논문 요약을 입력해주세요"
            className="h-40"
            type="textarea"
            required
          />
          <InputField
            label="연구주제"
            name="researchTopic"
            control={control}
            placeholder="연구주제를 입력해주세요"
            required
          />
          <InputField
            label="연구 질문"
            name="researchQuestion"
            control={control}
            placeholder="연구 질문을 입력해주세요"
            className="h-40"
            type="textarea"
            required
          />
          <InputField
            label="연구의 필요성"
            name="researchNeed"
            control={control}
            placeholder="연구의 필요성을 입력해주세요"
            className="h-40"
            type="textarea"
            required
          />
          <InputField
            label="연구 방법"
            name="researchMethod"
            control={control}
            placeholder="연구 방법을 입력해주세요"
            className="h-40"
            type="textarea"
            required
          />
        </div>

        <div
          className={clsx(
            'sticky bottom-0 flex h-[104px] gap-4 border-t border-t-primary-gray-100 bg-white/70 pb-8 pt-6 backdrop-blur-[20px]',
            {
              'justify-between': type === 'create',
              'justify-end': type !== 'create',
            },
          )}
        >
          {type === 'create' && (
            <ButtonV2 variant="solid" color="gray100" size={48} onClick={handleBack}>
              이전
            </ButtonV2>
          )}
          <div className="flex gap-3">
            <ButtonV2
              type="button"
              variant="solid"
              color="gray700"
              size={48}
              onClick={handleSubmit(onSubmit)}
              disabled={!areAllFieldsFilled || isSubmitDisabled()}
            >
              제안서 저장
            </ButtonV2>
          </div>
        </div>
      </div>
    </div>
  );
}
