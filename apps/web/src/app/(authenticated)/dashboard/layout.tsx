"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@cottonbro/auth-react";
import {
  ArrowUpRight,
  Bell,
  GearSix as Settings,
  Plus,
  SignOut as LogOut,
  UserCircle as User,
} from "@phosphor-icons/react";
import { Logo } from "@cottonbro/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, role } = useAuth();
  const showUserSettings = role === "user" || role === undefined;

  const navItems = [
    ...(showUserSettings
      ? [
          {
            href: "/dashboard/settings",
            label: "Settings",
            icon: <Settings className="w-4 h-4" />,
          },
        ]
      : []),
    { href: "/dashboard/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col md:flex-row font-sans text-black selection:bg-black selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between shrink-0 h-auto md:min-h-screen relative z-10">
        <div>
          {/* Logo Area */}
          <div className="p-6 md:p-8 flex items-center justify-between md:justify-start">
            <Link href="/" className="hover:opacity-70 transition-opacity">
              <Logo size="md" color="black" />
            </Link>
          </div>

          {/* Main Action */}
          <div className="px-6 md:px-8 pb-8">
            <Link
              href="/create-product"
              className="group flex items-center justify-between w-full bg-black text-white px-5 py-4 text-[10px] font-bold tracking-[0.2em] uppercase transition-all hover:opacity-80 rounded-full"
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-3.5 h-3.5" />
                Create Product
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" weight="regular" aria-hidden="true" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col">
            <div className="px-6 md:px-8 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Products</span>
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-6 md:px-8 py-3 text-[11px] font-bold tracking-[0.15em] transition-colors ${
                    isActive 
                      ? "text-black border-l-[3px] border-black" 
                      : "text-gray-500 border-l-[3px] border-transparent hover:text-black"
                  }`}
                >
                  {item.icon && <span className={isActive ? "text-black" : "text-gray-400"}>{item.icon}</span>}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 border-t border-gray-200">
          <button
            onClick={() => logout()}
            className="group flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs font-bold">C</div>
              <span className="text-[10px] font-bold tracking-[0.15em] text-gray-500 group-hover:text-black transition-colors">Logout</span>
            </div>
            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Top bar with notification & profile icons */}
        <div className="flex justify-end items-center gap-6 px-6 md:px-12 pt-6 md:pt-8">
          <Bell className="w-5 h-5 text-black cursor-pointer hover:opacity-70 transition-opacity" />
          <User className="w-5 h-5 text-black cursor-pointer hover:opacity-70 transition-opacity" />
        </div>
        <div className="max-w-6xl mx-auto h-full min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
