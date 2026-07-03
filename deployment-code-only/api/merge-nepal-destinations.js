const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data/destinations.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const destinations = JSON.parse(data);

    let modifiedCount = 0;

    const updatedDestinations = destinations.map(dest => {
        if (dest.country === 'Nepal') {
            if (dest.name === 'Nepal') {
                // Ensure the main Nepal entry is listed
                if (!dest.listed) {
                    dest.listed = true;
                    modifiedCount++;
                }
            } else {
                // Hide all other Nepal destinations
                if (dest.listed !== false) {
                    dest.listed = false;
                    modifiedCount++;
                }
            }
        }
        return dest;
    });

    if (modifiedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(updatedDestinations, null, 2));
        console.log(`Successfully updated ${modifiedCount} destinations.`);
    } else {
        console.log('No changes needed.');
    }

} catch (err) {
    console.error('Error updating destinations:', err);
}
