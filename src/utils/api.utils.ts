// API Utilities

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

export async function apiPost<T>(
  url: string,
  data: unknown,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  })
}

export async function apiGet<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'GET',
    ...options,
  })
}

export async function apiPut<T>(
  url: string,
  data: unknown,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  })
}

export async function apiDelete<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'DELETE',
    ...options,
  })
}

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

export function buildApiUrl(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, unknown>
): string {
  const url = `${baseUrl}${endpoint}`
  
  if (params) {
    const queryString = buildQueryString(params)
    return queryString ? `${url}?${queryString}` : url
  }
  
  return url
}

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred'
}

export function createApiResponse<T>(
  data: T,
  success: boolean = true,
  message?: string
) {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
}

export function createApiError(
  message: string,
  code?: string,
  details?: unknown
) {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  }
}
