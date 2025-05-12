import { useTranslation } from 'react-i18next';
import { Typography } from 'src/components/common/Typography';

type LearingOutcome = { name: string; count: number };

interface StudentActivityLearingOutcomeProps {
  data: LearingOutcome[];
}

function StudentActivityLearingOutcome({ data }: StudentActivityLearingOutcomeProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary-gray-200 p-4">
      {data.map((lea) => (
        <span className="flex flex-row items-center justify-between gap-4" key={lea.name}>
          <Typography variant="body3">{t(`trueLearningOutcomes.${lea.name}`)}</Typography>
          <div className="mx-2 h-[1px] flex-1 border-t border-dashed border-gray-300"></div>
          <span
            className={`flex h-4 w-4 items-center justify-center rounded ${
              lea.count === 0 ? 'bg-primary-gray-500' : 'bg-primary-orange-800'
            } px-1 py-px text-11 font-medium text-white`}
          >
            {lea.count}
          </span>
        </span>
      ))}
    </div>
  );
}

export default StudentActivityLearingOutcome;
