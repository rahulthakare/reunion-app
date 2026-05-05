import Link from "next/link";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Simple top nav for authenticated public pages */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-indigo-700">
            NEHS <span className="text-gray-900">Batch &apos;93</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/#details" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Event
            </Link>
            <Link href="/#rsvp" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              RSVP
            </Link>
            <Link href="/directory" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Directory
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
