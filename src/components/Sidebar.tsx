"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Sparkles,
  FileText,
  Calendar,
  Library,
  Sliders,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Cities", href: "/cities", icon: MapPin },
  { name: "Generate", href: "/generate", icon: Sparkles },
  { name: "Content", href: "/content", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Library", href: "/library", icon: Library },
  { name: "Preferences", href: "/preferences", icon: Sliders },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:block fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* TMH Logo */}
        <Link
          href="/cities"
          className="flex items-center justify-center h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TMH</span>
            </div>
            <span className="font-semibold text-gray-900">AI Engine</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5
                        ${isActive ? "text-blue-600" : "text-gray-400"}
                      `}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}