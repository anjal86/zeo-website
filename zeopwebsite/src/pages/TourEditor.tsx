
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Star,
  Camera,
  Calendar,
  X,
  Mountain,
  Menu,
  ChevronUp,
  ChevronDown,
  Copy,
  Bed,
  Utensils,
  Upload,
  Image,
  Eye,
  MapPin,
  Search,
  Activity,
  FileJson
} from 'lucide-react';
import ProgressModal from '../components/UI/ProgressModal';
import AdminSidebar from '../components/Admin/AdminSidebar';
import LoadingSpinner from '../components/UI/LoadingSpinner';

// API base URL helper function
const getApiBaseUrl = (): string => {
  // Check if we're in production (deployed)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for production
    return `${window.location.protocol}//${window.location.host}/api`;
  }

  // Development environment - use relative URL to leverage Vite proxy
  return '/api';
};

// Image base URL helper function
const getImageBaseUrl = (): string => {
  // Check if we're in production (deployed)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Use the same domain as the frontend for production
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Development environment - use relative URL to leverage Vite proxy
  return '';
};

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
}

interface Activity {
  name: string;
  description: string;
}

interface TourDetails {
  id?: number;
  slug: string;
  title: string;
  description: string;
  location?: string;
  category?: string;
  price: number;
  hasDiscount?: boolean; // Whether the tour has a discount
  discountPercentage?: number; // Discount percentage (e.g., 25 for 25% off)
  priceAvailable?: boolean; // Controls whether price is displayed to users
  duration: string;
  group_size: string;
  best_time: string;
  image: string;
  gallery?: string[];
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  activities?: Activity[];
  itinerary?: ItineraryDay[];

  fitness_requirements?: string;
  // Relationship fields - Primary + Secondary Destinations
  primary_destination_id?: number;
  secondary_destination_ids?: number[];
  activity_ids?: number[];
  related_destinations?: string[];
  related_activities?: string[];
  featured?: boolean;
}

