// API service for fetching data from REST API with mobile optimization
const getApiBaseUrl = (): string => {
  // Check if we're in production (deployed)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for production
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  // Development environment - use relative URL to leverage Vite proxy
  return '/api';
};

const getImageBaseUrl = (): string => {
  // Check if we're in production (deployed)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for production
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Development environment - use relative URL to leverage Vite proxy
  return '';
};

const API_BASE_URL = getApiBaseUrl();
const IMAGE_BASE_URL = getImageBaseUrl();
const requestCache = new Map<string, Promise<unknown>>();

const isPublicGetRequest = (url: string, options: RequestInit): boolean => {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') return false;

  const headers = new Headers(options.headers);
  if (headers.has('Authorization')) return false;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.pathname.startsWith('/api/') && !parsedUrl.pathname.startsWith('/api/admin') && !parsedUrl.pathname.startsWith('/api/auth');
  } catch {
    return false;
  }
};

export interface Tour {
  id: number;
  title: string;
  category: string;
  image: string;
  price: number;
  originalPrice?: number; // Original price before discount (if applicable)
  priceAvailable?: boolean; // Controls whether price is shown or "Request Price" is displayed
  hasDiscount?: boolean; // Whether the tour has a discount
  discountPercentage?: number; // Discount percentage (e.g., 25 for 25% off)
  duration: string;
  group_size: string; // SQLite uses group_size instead of groupSize
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  rating: number;
  reviews: number;
  highlights: string[];
  featured?: boolean;
  discount?: number;
  location: string;
  description: string;
  inclusions: string[];
  best_time: string; // SQLite uses best_time instead of bestTime
  listed?: boolean; // Controls whether tour is visible to public
  // Additional SQLite fields
  slug?: string;
  destination_id?: number;
  destination_name?: string;
  destination_slug?: string;
  primary_destination_id?: number;
  secondary_destination_ids?: number[];
  created_at?: string;
  updated_at?: string;
  activities?: Activity[];
  gallery?: string[];
}

export interface Destination {
  id: number;
  name: string;
  country: string;
  image: string;
  tourCount?: number; // Optional since SQLite doesn't have this field
  href?: string; // Optional since SQLite doesn't have this field
  type?: 'nepal' | 'international'; // Optional since SQLite doesn't have this field
  description: string;
  highlights?: string[]; // Optional since SQLite doesn't have this field
  bestTime?: string; // Optional since SQLite doesn't have this field
  altitude?: string; // Optional since SQLite doesn't have this field
  difficulty: string;
  // SQLite fields
  slug: string;
  location: string;
  duration: string;
  rating: number;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Activity {
  id: number;
  name: string;
  image: string;
  tourCount?: number; // Optional since SQLite doesn't have this field
  href?: string; // Optional since SQLite doesn't have this field
  type?: 'adventure' | 'cultural'; // Optional since SQLite doesn't have this field
  description?: string;
  highlights?: string[]; // Optional since SQLite doesn't have this field
  difficulty?: string; // Optional since SQLite doesn't have this field
  bestTime?: string; // Optional since SQLite doesn't have this field
  duration?: string; // Optional since SQLite doesn't have this field
  popularDestinations?: string[]; // Optional since SQLite doesn't have this field
  // SQLite fields
  slug: string;
  icon?: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Slider {
  id: number;
  title: string;
  subtitle?: string;
  location?: string;
  image: string;
  video?: string;
  video_start_time?: number;
  order_index: number;
  is_active: boolean;
  button_text?: string;
  button_url?: string;
  button_style?: 'primary' | 'secondary' | 'outline';
  show_button?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  company: {
    name: string;
    tagline: string;
    description: string;
  };
  contact: {
    phone: {
      primary: string;
      secondary: string;
      whatsapp: string;
    };
    email: {
      primary: string;
      booking: string;
      admin: string;
      support: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
      full: string;
    };
    location: {
      coordinates: {
        latitude: number;
        longitude: number;
      };
      timezone: string;
      display: string;
    };
  };
  business: {
    hours: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
      display: string;
    };
    support: {
      availability: string;
      emergency: string;
      response_time: string;
    };
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
    whatsapp: string;
  };
  legal: {
    registration: string;
    tax_id: string;
    established: string;
    certifications: string[];
  };
}

export interface Testimonial {
  id: number;
  name: string;
  email: string;
  country: string;
  tour: string;
  rating: number;
  title: string;
  message: string;
  image: string;
  date: string;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  title: string;
  slug: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  featured: boolean;
  image: string;
  excerpt: string;
  reading_time: string;
  content: string;
  filename: string;
  seo?: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  user_id: number;
  tour_id: number;
  booking_date: string;
  travel_date: string;
  participants: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

// Enhanced Destination interface for content-based destinations
export interface ContentDestination {
  title: string;
  slug: string;
  country: string;
  region: string;
  featured: boolean;
  difficulty: string;
  best_time: string;
  altitude: string;
  duration: string;
  image: string;
  gallery: string[];
  highlights: string[];
  activities: string[];
  accommodation: string[];
  transportation: string[];
  permits_required: string[];
  weather: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  content: string;
  filename: string;
  seo?: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
}

// Mobile detection utility
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper function to convert relative image URLs to full URLs
const convertImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';

