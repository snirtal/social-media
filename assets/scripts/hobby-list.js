    function showCustomAlert(message) {
        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #21262d;
            color: #c9d1d9;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
            z-index: 1001;
            text-align: center;
            border: 1px solid #4facfe;
            font-family: "Roboto Condensed", sans-serif;
            font-size: 1.1em;
        `;
        alertBox.innerHTML = `
            <p>${message}</p>
            <button style="
                background-color: #4facfe;
                color: black;
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 15px;
                font-weight: bold;
                transition: background-color 0.2s;
            " onmouseover="this.style.backgroundColor='black'; this.style.color='#4facfe';" onmouseout="this.style.backgroundColor='#4facfe'; this.style.color='black';" onclick="this.parentNode.remove()">OK</button>
        `;
        document.body.appendChild(alertBox);
    }

    function showCustomConfirm(message) {
        return new Promise((resolve) => {
            const confirmBox = document.createElement('div');
            confirmBox.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #21262d;
                color: #c9d1d9;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
                z-index: 1001;
                text-align: center;
                border: 1px solid #ff5f5f;
                font-family: "Roboto Condensed", sans-serif;
                font-size: 1.1em;
            `;
            confirmBox.innerHTML = `
                <p>${message}</p>
                <button id="confirmYes" style="
                    background-color: #ff5f5f;
                    color: white;
                    padding: 8px 15px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                    margin-right: 10px;
                    font-weight: bold;
                    transition: background-color 0.2s;
                " onmouseover="this.style.backgroundColor='#e63b3b';" onmouseout="this.style.backgroundColor='#ff5f5f';">Yes</button>
                <button id="confirmNo" style="
                    background-color: #4facfe;
                    color: black;
                    padding: 8px 15px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                    font-weight: bold;
                    transition: background-color 0.2s;
                " onmouseover="this.style.backgroundColor='black'; this.style.color='#4facfe';" onmouseout="this.style.backgroundColor='#4facfe'; this.style.color='black';">No</button>
            `;
            document.body.appendChild(confirmBox);

            document.getElementById('confirmYes').onclick = () => {
                confirmBox.remove();
                resolve(true);
            };
            document.getElementById('confirmNo').onclick = () => {
                confirmBox.remove();
                resolve(false);
            };
        });
    }

    async function deleteHobby(id) {
        const confirmed = await showCustomConfirm('Are you sure you want to delete this hobby?');
        if (!confirmed) return;

        try {
            const res = await fetch(`/hobbies/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                // Remove the hobby card from the DOM
                document.getElementById(id).remove();
                showCustomAlert('Hobby deleted successfully!');
            } else {
                const errorData = await res.json();
                showCustomAlert(`Error deleting hobby: ${errorData.message || res.statusText}`);
            }
        } catch (error) {
            showCustomAlert('Error deleting hobby.');
            console.error(error);
        }
    }

    // Search Modal Logic
    const searchModal = document.getElementById('searchModal');
    const openSearchModalBtn = document.getElementById('openSearchModalBtn');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    const performSearchBtn = document.getElementById('performSearchBtn');

    const searchNameInput = document.getElementById('searchName');
    const minPracticeTimeInput = document.getElementById('minPracticeTime');
    const maxPracticeTimeInput = document.getElementById('maxPracticeTime');
    const minParticipantsInput = document.getElementById('minParticipants');
    const maxParticipantsInput = document.getElementById('maxParticipants');
    const createdByUserNameInput = document.getElementById('createdByUserName');
    const searchResultsList = document.getElementById('searchResultsList');

    if (openSearchModalBtn) {
        openSearchModalBtn.addEventListener('click', () => {
            searchModal.style.display = 'flex'; // Show modal
        });
    }

    if (closeSearchModalBtn) {
        closeSearchModalBtn.addEventListener('click', () => {
            searchModal.style.display = 'none'; // Hide modal
            // Optionally clear search results and inputs when closing
            searchResultsList.innerHTML = '<p class="no-results">Enter search criteria and click \'Search\'.</p>';
            searchNameInput.value = '';
            minPracticeTimeInput.value = '';
            maxPracticeTimeInput.value = '';
            minParticipantsInput.value = '';
            maxParticipantsInput.value = '';
            createdByUserNameInput.value = '';
        });
    }

    if (performSearchBtn) {
        performSearchBtn.addEventListener('click', async () => {
            const filters = {
                name: searchNameInput.value,
                // Convert to number or keep undefined if empty
                minPracticeTime: minPracticeTimeInput.value ? parseInt(minPracticeTimeInput.value) : undefined,
                maxPracticeTime: maxPracticeTimeInput.value ? parseInt(maxPracticeTimeInput.value) : undefined,
                minParticipants: minParticipantsInput.value ? parseInt(minParticipantsInput.value) : undefined,
                maxParticipants: maxParticipantsInput.value ? parseInt(maxParticipantsInput.value) : undefined,
                createdByUserName: createdByUserNameInput.value
            };

            // Remove empty string values from filters to avoid sending unnecessary query parameters
            for (const key in filters) {
                if (filters[key] === '') {
                    delete filters[key];
                }
            }

            try {
                searchResultsList.innerHTML = '<p class="no-results">Searching...</p>'; // Show loading message
                
                // --- FIX START ---
                const response = await fetch(`/hobbies/search`, { // No query params in URL for POST
                    method: 'POST', // Changed to POST
                    headers: {
                        'Content-Type': 'application/json' // Specify content type
                    },
                    body: JSON.stringify(filters) // Send filters in the request body
                });
                // --- FIX END ---
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const foundHobbies = await response.json();
                searchResultsList.innerHTML = ''; // Clear previous results

                if (foundHobbies.length > 0) {
                    foundHobbies.forEach(hobby => {
                        const hobbyCard = document.createElement('div');
                        hobbyCard.classList.add('search-result-card');
                        hobbyCard.innerHTML = `
                            <div class="hobby-name">${hobby.name}</div>
                            <div class="hobby-description">${hobby.description}</div>
                            <div class="hobby-details">
                                Practice Time: ${hobby.practiceTime || 'N/A'} hrs | Max Participants: ${hobby.maxParticipants || 'N/A'}
                                ${hobby.owner && hobby.owner.firstName && hobby.owner.lastName ? 
                                    `| Created By: ${hobby.owner.firstName} ${hobby.owner.lastName}` : ''
                                }
                            </div>
                        `;
                        searchResultsList.appendChild(hobbyCard);
                    });
                } else {
                    searchResultsList.innerHTML = '<p class="no-results">No hobbies found matching your criteria.</p>';
                }

            } catch (error) {
                console.error('Error during hobby search:', error);
                searchResultsList.innerHTML = '<p class="no-results" style="color: #ff5f5f;">Error searching hobbies. Please try again.</p>';
            }
        });
    }
