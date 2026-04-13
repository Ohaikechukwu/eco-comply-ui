import "axios";

declare module "axios" {
  export interface AxiosRequestConfig<D = any> {
    skipAuthRefresh?: boolean;
    skipAuthRedirect?: boolean;
    _retry?: boolean;
  }
}
