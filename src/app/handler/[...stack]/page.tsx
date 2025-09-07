import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack-server";

export default async function StackHandlerPage({
  params,
}: {
  params: Promise<{ stack: string[] }>;
}) {
  const resolvedParams = await params;
  
  return (
    <StackHandler 
      app={stackServerApp} 
      routeProps={{ params: resolvedParams }}
      fullPage
    />
  );
}
