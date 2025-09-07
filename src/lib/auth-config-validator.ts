// Stack Auth Configuration Validator

export function validateStackAuthConfig() {
  // Only validate client-side environment variables
  const requiredEnvVars = {
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
  };
  
  // Server-side variables (only check if running on server)
  const serverEnvVars = typeof window === 'undefined' ? {
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
    STACK_WEBHOOK_SECRET: process.env.STACK_WEBHOOK_SECRET
  } : {};

  const missingVars: string[] = [];
  const invalidVars: string[] = [];
  
  // Combine client and server variables
  const allEnvVars = { ...requiredEnvVars, ...serverEnvVars };

  Object.entries(allEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    } else {
      // Validate format
      if (key === 'NEXT_PUBLIC_STACK_PROJECT_ID' && !value.match(/^[a-f0-9-]{36}$/)) {
        invalidVars.push(`${key} (should be UUID format)`);
      }
      if (key === 'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY' && !value.startsWith('pck_')) {
        invalidVars.push(`${key} (should start with 'pck_')`);
      }
      if (key === 'STACK_SECRET_SERVER_KEY' && !value.startsWith('ssk_')) {
        invalidVars.push(`${key} (should start with 'ssk_')`);
      }
      if (key === 'STACK_WEBHOOK_SECRET' && !value.startsWith('whsec_')) {
        invalidVars.push(`${key} (should start with 'whsec_')`);
      }
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing Stack Auth environment variables:', missingVars);
  }

  if (invalidVars.length > 0) {
    console.error('❌ Invalid Stack Auth environment variables:', invalidVars);
  }

  if (missingVars.length === 0 && invalidVars.length === 0) {
    console.log('✅ Stack Auth configuration is valid');
    return true;
  }

  return false;
}

// Auto-validate on import in development
if (process.env.NODE_ENV === 'development') {
  validateStackAuthConfig();
}