import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Edge runtime is required for OG image generation
// This will show a warning about static generation being disabled, which is expected
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = false

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Breaktool'
    const description = searchParams.get('description') || 'Trusted SaaS Reviews by Verified Experts'
    const score = searchParams.get('score')
    const logo = searchParams.get('logo')
    const type = searchParams.get('type') || 'default'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: type === 'tool' 
              ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
            }}
          />
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginRight: logo ? '20px' : '0',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              Breaktool
            </div>
            {logo && (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundImage: `url(${logo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              />
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 30 ? '42px' : '48px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              maxWidth: '900px',
              marginBottom: '20px',
              lineHeight: '1.2',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '24px',
              color: '#e2e8f0',
              textAlign: 'center',
              maxWidth: '800px',
              marginBottom: '30px',
              lineHeight: '1.4',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {description}
          </div>

          {/* Score Badge */}
          {score && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                padding: '16px 32px',
                borderRadius: '16px',
                border: '2px solid #3b82f6',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  marginRight: '12px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {score}/10
              </div>
              <div
                style={{
                  fontSize: '18px',
                  color: '#ffffff',
                  fontWeight: '600',
                }}
              >
                Expert Rating
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '18px',
              color: '#94a3b8',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              zIndex: 1,
            }}
          >
            Trusted SaaS Reviews by Verified Experts
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