  // Rewrite Vercel blob URLs to local /uploads/
  if (imageUrl.includes('blob.vercel-storage.com')) {
    try {
      const urlObj = new URL(imageUrl);
      return urlObj.pathname.startsWith('/uploads/') 
        ? urlObj.pathname 
        : `/uploads${urlObj.pathname}`;
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it starts with /uploads/, return as is (Next.js public folder)
  if (imageUrl.startsWith('/uploads/')) {
    return imageUrl;
  }

  // If it doesn't start with /, add /uploads/
  if (!imageUrl.startsWith('/')) {
    return `/uploads/${imageUrl}`;
  }

  // Default case
  return imageUrl;
};

// Helper function to convert tour data with proper image URLs
const convertTourImageUrls = (tour: Tour): Tour => {
  return {
    ...tour,
    image: convertImageUrl(tour.image),
    // Convert gallery images if they exist
    ...(tour.gallery && {
      gallery: tour.gallery.map((img: string) => convertImageUrl(img))
    })
  };
};

// Enhanced API call helper with mobile optimizations, retry logic, and session-level GET dedupe
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for mobile

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();

    const defaultOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(isMobileDevice() && { 'X-Mobile-Request': 'true' })
      },
      signal: controller.signal,
      ...options
    };

    const cacheKey = `${method}:${url}`;
    if (isPublicGetRequest(url, defaultOptions)) {
      const cachedRequest = requestCache.get(cacheKey);
      if (cachedRequest) {
        clearTimeout(timeoutId);
        return cachedRequest as Promise<T>;
      }
    }

    const requestPromise = fetch(url, defaultOptions)
      .then(async (response) => {
        clearTimeout(timeoutId);

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 503) {
            throw new Error('Server temporarily unavailable - using fallback data');
          }
          if (response.status === 404) {
            throw new Error('API endpoint not found - using fallback data');
          }
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
      })
      .catch((error) => {
        requestCache.delete(cacheKey);
        throw error;
      });

    if (isPublicGetRequest(url, defaultOptions)) {
      requestCache.set(cacheKey, requestPromise);
    }

    return requestPromise as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      // Log the error but don't break the app
      console.warn(`API call to ${endpoint} failed:`, error.message);
      throw error;
    }

    throw new Error('Unknown API error occurred');
  }
};

// Retry wrapper for critical API calls
const apiCallWithRetry = async <T>(endpoint: string, maxRetries: number = 3): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall<T>(endpoint);
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

