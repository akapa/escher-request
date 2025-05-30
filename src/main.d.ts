import { AxiosRequestConfig, AxiosResponse } from "axios";

export function request(config: EscherRequestConfig): Promise<EscherRequestResponse>;

export function get(url: string, config: EscherRequestConfig): Promise<EscherRequestResponse>;
export function post(url: string, data: any, config: EscherRequestConfig): Promise<EscherRequestResponse>;
export function put(url: string, data: any, config: EscherRequestConfig): Promise<EscherRequestResponse>;
declare function _delete(url: string, config: EscherRequestConfig): Promise<EscherRequestResponse>;
export { _delete as delete }
export function patch(url: string, data: any, config: EscherRequestConfig): Promise<EscherRequestResponse>;
export function options(url: string, config: EscherRequestConfig): Promise<EscherRequestResponse>;
export function head(url: string, config: EscherRequestConfig): Promise<EscherRequestResponse>;

export function preSignUrl(
  url: string,
  config: {
    expires?: number,
    escherKeyId?: string | null
  }
): string;

export function authenticate(
  credentialScope: string,
  config: {
    method: string,
    url: string,
    headers: { [key: string]: string },
    body: string
  }
): EscherRequestAuthenticateResponse;

export function getServiceUrlForEscherKeyId(escherKeyId: string): string;

export interface EscherRequestConfig extends AxiosRequestConfig {
  escherKeyId?: string
  escherCredentialScope?: string
  escherSecret?: string
}

export type EscherRequestResponse = Omit<AxiosResponse, 'request'>;

export type EscherRequestAuthenticateResponse = {
  authenticated: boolean
  accessKeyId?: string
  message?: string
};
