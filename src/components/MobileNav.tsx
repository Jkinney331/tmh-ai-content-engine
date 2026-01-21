"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin, Sparkles, FileText, Calendar, Library, Sliders, Settings } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: typeof MapPin;
}

const navigation: NavItem[] = [
  { name: "Cities", href: "/cities", icon: MapPin },
  { name: "Generate", href: "/generate", icon: Sparkles },
  { name: "Content", href: "/content", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Library", href: "/library", icon: Library },
  { name: "Preferences", href: "/preferences", icon: Sliders },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest("#mobile-sidebar") && !target.closest("#hamburger-button")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <button
        id="hamburger-button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity" />
      )}

      <div
        id="mobile-sidebar"
        className={`
          md:hidden fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <Link
            href="/cities"
            className="flex items-center justify-center h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TMH</span>
              </div>
              <span className="font-semibold text-gray-900">AI Engine</span>
            </div>
          </Link>

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
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon
                        className={`
                          mr-3 h-5 w-5
                          ${isActive ? "text-blue-600" : "text-gray-400"}
                        `}
                      />
                      {item.name || 'Untitled'}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}