import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Breaktool'
    const description = searchParams.get('description') || 'Trusted SaaS Reviews by Verified Experts'
    const score = searchParams.get('score')
    const logo = searchParams.get('logo')

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
            backgroundImage: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginRight: '20px',
              }}
            >
              Breaktool
            </div>
            {logo && (
              <img
                src={logo}
                alt="Tool Logo"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                }}
              />
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              maxWidth: '900px',
              marginBottom: '20px',
              lineHeight: '1.2',
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '800px',
              marginBottom: '30px',
              lineHeight: '1.4',
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
                backgroundColor: '#1f2937',
                padding: '12px 24px',
                borderRadius: '12px',
                border: '2px solid #3b82f6',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  marginRight: '8px',
                }}
              >
                {score}/10
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#ffffff',
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
              color: '#6b7280',
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