// Tours API
export const toursApi = {
  // Get all tours
  async getAll(): Promise<Tour[]> {
    const tours = await apiCallWithRetry<Tour[]>('/tours');
    return tours.map(convertTourImageUrls);
  },

  // Get lightweight tour cards for navigation and landing-page lists
  async getList(): Promise<Tour[]> {
    const tours = await apiCallWithRetry<Tour[]>('/tours?view=list');
    return tours.map(convertTourImageUrls);
  },

  // Get tours with pagination
  async getPaginated(page: number = 1, limit: number = 12, filters?: {
    category?: string;
    location?: string;
    search?: string;
    featured?: boolean;
  }): Promise<{
    tours: Tour[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.location && { location: filters.location }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.featured && { featured: filters.featured.toString() })
    });

    const response = await fetch(`${API_BASE_URL}/tours?${params}`);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const tours = await response.json();

    // Extract pagination info from headers
    const totalCount = parseInt(response.headers.get('X-Total-Count') || '0');
    const totalPages = parseInt(response.headers.get('X-Total-Pages') || '1');
    const hasNext = response.headers.get('X-Has-Next') === 'true';
    const hasPrevious = response.headers.get('X-Has-Previous') === 'true';

    return {
      tours: tours.map(convertTourImageUrls),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext,
        hasPrevious
      }
    };
  },

  // Get tour by ID
  async getById(id: number): Promise<Tour | null> {
    try {
      const tour = await apiCall<Tour>(`/tours/${id}`);
      return tour ? convertTourImageUrls(tour) : null;
    } catch (error) {
      return null;
    }
  },


  // Get tours by category
  async getByCategory(category: string): Promise<Tour[]> {
    const tours = await apiCall<Tour[]>(`/tours?category=${encodeURIComponent(category)}`);
    return tours.map(convertTourImageUrls);
  },

  // Get tours by location
  async getByLocation(location: string): Promise<Tour[]> {
    const tours = await apiCall<Tour[]>(`/tours?location=${encodeURIComponent(location)}`);
    return tours.map(convertTourImageUrls);
  },

  // Search tours
  async search(query: string): Promise<Tour[]> {
    const tours = await apiCall<Tour[]>(`/tours?search=${encodeURIComponent(query)}`);
    return tours.map(convertTourImageUrls);
  },

  // Update tour listing status
  async updateListingStatus(id: number, listed: boolean): Promise<Tour> {
    return apiCall<Tour>(`/admin/tours/${id}/listing`, {
      method: 'PATCH',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ listed })
    });
  }
};

// Destinations API
export const destinationsApi = {
  // Get all destinations
  async getAll(): Promise<Destination[]> {
    return apiCallWithRetry<Destination[]>('/destinations');
  },

  // Get destination by ID
  async getById(id: number): Promise<Destination | null> {
    try {
      return await apiCall<Destination>(`/destinations/${id}`);
    } catch (error) {
      return null;
    }
  },

  // Get destination by slug
  async getBySlug(slug: string): Promise<Destination | null> {
    try {
      return await apiCall<Destination>(`/destinations/${encodeURIComponent(slug)}`);
    } catch (error) {

      return null;
    }
  },

  // Get destinations by type
  async getByType(type: 'nepal' | 'international'): Promise<Destination[]> {
    return apiCall<Destination[]>(`/destinations?type=${type}`);
  },

  // Get featured destinations
  async getFeatured(): Promise<Destination[]> {
    return apiCall<Destination[]>('/destinations?featured=true');
  },

  // Get destination by name
  async getByName(name: string): Promise<Destination | null> {
    try {
      return await apiCall<Destination>(`/destinations/name/${encodeURIComponent(name)}`);
    } catch (error) {

      return null;
    }
  }
};

// Activities API
export const activitiesApi = {
  // Get all activities
  async getAll(): Promise<Activity[]> {
    return apiCallWithRetry<Activity[]>('/activities');
  },

  // Get activity by ID
  async getById(id: number): Promise<Activity | null> {
    try {
      return await apiCall<Activity>(`/activities/${id}`);
    } catch (error) {

      return null;
    }
  },

  // Get activity by slug
  async getBySlug(slug: string): Promise<Activity | null> {
    try {
      return await apiCall<Activity>(`/activities/${encodeURIComponent(slug)}`);
    } catch (error) {

      return null;
    }
  },

  // Get activities by type
  async getByType(type: 'adventure' | 'cultural'): Promise<Activity[]> {
    return apiCall<Activity[]>(`/activities?type=${type}`);
  },

  // Get activity by name
  async getByName(name: string): Promise<Activity | null> {
    try {
      return await apiCall<Activity>(`/activities/name/${encodeURIComponent(name)}`);
    } catch (error) {

      return null;
    }
  }
};

// Combined API for search across all data types
export const searchApi = {
  async searchAll(query: string): Promise<{
    tours: Tour[];
    destinations: Destination[];
    activities: Activity[];
  }> {
    return apiCall<{
      tours: Tour[];
      destinations: Destination[];
      activities: Activity[];
    }>(`/search?q=${encodeURIComponent(query)}`);
  }
};

