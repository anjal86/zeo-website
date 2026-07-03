import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  breadcrumb: string;
  backgroundImage: string;
  iconImage?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb,
  backgroundImage,
  iconImage
}) => {
  // Parse breadcrumb to create proper navigation
  const breadcrumbParts = breadcrumb.split(' > ');
  const isDestinationDetail = breadcrumbParts.length > 1 && breadcrumbParts[0] === 'Destinations'; // Is a destination detail page
  return (
    <section className="relative text-white overflow-hidden min-h-[40vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="section-container text-center relative z-10 w-full py-20 pt-40">
        {iconImage && (
          <div className="flex justify-center mb-6">
            <img src={iconImage} alt="" className="w-20 h-20 object-contain drop-shadow-2xl" />
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
          {title}
        </h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
          {subtitle}
        </p>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center">
          <Link to="/" className="text-white/80 hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-white/60" />
          {isDestinationDetail ? (
            <>
              <Link to="/destinations" className="text-white/80 hover:text-white transition-colors">
                Destinations
              </Link>
              <ChevronRight className="w-4 h-4 mx-2 text-white/60" />
              <span className="text-white font-medium">{breadcrumbParts[1]}</span>
            </>
          ) : (
            <span className="text-white font-medium">{breadcrumbParts[breadcrumbParts.length - 1]}</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;