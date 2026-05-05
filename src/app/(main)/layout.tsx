import { SiteNav } from "@/components/features/SiteNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
    </>
  );
}
