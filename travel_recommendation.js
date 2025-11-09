// Global variable to store the travel data
let travelData = null;

// Time zone mapping for countries (for optional Task 10)
const countryTimeZones = {
    'Australia': 'Australia/Sydney',
    'Japan': 'Asia/Tokyo',
    'Brazil': 'America/Sao_Paulo'
};

// Fetch data from JSON file
async function fetchTravelData() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error('Failed to fetch travel data');
        }
        travelData = await response.json();
        console.log('Travel data loaded successfully:', travelData);
        return travelData;
    } catch (error) {
        console.error('Error fetching travel data:', error);
        return null;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    fetchTravelData();
});

// Show specific section and hide others
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update navbar - hide search on About Us and Contact Us pages
    const navbar = document.getElementById('navbar');
    if (sectionId === 'about' || sectionId === 'contact') {
        navbar.classList.add('navbar-simple');
    } else {
        navbar.classList.remove('navbar-simple');
    }

    // Clear recommendations when navigating away from home
    if (sectionId !== 'home') {
        clearResults();
    }
}

// Search recommendations based on keyword
function searchRecommendations() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
        alert('Please enter a search keyword');
        return;
    }

    if (!travelData) {
        alert('Travel data is still loading. Please try again in a moment.');
        return;
    }

    const results = [];
    const recommendationsContainer = document.getElementById('recommendations');

    // Search in beaches
    if (keyword === 'beach' || keyword === 'beaches') {
        travelData.beaches.forEach(beach => {
            results.push({
                name: beach.name,
                imageUrl: beach.imageUrl,
                description: beach.description,
                type: 'beach'
            });
        });
    }

    // Search in temples
    if (keyword === 'temple' || keyword === 'temples') {
        travelData.temples.forEach(temple => {
            results.push({
                name: temple.name,
                imageUrl: temple.imageUrl,
                description: temple.description,
                type: 'temple'
            });
        });
    }

    // Search in countries
    travelData.countries.forEach(country => {
        const countryName = country.name.toLowerCase();
        if (countryName === keyword || countryName.includes(keyword) || keyword.includes(countryName)) {
            country.cities.forEach(city => {
                results.push({
                    name: city.name,
                    imageUrl: city.imageUrl,
                    description: city.description,
                    type: 'country',
                    country: country.name
                });
            });
        }
    });

    // Display results
    displayRecommendations(results);

    // Show home section if not already visible
    if (!document.getElementById('home').classList.contains('active')) {
        showSection('home');
    }
}

// Display recommendations
function displayRecommendations(results) {
    const recommendationsContainer = document.getElementById('recommendations');
    
    if (results.length === 0) {
        recommendationsContainer.innerHTML = '<p style="text-align: center; color: #fff; font-size: 1.2rem; margin-top: 2rem;">No recommendations found. Try searching for "beach", "temple", or a country name.</p>';
        return;
    }

    // Create grid container
    let html = '<div class="recommendations-grid">';
    
    results.forEach(result => {
        // Get time zone if it's a country result
        let timeHtml = '';
        if (result.country && countryTimeZones[result.country]) {
            const timeZone = countryTimeZones[result.country];
            const options = {
                timeZone: timeZone,
                hour12: true,
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            };
            const localTime = new Date().toLocaleTimeString('en-US', options);
            timeHtml = `<div class="country-time">Current time in ${result.country}: ${localTime}</div>`;
        }

        // Handle image URL - if it's a placeholder, use a default image
        let imageUrl = result.imageUrl;
        if (imageUrl && imageUrl.includes('enter_your_image')) {
            // Use placeholder images from Unsplash based on the destination
            const placeholders = {
                'sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                'melbourne': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
                'tokyo': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
                'kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
                'rio': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
                'sao-paulo': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
                'angkor-wat': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                'taj-mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
                'bora-bora': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                'copacabana': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'
            };
            
            // Try to match the image name
            for (const [key, url] of Object.entries(placeholders)) {
                if (imageUrl.toLowerCase().includes(key)) {
                    imageUrl = url;
                    break;
                }
            }
            
            // Default fallback image
            if (imageUrl.includes('enter_your_image')) {
                imageUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
            }
        }

        html += `
            <div class="recommendation-card">
                <img src="${imageUrl}" alt="${result.name}" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'">
                <div class="recommendation-card-content">
                    <h3>${result.name}</h3>
                    <p>${result.description}</p>
                    ${timeHtml}
                </div>
            </div>
        `;
    });

    html += '</div>';
    recommendationsContainer.innerHTML = html;
}

// Clear search results
function clearResults() {
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.innerHTML = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
}

// Handle contact form submission
function handleSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Log the form data (in a real application, this would be sent to a server)
    console.log('Form submitted:', { name, email, message });
    
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset the form
    event.target.reset();
}

// Allow Enter key to trigger search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchRecommendations();
            }
        });
    }
});

