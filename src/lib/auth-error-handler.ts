// Auth Error Handler for Stack Auth

export class AuthErrorHandler {
  static handleRefreshTokenError(error: Error | unknown) {
    console.error('Refresh token error:', error);
    
    // Clear any stored tokens
    if (typeof window !== 'undefined') {
      // Clear cookies related to Stack Auth
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear localStorage
      localStorage.clear();
      
      // Redirect to sign-in page
      window.location.href = '/handler/sign-in';
    }
  }
  
  static handleAuthError(error: Error | unknown) {
    console.error('Auth error:', error);
    
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('refresh token')) {
      this.handleRefreshTokenError(error);
    }
  }
}

// Global error handler for unhandled auth errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('refresh token')) {
      AuthErrorHandler.handleRefreshTokenError(event.reason);
      event.preventDefault();
    }
  });
}