// src/services/api.js

import { request } from './request';

const appController = {
  getHello: () => request('/', 'GET'),
};

const rssController = {
  createRss: (data) => request('/rss', 'POST', data),
  findAllRss: () => request('/rss', 'GET'),
  findOneRss: (id) => request(`/rss/${id}`, 'GET'),
  updateRss: (id) => request(`/rss/update/${id}`, 'GET'),
};

const taskController = {
  createTask: (data) => request('/task', 'POST', data),
  getTaskHello: () => request('/task', 'GET'),
  sayTaskHello: () => request('/task/hello', 'POST'),
};

const transformeredController = {
  getTransformeredHello: () => request('/transformered', 'GET'),
  getTransformeredById: (id) => request(`/transformered/${id}`, 'GET'),
};

export {
  appController,
  rssController,
  taskController,
  transformeredController,
};
