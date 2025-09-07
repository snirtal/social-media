const postsButton = document.getElementById('postsButton');
const usersButton = document.getElementById('usersButton');
const hobbiesButton = document.getElementById('hobbiesButton');

const postsDialog = document.getElementById('postsDialog');
const usersDialog = document.getElementById('usersDialog');
const hobbiesDialog = document.getElementById('hobbiesDialog');

const postsForm = document.getElementById('postsForm');
const usersForm = document.getElementById('usersForm');
const hobbiesForm = document.getElementById('hobbiesForm');

const statsResults = document.getElementById('stats-results');

// Helper function to show a specific dialog
const showDialog = (dialog) => {
    dialog.classList.remove('hidden');
};

// Helper function to hide all dialogs
const hideAllDialogs = () => {
    postsDialog.classList.add('hidden');
    usersDialog.classList.add('hidden');
    hobbiesDialog.classList.add('hidden');
};

// Add event listeners to the search buttons
postsButton.addEventListener('click', () => {
    showDialog(postsDialog);
});

usersButton.addEventListener('click', () => {
    showDialog(usersDialog);
});

hobbiesButton.addEventListener('click', () => {
    showDialog(hobbiesDialog);
});

// Add event listeners to the cancel buttons
document.querySelectorAll('.cancelButton').forEach(button => {
    button.addEventListener('click', () => {
        hideAllDialogs();
    });
});

// Handle posts form submission
postsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(postsForm);
    const data = Object.fromEntries(formData.entries());

    statsResults.innerHTML = '<p class="text-center text-blue-400 animate-pulse">Fetching posts data...</p>';

    try {
        const response = await fetch('http://localhost:3000/posts/about/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        statsResults.innerHTML = `<p class="text-lg leading-relaxed"><strong>${result.lastWeekPosts}</strong> new posts were created within your date range!</p>`;

    } catch (error) {
        console.error('Error:', error);
        statsResults.innerHTML = '<p class="text-center text-red-400">Failed to fetch posts data. Please try again.</p>';
    } finally {
        hideAllDialogs();
    }
});

// Handle users form submission
usersForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(usersForm);
    const data = Object.fromEntries(formData.entries());

    statsResults.innerHTML = '<p class="text-center text-blue-400 animate-pulse">Fetching users data...</p>';

    try {
        const response = await fetch('http://localhost:3000/users/about/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        statsResults.innerHTML = `<p class="text-lg leading-relaxed">There are <strong>${result.usersWithSameGender}</strong> users with the same gender as you in our system!</p>`;

    } catch (error) {
        console.error('Error:', error);
        statsResults.innerHTML = '<p class="text-center text-red-400">Failed to fetch users data. Please try again.</p>';
    } finally {
        hideAllDialogs();
    }
});

// Handle hobbies form submission
hobbiesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(hobbiesForm);
    const data = Object.fromEntries(formData.entries());

    statsResults.innerHTML = '<p class="text-center text-blue-400 animate-pulse">Fetching hobbies data...</p>';

    try {
        const response = await fetch('http://localhost:3000/hobbies/about/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        statsResults.innerHTML = `<p class="text-lg leading-relaxed"><strong>${result.lastWeekHobbies}</strong> new hobbies were created within your date range!</p>`;

    } catch (error) {
        console.error('Error:', error);
        statsResults.innerHTML = '<p class="text-center text-red-400">Failed to fetch hobbies data. Please try again.</p>';
    } finally {
        hideAllDialogs();
    }
});