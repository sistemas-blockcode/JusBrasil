// types/global.d.ts

interface CaptchaParams {
    sitekey: string;
    cData: string;
    chlPageData: string;
    action: string;
    callback: (token: string) => void;
    userAgent?: string;
  }
  
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          cData: string;
          chlPageData: string;
          action: string;
          callback: (token: string) => void;
        }
      ) => string;
    };
    captchaParams?: CaptchaParams;
    tsCallback?: (token: string) => void;
  }
  