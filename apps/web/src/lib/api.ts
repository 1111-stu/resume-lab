const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const runtimeBaseUrl = window.__RESUMELAB_RUNTIME_CONFIG__?.VITE_API_BASE_URL;
    if (runtimeBaseUrl) {
      return trimTrailingSlash(runtimeBaseUrl);
    }
  }

  const buildTimeBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return buildTimeBaseUrl ? trimTrailingSlash(buildTimeBaseUrl) : "";
};

export const apiUrl = (path: string) => {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return path;
  return `${apiBaseUrl}${path}`;
};
