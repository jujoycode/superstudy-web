import { useState } from 'react';

export function useURLManager(initialURLs: string[] = []) {
  const [urlList, setUrlList] = useState<string[]>(initialURLs);

  const addURL = (url: string) => {
    if (urlList.includes(url)) {
      alert('이미 추가된 URL입니다.');
      return;
    }
    setUrlList([...urlList, url]);
  };

  const removeURL = (url: string) => {
    setUrlList(urlList.filter((item) => item !== url));
  };

  const resetURLs = () => {
    setUrlList([]);
  };

  return {
    urlList,
    addURL,
    removeURL,
    resetURLs,
  };
}
