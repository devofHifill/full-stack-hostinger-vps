export function buildApiUrl(endpoint) {
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
}

// export async function apiFetch(
//   endpoint,
//   { method = "GET", token, headers = {}, body } = {}
// ) {
//   const response = await fetch(buildApiUrl(endpoint), {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...headers,
//     },
//     ...(body !== undefined
//       ? { body: typeof body === "string" ? body : JSON.stringify(body) }
//       : {}),
//   });

//   return response;
// }

export async function apiFetch(
  endpoint,
  { method = "GET", token, headers = {}, body } = {}
) {
  const isFormData = body instanceof FormData;

  const response = await fetch(buildApiUrl(endpoint), {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined
      ? {
          body: isFormData
            ? body
            : typeof body === "string"
            ? body
            : JSON.stringify(body),
        }
      : {}),
  });

  return response;
}

export async function apiFetchJson(endpoint, options = {}) {
  const response = await apiFetch(endpoint, options);

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}