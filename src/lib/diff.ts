export interface DiffChunk {
  type: "equal" | "added" | "removed";
  value: string;
}

function tokenize(text: string) {
  return text.match(/\s+|[^\s]+/g) ?? [];
}

export function diffText(source: string, target: string): DiffChunk[] {
  const left = tokenize(source);
  const right = tokenize(target);
  const dp = Array.from({ length: left.length + 1 }, () =>
    Array<number>(right.length + 1).fill(0),
  );

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      if (left[i] === right[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const chunks: DiffChunk[] = [];

  function pushChunk(type: DiffChunk["type"], value: string) {
    const previous = chunks[chunks.length - 1];
    if (previous && previous.type === type) {
      previous.value += value;
      return;
    }
    chunks.push({ type, value });
  }

  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      pushChunk("equal", left[i]);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      pushChunk("removed", left[i]);
      i += 1;
    } else {
      pushChunk("added", right[j]);
      j += 1;
    }
  }

  while (i < left.length) {
    pushChunk("removed", left[i]);
    i += 1;
  }

  while (j < right.length) {
    pushChunk("added", right[j]);
    j += 1;
  }

  return chunks;
}
