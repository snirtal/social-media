        let map;
        let marker;
        let currentLatitude = parseFloat(document.getElementById('latitude').value) || 31.0461;
        let currentLongitude = parseFloat(document.getElementById('longitude').value) || 34.8516;

        async function initMap() {
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            map = new Map(document.getElementById("map"), {
                center: { lat: currentLatitude, lng: currentLongitude },
                zoom: 8,
                mapId: "DEMO_MAP_ID", // You can use "DEMO_MAP_ID" or create your own Map ID in Google Cloud Console
            });

            // Add a marker if initial coordinates exist
            if (currentLatitude && currentLongitude) {
                marker = new AdvancedMarkerElement({
                    map: map,
                    position: { lat: currentLatitude, lng: currentLongitude },
                });
            }

            // Add a click listener to the map to update the marker and coordinates
            map.addListener("click", (mapsMouseEvent) => {
                const clickedLat = mapsMouseEvent.latLng.lat();
                const clickedLng = mapsMouseEvent.latLng.lng();

                // Update the current coordinates
                currentLatitude = clickedLat;
                currentLongitude = clickedLng;

                // Update hidden input fields
                document.getElementById('latitude').value = clickedLat;
                document.getElementById('longitude').value = clickedLng;

                // Remove existing marker if any
                if (marker) {
                    marker.map = null; // Remove from map
                }

                // Add a new marker at the clicked location
                marker = new AdvancedMarkerElement({
                    map: map,
                    position: { lat: clickedLat, lng: clickedLng },
                });

                console.log("New Location:", { lat: clickedLat, lng: clickedLng });
            });
        }

        // Call initMap when the page loads
        window.onload = initMap;

        // --- Image Modal Logic ---
        const imageSelectionModal = document.getElementById('imageSelectionModal');
        const avatarContainer = document.getElementById('avatarContainer');
        const profileAvatar = document.getElementById('profileAvatar');
        const closeModalButton = document.getElementById('closeModalButton');
        const imageOptionsContainer = document.getElementById('imageOptionsContainer');
        const selectImageButton = document.getElementById('selectImageButton');
        let selectedImageUrl = profileAvatar.src; // Initialize with current avatar or placeholder

        // Sample image URLs (you can replace these with your own)
        const availableImages = [
            '/uploads/avatars/1.jpg',
            '/uploads/avatars/2.jpg',
            '/uploads/avatars/3.jpg',
            '/uploads/avatars/4.jpg',
            '/uploads/avatars/5.jpg',
            '/uploads/avatars/6.jpg',
            // Add more image URLs as needed
        ];

        function openImageModal() {
            imageOptionsContainer.innerHTML = ''; // Clear previous options
            availableImages.forEach(imageUrl => {
                const div = document.createElement('div');
                div.classList.add('image-option');
                if (imageUrl === selectedImageUrl) {
                    div.classList.add('selected'); // Mark current avatar as selected
                }
                div.innerHTML = `<img src="${imageUrl}" alt="Avatar Option">`;
                div.addEventListener('click', () => {
                    // Remove selected class from all others
                    document.querySelectorAll('.image-option').forEach(opt => opt.classList.remove('selected'));
                    div.classList.add('selected'); // Add selected class to clicked one
                    selectedImageUrl = imageUrl;
                });
                imageOptionsContainer.appendChild(div);
            });
            imageSelectionModal.style.display = 'flex'; // Show modal
        }

        function closeImageModal() {
            imageSelectionModal.style.display = 'none'; // Hide modal
        }

        avatarContainer.addEventListener('click', openImageModal); // Click avatar to open modal
        closeModalButton.addEventListener('click', closeImageModal); // Click 'x' to close
        selectImageButton.addEventListener('click', () => {
            profileAvatar.src = selectedImageUrl; // Update displayed avatar
            closeImageModal(); // Close modal
        });

        // Close modal if clicked outside of content
        window.addEventListener('click', (event) => {
            if (event.target === imageSelectionModal) {
                closeImageModal();
            }
        });

        // --- Hobbies Selection Logic ---
        document.querySelectorAll('.hobby-item').forEach(item => {
            item.addEventListener('click', function() {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked; // Toggle checkbox state
                this.classList.toggle('selected', checkbox.checked); // Toggle 'selected' class
            });
        });

        // --- Facebook Share Logic ---
        document.getElementById('shareHobbiesFacebook').addEventListener('click', function() {
            const selectedHobbies = Array.from(document.querySelectorAll('input[name="hobbies"]:checked'))
                                     .map(cb => cb.nextSibling.textContent.trim()); // Get hobby name

            let shareMessage = `Check out my hobbies! I enjoy: ${selectedHobbies.join(', ')}.`;
            if (selectedHobbies.length === 0) {
                shareMessage = "Check out my profile and my amazing hobbies!";
            }

            FB.ui({
                method: 'share',
                href: window.location.href, // Or a specific URL for your profile
                quote: shareMessage,
                hashtag: '#MyHobbies #Profile',
            }, function(response){
                if (response && !response.error_message) {
                    alert('Post shared successfully!');
                } else {
                    alert('Error sharing post, or share cancelled by user.');
                }
            });
        });

        // --- Submit Form Logic ---
        document.getElementById('submit').addEventListener('click', async function(e) {
            e.preventDefault();

            // Collect form data
            const firstName = document.getElementById('firstname').value.trim();
            const lastName = document.getElementById('lastname').value.trim();
            const email = document.getElementById('email').value.trim();
            const phoneNumber = document.getElementById('PhoneNumber').value.trim();
            const city = document.getElementById('City').value.trim();
            const age = parseInt(document.getElementById('Age').value.trim(), 10); // Parse age as integer
            const bio = document.getElementById('bio').value.trim(); // New field
            const gender = document.getElementById('gender').value; // New field
            const preferredCommunication = document.getElementById('preferredCommunication').value; // New field
            if(!firstName || !lastName || !email || !phoneNumber || !age) {
                alert('Please fill requried fields');
                return;
            }
            // Get location coordinates from hidden inputs
            const latitude = parseFloat(document.getElementById('latitude').value);
            const longitude = parseFloat(document.getElementById('longitude').value);

            // Collect hobbies checkboxes
            const hobbies = Array.from(document.querySelectorAll('input[name="hobbies"]:checked')).map(cb => cb.value);

            // Prepare the location object if coordinates are valid
            let locationData = null;
            if (!isNaN(latitude) && !isNaN(longitude)) {
                locationData = {
                    type: 'Point',
                    coordinates: [longitude, latitude] // GeoJSON format: [longitude, latitude]
                };
            }
            console.log('Location Data to send:', locationData);

            // Include the selected profile picture URL
            const profilePicture = selectedImageUrl === 'https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg' ? '' : selectedImageUrl; // Send empty string if placeholder

            try {
                const response = await fetch(`/users/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        phoneNumber,
                        city,
                        age,
                        bio, // Include new field
                        gender, // Include new field
                        preferredCommunication, // Include new field
                        hobbies,
                        location: locationData,
                        profileAvatar: profilePicture
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    alert(`Failed to update profile: ${errorData.message || response.statusText}`);
                    return;
                }

                alert('Profile updated successfully!');
                window.location.reload();
            } catch (err) {
                console.error('Error:', err);
                alert('Failed to update profile.');
            }
        });
