import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.DOWNLOAD_JWT_SECRET || 'fallback-secret-key'
const TOKEN_EXPIRY_MINUTES = parseInt(process.env.DOWNLOAD_TOKEN_EXPIRY_MINUTES || '15')

export interface DownloadTokenPayload {
  userId: string
  productId: string
  subscriptionId: string
  iat?: number
  exp?: number
}

/**
 * Generate a download token that expires after specified time
 */
export function generateDownloadToken(payload: {
  userId: string
  productId: string
  subscriptionId: string
}): string {
  const tokenPayload: DownloadTokenPayload = {
    userId: payload.userId,
    productId: payload.productId,
    subscriptionId: payload.subscriptionId,
  }

  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: `${TOKEN_EXPIRY_MINUTES}m`,
    issuer: 'ebook-store',
    audience: 'download-service'
  })
}

/**
 * Verify and decode a download token
 */
export function verifyDownloadToken(token: string): DownloadTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ebook-store',
      audience: 'download-service'
    }) as DownloadTokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Download link has expired. Please request a new download.')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid download link.')
    } else {
      throw new Error('Failed to verify download token.')
    }
  }
}

/**
 * Check if token is about to expire (within 2 minutes)
 */
export function isTokenNearExpiry(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as DownloadTokenPayload
    if (!decoded.exp) return true
    
    const expirationTime = decoded.exp * 1000 // Convert to milliseconds
    const twoMinutesFromNow = Date.now() + (2 * 60 * 1000)
    
    return expirationTime <= twoMinutesFromNow
  } catch {
    return true
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpirationTime(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as DownloadTokenPayload
    if (!decoded.exp) return null
    
    return new Date(decoded.exp * 1000)
  } catch {
    return null
  }
}

/**
 * Get minutes until token expires
 */
export function getMinutesUntilExpiry(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as DownloadTokenPayload
    if (!decoded.exp) return null
    
    const expirationTime = decoded.exp * 1000
    const now = Date.now()
    const millisecondsUntilExpiry = expirationTime - now
    
    return Math.max(0, Math.ceil(millisecondsUntilExpiry / (1000 * 60)))
  } catch {
    return null
  }
}