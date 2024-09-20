export const isDev = import.meta.env.DEV;

/**
 * Testing mode, for show json data in html page and CORS api requests
 */
export const isTesting = isDev || !!import.meta.env.VITE_TEST;

/**
 * App URL, for Cloudflare Pages and local development
 */
export const appUrl: string | undefined = import.meta.env.VITE_APP_URL;

/**
 * Backend API URL
 */
export const apiUrl: string = import.meta.env.VITE_API_URL ?? "";

export const orientation = screen.orientation.type;

export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION || "0.0.0";
