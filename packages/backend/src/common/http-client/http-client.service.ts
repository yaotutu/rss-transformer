import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
  constructor(private httpService: HttpService) {}

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    config: AxiosRequestConfig = {},
    data?: any,
  ): Promise<T> {
    try {
      let response: AxiosResponse<T>;

      switch (method) {
        case 'get':
          response = await firstValueFrom(this.httpService.get<T>(url, config));
          break;
        case 'post':
          response = await firstValueFrom(
            this.httpService.post<T>(url, data, config),
          );
          break;
        case 'put':
          response = await firstValueFrom(
            this.httpService.put<T>(url, data, config),
          );
          break;
        case 'delete':
          response = await firstValueFrom(
            this.httpService.delete<T>(url, config),
          );
          break;
      }

      return response.data;
    } catch (error) {
      console.error(`Error ${method}ing ${url}:`, error);
      throw error;
    }
  }

  async get<T>(
    url: string,
    useProxy: boolean = false,
    params?: any,
  ): Promise<T> {
    const config: AxiosRequestConfig = { params };
    if (useProxy) {
      config.proxy = {
        host: '127.0.0.1',
        port: 7890,
        protocol: 'http',
      };
    }
    return this.request<T>('get', url, config);
  }

  async post<T>(url: string, data: any, useProxy: boolean = false): Promise<T> {
    const config: AxiosRequestConfig = {};
    if (useProxy) {
      config.proxy = {
        host: '127.0.0.1',
        port: 7890,
        protocol: 'http',
      };
    }
    return this.request<T>('post', url, config, data);
  }

  async put<T>(url: string, data: any, useProxy: boolean = false): Promise<T> {
    const config: AxiosRequestConfig = {};
    if (useProxy) {
      config.proxy = {
        host: '127.0.0.1',
        port: 7890,
        protocol: 'http',
      };
    }
    return this.request<T>('put', url, config, data);
  }

  async delete<T>(url: string, useProxy: boolean = false): Promise<T> {
    const config: AxiosRequestConfig = {};
    if (useProxy) {
      config.proxy = {
        host: '127.0.0.1',
        port: 7890,
        protocol: 'http',
      };
    }
    return this.request<T>('delete', url, config);
  }
}
