// Stack Auth Connection Test

export async function testStackAuthConnection() {
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
  
  if (!projectId || !publishableKey) {
    console.error('❌ Stack Auth environment variables not found');
    return false;
  }
  
  try {
    // Test Stack Auth API endpoint
    const response = await fetch(`https://api.stack-auth.com/api/v1/projects/${projectId}/client-info`, {
      headers: {
        'x-stack-publishable-client-key': publishableKey,
        'x-stack-access-type': 'client',
        'x-stack-project-id': projectId,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Stack Auth connection successful:', data);
      return true;
    } else {
      console.error('❌ Stack Auth API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Stack Auth connection failed:', error);
    return false;
  }
}

// Test function for debugging
export async function debugStackAuth() {
  console.log('🔍 Debugging Stack Auth configuration...');
  
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
  
  console.log('Project ID:', projectId ? `${projectId.substring(0, 8)}...` : 'NOT FOUND');
  console.log('Publishable Key:', publishableKey ? `${publishableKey.substring(0, 8)}...` : 'NOT FOUND');
  
  if (typeof window !== 'undefined') {
    console.log('Current URL:', window.location.href);
    console.log('Current Domain:', window.location.hostname);
  }
  
  await testStackAuthConnection();
}