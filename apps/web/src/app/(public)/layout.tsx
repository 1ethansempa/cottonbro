import { CrispChat } from "@/components/crisp-chat";

export const revalidate = 60;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CrispChat />
      {children}
    </>
  );
}