// Sliders API
export const slidersApi = {
  // Get all active sliders
  async getAll(): Promise<Slider[]> {
    return apiCallWithRetry<Slider[]>('/sliders');
  },

  // Get slider by ID
  async getById(id: number): Promise<Slider | null> {
    try {
      return await apiCall<Slider>(`/sliders/${id}`);
    } catch (error) {

      return null;
    }
  }
};

// Blogs API (New - Markdown + YAML content)
export const blogsApi = {
  // Get all blog posts
  async getAll(): Promise<Blog[]> {
    return apiCallWithRetry<Blog[]>('/blogs');
  },

  // Get blog by slug
  async getBySlug(slug: string): Promise<Blog | null> {
    try {
      return await apiCall<Blog>(`/blogs/${encodeURIComponent(slug)}`);
    } catch (error) {

      return null;
    }
  },

  // Get featured blogs
  async getFeatured(): Promise<Blog[]> {
    return apiCall<Blog[]>('/blogs?featured=true');
  },

  // Get blogs by category
  async getByCategory(category: string): Promise<Blog[]> {
    return apiCall<Blog[]>(`/blogs?category=${encodeURIComponent(category)}`);
  }
};

// Users API (New - LowDB structured data)
export const usersApi = {
  // Get all users
  async getAll(): Promise<User[]> {
    return apiCallWithRetry<User[]>('/users');
  },

  // Get user by ID
  async getById(id: number): Promise<User | null> {
    try {
      return await apiCall<User>(`/users/${id}`);
    } catch (error) {

      return null;
    }
  },

  // Create new user
  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return apiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Update user
  async update(id: number, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    return apiCall<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};

// Bookings API (New - LowDB structured data)
export const bookingsApi = {
  // Get all bookings
  async getAll(): Promise<Booking[]> {
    return apiCallWithRetry<Booking[]>('/bookings');
  },

  // Get booking by ID
  async getById(id: number): Promise<Booking | null> {
    try {
      return await apiCall<Booking>(`/bookings/${id}`);
    } catch (error) {

      return null;
    }
  },

  // Get bookings by user ID
  async getByUserId(userId: number): Promise<Booking[]> {
    return apiCall<Booking[]>(`/bookings?user_id=${userId}`);
  },

  // Get bookings by tour ID
  async getByTourId(tourId: number): Promise<Booking[]> {
    return apiCall<Booking[]>(`/bookings?tour_id=${tourId}`);
  },

  // Create new booking
  async create(bookingData: Omit<Booking, 'id' | 'booking_date' | 'created_at' | 'updated_at'>): Promise<Booking> {
    return apiCall<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  // Update booking
  async update(id: number, bookingData: Partial<Omit<Booking, 'id' | 'booking_date' | 'created_at' | 'updated_at'>>): Promise<Booking> {
    return apiCall<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    });
  }
};

// Enhanced Destinations API (Now supports content-based destinations)
export const contentDestinationsApi = {
  // Get all content-based destinations
  async getAll(): Promise<ContentDestination[]> {
    return apiCallWithRetry<ContentDestination[]>('/destinations');
  },

  // Get destination by slug
  async getBySlug(slug: string): Promise<ContentDestination | null> {
    try {
      return await apiCall<ContentDestination>(`/destinations/${encodeURIComponent(slug)}`);
    } catch (error) {

      return null;
    }
  },

  // Get featured destinations
  async getFeatured(): Promise<ContentDestination[]> {
    return apiCall<ContentDestination[]>('/destinations?featured=true');
  },

  // Get destinations by country
  async getByCountry(country: string): Promise<ContentDestination[]> {
    return apiCall<ContentDestination[]>(`/destinations?country=${encodeURIComponent(country)}`);
  }
};

// Enhanced Search API (Now includes blogs and content destinations)
export const enhancedSearchApi = {
  async searchAll(query: string): Promise<{
    tours: Tour[];
    blogs: Blog[];
    destinations: ContentDestination[];
  }> {
    return apiCall<{
      tours: Tour[];
      blogs: Blog[];
      destinations: ContentDestination[];
    }>(`/search?q=${encodeURIComponent(query)}`);
  }
};

