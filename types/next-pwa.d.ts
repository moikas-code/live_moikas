declare module 'next-pwa' {
  const with_pwa: (config: unknown) => (next_config: unknown) => unknown;
  export default with_pwa;
} 