import { OAuthButtonGroup } from "@stackframe/stack";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold mx-auto mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold">Welcome to Breaktool</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access trusted SaaS reviews and expert insights
          </p>
        </div>
        
        {/* OAuth Buttons */}
        <div className="mb-6">
          <OAuthButtonGroup type="sign-in" />
        </div>
        
        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>By signing in, you agree to our terms of service and privacy policy</p>
        </div>
      </div>
    </div>
  );
}
