import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center flex-wrap gap-1 text-sm ${className}`}>
      <Link
        href="/"
        className="flex items-center text-gray-400 hover:text-primary transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" aria-hidden="true" />
            {isLast || !item.href ? (
              <span
                className={isLast ? 'text-gray-700 font-medium truncate max-w-[200px]' : 'text-gray-400'}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-400 hover:text-primary transition-colors truncate max-w-[150px]"
              >
                {item.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
