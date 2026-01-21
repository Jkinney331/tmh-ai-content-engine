'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrentPage: boolean;
}

const pathLabelMap: Record<string, string> = {
  cities: 'Cities',
  generate: 'Generate',
  shots: 'Product Shots',
  lifestyle: 'Lifestyle',
  video: 'Video',
  content: 'Content',
  create: 'Create',
  calendar: 'Calendar',
  library: 'Library',
  preferences: 'Preferences',
  settings: 'Settings',
  prompts: 'Prompts',
  api: 'API Status',
  'content-types': 'Content Types',
};

export default function Breadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb segments from pathname
  const segments: BreadcrumbSegment[] = [];

  // Always add Home
  segments.push({
    label: 'Home',
    href: '/',
    isCurrentPage: pathname === '/',
  });

  // Split pathname and build segments
  if (pathname !== '/') {
    const pathParts = pathname.split('/').filter(Boolean);
    let currentPath = '';

    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === pathParts.length - 1;

      // Get label from map or capitalize the part
      const label = pathLabelMap[part.toLowerCase()] ||
                   part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');

      segments.push({
        label,
        href: currentPath,
        isCurrentPage: isLast,
      });
    });
  }

  // Don't render if only home
  if (segments.length === 1 && segments[0].isCurrentPage) {
    return null;
  }

  return (
    <nav
      className="flex items-center space-x-1 mb-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {segments.map((segment, index) => (
          <li key={segment.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />
            )}
            {segment.isCurrentPage ? (
              <span className="flex items-center text-sm font-medium text-gray-900">
                {index === 0 && <Home className="mr-1 h-4 w-4" />}
                {segment.label}
              </span>
            ) : (
              <Link
                href={segment.href}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {index === 0 && <Home className="mr-1 h-4 w-4" />}
                {segment.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
