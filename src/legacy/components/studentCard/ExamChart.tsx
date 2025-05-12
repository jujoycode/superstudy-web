import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Select as CommonSelect, Label } from 'src/components/common';
import { useStudentSubjectsScore } from 'src/container/student-subjects-score';
import HintMessage from '../common/HintMessage';
import { IBBlank } from '../common/IBBlank';
import { Typography } from '../common/Typography';

interface ExamChartProps {
  studentId: string;
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const SCORE_FILTER = [
  { label: '등급', value: '등급' },
  { label: 'Z점수', value: 'Z점수' },
  { label: '원점수', value: '원점수' },
];

const LABELS = ['1학년 1학기', '1학년 2학기', '2학년 1학기', '2학년 2학기', '3학년 1학기', '3학년 2학기', '평균'];
const defaultSubjects = ['국어', '과학', '사회(역사/도덕포함)', '수학', '영어'];

const colors = [
  'rgba(247, 124, 206, 1)',
  'rgba(251, 126, 98, 1)',
  'rgba(239, 204, 62, 1)',
  'rgba(124, 202, 87, 1)',
  'rgba(90, 194, 180, 1)',
  'rgba(78, 155, 255, 1)',
  'rgba(170, 106, 255, 1)',
  'rgba(213, 124, 242, 1)',
  'rgba(237, 110, 121, 1)',
  'rgba(251, 166, 87, 1)',
  'rgba(214, 224, 84, 1)',
  'rgba(63, 175, 113, 1)',
  'rgba(82, 203, 228, 1)',
  'rgba(102, 139, 242, 1)',
];

const animatedComponents = makeAnimated();

export default function ExamChart({ studentId }: ExamChartProps) {
  const [scoreType, setScoreType] = useState<string>(SCORE_FILTER[0].value);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [scoreDatas, setScoreDatas] = useState<any>({});
  const { scores, isLoading } = useStudentSubjectsScore(Number(studentId));

  useEffect(() => {
    if (scores) {
      const newScoreDatas: any = {};
      scores.forEach((scoreData: any) => {
        const scoreTypeLabel = scoreData.score_type;
        newScoreDatas[scoreTypeLabel] = newScoreDatas[scoreTypeLabel] || {};
        const subjectAverages: { [key: string]: { total: number; count: number } } = {};

        scoreData.scores.forEach((semesterData: any) => {
          const label = `${semesterData.grade}학년 ${semesterData.semester}학기`;
          newScoreDatas[scoreTypeLabel][label] = newScoreDatas[scoreTypeLabel][label] || [];
          newScoreDatas[scoreTypeLabel][label].push(semesterData);

          const subjectGroup = semesterData.subject_group;
          if (!subjectAverages[subjectGroup]) {
            subjectAverages[subjectGroup] = { total: 0, count: 0 };
          }
          subjectAverages[subjectGroup].total += parseFloat(semesterData.average_score);
          subjectAverages[subjectGroup].count++;
        });

        newScoreDatas[scoreTypeLabel]['평균'] = Object.keys(subjectAverages).map((subjectGroup) => {
          const { total, count } = subjectAverages[subjectGroup];
          return {
            subject_group: subjectGroup,
            average_score: (total / count).toFixed(2),
          };
        });
      });
      if (subjectNames.length > 0) {
        const initialSubjects = subjectNames
          .filter((subject) => defaultSubjects.includes(subject.label))
          .map((subject) => subject.value);
        setSelectedSubjects(initialSubjects);
      }
      setScoreDatas(newScoreDatas);
    }
  }, [scores]);

  const subjectNames = _.chain(scores)
    .map('scores')
    .flatten()
    .map('subject_group')
    .uniq()
    .map((subject) => ({ value: subject, label: subject }))
    .value();

  // 차트 옵션 정의
  const options = {
    spanGaps: false,
    responsive: true,
    interaction: {
      mode: 'point' as const,
      intersect: true,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Noto Sans KR', 'serif'",
            lineHeight: 1,
          },
          boxWidth: 6,
          boxHeight: 6,
          generateLabels: function (chart: any) {
            return chart.data.datasets.map((dataset: any, i: any) => ({
              text: dataset.label,
              fillStyle: colors[i],
              strokeStyle: colors[i],
              lineWidth: 2,
              pointStyle: 'circle',
              hidden: !chart.isDatasetVisible(i),
              index: i,
            }));
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: 'black',
        borderWidth: 1,
        padding: 20,
        bodySpacing: 10,
        usePointStyle: true,
        filter: (item: any) => item.parsed.y !== null,
        callbacks: {
          title: (tooltipItems: any) => {
            const tooltipItem = tooltipItems[0];
            const semesterLabel = tooltipItem.label;
            const subjectName = tooltipItem.dataset.label;
            if (semesterLabel === '평균') {
              return subjectName;
            }
            const semesterData = scoreDatas[scoreType][semesterLabel];
            if (semesterData) {
              const subjectData = _.find(semesterData, { subject_group: subjectName });
              if (subjectData) {
                let subjects = subjectData.subject_list || subjectData.total_subject_list;
                return subjects.map((sub: any) => sub).join(', ');
              }
            }
            return subjectName;
          },
          label: (tooltipItem: any) => {
            return `${scoreType}: ${tooltipItem.raw}`;
          },
        },
        titleColor: 'black',
        bodyColor: 'black',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        offset: true,
      },
      y: {
        grid: {
          color: '#DDDDDD',
        },
        axis: 'y' as const,
        display: true,
        max: scoreType === '등급' ? 10 : scoreType === '원점수' ? 100 : undefined,
        min: scoreType === '등급' ? 0 : undefined,
        reverse: scoreType === '등급' ? true : undefined,
        ticks: {
          stepSize: scoreType === 'Z점수' ? 0.5 : scoreType === '등급' ? 1 : undefined,
          callback: function (tickValue: string | number) {
            // 기준선의 데이터가 숫자이고, 0일 경우 빈 문자열 아닐 경우에는 값 그대로 전달
            if (typeof tickValue === 'number') {
              return tickValue === 0 || tickValue === 10 ? '' : tickValue;
            }
            return tickValue;
          },
        },
      },
    },
  };

