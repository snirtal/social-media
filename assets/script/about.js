      const searchButton = document.getElementById('searchButton');
        const searchDialog = document.getElementById('searchDialog');
        const cancelButton = document.getElementById('cancelButton');
        const searchForm = document.getElementById('searchForm');
        const statsResults = document.getElementById('stats-results');

        // Show the dialog when the search button is clicked
        searchButton.addEventListener('click', () => {
            searchDialog.classList.remove('hidden');
        });

        // Hide the dialog when the cancel button is clicked
        cancelButton.addEventListener('click', () => {
            searchDialog.classList.add('hidden');
        });

        // Handle form submission
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Collect form data
            const formData = new FormData(searchForm);
            const data = Object.fromEntries(formData.entries());

            // Show a loading message
            statsResults.innerHTML = '<p class="text-center text-blue-400 animate-pulse">Fetching data...</p>';
            
            try {
                // Send data to the server
                const response = await fetch('http://localhost:3000/users/about/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const result = await response.json();

                // Update the UI with the fetched data
                let resultHtml = `
                    <p class="text-lg leading-relaxed"><strong>${result.lastWeekPosts}</strong> new posts were created within your date range!</p>
                    <p class="text-lg leading-relaxed">There are <strong>${result.usersWithSameGender}</strong> users with the same gender as you in our system!</p>
                    <p class="text-lg leading-relaxed"><strong>${result.lastWeekHobbies}</strong> new hobbies were created within your date range!</p>
                `;

                if (result.usersWithSameGender === 0) {
                    resultHtml = `
                        <p class="text-lg leading-relaxed"><strong>${result.lastWeekPosts}</strong> new posts were created within your date range!</p>
                        <p class="text-lg leading-relaxed">You have 0 users with your same gender in our system.</p>
                        <p class="text-lg leading-relaxed"><strong>${result.lastWeekHobbies}</strong> new hobbies were created within your date range!</p>
                    `;
                }

                statsResults.innerHTML = resultHtml;

            } catch (error) {
                console.error('Error:', error);
                statsResults.innerHTML = '<p class="text-center text-red-400">Failed to fetch data. Please try again.</p>';
            } finally {
                // Hide the dialog after the fetch is complete
                searchDialog.classList.add('hidden');
            }
        });