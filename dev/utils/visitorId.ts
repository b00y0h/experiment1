import { nanoid } from 'nanoid'

/**
 * Cookie name for visitor identification.
 */
export const VISITOR_COOKIE_NAME = 'visitor_id'

/**
 * Cookie max age in seconds (365 days).
 */
export const VISITOR_COOKIE_MAX_AGE = 31536000

/**
 * Result from getOrCreateVisitorId function.
 */
export type VisitorIdResult = {
  /** Whether this is a newly generated visitor ID */
  isNew: boolean
  /** The visitor ID (existing or newly generated) */
  visitorId: string
}

/**
 * A minimal cookies interface that matches both Next.js Request cookies
 * and other cookie implementations.
 */
export type CookiesLike = {
  get: (name: string) => { value: string } | string | undefined
}

/**
 * Gets an existing visitor ID from cookies or creates a new one.
 *
 * This utility is pure and testable - it does NOT set cookies.
 * Cookie setting is the caller's responsibility as it differs
 * between API routes and server components.
 *
 * @param cookies - A cookies object with a get method (e.g., from Next.js Request)
 * @returns Object with visitorId and isNew flag indicating if a new ID was generated
 *
 * @example
 * // In an API route
 * const { visitorId, isNew } = getOrCreateVisitorId(request.cookies)
 * if (isNew) {
 *   response.cookies.set(VISITOR_COOKIE_NAME, visitorId, { maxAge: VISITOR_COOKIE_MAX_AGE })
 * }
 *
 * @example
 * // In a server component
 * import { cookies } from 'next/headers'
 * const { visitorId, isNew } = getOrCreateVisitorId(await cookies())
 */
export function getOrCreateVisitorId(cookies: CookiesLike): VisitorIdResult {
  const existingCookie = cookies.get(VISITOR_COOKIE_NAME)

  // Handle different cookie value formats
  let existingValue: string | undefined
  if (existingCookie) {
    if (typeof existingCookie === 'string') {
      existingValue = existingCookie
    } else if (typeof existingCookie === 'object' && 'value' in existingCookie) {
      existingValue = existingCookie.value
    }
  }

  if (existingValue) {
    return {
      isNew: false,
      visitorId: existingValue,
    }
  }

  // Generate new visitor ID using nanoid(21) - URL-safe, 21 chars is standard length
  const visitorId = nanoid(21)

  return {
    isNew: true,
    visitorId,
  }
}
