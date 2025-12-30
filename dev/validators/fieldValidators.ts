import type { GroupField, TextField, Validate, ValidateOptions } from 'payload'

/**
 * Creates a max length validator for text fields.
 * @param max Maximum allowed characters
 * @returns Payload validate function
 */
export const maxLengthValidator = (
  max: number,
): Validate<null | string | undefined, unknown, unknown, TextField> => {
  return (value: null | string | undefined): string | true => {
    if (!value) {return true}
    if (value.length > max) {
      return `Maximum ${max} characters allowed. Current: ${value.length}`
    }
    return true
  }
}

/**
 * URL validator for optional text fields.
 * Only validates if value is present.
 * Accepts valid URLs starting with http://, https://, or /
 */
export const urlValidator: Validate<null | string | undefined, unknown, unknown, TextField> = (
  value: null | string | undefined,
): string | true => {
  if (!value) {return true}

  // Allow relative URLs starting with /
  if (value.startsWith('/')) {return true}

  // Validate absolute URLs
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'URL must start with http://, https://, or /'
    }
    return true
  } catch {
    return 'Invalid URL format. Must be a valid URL (http://, https://) or relative path (/)'
  }
}

/**
 * CTA completeness validator for the CTA group field.
 * Ensures both ctaText and ctaLink are set together, or neither is set.
 */
export const ctaValidator: Validate<
  { ctaLink?: null | string; ctaText?: null | string },
  unknown,
  unknown,
  GroupField
> = (
  value: { ctaLink?: null | string; ctaText?: null | string } | null | undefined,
  _options: ValidateOptions<
    { ctaLink?: null | string; ctaText?: null | string },
    unknown,
    unknown,
    GroupField
  >,
): string | true => {
  if (!value) {return true}

  const hasText = value.ctaText && value.ctaText.trim().length > 0
  const hasLink = value.ctaLink && value.ctaLink.trim().length > 0

  if (hasText && !hasLink) {
    return 'CTA link is required when CTA text is provided'
  }

  if (hasLink && !hasText) {
    return 'CTA text is required when CTA link is provided'
  }

  return true
}
