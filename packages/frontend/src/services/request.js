import { ElMessage } from 'element-plus';

const BASE_URL = 'http://127.0.0.1:3000';

/**
 * Makes an HTTP request to the specified endpoint.
 *
 * @param {string} endpoint - The endpoint to send the request to.
 * @param {string} [method='GET'] - The HTTP method to use for the request.
 * @param {Object|null} [body=null] - The request body.
 * @param {Object} [customHeaders={}] - Additional headers to include in the request.
 * @returns {Promise<any>} - A promise that resolves to the response data.
 * @throws {Error} - If there is a network error or the response status is not OK.
 */
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
