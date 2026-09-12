const API_BASE_URL = "/api";

export async function apiRequest(
  endpoint,
  options = {}
) {
  const {
    method = "GET",
    body,
    headers = {},
    ...rest
  } = options;

  const requestHeaders = {
    ...headers
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      credentials: "include",
      headers: requestHeaders,
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
      ...rest
    }
  );

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(
      payload?.message ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.payload = payload;

    throw error;
  }

  return payload;
}