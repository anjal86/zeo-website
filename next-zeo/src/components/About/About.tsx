"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Shield, Globe, Award, Star,
  Plane, FileText, Hotel, Car, Ship, Sparkles, Target, Users,
  Palmtree, PartyPopper, MapPin, Calendar, TrendingUp, Building2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import api, { type DirectorMessage, type TeamMember } from '../../services/api';
import { Quote } from 'lucide-react';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
const About: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [directorMessage, setDirectorMessage] = useState<DirectorMessage | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const msg = await api.directorMessage.get();
        if (msg) setDirectorMessage(msg);

        const team = await api.team.getAll();
        setTeamMembers(team.sort((a, b) => a.order_index - b.order_index));
      } catch (error) {
        console.error('Failed to fetch about page data', error);
      }
    };
    fetchData();
  }, []);

  const coreValues = [
    {
      icon: Heart,
      title: 'Authentic Experiences',
      description: 'We create genuine connections with local cultures and communities.',
      stat: '95% satisfaction rate'
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Your safety is our top priority with certified guides and protocols.',
      stat: '100% safety record'
    },
    {
      icon: Globe,
      title: 'Sustainable Travel',
      description: 'We protect the environments and communities we visit.',
      stat: '50+ eco-friendly tours'
    }
  ];

  const achievements = [
    { number: '2018', label: 'Founded', icon: Calendar },
    { number: '13+', label: 'Years Experience', icon: TrendingUp },
    { number: '10K+', label: 'Happy Travelers', icon: Users },
    { number: '50+', label: 'Destinations', icon: Globe }
  ];

  const timeline = [
    {
      year: '2018',
      title: 'Company Founded',
      description: 'Zeo Tourism Pvt. Ltd. established in Kathmandu, Nepal'
    },
    {
      year: '2020',
      title: 'Dubai Expansion',
      description: 'Registered as ZEO Tourism LLC in Dubai, UAE'
    },
    {
      year: '2022',
      title: 'Major Milestone',
      description: 'Served 10,000+ travelers across 50+ destinations'
    },
    {
      year: '2024',
      title: 'Excellence Award',
      description: 'Recognized for outstanding service in travel industry'
    }
  ];

  const serviceCategories = [
    {
      category: 'Travel Planning',
      icon: Target,
      services: [
        {
          title: 'International & Domestic Tour Packages',
          description: 'Curated travel experiences across the globe and within Nepal',
          icon: Globe
        },
        {
          title: 'Tailor-Made Travel',
          description: 'Customized travel packages for families, groups, and corporate tours',
          icon: Target
        },
        {
          title: 'Holiday Packages',
          description: 'Complete holiday solutions with accommodation and activities',
          icon: Palmtree
        }
      ]
    },
    {
      category: 'Travel Essentials',
      icon: Plane,
      services: [
        {
          title: 'Visa Processing (Global)',
          description: 'Fast, reliable visa application assistance for global destinations',
          icon: FileText
        },
        {
          title: 'Worldwide Flight Ticketing',
          description: 'Global airline tickets with great prices and real-time support',
          icon: Plane
        },
        {
          title: 'Hotel Booking & Accommodation',
          description: 'Affordable to luxury hotel stays across Asia and Europe',
          icon: Hotel
        },
        {
          title: 'Travel Insurance',
          description: 'Comprehensive travel insurance and concierge support',
          icon: Shield
        }
      ]
    },
    {
      category: 'Premium Services',
      icon: Sparkles,
      services: [
        {
          title: 'Airport VIP/VVIP Meet & Assist',
          description: 'Exclusive airport services for seamless travel experience',
          icon: Sparkles
        },
        {
          title: 'Luxury Transfers & Transportation',
          description: 'Premium transportation services for comfort and convenience',
          icon: Car
        },
        {
          title: 'Cruise & Yacht Rentals (Dubai)',
          description: 'Book luxury yachts in Dubai, cruises in Southeast Asia',
          icon: Ship
        }
      ]
    },
    {
      category: 'Corporate Solutions',
      icon: Building2,
      services: [
        {
          title: 'MICE',
          description: 'Meetings, Incentives, Conferences & Events management',
          icon: PartyPopper
        },
        {
          title: 'Escort Services',
          description: 'Professional travel escorts for guided experiences',
          icon: Users
        }
      ]
    }
  ];

  const testimonials = [
    {
      quote: "Zeo Tourism didn't just show us Nepal – they helped us understand it. The cultural immersion and personal connections we made will stay with us forever.",
      author: "Sarah Johnson",
      trip: "Everest Base Camp Trek",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      quote: "Outstanding service from start to finish. The team handled everything professionally, and our Dubai yacht experience was absolutely unforgettable.",
      author: "Michael Chen",
      trip: "Dubai Luxury Tour",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      quote: "Best travel agency we've worked with! They customized our corporate retreat perfectly and handled all logistics seamlessly.",
      author: "Priya Sharma",
      trip: "Corporate MICE Event",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&h=100&fit=crop&crop=face",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="bg-white">
      {/* Enhanced Stats Section with Background */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
            alt="Mountain landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary-dark/90 to-gray-900/95"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Our Journey in Numbers
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Building trust through excellence and dedication
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <IconComponent className="w-10 h-10 text-white/80 mx-auto mb-4" />
                    <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-white/90 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Story Section - Enhanced */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Since 2018 Badge */}
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">Established 2018</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8">
                About
                <span className="block text-primary">Zeo Tourism</span>
              </h2>

              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Founded in <strong className="text-gray-900">2018</strong> and headquartered in <a href="https://ntb.gov.np" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-primary underline decoration-primary/30">Kathmandu</a>, <strong className="text-primary">Zeo Tourism Pvt. Ltd.</strong> is a premier travel agency dedicated to delivering world-class travel experiences. With over <strong className="text-gray-900">13 years</strong> of professional expertise in the travel and hospitality industry, we specialize in customized international packages, corporate incentive tours, and complete travel solutions.
                </p>
                <p>
                  We are also officially registered in <strong className="text-gray-900">Dubai</strong> as <strong className="text-primary">ZEO Tourism LLC</strong>, expanding our premium services to clients based worldwide. As a registered travel entity in <a href="https://ntb.gov.np/plan-your-trip/nepal-at-a-glance" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-primary underline decoration-primary/30">Nepal</a>, we uphold the highest standards of Himalayan hospitality.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-2xl">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-gray-900">Nepal Office</div>
                    <div className="text-sm text-gray-600">Kathmandu</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-2xl">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-gray-900">Dubai Office</div>
                    <div className="text-sm text-gray-600">UAE</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1571401835393-8c5f35328320?q=80&w=800&auto=format&fit=crop"
                  alt="Mountain landscape"
                  className="rounded-2xl shadow-xl w-full h-64 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop"
                  alt="Dubai skyline"
                  className="rounded-2xl shadow-xl w-full h-64 object-cover mt-8"
                />
              </div>

              {/* Floating Award Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6 border-4 border-primary/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Excellence Award</div>
                    <div className="text-sm text-gray-600">Travel Industry 2024</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Director Message Section */}
      {directorMessage && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform translate-x-1/4"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="grid md:grid-cols-12 gap-0">
                <div className="md:col-span-5 relative min-h-[400px]">
                  <img
                    src={directorMessage.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800"}
                    alt={directorMessage.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                    <h3 className="text-2xl font-bold text-white">{directorMessage.name}</h3>
                    <p className="text-white/90 font-medium">{directorMessage.title}</p>
                  </div>
                </div>

                <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <Quote className="w-12 h-12 text-primary/20" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">Message from the Director</h2>
                  <div className="prose prose-lg text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
                    {directorMessage.message}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Company Timeline Section - NEW */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Our <span className="text-primary">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Milestones that shaped our story
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-primary-dark to-primary"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                      <div className="text-3xl font-bold text-primary mb-2">{item.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section - Modern Tabbed Interface */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              What We <span className="text-primary">Offer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive travel services tailored to your needs
            </p>
          </motion.div>

          {/* Modern Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {serviceCategories.map((category, index) => {
              const CategoryIcon = category.icon;
              return (
                <motion.button
                  key={index}
                  onClick={() => setActiveCategory(index)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`group relative px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${activeCategory === index
                    ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <CategoryIcon className={`w-5 h-5 ${activeCategory === index ? 'text-white' : 'text-primary'
                      }`} />
                    <span className="hidden sm:inline">{category.category}</span>
                    <span className="sm:hidden">{category.category.split(' ')[0]}</span>
                  </div>

                  {/* Active indicator */}
                  {activeCategory === index && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Tab Content with Animation */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >


            {/* Services Grid */}
            <div className={`grid md:grid-cols-2 ${serviceCategories[activeCategory].services.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
              } gap-6`}>
              {serviceCategories[activeCategory].services.map((service, serviceIndex) => {
                const ServiceIcon = service.icon;
                return (
                  <motion.div
                    key={serviceIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: serviceIndex * 0.1 }}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/50 overflow-hidden"
                  >
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <ServiceIcon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* Decorative Corner Element */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  </motion.div>
                );
              })}
            </div>


          </motion.div>
        </div>
      </section>

      {/* Values Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Why Choose <span className="text-primary">Us</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from planning your journey to ensuring lasting positive impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{value.description}</p>
                <div className="text-sm font-semibold text-primary">{value.stat}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      {teamMembers.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                Meet the <span className="text-primary">Team</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The experts behind your unforgettable journeys
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl mb-4 shadow-lg aspect-[3/4]">
                    <img
                      src={member.image || 'https://via.placeholder.com/400x500'}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div className="flex gap-4">
                        {member.social?.linkedin && (
                          <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                            <FaLinkedin className="w-5 h-5" />
                          </a>
                        )}
                        {member.social?.twitter && (
                          <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                            <FaTwitter className="w-5 h-5" />
                          </a>
                        )}
                        {member.social?.facebook && (
                          <a href={member.social.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                            <FaFacebook className="w-5 h-5" />
                          </a>
                        )}
                        {member.social?.instagram && (
                          <a href={member.social.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                            <FaInstagram className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    {member.bio && (
                      <p className="text-sm text-gray-500 line-clamp-2">{member.bio}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Testimonials Carousel */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              What Our <span className="text-primary">Travelers Say</span>
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from real travelers
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-8">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
                ))}
              </div>

              <blockquote className="text-2xl sm:text-3xl font-serif text-gray-900 mb-8 leading-relaxed">
                "{testimonials[activeTestimonial].quote}"
              </blockquote>

              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[activeTestimonial].image}
                  alt={testimonials[activeTestimonial].author}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].author}</div>
                  <div className="text-gray-600">{testimonials[activeTestimonial].trip}</div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors duration-300 flex items-center justify-center"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeTestimonial ? 'bg-primary w-8' : 'bg-gray-300'
                      }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors duration-300 flex items-center justify-center"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-8">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Let us craft a journey that will exceed your expectations and create memories to last a lifetime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/contact"
                className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Planning Today
              </Link>
              <Link
                href="/tours"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-primary transition-all duration-300"
              >
                Browse Our Tours
              </Link>
            </div>

            <div className="text-white/80 text-sm">
              Join 10,000+ happy travelers who trusted us with their journey
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
