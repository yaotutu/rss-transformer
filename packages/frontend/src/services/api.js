// src/services/api.js

import { request } from './request';

const appController = {
  getHello: () => request('/', 'GET'),
};

const rssController = {
  createRss: (data) => request('/rss', 'POST', data),
  findAllRss: () => request('/rss', 'GET'),
  deleteRss: (ids) => request(`/rss?ids=${ids.join(',')}`, 'DELETE'), // 修改为使用查询字符串
  findOneRss: (id) => request(`/rss/${id}`, 'GET'),
  updateRss: (id) => request(`/rss/update/${id}`, 'GET'),
};

const taskController = {
  createTask: (data) => request('/task', 'POST', data),
  updateTask: (id, data) => request(`/task/${id}`, 'PUT', data),
  getAllTask: () => request('/task', 'GET'),
  sayTaskHello: () => request('/task/hello', 'POST'),
};

const transformedController = {
  gettransformedHello: () => request('/transformed', 'GET'),
  gettransformedById: (id) => request(`/transformed/${id}`, 'GET'),
};

export {
  appController,
  rssController,
  taskController,
  transformedController,
};
