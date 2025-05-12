import { useIdleTimer } from 'react-idle-timer';

export function useLogoutOnIdle(logoutFn: () => void, isStop: boolean, timeoutMinute = 30000) {
  const onIdle = () => {
    if (!isStop) {
      logoutFn();
    }
  };

  useIdleTimer({
    timeout: timeoutMinute * 60 * 1000,
    onIdle,
    debounce: 500,
  });
}