const TourEditor: React.FC = () => {
  const params = useParams<{ tourSlug?: string; tourId?: string; id?: string }>();
  const navigate = useNavigate();

  // Try to get the tour identifier from various possible param names
  const tourId = params.tourSlug || params.tourId || params.id || 'new';
  const isEditing = tourId !== 'new';


  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simple fetch for destinations and activities
  const [destinations, setDestinations] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [destSearch, setDestSearch] = useState('');
  const [destRegionFilter, setDestRegionFilter] = useState<'nepal' | 'international'>('nepal');
  const [actSearch, setActSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destResponse, actResponse] = await Promise.all([
          fetch(`${getApiBaseUrl()}/destinations?includeUnlisted=true`),
          fetch(`${getApiBaseUrl()}/activities`)
        ]);

        if (destResponse.ok) {
          const destData = await destResponse.json();
          setDestinations(destData);
        }

        if (actResponse.ok) {
          const actData = await actResponse.json();
          setActivities(actData);
        }
      } catch (error) {
        // Error fetching reference data
      }
    };

    fetchData();
  }, []);

  // Progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressStatus, setProgressStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [progressValue, setProgressValue] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Import JSON state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');

  // Paste Itinerary state
  const [showItineraryPasteModal, setShowItineraryPasteModal] = useState(false);
  const [itineraryPasteText, setItineraryPasteText] = useState('');

  const [formData, setFormData] = useState<TourDetails>({
    slug: '',
    title: '',
    description: '',
    price: 0,
    duration: '',
    group_size: '',
    best_time: '',
    image: '',
    gallery: [],
    highlights: [],
    inclusions: [],
    exclusions: [],
    activities: [],
    itinerary: [],

    fitness_requirements: '',
    primary_destination_id: undefined,
    secondary_destination_ids: [],
    activity_ids: [],
    related_destinations: [],
    related_activities: []
  });


  useEffect(() => {
    // Check authentication and get user data
    const userData = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');

    if (userData && token) {
      try {
        setUser(JSON.parse(userData));

        if (isEditing && tourId && tourId !== 'new') {
          fetchTourDetails();
        }
      } catch (error) {
        navigate('/admin/login');
      }
    } else {
      navigate('/admin/login');
    }
  }, [tourId, isEditing, navigate]);

  // Disabled auto-detection to prevent automatic selection of all destinations and activities
  // Auto-detection was too aggressive and selecting everything
  // Users should manually select destinations and activities

  // Auto-detect destinations based on tour location
  const autoDetectDestinations = (tourDetails: any) => {
    if (!destinations || destinations.length === 0) return { primary: undefined, secondary: [], names: [] };

    const location = tourDetails.location?.toLowerCase() || '';
    const title = tourDetails.title?.toLowerCase() || '';

    let primaryDestination: number | undefined = undefined;
    const secondaryDestinations: number[] = [];
    const destinationNames: string[] = [];

    // Find matching destinations based on location or title
    destinations.forEach((dest: any) => {
      const destName = dest.name.toLowerCase();
      const destCountry = (dest as any).country?.toLowerCase() || '';

      // More flexible matching with specific keyword detection
      const locationParts = location.split(',').map((part: string) => part.trim().toLowerCase());
      const titleWords = title.split(' ').map((word: string) => word.toLowerCase());

      const isMatch =
        location.includes(destName) || title.includes(destName) ||
        location.includes(destCountry) || title.includes(destCountry) ||
        locationParts.some((part: string) => part.includes(destName) || destName.includes(part)) ||
        titleWords.some((word: string) => word.includes(destName) || destName.includes(word)) ||
        // Special cases for common destination mappings
        (location.includes('kailash') && destName === 'tibet') ||
        (location.includes('tibet') && destName === 'tibet') ||
        (location.includes('everest') && destName === 'everest') ||
        (location.includes('annapurna') && destName === 'annapurna') ||
        (location.includes('langtang') && destName === 'langtang') ||
        (location.includes('pokhara') && destName === 'pokhara') ||
        (location.includes('kathmandu') && destName === 'kathmandu') ||
        (location.includes('chitwan') && destName === 'chitwan');

      if (isMatch) {
        if (primaryDestination === undefined) {
          primaryDestination = dest.id;
          destinationNames.push(dest.name);
        } else {
          secondaryDestinations.push(dest.id);
          destinationNames.push(dest.name);
        }
      }
    });

    return {
      primary: primaryDestination,
      secondary: secondaryDestinations,
      names: destinationNames
    };
  };

  // Auto-detect activities based on tour category and description
  const autoDetectActivities = (tourDetails: any) => {
    if (!activities || activities.length === 0) return { ids: [], names: [] };

    const category = tourDetails.category?.toLowerCase() || '';
    const description = tourDetails.description?.toLowerCase() || '';
    const title = tourDetails.title?.toLowerCase() || '';

    const activityIds: number[] = [];
    const activityNames: string[] = [];

    // Find matching activities based on category, title, or description
    activities.forEach((activity: any) => {
      const activityName = activity.name.toLowerCase();
      const activityType = (activity as any).type?.toLowerCase() || '';

      // More flexible matching for activities
      const isMatch =
        category.includes(activityName) || category.includes(activityType) ||
        title.includes(activityName) || description.includes(activityName) ||
        title.includes(activityType) || description.includes(activityType) ||
        activityName.includes(category) || activityType.includes(category) ||
        // Special cases for common activity mappings
        (category.includes('pilgrimage') && activityName.includes('spiritual')) ||
        (category.includes('luxury') && activityName.includes('cultural')) ||
        (category.includes('trek') && activityName.includes('trekking')) ||
        (category.includes('cultural') && activityName.includes('cultural'));

      if (isMatch) {
        activityIds.push(activity.id);
        activityNames.push(activity.name);
      }
    });

    return {
      ids: activityIds,
      names: activityNames
    };
  };

  const fetchTourDetails = async () => {
    if (!tourId || tourId === 'new') return;

    setLoading(true);
    try {
      // Check if tourId is a number (ID) or string (slug)
      const isNumericId = /^\d+$/.test(tourId);
      const endpoint = isNumericId
        ? `/api/admin/tours/${tourId}`
        : `/api/admin/tours/slug/${tourId}`;

      const token = localStorage.getItem('adminToken');
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const details = await response.json();

        // Auto-detect destinations and activities if not already set
        const autoDetectedDestinations = autoDetectDestinations(details);
        const autoDetectedActivities = autoDetectActivities(details);

        // Ensure relationship fields are properly initialized
        const formattedDetails = {
          ...details,
          // Parse duration to extract numeric value (e.g., "13 days" -> "13")
          duration: typeof details.duration === 'string'
            ? details.duration.replace(/[^\d]/g, '') || details.duration
            : details.duration,
          primary_destination_id: details.primary_destination_id || details.destination_id || details.destination_ids?.[0] || autoDetectedDestinations.primary,
          secondary_destination_ids: details.secondary_destination_ids || autoDetectedDestinations.secondary,
          activity_ids: details.activity_ids || autoDetectedActivities.ids,
          related_destinations: details.related_destinations || autoDetectedDestinations.names,
          related_activities: details.related_activities || autoDetectedActivities.names,
          gallery: details.gallery || [],
          highlights: details.highlights || [],
          inclusions: details.inclusions || [],
          exclusions: details.exclusions || [],
          activities: details.activities || [],
          itinerary: details.itinerary || []
        };

        setFormData(formattedDetails);
      } else {
        await response.text();
        throw new Error(`Failed to fetch tour details: ${response.status}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch tour details');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        // Auto-generate slug when title changes
        if (name === 'title') {
          updated.slug = generateSlug(value);
        }
        return updated;
      });
    }
  };

  const handleArrayChange = (field: keyof TourDetails, index: number, value: string) => {
    setFormData(prev => {
      const array = (prev[field] as string[]) || [];
      const newArray = [...array];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: keyof TourDetails) => {
    setFormData(prev => {
      const array = (prev[field] as string[]) || [];
      return { ...prev, [field]: [...array, ''] };
    });
  };

  const removeArrayItem = (field: keyof TourDetails, index: number) => {
    setFormData(prev => {
      const array = (prev[field] as string[]) || [];
      const newArray = array.filter((_, i) => i !== index);
      return { ...prev, [field]: newArray };
    });
  };

  const handlePasteAsArray = (
    e: React.ClipboardEvent,
    field: keyof TourDetails,
    index: number
  ) => {
    // Get the pasted data
    const pastedText = e.clipboardData.getData('text');
    // Split by newline and filter out empty lines
    const lines = pastedText.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');

    // Only intervene if we have multiple lines
    if (lines.length > 1) {
      e.preventDefault();
      setFormData(prev => {
        const array = (prev[field] as string[]) || [];
        const newArray = [...array];

        // Replace the current item with the first line
        newArray[index] = lines[0];

        // Insert the rest of the lines after the current index
        if (lines.length > 1) {
          newArray.splice(index + 1, 0, ...lines.slice(1));
        }

        return { ...prev, [field]: newArray };
      });
    }
  };

  // Function to clear all gallery images
  const clearAllGalleryImages = async () => {
    if (!confirm('Remove all gallery images?')) return;

    try {
      // Delete all images from server if editing existing tour
      if (isEditing && tourId && tourId !== 'new' && formData.gallery) {
        const token = localStorage.getItem('adminToken');

        for (const imageUrl of formData.gallery) {
          const filename = imageUrl.split('/').pop();
          if (filename && !imageUrl.startsWith('http')) {
            try {
              await fetch(`${getApiBaseUrl()}/admin/tours/${tourId}/gallery/${filename}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
            } catch (error) {
              console.error('Error deleting image:', filename, error);
            }
          }
        }
      }

      // Clear from local state
      setFormData(prev => ({ ...prev, gallery: [] }));

    } catch (error) {
      console.error('Error clearing gallery images:', error);
      // Still clear from UI even if server deletion fails
      setFormData(prev => ({ ...prev, gallery: [] }));
    }
  };
  const removeGalleryImage = async (index: number) => {
    const imageUrl = formData.gallery?.[index];
    if (!imageUrl) return;

    try {
      // Extract filename from URL
      const filename = imageUrl.split('/').pop();
      if (!filename || imageUrl.startsWith('http')) {
        // For external URLs or if we can't extract filename, just remove from array
        removeArrayItem('gallery', index);
        return;
      }

      // Only call API for uploaded files if we're editing an existing tour
      if (isEditing && tourId && tourId !== 'new') {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${getApiBaseUrl()}/admin/tours/${tourId}/gallery/${filename}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete image from server');
        }

        console.log('Image deleted from server:', filename);
      }

      // Remove from local state
      removeArrayItem('gallery', index);

    } catch (error) {
      console.error('Error deleting gallery image:', error);
      // Still remove from UI even if server deletion fails
      removeArrayItem('gallery', index);
    }
  };


  const handleJsonImport = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!importJson.trim()) return;

      const parsedData = JSON.parse(importJson);

      // Map the imported data to our form structure
      // We process it field by field to ensure type safety
      const newFormData: TourDetails = { ...formData };

      // Basic string/number fields
      if (parsedData.title) newFormData.title = parsedData.title;
      if (parsedData.slug) newFormData.slug = parsedData.slug;
      else if (parsedData.title) newFormData.slug = generateSlug(parsedData.title);

      if (parsedData.description) newFormData.description = parsedData.description;
      if (parsedData.price) newFormData.price = Number(parsedData.price) || 0;
      if (parsedData.duration) newFormData.duration = String(parsedData.duration);
      if (parsedData.group_size) newFormData.group_size = parsedData.group_size;
      if (parsedData.best_time) newFormData.best_time = parsedData.best_time;
      if (parsedData.fitness_requirements) newFormData.fitness_requirements = parsedData.fitness_requirements;

      // Boolean fields
      if (parsedData.priceAvailable !== undefined) newFormData.priceAvailable = parsedData.priceAvailable;
      if (parsedData.hasDiscount !== undefined) newFormData.hasDiscount = parsedData.hasDiscount;
      if (parsedData.discountPercentage) newFormData.discountPercentage = Number(parsedData.discountPercentage);

      // Arrays
      if (Array.isArray(parsedData.gallery)) newFormData.gallery = parsedData.gallery;
      if (Array.isArray(parsedData.highlights)) newFormData.highlights = parsedData.highlights;
      if (Array.isArray(parsedData.inclusions)) newFormData.inclusions = parsedData.inclusions;
      if (Array.isArray(parsedData.exclusions)) newFormData.exclusions = parsedData.exclusions;
      if (Array.isArray(parsedData.related_destinations)) newFormData.related_destinations = parsedData.related_destinations;
      if (Array.isArray(parsedData.related_activities)) newFormData.related_activities = parsedData.related_activities;

      // Complex objects
      if (Array.isArray(parsedData.itinerary)) {
        newFormData.itinerary = parsedData.itinerary.map((day: any, index: number) => ({
          day: day.day || index + 1,
          title: day.title || '',
          description: day.description || '',
          accommodation: day.accommodation || '',
          meals: day.meals || ''
        }));
      }

      // Handle relationships if ID's are present
      if (parsedData.primary_destination_id) newFormData.primary_destination_id = parsedData.primary_destination_id;
      if (parsedData.secondary_destination_ids) newFormData.secondary_destination_ids = parsedData.secondary_destination_ids;
      if (parsedData.activity_ids) newFormData.activity_ids = parsedData.activity_ids;

      // If we imported relationships by name but not ID, we could try to auto-detect ID's here,
      // but the auto-detect logic runs on save or load usually.

      setFormData(newFormData);
      setShowImportModal(false);
      setImportJson('');

      // Show success feedback?
      alert('Tour data imported successfully! Please review the details.');

    } catch (error) {
      alert('Invalid JSON format. Please check your data.');
    }
  };

  const handleItineraryPaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itineraryPasteText.trim()) return;

    try {
      const days: ItineraryDay[] = [];
      const lines = itineraryPasteText.split(/\r?\n/);
      let currentDay: ItineraryDay | null = null;
      let currentDescription: string[] = [];

      // Regex to match "Day 1", "Day 01", "Day 1:", "Day 1 -", etc.
      // Matches "Day" followed by a number, then optionally separator and title
      const dayRegex = /^Day\s+(\d+)(?:[:\.-]?\s*(.*))?/i;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          // Keep empty lines in description for formatting if we are inside a day
          if (currentDay && currentDescription.length > 0) {
            currentDescription.push('');
          }
          continue;
        }

        const match = trimmedLine.match(dayRegex);

        // Check if this line looks like a new day header
        if (match) {
          // If we were processing a day, save it
          if (currentDay) {
            currentDay.description = currentDescription.join('\n').trim();
            days.push(currentDay);
          }

          // Start new day
          const dayNum = parseInt(match[1]);
          // Title might be captured in the second group, or it might be empty
          let title = match[2] ? match[2].trim() : '';

          // If the title starts with "-" or ":", remove it (in case regex didn't catch it cleanly)
          if (title.startsWith('-') || title.startsWith(':')) {
            title = title.substring(1).trim();
          }

          currentDay = {
            day: dayNum,
            title: title,
            description: '',
            accommodation: '',
            meals: ''
          };
          currentDescription = [];
        } else if (currentDay) {
          // Check for specific fields (Accommodation, Meals)
          const accommodationMatch = trimmedLine.match(/^(?:Accommodation|Overnight|Hotel|Lodge|Guesthouse|Teahouse|Camp|Stay)(?:\s*(?:at|in))?\s*[:|-]?\s*(.*)/i);
          const mealsMatch = trimmedLine.match(/^(?:Meals|Meal Plan|Food)\s*[:|-]?\s*(.*)/i);

          if (accommodationMatch && accommodationMatch[1]) {
            currentDay.accommodation = accommodationMatch[1].trim();
          } else if (mealsMatch && mealsMatch[1]) {
            currentDay.meals = mealsMatch[1].trim();
          } else {
            // Append to current description if we are in a day block

            // Heuristic: If the title is currently empty, and this is the first line of content,
            // treat this line as the title instead of description.
            if (!currentDay.title && currentDescription.length === 0) {
              currentDay.title = trimmedLine;
            } else {
              currentDescription.push(trimmedLine);
            }
          }
        }
      }

      // Push the last day
      if (currentDay) {
        currentDay.description = currentDescription.join('\n').trim();
        days.push(currentDay);
      }

      if (days.length > 0) {
        // Sort by day number just in case
        days.sort((a, b) => a.day - b.day);

        setFormData(prev => ({
          ...prev,
          itinerary: days
        }));
        setShowItineraryPasteModal(false);
        setItineraryPasteText('');
        // Optional: Update duration if it's currently unset or different? 
        // Better leave duration manual or prompt user.
        alert(`Successfully parsed and imported ${days.length} days into the itinerary!`);
      } else {
        alert('Could not identify any days. Please ensure your text has lines like "Day 1: Title".');
      }
    } catch (error) {
      console.error('Error parsing itinerary:', error);
      alert('An error occurred while parsing the itinerary.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Show progress modal
    setShowProgressModal(true);
    setProgressStatus('loading');
    setProgressValue(0);
    setProgressMessage('Preparing to save tour...');

    try {
      // Step 1: Validate data
      setProgressValue(25);
      setProgressMessage('Validating tour data...');

      // Simple validation - only check title
      if (!formData.title.trim()) {
        throw new Error('Tour title is required.');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Prepare API call
      setProgressValue(50);
      setProgressMessage('Updating tour information...');

      const token = localStorage.getItem('adminToken');

      // For editing, we need to determine if we should use slug or ID endpoint
      // Check if tourId is a number (ID) or string (slug)
      const isNumericId = /^\d+$/.test(tourId || '');

      let url;
      if (isEditing && tourId && tourId !== 'new') {
        if (formData.id) {
          // If we have the ID from formData, use it (most reliable)
          url = `/api/admin/tours/${formData.id}`;
        } else if (isNumericId) {
          // Use ID endpoint
          url = `/api/admin/tours/${tourId}`;
        } else {
          // Use slug endpoint for updates
          url = `/api/admin/tours/slug/${tourId}`;
        }
      } else {
        // Creating new tour
        url = `/api/admin/tours`;
      }

      const method = isEditing && tourId && tourId !== 'new' ? 'PUT' : 'POST';

      // Step 3: Make API call
      setProgressValue(75);
      setProgressMessage('Generating tour details...');

      // Prepare tour data with relationships
      const tourData = {
        ...formData,
        // Format duration properly - if it's just a number, add "days"
        duration: formData.duration && !String(formData.duration).includes('day')
          ? `${formData.duration} days`
          : String(formData.duration),
        // Ensure relationships are properly formatted
        primary_destination_id: formData.primary_destination_id || undefined,
        secondary_destination_ids: formData.secondary_destination_ids || [],
        activity_ids: formData.activity_ids || [],
        related_destinations: formData.related_destinations || [],
        related_activities: formData.related_activities || []
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(tourData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save tour');
      }

      const updatedTour = await response.json();

      // Update URL if slug changed (or new tour created) to prevent 404 on refresh
      if (updatedTour.slug && updatedTour.slug !== tourId) {
        navigate(`/admin/tours/${updatedTour.slug}`, { replace: true });
      }

      // Step 4: Complete
      setProgressValue(100);
      setProgressMessage('Finalizing changes...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Success
      setProgressStatus('success');
      setProgressMessage('Tour saved successfully! What would you like to do next?');

    } catch (error) {
      setProgressStatus('error');
      setProgressMessage(error instanceof Error ? error.message : 'Failed to save tour');
      setError(error instanceof Error ? error.message : 'Failed to save tour');

      // Auto-close error modal after 3 seconds
      setTimeout(() => {
        setShowProgressModal(false);
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  // Validation helper functions
  const hasRequiredDestinations = () => {
    return formData.primary_destination_id || (formData.secondary_destination_ids && formData.secondary_destination_ids.length > 0);
  };

  const hasRequiredActivities = () => {
    return formData.activity_ids && formData.activity_ids.length > 0;
  };

  const isFormValid = () => {
    // Simple validation - just check if we have a title (most basic requirement)
    return formData.title.trim().length > 0;
  };


  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    {
      id: 'relationships',
      label: 'Destinations & Activities',
      icon: MapPin,
      hasError: !hasRequiredDestinations() || !hasRequiredActivities(),
      errorCount: (!hasRequiredDestinations() ? 1 : 0) + (!hasRequiredActivities() ? 1 : 0)
    },
    { id: 'details', label: 'Details', icon: Star },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'media', label: 'Media', icon: Camera }
  ];

  const handleItineraryChange = (index: number, field: keyof ItineraryDay, value: string | number) => {
    setFormData(prev => {
      const itinerary = [...(prev.itinerary || [])];
      itinerary[index] = { ...itinerary[index], [field]: value };
      return { ...prev, itinerary };
    });
  };

  // Image upload functionality
  const handleImageUpload = async (file: File, isGallery: boolean = false) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      // Use the tour slug for folder organization, fallback to title or 'general'
      const slugForFolder = formData.slug || (formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'general');
      uploadData.append('tourSlug', slugForFolder);

      const token = localStorage.getItem('adminToken');

      // Use the dedicated tour upload endpoint
      const response = await fetch(`${getApiBaseUrl()}/admin/uploads/tours`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();

      if (isGallery) {
        // Add to gallery
        setFormData(prev => ({
          ...prev,
          gallery: [...(prev.gallery || []), result.url]
        }));
      } else {
        // Set as main image
        setFormData(prev => ({
          ...prev,
          image: result.url
        }));
      }

      setUploadProgress(100);
    } catch (error) {
      alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent, isGallery: boolean = false) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      if (isGallery && imageFiles.length > 1) {
        // Handle multiple files for gallery
        imageFiles.forEach((file, index) => {
          setTimeout(() => handleImageUpload(file, isGallery), index * 500);
        });
      } else {
        handleImageUpload(imageFiles[0], isGallery);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      if (isGallery && imageFiles.length > 1) {
        // Handle multiple files for gallery
        imageFiles.forEach((file, index) => {
          setTimeout(() => handleImageUpload(file, isGallery), index * 500);
        });
      } else {
        handleImageUpload(imageFiles[0], isGallery);
      }
    }

    // Reset the input value to allow selecting the same files again
    e.target.value = '';
  };

  const addItineraryDay = () => {
    const nextDay = (formData.itinerary?.length || 0) + 1;
    setFormData(prev => ({
      ...prev,
      itinerary: [...(prev.itinerary || []), {
        day: nextDay,
        title: '',
        description: '',
        accommodation: '',
        meals: ''
      }]
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: (prev.itinerary || []).filter((_, i) => i !== index).map((day, i) => ({
        ...day,
        day: i + 1 // Renumber days
      }))
    }));
  };

  const moveItineraryDay = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const itinerary = [...(prev.itinerary || [])];
      const newIndex = direction === 'up' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= itinerary.length) return prev;

      // Swap items
      [itinerary[index], itinerary[newIndex]] = [itinerary[newIndex], itinerary[index]];

      // Renumber days
      const renumbered = itinerary.map((day, i) => ({ ...day, day: i + 1 }));

      return { ...prev, itinerary: renumbered };
    });
  };

  const duplicateItineraryDay = (index: number) => {
    setFormData(prev => {
      const itinerary = [...(prev.itinerary || [])];
      const dayToDuplicate = { ...itinerary[index] };
      dayToDuplicate.day = itinerary.length + 1;
      dayToDuplicate.title = `${dayToDuplicate.title} (Copy)`;

      return { ...prev, itinerary: [...itinerary, dayToDuplicate] };
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading tour details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isMobile && !sidebarOpen ? '-100%' : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`bg-slate-800 text-white ${sidebarOpen ? 'w-64' : 'w-16'} fixed left-0 top-0 h-full z-40 overflow-visible`}
      >
        <AdminSidebar
          activeKey={'tours'}
          mode={'links'}
          linkBase={'/admin/dashboard'}
          sidebarOpen={sidebarOpen}
          user={user}
          onLogout={handleLogout}
        />
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isMobile ? (sidebarOpen ? 'ml-64' : 'ml-0') : (sidebarOpen ? 'ml-64' : 'ml-16')}`}>
        {/* Top Bar with Integrated Tab Navigation */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
          {/* Main Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <Link
                    to="/admin/dashboard?tab=tours"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      {isEditing ? 'Edit Tour' : 'Create New Tour'}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {isEditing ? 'Update tour information and details' : 'Add a new tour to your collection'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard?tab=tours')}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4" />
                  Import JSON
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isFormValid()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                  title={!isFormValid() ? 'Please complete all required fields and select destinations & activities' : ''}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {isEditing ? 'Update' : 'Create'} Tour
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation - Integrated in Header */}
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const hasError = (tab as any).hasError;
                const errorCount = (tab as any).errorCount;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-green-600 text-gray-500'
                      : hasError
                        ? 'border-transparent text-red-500 hover:text-red-700 hover:border-red-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {hasError && errorCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {errorCount}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Tab Content */}
          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tour Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Everest Base Camp Trek"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug (Auto-generated)
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                        placeholder="everest-base-camp-trek"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Describe the tour experience..."
                    />
                  </div>

                  {/* Category and difficulty are now derived from activities, so these fields are removed */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (Days) *
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="365"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 14"
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of days for the tour</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (USD) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Display
                      </label>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="priceAvailable"
                            checked={formData.priceAvailable !== false}
                            onChange={(e) => setFormData(prev => ({ ...prev, priceAvailable: e.target.checked }))}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                          />
                          <span className="ml-2 text-sm text-gray-700">Show price to customers</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        When unchecked, customers will see "Request Price" instead of the actual price
                      </p>
                    </div>

                    {/* Discount Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Settings
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="hasDiscount"
                              checked={formData.hasDiscount || false}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                hasDiscount: e.target.checked,
                                // Clear discount fields if unchecked
                                ...(e.target.checked ? {} : { discountPercentage: undefined })
                              }))}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <span className="ml-2 text-sm text-gray-700">This tour has a discount</span>
                          </label>
                        </div>

                        {formData.hasDiscount && (
                          <div className="ml-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Percentage *
                              </label>
                              <input
                                type="number"
                                name="discountPercentage"
                                value={formData.discountPercentage || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="e.g., 25"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        When enabled, customers will see the discount badge and the discounted price (main price will be treated as original price)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Size *
                      </label>
                      <input
                        type="text"
                        name="group_size"
                        value={formData.group_size}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 2-12 people"
                      />
                    </div>
                  </div>

                  {/* Best Time Section - Full Width */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Best Time to Visit *
                    </label>
                    <div className="space-y-4">
                      <p className="text-xs text-gray-500">Click on months to select the best time for this tour</p>

                      {/* Month Selection Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                        {[
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ].map((month) => {
                          const selectedMonths = formData.best_time ? formData.best_time.split(', ').filter(m => m.trim()) : [];
                          const isSelected = selectedMonths.includes(month);

                          return (
                            <button
                              key={month}
                              type="button"
                              onClick={() => {
                                const currentMonths = formData.best_time ? formData.best_time.split(', ').filter(m => m.trim()) : [];
                                let newMonths;

                                if (isSelected) {
                                  // Remove month
                                  newMonths = currentMonths.filter(m => m !== month);
                                } else {
                                  // Add month in chronological order
                                  const allMonths = [
                                    'January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December'
                                  ];
                                  newMonths = [...currentMonths, month].sort((a, b) =>
                                    allMonths.indexOf(a) - allMonths.indexOf(b)
                                  );
                                }

                                setFormData(prev => ({
                                  ...prev,
                                  best_time: newMonths.join(', ')
                                }));
                              }}
                              className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${isSelected
                                ? 'bg-green-500 text-white border-green-500 shadow-md transform scale-105'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-700'
                                }`}
                            >
                              {month.substring(0, 3)}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick selection buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              best_time: 'March, April, May'
                            }));
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          Spring (Mar-May)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              best_time: 'September, October, November'
                            }));
                          }}
                          className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                        >
                          Autumn (Sep-Nov)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              best_time: 'March, April, May, September, October, November'
                            }));
                          }}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                        >
                          Peak Season
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              best_time: ''
                            }));
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>

                      {/* Selected months display */}
                      {formData.best_time && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Selected Months:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.best_time.split(', ').filter(m => m.trim()).map((month, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300"
                              >
                                {month}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const months = formData.best_time.split(', ').filter(m => m.trim() && m !== month);
                                    setFormData(prev => ({
                                      ...prev,
                                      best_time: months.join(', ')
                                    }));
                                  }}
                                  className="ml-2 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          {formData.best_time.split(', ').filter(m => m.trim()).length === 0 && (
                            <p className="text-sm text-gray-500 italic">No months selected</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Removed rating, reviews, and featured fields */}

                  {/* Main Image Upload Section */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Main Image *
                    </label>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Upload Area */}
                      <div>
                        <div
                          onDrop={(e) => handleDrop(e, false)}
                          onDragOver={(e) => e.preventDefault()}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Upload Image</h4>
                          <p className="text-xs text-gray-600 mb-3">Drag and drop or click to browse</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, false)}
                            className="hidden"
                            id="basic-image-upload"
                          />
                          <label
                            htmlFor="basic-image-upload"
                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer inline-flex items-center gap-2 text-sm"
                          >
                            <Camera className="w-4 h-4" />
                            Choose Image
                          </label>
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* URL Input Alternative */}
                        <div className="mt-4">
                          <label className="block text-xs font-medium text-gray-600 mb-2">
                            Or enter image URL
                          </label>
                          <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>

                      {/* Image Preview */}
                      <div>
                        {formData.image ? (
                          <div className="relative">
                            <img
                              src={formData.image.startsWith('http') ? formData.image : `${getImageBaseUrl()}${formData.image}`}
                              alt="Main tour image preview"
                              className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
                              }}
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => window.open(formData.image, '_blank')}
                                className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors"
                                title="View full size"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                className="bg-red-500 bg-opacity-80 text-white p-2 rounded-lg hover:bg-opacity-100 transition-colors"
                                title="Remove image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                              Main Image
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="text-center">
                              <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No image selected</p>
                              <p className="text-xs text-gray-400">Upload or enter URL above</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Status & Visibility Tab */}
              {activeTab === 'details' && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Visibility Status</h3>
                      <p className="text-sm text-gray-500">Manage how this tour appears on the website</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Featured Checkbox */}
                    <label className="flex items-center space-x-2 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-colors border border-gray-100 hover:border-yellow-200">
                      <input
                        type="checkbox"
                        checked={formData.featured || false}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500 cursor-pointer"
                      />
                      <div>
                        <span className="block font-medium text-gray-900">Featured Tour</span>
                        <span className="block text-xs text-gray-500">Show in featured sections and first in lists</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Relationships Tab */}
              {activeTab === 'relationships' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Related Destinations */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Mountain className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Related Destinations *</h3>
                        <p className="text-sm text-gray-500">Select destinations that this tour visits or relates to</p>
                        {!hasRequiredDestinations() && (
                          <div className="mt-2 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">At least one destination must be selected</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      {/* Search Destinations */}
                      <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search destinations..."
                          value={destSearch}
                          onChange={(e) => setDestSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        />
                      </div>

                      {/* Region Filter */}
                      <div className="flex gap-2">
                        {(['nepal', 'international'] as const).map((region) => (
                          <button
                            key={region}
                            type="button"
                            onClick={() => setDestRegionFilter(region)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${destRegionFilter === region
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            {region.charAt(0).toUpperCase() + region.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                      {destinations?.filter(d => {
                        const matchesSearch = d.name.toLowerCase().includes(destSearch.toLowerCase()) ||
                          (d.country && d.country.toLowerCase().includes(destSearch.toLowerCase()));
                        const matchesRegion = (destRegionFilter === 'nepal' && (d.type === 'nepal' || d.country === 'Nepal')) ||
                          (destRegionFilter === 'international' && (d.type === 'international' || d.country !== 'Nepal'));
                        return matchesSearch && matchesRegion;
                      }).map((destination: any) => {
                        const isPrimary = formData.primary_destination_id === destination.id;
                        const isSecondary = formData.secondary_destination_ids?.includes(destination.id);

                        return (
                          <div
                            key={destination.id}
                            onClick={() => {
                              const secondaryIds = formData.secondary_destination_ids || [];
                              const relatedDestinations = formData.related_destinations || [];

                              if (isPrimary) {
                                setFormData(prev => ({
                                  ...prev,
                                  primary_destination_id: undefined,
                                  related_destinations: relatedDestinations.filter(name => name !== destination.name)
                                }));
                              } else if (isSecondary) {
                                setFormData(prev => ({
                                  ...prev,
                                  secondary_destination_ids: secondaryIds.filter(id => id !== destination.id),
                                  related_destinations: relatedDestinations.filter(name => name !== destination.name)
                                }));
                              } else {
                                if (!formData.primary_destination_id) {
                                  setFormData(prev => ({
                                    ...prev,
                                    primary_destination_id: destination.id,
                                    related_destinations: [...relatedDestinations, destination.name]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    secondary_destination_ids: [...secondaryIds, destination.id],
                                    related_destinations: [...relatedDestinations, destination.name]
                                  }));
                                }
                              }
                            }}
                            className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${isPrimary
                              ? 'border-primary bg-primary/10 shadow-md'
                              : isSecondary
                                ? 'border-secondary bg-secondary/10 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }`}
                          >
                            <div className="p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate text-sm">{destination.name}</h4>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  {isPrimary && (
                                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center" title="Primary Destination">
                                      <span className="text-white text-[10px] font-bold">P</span>
                                    </div>
                                  )}
                                  {isSecondary && (
                                    <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center" title="Secondary Destination">
                                      <span className="text-white text-[10px] font-bold">S</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(!destinations || destinations.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Mountain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No destinations available. Create destinations first.</p>
                      </div>
                    )}
                  </div>

                  {/* Related Activities */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Related Activities *</h3>
                        <p className="text-sm text-gray-500">Select activities that are part of this tour</p>
                        {!hasRequiredActivities() && (
                          <div className="mt-2 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">At least one activity must be selected</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      {/* Search Activities */}
                      <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search activities..."
                          value={actSearch}
                          onChange={(e) => setActSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
                      {activities?.filter(act => {
                        const matchesSearch = act.name.toLowerCase().includes(actSearch.toLowerCase());
                        return matchesSearch;
                      }).map((activity: any) => {
                        const isSelected = formData.activity_ids?.includes(activity.id) ||
                          formData.related_activities?.includes(activity.name);
                        return (
                          <div
                            key={activity.id}
                            onClick={() => {
                              const activityIds = formData.activity_ids || [];
                              const relatedActivities = formData.related_activities || [];

                              if (isSelected) {
                                setFormData(prev => ({
                                  ...prev,
                                  activity_ids: activityIds.filter(id => id !== activity.id),
                                  related_activities: relatedActivities.filter(name => name !== activity.name)
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  activity_ids: [...activityIds, activity.id],
                                  related_activities: [...relatedActivities, activity.name]
                                }));
                              }
                            }}
                            className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${isSelected
                              ? 'border-secondary bg-secondary/10 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }`}
                          >
                            <div className="p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate text-sm">{activity.name}</h4>
                                </div>
                                {isSelected && (
                                  <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {(!activities || activities.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No activities available. Create activities first.</p>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationship Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Primary Destination</h4>
                        <div className="space-y-1">
                          {formData.primary_destination_id ? (
                            <div className="text-sm text-gray-600 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block mr-2 mb-1">
                              <span className="text-primary font-medium">P</span> {destinations?.find((d: any) => d.id === formData.primary_destination_id)?.name}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No primary destination selected</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Secondary Destinations ({formData.secondary_destination_ids?.length || 0})</h4>
                        <div className="space-y-1">
                          {formData.secondary_destination_ids?.length ? (
                            formData.secondary_destination_ids.map((destId) => {
                              const dest = destinations?.find((d: any) => d.id === destId);
                              return dest ? (
                                <div key={destId} className="text-sm text-gray-600 bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-full inline-block mr-2 mb-1">
                                  <span className="text-secondary font-medium">S</span> {dest.name}
                                </div>
                              ) : null;
                            })
                          ) : (
                            <p className="text-sm text-gray-500">No secondary destinations selected</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Selected Activities ({formData.activity_ids?.length || 0})</h4>
                        <div className="space-y-1">
                          {formData.related_activities?.map((activity, index) => (
                            <div key={index} className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full inline-block mr-2 mb-1">
                              {activity}
                            </div>
                          )) || <p className="text-sm text-gray-500">No activities selected</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Highlights */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Tour Highlights</h3>
                      <button
                        type="button"
                        onClick={() => addArrayItem('highlights')}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(formData.highlights || []).map((highlight, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                            onPaste={(e) => handlePasteAsArray(e, 'highlights', index)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Tour highlight..."
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('highlights', index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!formData.highlights || formData.highlights.length === 0) && (
                        <p className="text-gray-500 text-sm">No highlights added yet. Click "Add" to add tour highlights.</p>
                      )}
                    </div>
                  </div>

                  {/* Inclusions */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">What's Included</h3>
                      <button
                        type="button"
                        onClick={() => addArrayItem('inclusions')}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(formData.inclusions || []).map((inclusion, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={inclusion}
                            onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                            onPaste={(e) => handlePasteAsArray(e, 'inclusions', index)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="What's included..."
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('inclusions', index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!formData.inclusions || formData.inclusions.length === 0) && (
                        <p className="text-gray-500 text-sm">No inclusions added yet. Click "Add" to add what's included.</p>
                      )}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">What's Not Included</h3>
                      <button
                        type="button"
                        onClick={() => addArrayItem('exclusions')}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(formData.exclusions || []).map((exclusion, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={exclusion}
                            onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                            onPaste={(e) => handlePasteAsArray(e, 'exclusions', index)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="What's not included..."
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('exclusions', index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!formData.exclusions || formData.exclusions.length === 0) && (
                        <p className="text-gray-500 text-sm">No exclusions added yet. Click "Add" to add what's not included.</p>
                      )}
                    </div>
                  </div>


                </motion.div>
              )}

              {/* Itinerary Tab */}
              {activeTab === 'itinerary' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Tour Itinerary</h2>
                      <p className="text-sm text-gray-600 mt-1">Create a detailed day-by-day itinerary for your tour</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowItineraryPasteModal(true)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 border border-blue-200"
                    >
                      <FileText className="w-4 h-4" />
                      Paste Itinerary
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(formData.itinerary || []).map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Day Header with Enhanced Controls */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                              {day.day}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">Day {day.day}</h3>
                              <p className="text-sm text-gray-600">Itinerary Details</p>
                            </div>
                          </div>

                          {/* Enhanced Action Buttons */}
                          <div className="flex items-center gap-2">
                            {/* Move Up/Down */}
                            <div className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => moveItineraryDay(index, 'up')}
                                disabled={index === 0}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItineraryDay(index, 'down')}
                                disabled={index === (formData.itinerary?.length || 0) - 1}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-t border-gray-200"
                                title="Move down"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => duplicateItineraryDay(index)}
                              className="p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                              title="Duplicate day"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => removeItineraryDay(index)}
                              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                              title="Delete day"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Enhanced Form Fields */}
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Day Title *
                            </label>
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-all"
                              placeholder="e.g., Arrival in Kathmandu"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Description *
                            </label>
                            <textarea
                              value={day.description}
                              onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                              rows={8}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm resize-y transition-all"
                              placeholder="Describe what happens on this day in detail..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {day.description.length} characters
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Bed className="w-4 h-4 text-gray-500" />
                                Accommodation
                              </label>
                              <input
                                type="text"
                                value={day.accommodation || ''}
                                onChange={(e) => handleItineraryChange(index, 'accommodation', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-all"
                                placeholder="e.g., Hotel in Kathmandu"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-gray-500" />
                                Meals
                              </label>
                              <input
                                type="text"
                                value={day.meals || ''}
                                onChange={(e) => handleItineraryChange(index, 'meals', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-all"
                                placeholder="e.g., Breakfast, Lunch, Dinner"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {(!formData.itinerary || formData.itinerary.length === 0) && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Itinerary Added</h3>
                        <p className="text-gray-600 mb-4">Start building your tour itinerary by adding the first day.</p>
                        <button
                          type="button"
                          onClick={addItineraryDay}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Plus className="w-4 h-4" />
                          Add First Day
                        </button>
                      </div>
                    )}

                    {/* Add Day Button - At the end of itinerary */}
                    {formData.itinerary && formData.itinerary.length > 0 && (
                      <div className="text-center pt-4">
                        <button
                          type="button"
                          onClick={addItineraryDay}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto shadow-sm"
                        >
                          <Plus className="w-5 h-5" />
                          Add Another Day
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Gallery Images</h2>
                    <p className="text-sm text-gray-600 mt-1">Upload images to showcase your tour</p>
                  </div>

                  {/* Simple Upload Section */}
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Gallery Images</h3>
                      <p className="text-gray-600 mb-4">Drag and drop images here or click to browse</p>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => handleImageUpload(file, true));
                        }}
                        className="hidden"
                        id="gallery-upload"
                      />
                      <label
                        htmlFor="gallery-upload"
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors cursor-pointer inline-flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Images
                      </label>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Upload className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Uploading...</span>
                        <span className="text-blue-600 font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Simple Gallery Grid */}
                  {(formData.gallery || []).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          Gallery ({(formData.gallery || []).length} images)
                        </h3>
                        <button
                          type="button"
                          onClick={clearAllGalleryImages}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-2"
                          disabled={(formData.gallery || []).length === 0}
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear All
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(formData.gallery || []).map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl.startsWith('http') ? imageUrl : `${getImageBaseUrl()}${imageUrl}`}
                              alt={`Gallery image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400';
                              }}
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                title="Remove image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {(!formData.gallery || formData.gallery.length === 0) && !uploading && (
                    <div className="text-center py-8 text-gray-500">
                      <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No images uploaded yet</p>
                      <p className="text-gray-600">Upload images to create a beautiful gallery for your tour</p>
                    </div>
                  )}
                </motion.div>
              )}
            </form>
          </div>
        </main >
      </div >

      {/* Progress Modal */}
      < ProgressModal
        isOpen={showProgressModal}
        title={isEditing ? 'Updating Tour' : 'Creating Tour'}
        message={progressMessage}
        progress={progressValue}
        status={progressStatus}
        onClose={() => setShowProgressModal(false)}
        showCloseButton={progressStatus === 'error'}
        actionButtons={progressStatus === 'success' ? [
          {
            label: 'View Tour',
            onClick: () => {
              setShowProgressModal(false);
              window.open(`/tours/${formData.slug}`, '_blank');
            },
            variant: 'primary'
          },
          {
            label: 'Back to Tours',
            onClick: () => {
              setShowProgressModal(false);
              navigate('/admin/dashboard?tab=tours');
            },
            variant: 'secondary'
          },
          {
            label: 'Continue Editing',
            onClick: () => {
              setShowProgressModal(false);
            },
            variant: 'secondary'
          }
        ] : []}
      />
      {/* Import JSON Modal */}
      {
        showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileJson className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Import Tour JSON</h3>
                    <p className="text-sm text-gray-500">Paste your tour data JSON below</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleJsonImport} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> You can paste a full JSON object here. Fields found in the JSON will overwrite the current form data.
                    </p>
                  </div>
                  <textarea
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    className="w-full h-96 p-4 font-mono text-sm bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`{
  "title": "Tour Title",
  "description": "Tour description...",
  "price": 1000,
  "duration": "10 days",
  "itinerary": [
    { "day": 1, "title": "Arrival", "description": "..." }
  ]
}`}
                    autoFocus
                  />
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!importJson.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    Parse & Import
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Paste Itinerary Modal */}
      {
        showItineraryPasteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Paste Itinerary</h3>
                    <p className="text-sm text-gray-500">Paste your raw itinerary text below</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowItineraryPasteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleItineraryPaste} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Instructions:</strong> Paste your itinerary text. We'll look for lines starting with "Day 1", "Day 2", etc. to separate the days.
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-mono">
                      Example:<br />
                      Day 1: Arrival in Kathmandu<br />
                      We pick you up from the airport...<br />
                      <br />
                      Day 2: Sightseeing<br />
                      ...
                    </p>
                  </div>
                  <textarea
                    value={itineraryPasteText}
                    onChange={(e) => setItineraryPasteText(e.target.value)}
                    className="w-full h-96 p-4 font-mono text-sm bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste your itinerary here..."
                    autoFocus
                  />
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => setShowItineraryPasteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!itineraryPasteText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Parse & Create Itinerary
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default TourEditor;
