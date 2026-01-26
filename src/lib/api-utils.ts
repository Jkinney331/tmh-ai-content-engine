import { NextResponse } from 'next/server'

// Standard API response types
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// Create standard success response
export function successResponse<T>(data: T, message?: string, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true as const,
    data,
    ...(message && { message })
  }, { status })
}

// Create standard error response
export function errorResponse(
  error: string,
  status = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error
  }
  if (code) response.code = code
  if (details !== undefined) response.details = details

  return NextResponse.json(response, { status })
}

// Common error responses
export const notFound = (resource = 'Resource') =>
  errorResponse(`${resource} not found`, 404, 'NOT_FOUND')

export const badRequest = (message = 'Invalid request') =>
  errorResponse(message, 400, 'BAD_REQUEST')

export const unauthorized = (message = 'Unauthorized') =>
  errorResponse(message, 401, 'UNAUTHORIZED')

export const forbidden = (message = 'Forbidden') =>
  errorResponse(message, 403, 'FORBIDDEN')

export const serverError = (message = 'Internal server error', details?: unknown) =>
  errorResponse(message, 500, 'SERVER_ERROR', details)

export const serviceUnavailable = (message = 'Service unavailable') =>
  errorResponse(message, 503, 'SERVICE_UNAVAILABLE')

// Validation helper
export function validateRequired(
  body: Record<string, unknown>,
  fields: string[]
): { valid: true } | { valid: false; missing: string[] } {
  const missing = fields.filter(field =>
    body[field] === undefined || body[field] === null || body[field] === ''
  )

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return { valid: true }
}

// Parse request body safely
export async function parseBody<T = Record<string, unknown>>(
  request: Request
): Promise<{ data: T } | { error: string }> {
  try {
    const data = await request.json() as T
    return { data }
  } catch {
    return { error: 'Invalid JSON body' }
  }
}

// Wrap async route handlers with error handling
export function withErrorHandling<T>(
  handler: (request: Request, context?: unknown) => Promise<NextResponse<T>>
) {
  return async (request: Request, context?: unknown): Promise<NextResponse<T | ApiErrorResponse>> => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof Error) {
        return serverError(error.message) as NextResponse<ApiErrorResponse>
      }

      return serverError() as NextResponse<ApiErrorResponse>
    }
  }
}
