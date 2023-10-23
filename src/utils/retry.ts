type Retry = {
  retries: number;
};

export const retry = async <T>(fn: () => Promise<T> | T, { retries }: Retry): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    return retry(fn, { retries: retries - 1 });
  }
};
