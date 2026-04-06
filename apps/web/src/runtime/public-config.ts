const getPublicRuntimeConfig = () => ({
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || ""
});

export const getPublicRuntimeConfigScript = () => {
  const payload = JSON.stringify(getPublicRuntimeConfig()).replace(/</g, "\\u003c");
  return `window.__RESUMELAB_RUNTIME_CONFIG__ = ${payload};`;
};
