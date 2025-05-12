import { useRef, useEffect, useState } from 'react';

interface UsePollingProps<T> {
  enabled: boolean;
  pollingInterval?: number;
  maxPollingCount?: number;
  fetchFn: () => Promise<{ data?: T }>;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  isComplete?: (data: T) => boolean;
}

export function usePolling<T>({
  enabled,
  pollingInterval = 5000,
  maxPollingCount = 10,
  fetchFn,
  onSuccess,
  onError,
  isComplete,
}: UsePollingProps<T>) {
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef(0);

  // 폴링 시작 함수
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsLoading(true);
    setIsPolling(true);
    pollingCountRef.current = 0;

    // 단일 폴링 실행 함수
    const executeSinglePoll = async () => {
      try {
        if (pollingCountRef.current >= maxPollingCount) {
          // 폴링 최대 횟수 초과 시 중단
          // console.log(`최대 폴링 횟수(${maxPollingCount}) 도달, 폴링 중단`);
          stopPolling();
          setIsLoading(false);
          return;
        }

        // console.log(`폴링 진행 중... (${pollingCountRef.current + 1}/${maxPollingCount})`);
        pollingCountRef.current++;

        const response = await fetchFn();

        if (!response || !response.data) {
          throw new Error('응답 데이터가 없습니다');
        }

        const responseData = response.data as T;
        setData(responseData);

        if (isComplete && isComplete(responseData)) {
          // console.log('폴링 완료 조건 충족:', responseData);
          onSuccess?.(responseData);
          stopPolling();
          setIsLoading(false);
          return;
        }

        // 폴링 조건이 충족되지 않았으면 다음 폴링을 예약
        pollingIntervalRef.current = setTimeout(executeSinglePoll, pollingInterval);
      } catch (error) {
        console.error('폴링 중 오류 발생:', error);
        onError?.(error);
        // 에러 발생 시 폴링 중단
        stopPolling();
        setIsLoading(false);
      }
    };

    // 첫 번째 폴링 즉시 실행
    executeSinglePoll();
  };

  // 폴링 중지 함수
  const stopPolling = () => {
    // console.log('폴링 중지 함수 호출됨');
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    setIsLoading(false);
  };

  // enabled가 true일 때 폴링 시작
  useEffect(() => {
    if (enabled && !pollingIntervalRef.current) {
      startPolling();
    }
    return () => {
      stopPolling();
    };
  }, [enabled]);

  return {
    isPolling,
    isLoading,
    data,
    startPolling,
    stopPolling,
    pollingCount: pollingCountRef.current,
  };
}
