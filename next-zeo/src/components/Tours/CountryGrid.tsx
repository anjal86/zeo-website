"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight } from 'lucide-react';

interface Country {
    name: string;
    image: string;
    tourCount: number;
}

interface CountryGridProps {
    countries: Country[];
    onSelectCountry: (countryName: string) => void;
}

const CountryGrid: React.FC<CountryGridProps> = ({ countries, onSelectCountry }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
            {countries.map((country) => (
                <motion.div
                    key={country.name}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="group cursor-pointer"
                    onClick={() => onSelectCountry(country.name)}
                >
                    <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                        <img
                            src={country.image}
                            alt={country.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <MapPin className="w-5 h-5 text-secondary" />
                                    <h3 className="text-2xl font-bold">{country.name}</h3>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="text-white/80 font-medium group-hover:text-white transition-colors">
                                {country.tourCount} {country.tourCount === 1 ? 'Tour' : 'Tours'} Available
                            </p>
                        </div>

                        {/* Hover overlay effect */}
                        <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default CountryGrid;
