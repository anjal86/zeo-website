const fs = require('fs');
const path = require('path');

// Read the original tours.json
const toursPath = path.join(__dirname, 'data', 'tours.json');
const originalData = JSON.parse(fs.readFileSync(toursPath, 'utf8'));

// Fields to keep for tour listings
const essentialFields = [
  'id',
  'slug', 
  'title',
  'category',
  'location',
  'price',
  'duration',
  'group_size',
  'difficulty',
  'rating',
  'reviews',
  'best_time',
  'featured',
  'listed',
  'image',
  // Pricing fields
  'hasDiscount',
  'discountPercentage', 
  'priceAvailable',
  'discount', // legacy field
  'originalPrice', // legacy field
  // Relationship fields
  'primary_destination_id',
  'secondary_destination_ids',
  'activity_ids',
  'related_destinations',
  'related_activities',
  // Timestamps
  'created_at',
  'updated_at'
];

// Simplify tours by keeping only essential fields
const simplifiedTours = originalData.tours.map(tour => {
  const simplifiedTour = {};
  
  essentialFields.forEach(field => {
    if (tour.hasOwnProperty(field)) {
      simplifiedTour[field] = tour[field];
    }
  });
  
  return simplifiedTour;
});

// Create simplified data structure
const simplifiedData = {
  tours: simplifiedTours
};

// Write simplified tours.json
fs.writeFileSync(toursPath, JSON.stringify(simplifiedData, null, 2));

console.log(`✅ Simplified tours.json successfully!`);
console.log(`📊 Original size: ${originalData.tours.length} tours`);
console.log(`📊 Simplified size: ${simplifiedTours.length} tours`);
console.log(`💾 Backup saved as tours.json.backup`);

// Calculate size reduction
const originalSize = fs.statSync(toursPath + '.backup').size;
const newSize = fs.statSync(toursPath).size;
const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

console.log(`📉 File size reduced by ${reduction}% (${(originalSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB)`);