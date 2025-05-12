export const splitStringByUnicode = (str: string, chunkSize: number) => {
  const chunks: string[] = [];
  let index = 0;

  const unicodeStr = str.replace(
    /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7A3\uD7B0-\uD7FF]|./g,
    (match) => {
      // 한글 문자에 ^를 추가하는 로직
      if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7A3\uD7B0-\uD7FF]/.test(match)) {
        return '^' + match;
      } else {
        return match;
      }
    },
  );

  while (index < unicodeStr.length) {
    const chunk = unicodeStr.substring(index, index + chunkSize * 2);

    chunks.push(chunk.replace(/\^/g, ''));
    index += chunk.length;
  }

  return chunks;
};
