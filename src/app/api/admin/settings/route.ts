import { NextResponse } from 'next/server';

// Default settings
const DEFAULT_SETTINGS = {
  platformName: 'BreakTool',
  contactEmail: 'admin@breaktool.com',
  maxFileSize: 10,
  requireEmailVerification: true,
  autoApproveVerifiedTesters: false,
  minTrustScore: 50,
  autoModerateReviews: true,
  requireAdminApprovalForTools: true,
  moderationDelay: 24,
  notifyNewUsers: true,
  notifyPendingVerifications: true,
  notifyToolSubmissions: true
};

export async function GET() {
  try {
    // For now, return default settings
    // In a real application, you would store these in a database table
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json();
    
    // Validate settings
    const validatedSettings = {
      platformName: settings.platformName || DEFAULT_SETTINGS.platformName,
      contactEmail: settings.contactEmail || DEFAULT_SETTINGS.contactEmail,
      maxFileSize: Math.max(1, Math.min(100, settings.maxFileSize || DEFAULT_SETTINGS.maxFileSize)),
      requireEmailVerification: Boolean(settings.requireEmailVerification),
      autoApproveVerifiedTesters: Boolean(settings.autoApproveVerifiedTesters),
      minTrustScore: Math.max(0, Math.min(100, settings.minTrustScore || DEFAULT_SETTINGS.minTrustScore)),
      autoModerateReviews: Boolean(settings.autoModerateReviews),
      requireAdminApprovalForTools: Boolean(settings.requireAdminApprovalForTools),
      moderationDelay: Math.max(1, Math.min(168, settings.moderationDelay || DEFAULT_SETTINGS.moderationDelay)),
      notifyNewUsers: Boolean(settings.notifyNewUsers),
      notifyPendingVerifications: Boolean(settings.notifyPendingVerifications),
      notifyToolSubmissions: Boolean(settings.notifyToolSubmissions)
    };

    // In a real application, you would save these to a database table
    // For now, we'll just return the validated settings
    console.log('Settings updated:', validatedSettings);

    return NextResponse.json({
      message: 'Settings saved successfully',
      settings: validatedSettings
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