// Enhanced Featured content API (Now includes blogs)
export const featuredApi = {
  async getAll(): Promise<{
    destinations: ContentDestination[];
    tours: Tour[];
    blogs: Blog[];
  }> {
    return apiCallWithRetry<{
      destinations: ContentDestination[];
      tours: Tour[];
      blogs: Blog[];
    }>('/featured');
  }
};

// Contact API
export const contactApi = {
  async get(): Promise<Contact> {
    return apiCallWithRetry<Contact>('/contact');
  }
};

// Testimonials API
export const testimonialsApi = {
  // Get all approved testimonials
  async getAll(): Promise<Testimonial[]> {
    return apiCallWithRetry<Testimonial[]>('/testimonials');
  },

  // Get featured testimonials
  async getFeatured(): Promise<Testimonial[]> {
    return apiCall<Testimonial[]>('/testimonials?featured=true');
  },

  // Get testimonial by ID
  async getById(id: number): Promise<Testimonial | null> {
    try {
      return await apiCall<Testimonial>(`/testimonials/${id}`);
    } catch (error) {

      return null;
    }
  },

  // Submit new testimonial (public)
  async submit(testimonialData: Omit<Testimonial, 'id' | 'date' | 'is_featured' | 'is_approved' | 'created_at' | 'updated_at'>): Promise<{
    success: boolean;
    message: string;
    testimonial: Testimonial;
  }> {
    return apiCall('/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonialData)
    });
  }
};

// Health check API
export const healthApi = {
  async check(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    version: string;
    environment: string;
    mobile: boolean;
    dataLoaded: {
      destinations: number;
      activities: number;
      tours: number;
    };
  }> {
    return apiCall('/health');
  }
};

// Logos API
export const logosApi = {
  // Get all logos (public)
  async getAll(): Promise<{
    header: string;
    footer: string;
    lastUpdated: string;
  }> {
    return apiCallWithRetry('/logos');
  }
};
// Director Message API
export interface DirectorMessage {
  id: number;
  name: string;
  title: string;
  message: string;
  image: string;
  updated_at?: string;
}

export const directorMessageApi = {
  async get(): Promise<DirectorMessage | null> {
    try {
      return await apiCall<DirectorMessage>('/director-message');
    } catch (error) {
      return null;
    }
  },

  async update(data: Partial<DirectorMessage> | FormData): Promise<DirectorMessage> {
    const isFormData = data instanceof FormData;

    return apiCall<DirectorMessage>('/admin/director-message', {
      method: 'PUT',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      },
      body: isFormData ? (data as FormData) : JSON.stringify(data)
    });
  }
};

// Team Members API
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio?: string;
  order_index: number;
  social: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const teamApi = {
  async getAll(): Promise<TeamMember[]> {
    return apiCallWithRetry<TeamMember[]>('/team');
  },

  async getById(id: number): Promise<TeamMember | null> {
    try {
      return await apiCall<TeamMember>(`/team/${id}`);
    } catch (error) {
      return null;
    }
  },

  async create(data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> {
    return apiCall<TeamMember>('/admin/team', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  async update(id: number, data: Partial<TeamMember>): Promise<TeamMember> {
    return apiCall<TeamMember>(`/admin/team/${id}`, {
      method: 'PUT',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },

  async delete(id: number): Promise<void> {
    await apiCall(`/admin/team/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
  },

  async updateOrder(orders: { id: number; order_index: number }[]): Promise<void> {
    await apiCall('/admin/team/order', {
      method: 'PATCH',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orders })
    });
  }
};

// Export default API object
const api = {
  tours: toursApi,
  destinations: destinationsApi,
  activities: activitiesApi,
  search: searchApi,
  sliders: slidersApi,
  featured: featuredApi,
  contact: contactApi,
  testimonials: testimonialsApi,
  health: healthApi,
  logos: logosApi,
  // New hybrid APIs
  blogs: blogsApi,
  users: usersApi,
  bookings: bookingsApi,
  contentDestinations: contentDestinationsApi,
  enhancedSearch: enhancedSearchApi,
  directorMessage: directorMessageApi,
  team: teamApi
};

export default api;