  // 각 Option 들에 대한 스타일 설정
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? '#EE853A' : base.borderColor, // 포커스 시 테두리 색상
      boxShadow: state.isFocused ? '0 0 0 1px #EE853A' : base.boxShadow, // 포커스 시 그림자
      '&:hover': {
        borderColor: state.isFocused ? '#EE853A' : base.borderColor,
      },
    }),
    input: (base: any) => ({
      ...base,
      border: 'none !important',
      boxShadow: 'none !important',
      '&:focus': {
        outline: 'none !important',
        boxShadow: 'none !important',
      },
      '&:hover': {
        borderColor: 'none !important',
      },
      '[type="text"]:focus': {
        boxShadow: 'none !important',
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      color: 'gray',
      backgroundColor: 'rgb(255 216 194)',
      borderRadius: 5,
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#999',
    }),
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-6">
        <IBBlank type="section" />
        <Typography variant="body3" className="font-medium">
          종합성적 데이터를 불러오고 있습니다.
        </Typography>
      </div>
    );
  return (
    <div>
      <div className="flex w-full flex-col gap-4 pb-4 md:flex-col">
        <div className="flex flex-row items-center gap-4">
          <Label htmlFor="subject" className="min-w-[150px] font-bold" children="과목 선택 (다중)" />
          <Select
            options={subjectNames}
            id="subject"
            isMulti
            styles={customStyles}
            className="min-w-10 md:min-w-100"
            components={animatedComponents}
            closeMenuOnSelect={false}
            value={subjectNames.filter((option) => selectedSubjects.includes(option.value))}
            onChange={(selectedOptions: any) => setSelectedSubjects(selectedOptions.map((option: any) => option.value))}
            placeholder="과목을 선택하세요"
            noOptionsMessage={() => (isLoading ? '로딩 중입니다...' : '데이터를 입력하여야 사용할 수 있는 기능입니다.')}
          />
        </div>
        <div className="flex flex-row items-center gap-4">
          <div className="flex min-w-[150px] flex-row items-center justify-between">
            <Label htmlFor="scoreType" className="font-bold" children="데이터 선택" />
            <HintMessage message="슈퍼스쿨 성적관리 시스템으로 산출된 예상 성적입니다. 정확한 성적은 반드시, NEIS와 학교 발급 성적표에서 확인하시기 바랍니다." />
          </div>
          <CommonSelect
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value)}
            id="scoreType"
            className="h-10 min-w-10 rounded-[4px]"
          >
            {SCORE_FILTER.map(({ label, value }) => (
              <option value={value} key={label}>
                {label}
              </option>
            ))}
          </CommonSelect>
        </div>
      </div>
      <Chart
        type="line"
        options={options}
        datasetIdKey="id"
        data={{
          labels: LABELS,
          datasets: selectedSubjects.map((subjectName, index) => ({
            label: subjectName,
            data: LABELS.map((label) => {
              const semesterData = scoreDatas[scoreType][label];
              if (semesterData) {
                const subjectData = _.find(semesterData, { subject_group: subjectName });
                return subjectData ? subjectData.average_score : null;
              }
              return null;
            }),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length],
            borderWidth: 2,
            pointRadius: LABELS.map((label) => (label === '평균' ? 10 : 5)), // 평균인 경우 반경을 다르게 설정
            pointHoverRadius: LABELS.map((label) => (label === '평균' ? 12 : 6)), // 평균인 경우 반경을 다르게 설정
            pointStyle: LABELS.map((label) => (label === '평균' ? 'line' : 'circle')), // 평균일 때 line 스타일 사용
            pointBorderWidth: LABELS.map((label) => (label === '평균' ? 8 : 2)), // 두께를 증가시켜 직사각형처럼 보이게 설정
            pointHoverBorderWidth: LABELS.map((label) => (label === '평균' ? 8 : 2)), // hover 시에도 두께 유지
          })),
        }}
      />
    </div>
  );
}
