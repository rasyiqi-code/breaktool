// Client-side auth utilities for Stack Auth
// Note: These are utility functions, not hooks

// Sign in functions
export const signIn = {
  social: () => {
    // This will be called from components that have access to useStackApp
    // For direct usage, components should use useStackApp().redirectToSignIn()
    console.warn('signIn.social() should be called from component with useStackApp hook');
  }
};

// Sign out function - should be called from component with useUser hook
export const signOut = async (user: { signOut: () => Promise<void> } | null) => {
  if (user) {
    await user.signOut();
  }
};

// Helper function to get current user - should be called from component
export const getCurrentUser = (user: unknown) => {
  return user;
};

// Helper function to get stack app instance - should be called from component
export const getStackApp = (app: unknown) => {
  return app;
};
