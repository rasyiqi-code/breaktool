import Image from 'next/image'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    canvas.width = w
    canvas.height = h
    
    // Create a simple gradient blur
    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
    
    return canvas.toDataURL()
  }

  const defaultBlurDataURL = blurDataURL || (width && height ? generateBlurDataURL(width, height) : '')

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={fill ? {} : { width, height }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-xs">Image failed to load</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
          style={fill ? {} : { width, height }}
        >
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}

// Specialized components for different use cases
export function ToolLogo({ 
  src, 
  name, 
  size = 64, 
  className 
}: { 
  src?: string
  name: string
  size?: number
  className?: string 
}) {
  if (!src) {
    return (
      <div 
        className={cn(
          'bg-primary/10 flex items-center justify-center rounded-lg shrink-0',
          className
        )}
        style={{ width: size, height: size }}
      >
        <span className="text-lg font-bold text-primary">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={cn('rounded-lg object-cover shrink-0', className)}
      quality={90}
      sizes={`${size}px`}
    />
  )
}

export function HeroImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string
  alt: string
  className?: string 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      priority
      quality={95}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

export function ThumbnailImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string
  alt: string
  className?: string 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={300}
      height={200}
      className={cn('object-cover rounded-lg', className)}
      quality={80}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
