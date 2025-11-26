import { cookies } from "next/headers";
import WebAuthProvider from "@/app/providers/auth-provider";
import { AuthRedirect } from "@/components/auth-redirect";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  // Server-side auth check for security
  if (!session) {
    // Use client component to handle redirect with pathname
    return <AuthRedirect />;
  }

  return <WebAuthProvider>{children}</WebAuthProvider>;
}
