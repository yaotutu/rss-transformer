import { ElMessage } from 'element-plus';

const BASE_URL = 'http://127.0.0.1:3000';

export const request = async (
  endpoint,
  method = 'GET',
  body = null,
  customHeaders = {},
) => {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (response.ok) {
      const responseData = await response.json();
      if (responseData.statusCode === 200) {
        return responseData.data;
      } else {
        ElMessage.error(`Error ${response.status}: ${errorMessage}`);
      }
    } else {
      const errorData = await response.json();
      const errorMessage = errorData.message || response.statusText;
      ElMessage.error(`Error ${response.status}: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    ElMessage.error('Network error, please try again later.');
    throw error;
  }
};
