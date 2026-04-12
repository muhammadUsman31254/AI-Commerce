import Link from "next/link";
import Image from "next/image";


export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-50 border border-teal-100">
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="16" y="16" width="32" height="32" rx="6" stroke="#0d9488" strokeWidth="2" fill="#ccfbf1" />
              <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0d9488" fontFamily="monospace">AI</text>
              <line x1="16" y1="24" x2="8"  y2="24" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="16" y1="32" x2="8"  y2="32" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="16" y1="40" x2="8"  y2="40" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="48" y1="24" x2="56" y2="24" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="48" y1="32" x2="56" y2="32" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="48" y1="40" x2="56" y2="40" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="24" y1="16" x2="24" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
              <line x1="32" y1="16" x2="32" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
              <line x1="40" y1="16" x2="40" y2="8"  stroke="#0d9488" strokeWidth="1.5" />
              <line x1="24" y1="48" x2="24" y2="56" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="32" y1="48" x2="32" y2="56" stroke="#0d9488" strokeWidth="1.5" />
              <line x1="40" y1="48" x2="40" y2="56" stroke="#0d9488" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-wide">
            <span className="text-teal-600">AI-</span><span className="text-gray-800">Commerce</span>
          </span>
        </div>

        {/* Auth links */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — icons ring + title */}
          <div className="relative flex items-center justify-center min-h-[380px]">

            {/* Package — top left */}
            <div className="absolute top-6 left-8 opacity-15">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>

            {/* Dollar — top center */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-15">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>

            {/* Cart — top right */}
            <div className="absolute top-6 right-8 opacity-15">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>

            {/* Brain — mid left */}
            <div className="absolute top-1/2 -translate-y-1/2 left-2 opacity-15">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
              </svg>
            </div>

            {/* Mic — mid right */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-15">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="11" rx="3"/>
                <path d="M19 10a7 7 0 0 1-14 0"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="8" y1="22" x2="16" y2="22"/>
              </svg>
            </div>

            {/* Inventory — bottom left */}
            <div className="absolute bottom-6 left-8 opacity-15">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                <polyline points="2 17 12 22 22 17"/>
                <polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>

            {/* Orders — bottom center */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-15">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>

            {/* Settings — bottom right */}
            <div className="absolute bottom-6 right-8 opacity-15">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>

            {/* Title — center */}
            <div className="text-center z-10">
              <h1 className="text-5xl font-extrabold leading-tight">
                <span className="text-teal-600">AI-</span><span className="text-gray-800">Commerce</span>
              </h1>
              <p className="mt-3 text-base font-medium tracking-widest text-teal-600 uppercase">
                AI Integrated E-Commerce Platform
              </p>
            </div>

          </div>

          {/* Right — illustration */}
          <div className="flex items-center justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent pointer-events-none z-10 rounded-3xl" />
              <Image
                src="/hero.png"
                alt="AI-Commerce illustration"
                width={560}
                height={420}
                priority
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        &copy; {new Date().getFullYear()} AI-Commerce &mdash; AI Integrated E-Commerce Platform
      </footer>

    </div>
  );
}
