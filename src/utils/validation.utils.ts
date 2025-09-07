// Validation Utilities

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateRequired(value: unknown): boolean {
  return value !== null && value !== undefined && value !== ''
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength
}

export function validateRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating)
}

export function validateTrustScore(score: number): boolean {
  return score >= 0 && score <= 100
}

export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export function validateToolSubmission(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!validateRequired(data.name)) {
    errors.push('Tool name is required')
  }

  if (!validateRequired(data.description)) {
    errors.push('Description is required')
  }

  if (!validateRequired(data.url)) {
    errors.push('URL is required')
  } else if (!validateUrl(data.url as string)) {
    errors.push('Invalid URL format')
  }

  if (!validateRequired(data.category_id)) {
    errors.push('Category is required')
  }

  if (!validateRequired(data.pricing_model)) {
    errors.push('Pricing model is required')
  }

  if (!Array.isArray(data.features) || data.features.length === 0) {
    errors.push('At least one feature is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateReview(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!validateRequired(data.tool_id)) {
    errors.push('Tool ID is required')
  }

  if (!validateRequired(data.title)) {
    errors.push('Review title is required')
  }

  if (!validateRequired(data.content)) {
    errors.push('Review content is required')
  }

  if (!validateRating(data.rating as number)) {
    errors.push('Rating must be between 1 and 5')
  }

  if (!validateRequired(data.verdict)) {
    errors.push('Verdict is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
