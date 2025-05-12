import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { SubjectMapping, SubjectOrder } from 'src/constants/score.enum';
import { useStudentAnalysisTargetScore } from 'src/container/student-score';
import { getThisSemester } from 'src/util/time';
import HintMessage from '../common/HintMessage';
import { IBBlank } from '../common/IBBlank';
import { Typography } from '../common/Typography';
import SolidSVGIcon from '../icon/SolidSVGIcon';

interface TargetScoreProps {
  studentId: string;
  grade: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
);

const chartEvents: ('mousemove' | 'mouseout' | 'click')[] = ['mousemove', 'mouseout', 'click'];

export const TargetScore = ({ studentId, grade }: TargetScoreProps) => {
  const thisSemester = getThisSemester();
  const { data, isLoading } = useStudentAnalysisTargetScore(Number(studentId), grade, Number(thisSemester));
  const scores = data?.analysed_target_score?.scores || [];

  const sortedScores = scores.sort((a: any, b: any) => {
    const orderA = SubjectMapping[a.subject_name] ?? SubjectOrder.기타;
    const orderB = SubjectMapping[b.subject_name] ?? SubjectOrder.기타;
    return orderA - orderB;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Typography variant="title1">목표성적</Typography>
        <div className="flex flex-col items-center justify-center gap-4">
          <IBBlank type="section" />
          <Typography variant="body3" className="font-medium">
            목표성적 데이터를 불러오고 있습니다.
          </Typography>
        </div>
      </div>
    );
  }

  if (!data || data.analysed_target_score.error === '데이터가 없습니다') {
    return (
      <main className="flex flex-col gap-10">
        <section className="flex flex-col gap-6">
          <Typography variant="title1">목표성적</Typography>
          <div className="scrollable w-full">
            <table className="w-full table-auto border-collapse">
              <thead className="text-center text-13 font-normal text-primary-gray-600">
                <tr>
                  <td className="w-[120px] bg-primary-gray-50 p-2">과목</td>
                  <td className="border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">단위수</td>
                  <td className="border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">점수</td>
                  <td className="border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">석차등급</td>
                  <td className="border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">
                    석차(동점자수)
                    <br />/ 수강자수
                  </td>
                  <td className="border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">
                    과목평균(표준편차)
                  </td>
                  <td className="border-x border-b border-primary-gray-200 bg-primary-orange-50 p-2">목표등급</td>
                  <td className="border-x border-b border-primary-gray-200 bg-primary-orange-50 p-2">목표석차</td>
                  <td className="border-x border-b border-primary-gray-200 bg-primary-orange-50 p-2">목표점수</td>
                  <td className="border-b border-l border-primary-gray-200 bg-primary-orange-50 p-2">경쟁자수</td>
                </tr>
              </thead>
              <tbody className="text-center text-13 text-primary-gray-900">
                <tr>
                  <td className={`border-b border-t border-b-primary-gray-100 border-t-primary-gray-200 p-2`}>-</td>
                  <td className="border border-primary-gray-100 p-2">-</td>
                  <td className="border border-primary-gray-100 p-2">-</td>
                  <td className="border border-primary-gray-100 p-2">-</td>
                  <td className="border border-primary-gray-100 p-2 text-center">-</td>
                  <td className="border border-primary-gray-100 p-2">-</td>
                  <td className="border border-primary-gray-100 p-2">-</td>
                  <td className="border border-primary-gray-100 p-2">-</td>
                  <td className="border border-primary-gray-100 p-2">-</td>
                  <td className="border-y border-l border-primary-gray-100 p-2">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    );
  }
  return (
    <main className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="flex flex-row items-center justify-between">
          <Typography variant="title1">목표성적</Typography>
          <div className="flex flex-col gap-1.5">
            <span className="flex flex-row items-center gap-1">
              <SolidSVGIcon.Info color="gray400" size={16} />
              <div className="flex flex-row items-center">
                <Typography variant="caption2" className="text-primary-gray-500">
                  현재 보여지는 성적은
                </Typography>
                <Typography variant="caption2" className="text-primary-orange-800">
                  {data &&
                    ` ${data.analysed_target_score.grade}학년 ${data.analysed_target_score.semester}학기 ${
                      data.analysed_target_score.step === 'final'
                        ? '종합성적'
                        : data.analysed_target_score.step === '2'
                        ? '2차 지필고사'
                        : '1차 지필고사'
                    } `}
                </Typography>
                <Typography variant="caption2" className="text-primary-gray-500">
                  기준입니다.
                </Typography>
              </div>
            </span>
            <Typography variant="caption2" className="text-right text-primary-gray-500">
              9 등급 체계의 과목만 목표성적에 보여집니다.
            </Typography>
          </div>
        </div>
        <div className="scrollable w-full">
          <table className="w-full table-auto border-collapse">
            <thead className="text-center text-13 font-normal text-primary-gray-600">
              <tr>
                <td className="min-w-[120px] border-b border-primary-gray-200 bg-primary-gray-50 p-2">과목</td>
                <td className="min-w-[120px] border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">
                  단위수
                </td>
                <td className="min-w-[120px] border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">점수</td>
                <td className="min-w-[120px] border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">
                  석차등급
                </td>
                <td className="min-w-[120px] border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">
                  석차(동점자수)
                  <br />/ 수강자수
                </td>
                <td className="min-w-[120px] border-x border-b border-primary-gray-200 bg-primary-gray-50 p-2">
                  과목평균(표준편차)
                </td>
                <td className="min-w-[120px] border-x border-b border-primary-gray-200 bg-primary-orange-50 p-2">
                  목표등급
                </td>
                <td className="min-w-[120px] border-x border-b border-primary-gray-200 bg-primary-orange-50 p-2">
                  목표석차
                </td>
                <td className="min-w-[120px] border-x border-b border-primary-gray-200 bg-primary-orange-50 p-2">
                  목표점수
                </td>
                <td className="relative min-w-[120px] border-b border-l border-primary-gray-200 bg-primary-orange-50 p-2">
                  경쟁자수
                  <div className="absolute right-1.5 top-1.5">
                    <HintMessage
                      direction="left"
                      message={`목표등급 : 현재 성적보다 한 등급 향상된 등급입니다.\n목표석차 : 목표 등급에 도달하기 위한 석차입니다.\n목표점수 : 이번 시험에서 목표 석차에 해당하는 점수입니다.\n위 데이터는 모두 [관리자 - 성적관리] 목표성적 분석 기능을 통해 생성되는 데이터입니다.`}
                    />
                  </div>
                </td>
              </tr>
            </thead>
            <tbody className="text-center text-13 text-primary-gray-900">
              {sortedScores.map((score: any, index: number) => (
                <tr key={index}>
                  <td
                    className={`whitespace-nowrap border-r border-t border-r-primary-gray-100 border-t-primary-gray-100 p-2 ${
                      index === sortedScores.length - 1 ? 'border-b border-b-primary-gray-100' : ''
                    }`}
                  >
                    {score.subject_name}
                  </td>
                  <td className="whitespace-nowrap border border-primary-gray-100 p-2">{score.credit}</td>
                  <td className="whitespace-nowrap border border-primary-gray-100 p-2">{score.score}</td>
                  <td className="whitespace-nowrap border border-primary-gray-100 p-2">{score.rank_score}</td>
                  <td className="whitespace-nowrap border border-primary-gray-100 p-2 text-center">
                    {score.position || '-'}({score.num_same_score || '-'})/
                    {score.subject_total_student_sum_real || '-'}
                  </td>
                  <td className="whitespace-nowrap border border-primary-gray-100 p-2">
                    {score.score_mean || '-'} ({score.score_std || '-'})
                  </td>
                  <td className="whitespace-nowrap border border-primary-gray-100 p-2">{score.target_rank || '-'}</td>
                  <td className="whitespace-nowrap border border-primary-gray-100 p-2">
                    {score.target_position || '-'}
                  </td>
                  <td className="whitespace-nowrap border border-primary-gray-100 p-2">{score.target_score || '-'}</td>
                  <td className="whitespace-nowrap border-y border-l border-primary-gray-100 p-2">
                    {score.n_people_ahead || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="scrollable my-4 flex flex-row items-center gap-10 py-2">
        <TargetScoreRadarChart data={sortedScores} />
        <TargetScoreBarChart data={sortedScores} />
      </section>
    </main>
  );
};

const TargetScoreBarChart = ({ data }: { data: any }) => {
  const [chartData, setChartData] = useState<ChartData<'bar', number[], string>>({
    labels: data.map((subjectData: any) => subjectData.subject_name),
    datasets: [],
  });

  const chartRef = useRef<any>(null);
  const getOrCreateTooltip = (chart: any) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'white';
      tooltipEl.style.borderRadius = '8px';
      tooltipEl.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08)';
      tooltipEl.style.color = '#121417';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';
      tooltipEl.style.border = '1px solid #E8EAED';

      const table = document.createElement('table');
      table.style.margin = '0px';

      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  const externalTooltipHandler = (context: any) => {
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map((b: any) => b.lines);
      const extractedData = bodyLines.flat().map((line: string) => {
        const [key] = line.split(': ');
        return key;
      });
      const formattedValue = tooltip.dataPoints[0]?.formattedValue ? Number(tooltip.dataPoints[0].formattedValue) : '';
      const dataIndex = tooltip.dataPoints[0]?.dataset.label;

      let color = '#000';
      switch (dataIndex) {
        case '학생점수':
          color = '#FF600C';
          break;
        case '과목평균':
          color = '#121417';
          break;
        default:
          color = '#000';
      }

      const tableHead = document.createElement('thead');

      titleLines.forEach((title: any) => {
        const tr = document.createElement('tr');
        tr.style.borderWidth = '0';

        const th = document.createElement('th');
        th.style.borderWidth = '0';
        th.style.fontSize = '16px';
        th.style.fontWeight = '600';
        th.style.textAlign = 'left';
        th.style.padding = '16px 16px 8px 16px';

        const titleText = document.createElement('span');
        titleText.style.color = '#121417';
        titleText.style.marginRight = '8px';
        titleText.textContent = title;

        // FormattedValue 스타일
        const valueText = document.createElement('span');
        valueText.style.fontSize = '16px';
        valueText.style.color = color;
        valueText.textContent = formattedValue.toString();

        th.appendChild(titleText);
        th.appendChild(valueText);
        tr.appendChild(th);
        tableHead.appendChild(tr);
      });

      const tableBody = document.createElement('tbody');
      extractedData.forEach((body: any, i: number) => {
        const span = document.createElement('span');
        span.style.borderWidth = '1px';
        span.style.borderRadius = '4px';
        span.style.border = '1px solid #E0E0E0';
        span.style.height = '12px';
        span.style.width = '12px';
        span.style.marginRight = '6px';
        span.style.display = 'inline-block';

        switch (body) {
          case '학생점수':
            span.style.background = 'linear-gradient(to right, #FF803D, #FFBC99)';
            break;
          case '과목평균':
            span.style.background = 'linear-gradient(to right, #6E83A3, #A4C0CF)';
            break;
          default:
            span.style.background = 'linear-gradient(to right, #CCCCCC, #EEEEEE)';
        }

        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';
        tr.style.borderWidth = '0';

        const td = document.createElement('td');
        td.style.borderWidth = '0';
        td.style.fontSize = '12px';
        td.style.fontFamily = 'Pretendard';
        td.style.padding = '0 16px 16px 16px';
        td.style.color = '#121417';
        td.style.fontWeight = '500';
        td.style.textAlign = 'left';
        td.style.display = 'flex';
        td.style.alignItems = 'center';
        const text = document.createTextNode(body);

        td.appendChild(span);
        td.appendChild(text);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });

      const tableRoot = tooltipEl.querySelector('table');

      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove();
      }

      tableRoot.appendChild(tableHead);
      tableRoot.appendChild(tableBody);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;
    const chartWidth = chart.width;
    const chartHeight = chart.height;

    let left = positionX + tooltip.caretX;
    let top = positionY + tooltip.caretY;

    // 화면의 오른쪽을 넘어가는 경우
    if (left + tooltipWidth > chartWidth) {
      left = chartWidth - tooltipWidth + 60; // 10px 여유를 두고 조정
    }

    // 화면의 아래쪽을 넘어가는 경우
    if (top + tooltipHeight > chartHeight) {
      top = chartHeight - tooltipHeight + 60; // 10px 여유를 두고 조정
    }

    // 화면의 왼쪽을 넘어가는 경우
    if (left < 0) {
      left = 4; // 10px 여유를 두고 조정
    }

    // 화면의 위쪽을 넘어가는 경우
    if (top < 0) {
      top = 10; // 10px 여유를 두고 조정
    }

    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  };

  const options = useMemo(
    () => ({
      spanGaps: false,
      responsive: true,
      maxBarThickness: 20,
      maintainAspectRatio: false,
      interaction: {
        mode: 'point' as const,
        intersect: true,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          position: 'nearest' as const,
          external: externalTooltipHandler,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          offset: true,
          ticks: {
            font: {
              size: 13,
              family: 'Pretendard',
              weight: 400,
            },
            color: '#121417',
            padding: 2,
            callback: function (value: string | number, index: number, values: any) {
              const label = chartData?.labels?.[index];
              const maxLength = 6;
              if (label && typeof label === 'string' && label.length > maxLength) {
                return label.substring(0, maxLength) + '...';
              }
              return label;
            },
          },
        },
        y: {
          reverse: false,
          grid: {
            color: '#DDDDDD',
            drawBorder: false,
          },
          axis: 'y' as const,
          display: true,
          max: 100,
          min: 0,
          beginAtZero: true,
          ticks: {
            font: {
              size: 10,
              family: 'Pretendard',
              weight: 500,
            },
            color: '#c7cbd1',
            stepSize: 20,
            callback: function (tickValue: number | string) {
              return tickValue;
            },
          },
        },
      },
    }),
    [],
  );

  useEffect(() => {
    const chartInstance = chartRef.current;
    if (chartInstance) {
      const ctx = chartInstance.ctx;

      const getGradient = (ctx: any, chartArea: any, colorStart: string, colorEnd: string) => {
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
      };

      // "구분" 값에 따른 색상 매핑
      const colorMap = {
        학생점수: getGradient(ctx, chartInstance.chartArea, '#FF803D', '#FFBC99'),
        과목평균: getGradient(ctx, chartInstance.chartArea, '#6E83A3', '#A4C0CF'),
      };

      const datasets = [
        {
          label: '학생점수',
          data: data.map((subjectData: any) => subjectData.score),
          borderWidth: 1,
          backgroundColor: colorMap['학생점수'],
          hoverBackgroundColor: getGradient(ctx, chartInstance.chartArea, '#FF803D', '#FFBC99'),
          barThickness: 'flex' as const,
          borderRadius: 4,
          categoryPercentage: 0.7,
          barPercentage: 0.7,
        },
        {
          label: '과목평균',
          data: data.map((subjectData: any) => subjectData.score_mean),
          backgroundColor: colorMap['과목평균'],
          borderWidth: 0,
          hoverBackgroundColor: getGradient(ctx, chartInstance.chartArea, '#6E83A3', '#A4C0CF'),
          barThickness: 'flex' as const,
          borderRadius: 4,
          categoryPercentage: 0.7,
          barPercentage: 0.7,
        },
      ];

      // Chart 데이터 설정
      setChartData({
        labels: data.map((subjectData: any) => subjectData.subject_name),
        datasets,
      });
    }
  }, [data]);

  return (
    <div className="flex w-full min-w-[704px] flex-col items-center gap-6 py-2">
      <div className="h-[432px] w-full min-w-[704px]">
        <Chart type="bar" options={options} datasetIdKey="id" data={chartData} ref={chartRef} />
      </div>
      <div className="flex w-fit items-center justify-center gap-4 rounded-lg bg-primary-gray-100 px-5 py-2">
        <div className="flex flex-row items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] border-dim-8 bg-gradient-orange-400" />
          <Typography variant="caption2" className="font-medium">
            학생점수
          </Typography>
        </div>
        <div className="flex flex-row items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] border-dim-8 bg-gradient-navy-400" />
          <Typography variant="caption2" className="font-medium">
            과목평균
          </Typography>
        </div>
      </div>
    </div>
  );
};

const TargetScoreRadarChart = ({ data }: { data: any }) => {
  const [chartData, setChartData] = useState<ChartData<'radar', number[], string>>({
    labels: [],
    datasets: [],
  });

  const chartRef = useRef<any>(null);
  const getOrCreateTooltip = (chart: any) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'white';
      tooltipEl.style.borderRadius = '8px';
      tooltipEl.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08)';
      tooltipEl.style.color = '#121417';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';
      tooltipEl.style.border = '1px solid #E8EAED';

      const table = document.createElement('table');
      table.style.margin = '0px';

      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  const externalTooltipHandler = (context: any) => {
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map((b: any) => b.lines);
      const extractedData = bodyLines.flat().map((line: string) => {
        const [key] = line.split(': ');
        return key;
      });
      const formattedValue = tooltip.dataPoints[0]?.formattedValue ? Number(tooltip.dataPoints[0].formattedValue) : '';
      const dataIndex = tooltip.dataPoints[0]?.dataset.label;

      let color = '#000';
      switch (dataIndex) {
        case '학생점수':
          color = '#FF600C';
          break;
        case '과목평균':
          color = '#121417';
          break;
        default:
          color = '#000';
      }

      const tableHead = document.createElement('thead');

      titleLines.forEach((title: any) => {
        const tr = document.createElement('tr');
        tr.style.borderWidth = '0';

        const th = document.createElement('th');
        th.style.borderWidth = '0';
        th.style.fontSize = '16px';
        th.style.fontWeight = '600';
        th.style.textAlign = 'left';
        th.style.padding = '16px 16px 8px 16px';

        const titleText = document.createElement('span');
        titleText.style.color = '#121417';
        titleText.style.marginRight = '8px';
        titleText.textContent = title;

        // FormattedValue 스타일
        const valueText = document.createElement('span');
        valueText.style.fontSize = '16px';
        valueText.style.color = color;
        valueText.textContent = formattedValue.toString();

        th.appendChild(titleText);
        th.appendChild(valueText);
        tr.appendChild(th);
        tableHead.appendChild(tr);
      });

      const tableBody = document.createElement('tbody');
      extractedData.forEach((body: any, i: number) => {
        const span = document.createElement('span');
        span.style.borderWidth = '1px';
        span.style.borderRadius = '4px';
        span.style.border = '1px solid #E0E0E0';
        span.style.height = '12px';
        span.style.width = '12px';
        span.style.marginRight = '6px';
        span.style.display = 'inline-block';

        switch (body) {
          case '학생점수':
            span.style.background = 'linear-gradient(to right, #FF803D, #FFBC99)';
            break;
          case '과목평균':
            span.style.background = 'linear-gradient(to right, #6E83A3, #A4C0CF)';
            break;
          default:
            span.style.background = 'linear-gradient(to right, #CCCCCC, #EEEEEE)';
        }

        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';
        tr.style.borderWidth = '0';

        const td = document.createElement('td');
        td.style.borderWidth = '0';
        td.style.fontSize = '12px';
        td.style.fontFamily = 'Pretendard';
        td.style.padding = '0 16px 16px 16px';
        td.style.color = '#121417';
        td.style.fontWeight = '500';
        td.style.textAlign = 'left';
        td.style.display = 'flex';
        td.style.alignItems = 'center';
        const text = document.createTextNode(body);

        td.appendChild(span);
        td.appendChild(text);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });

      const tableRoot = tooltipEl.querySelector('table');

      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove();
      }

      tableRoot.appendChild(tableHead);
      tableRoot.appendChild(tableBody);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;
    const chartWidth = chart.width;
    const chartHeight = chart.height;

    let left = positionX + tooltip.caretX;
    let top = positionY + tooltip.caretY;

    // 화면의 오른쪽을 넘어가는 경우
    if (left + tooltipWidth > chartWidth) {
      left = chartWidth - tooltipWidth + 60; // 10px 여유를 두고 조정
    }

    // 화면의 아래쪽을 넘어가는 경우
    if (top + tooltipHeight > chartHeight) {
      top = chartHeight - tooltipHeight + 60; // 10px 여유를 두고 조정
    }

    // 화면의 왼쪽을 넘어가는 경우
    if (left < 0) {
      left = 4; // 10px 여유를 두고 조정
    }

    // 화면의 위쪽을 넘어가는 경우
    if (top < 0) {
      top = 10; // 10px 여유를 두고 조정
    }

    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  };

  const options = useMemo(
    () => ({
      spanGaps: false,
      responsive: true,
      maintainAspectRatio: false,
      events: chartEvents,
      interaction: {
        mode: 'nearest' as const,
        // axis: 'xy' as const,
        intersect: false,
      },
      onHover: (_: any, elements: any) => {
        const chart = chartRef.current;
        if (!chart) return; // chartRef가 null인지 확인

        if (elements && elements.length > 0) {
          const datasetIndex = elements[0].datasetIndex;
          const datasets = [...chart.data.datasets];
          const datasetToMove = datasets[datasetIndex];
          datasets.splice(datasetIndex, 1);
          datasets.unshift(datasetToMove);

          chart.data.datasets = datasets;
          chart.update();
        }
      },
      hover: {
        mode: 'dataset' as const,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          position: 'nearest' as const,
          external: externalTooltipHandler,
        },
      },
      scales: {
        r: {
          type: 'radialLinear' as const,
          min: 0,
          max: 100,
          reverse: false,
          ticks: {
            stepSize: 20,
            font: {
              size: 10,
              weight: 500,
              family: 'Pretendard',
              lineHeight: '12px',
            },
            color: '#C7CBD1',
          },
          pointLabels: {
            font: {
              size: 13,
              weight: 400,
              family: 'Pretendard',
              lineHeight: '18px',
            },
            color: '#121417',
          },
          grid: {
            color: 'rgba(232, 234, 237, 1)', // 그리드 라인 색상
            lineWidth: 1, // 그리드 라인 두께
            circular: true, // 원형 그리드
          },
          border: {
            display: true, // 이전의 drawBorder
            width: 1, // 이전의 borderWidth
            color: 'rgba(232, 234, 237, 1)', // 이전의 borderColor
            dash: [], // 이전의 borderDash
            dashOffset: 0, // 이전의 borderDashOffset
          },
          angleLines: {
            display: true, // 각 레이블에서 중앙으로 선을 그리기
            color: '#E8EAED', // 선 색상
            lineWidth: 1, // 선 두께
          },
        },
      },
    }),
    [],
  );

  useEffect(() => {
    if (data) {
      const chartInstance = chartRef.current;
      if (chartInstance) {
        const ctx = chartInstance.ctx;

        const hexToRGBA = (hex: string, opacity: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        };

        const getGradient = (ctx: any, chartArea: any, colorStart: string, colorEnd: string, opacity: number) => {
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, hexToRGBA(colorStart, opacity));
          gradient.addColorStop(1, hexToRGBA(colorEnd, opacity));
          return gradient;
        };

        // "구분" 값에 따른 색상 매핑
        const colorMap = {
          학생점수: getGradient(ctx, chartInstance.chartArea, '#FF803D', '#FFBC99', 0.6),
          과목평균: getGradient(ctx, chartInstance.chartArea, '#6E83A3', '#A4C0CF', 0.6),
        };

        const datasets = [
          {
            label: '학생점수',
            data: data?.map((score: any) => score.score),
            borderWidth: 0,
            backgroundColor: colorMap['학생점수'],
            hoverBackgroundColor: getGradient(ctx, chartInstance.chartArea, '#FF803D', '#FFBC99', 1),
            pointRadius: 0,
            hoverRadius: 0,
          },
          {
            label: '과목평균',
            data: data?.map((score: any) => score.score_mean),
            backgroundColor: colorMap['과목평균'],
            hoverBackgroundColor: getGradient(ctx, chartInstance.chartArea, '#6E83A3', '#A4C0CF', 1),
            pointRadius: 0,
            borderWidth: 0,
            hoverRadius: 0,
          },
        ];
        setChartData({
          labels: data?.map((score: any) => score.subject_name),
          datasets: datasets,
        });
      }
    }
  }, [data]);

  return (
    <div className="flex w-[480px] flex-col items-center gap-6 py-2">
      <div className="h-[432px] w-[480px]">
        <Chart type="radar" options={options} datasetIdKey="id" data={chartData} ref={chartRef} />
      </div>
      <div className="flex w-fit items-center justify-center gap-4 rounded-lg bg-primary-gray-100 px-5 py-2">
        <div className="flex cursor-pointer flex-row items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] border-dim-8 bg-gradient-orange-400" />
          <Typography variant="caption2" className="font-medium">
            학생점수
          </Typography>
        </div>
        <div className="flex cursor-pointer flex-row items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] border-dim-8 bg-gradient-navy-400" />
          <Typography variant="caption2" className="font-medium">
            과목평균
          </Typography>
        </div>
      </div>
    </div>
  );
};
