import { OAuthButtonGroup } from "@stackframe/stack";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold mx-auto mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold">Join Breaktool</h1>
          <p className="text-muted-foreground mt-2">
            Create your account to start exploring SaaS tools
          </p>
        </div>
        
        {/* OAuth Buttons */}
        <div className="mb-6">
          <OAuthButtonGroup type="sign-up" />
        </div>
        
        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>By creating an account, you agree to our terms of service and privacy policy</p>
        </div>
      </div>
    </div>
  );
}
