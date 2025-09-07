const getEl = (id) => document.getElementById(id);
const userId = getEl('user_id')?.value;

let usersFriends = [];
let allHobbies = [];

// Elements for Post Creation and Display
const imageUploadArea = getEl('imageUploadArea');
const imageUploadInput = getEl('imageUpload');
const imagePreview = getEl('imagePreview');
const createPostForm = getEl('createPostForm');
const cancelPostBtn = getEl('cancelPostBtn');
const postContentTextarea = createPostForm.querySelector('textarea[name="content"]');
const postsContainer = getEl('posts'); // The main container for all posts

// Elements for User Feed and Suggestions
const suggestionsList = getEl('suggestionsList');
const filterModal = getEl('filterModal');
const openFilterModalBtn = getEl('openFilterModalBtn');
const closeFilterModalBtn = getEl('closeFilterModalBtn');
const applyFiltersBtn = getEl('applyFiltersBtn');
const searchName = getEl('searchName');
const filterAgeMin = getEl('filterAgeMin');
const filterAgeMax = getEl('filterAgeMax');
const filterCity = getEl('filterCity');
const filterHobbySelect = getEl('filterHobby');

// New: Get elements for gender and preferred communication filters
const filterGenderSelect = getEl('filterGender');
const filterPreferredCommunicationSelect = getEl('filterPreferredCommunication');


// --- Initial Load Functions ---
window.addEventListener('load', async () => {
    await fetchCurrentUserAndHobbies();
    await fetchAndRenderSuggestions({}); // Initial load of suggestions
});

async function fetchCurrentUserAndHobbies() {
    try {
        const userResponse = await fetch('/users/' + userId, { // Changed to relative path
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
        if (!userResponse.ok) { throw new Error('Failed to fetch current user data'); }
        const userData = await userResponse.json();
        usersFriends = userData?.friends || [];
        const userHobbies = userData?.hobbies || [];

        const menu = getEl('menu-links');
        // Clear existing hobby links to prevent duplicates on reload
        Array.from(menu.children).filter(li => li.querySelector('a') && li.querySelector('a').href.includes('/hobbies/group')).forEach(li => li.remove());

        userHobbies.forEach(hobby => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '/hobbies/group?hobby=' + encodeURIComponent(hobby._id);
            link.textContent = hobby.name;
            li.appendChild(link);
            menu.appendChild(li);
        });

    } catch (err) {
        console.error('Error fetching current user data:', err);
        alert('Failed to load user data and hobbies.');
    }

    try {
        const hobbiesResponse = await fetch('/hobbies', { headers: { 'Content-Type': 'application/json' } }); // Changed to relative path
        if (!hobbiesResponse.ok) { throw new Error('Failed to fetch all hobbies'); }
        allHobbies = await hobbiesResponse.json();
        filterHobbySelect.innerHTML = '<option value="">Any Hobby</option>';
        allHobbies.forEach(hobby => {
            const option = document.createElement('option');
            option.value = hobby._id;
            option.textContent = hobby.name;
            filterHobbySelect.appendChild(option);
        });
    } catch (err) {
        console.error('Error fetching all hobbies:', err);
        alert('Failed to load hobby filters.');
    }
}

imageUploadInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileType = file.type;
            if (fileType.startsWith('image/')) {
                imagePreview.innerHTML = `
                    <img src="${e.target.result}" alt="Image preview" style="max-width: 100%; max-height: 300px;">
                    <p>${file.name}</p>
                `;
            } else if (fileType.startsWith('video/')) {
                imagePreview.innerHTML = `
                    <video controls style="max-width: 100%; max-height: 300px;">
                        <source src="${e.target.result}" type="${fileType}">
                        Your browser does not support the video tag.
                    </video>
                    <p>${file.name}</p>
                `;
            } else {
                imagePreview.innerHTML = `<p>Unsupported file type.</p>`;
            }
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '';
    }
});


imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageUploadArea.style.borderColor = 'var(--primary-color)';
    imageUploadArea.style.backgroundColor = '#1a2027';
});

imageUploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageUploadArea.style.borderColor = '#333';
    imageUploadArea.style.backgroundColor = 'transparent';
});

imageUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageUploadArea.style.borderColor = '#333';
    imageUploadArea.style.backgroundColor = 'transparent';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        imageUploadInput.files = files;
        const event = new Event('change');
        imageUploadInput.dispatchEvent(event);
    }
});

imageUploadArea.addEventListener('click', () => {
    imageUploadInput.click();
});

cancelPostBtn.addEventListener('click', () => {
    postContentTextarea.value = '';
    imageUploadInput.value = '';
    imagePreview.innerHTML = '';
});

createPostForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData // FormData handles multipart/form-data
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to create post (Status: ${response.status})`);
        }

        window.location.reload();

    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post: ' + error.message);
    }
});


// --- Post Action Listeners (Delete & Like) ---
function attachPostEventListeners() {
    document.querySelectorAll('.delete-post-icon').forEach(icon => {
        icon.removeEventListener('click', handleDeletePost);
        icon.addEventListener('click', handleDeletePost);
    });

    document.querySelectorAll('.like-button').forEach(button => {
        button.removeEventListener('click', handleLikePost);
        button.addEventListener('click', handleLikePost);
    });
}

window.addEventListener('DOMContentLoaded', attachPostEventListeners);


async function handleDeletePost() {
    const postId = this.dataset.postId;
    if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
        try {
            const response = await fetch(`/posts/${postId}`, { // Changed to relative path
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete post');
            }

            this.closest('.post').remove(); // Remove post from DOM
            alert('Post deleted successfully!');

            if (postsContainer.querySelectorAll('.post').length === 0) {
                postsContainer.innerHTML = '<h2>Recent Posts</h2><p class="no-posts">No posts yet. Be the first to share something!</p>';
            }

        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post: ' + error.message);
        }
    }
}

async function handleLikePost() {
    const postId = this.dataset.postId;
    const currentUserId = this.dataset.userId;
    const likeCountSpan = this.nextElementSibling;

    if (!currentUserId || currentUserId === 'undefined') { // Check for undefined string too
        alert('You must be logged in to like posts.');
        return;
    }

    try {
        const response = await fetch(`/posts/${postId}/like`, { // Changed to relative path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to toggle like (Status: ${response.status})`);
        }

        const result = await response.json();
        likeCountSpan.textContent = result.likesCount;

        if (result.isLiked) {
            this.classList.remove('far');
            this.classList.add('fas', 'liked');
        } else {
            this.classList.remove('fas', 'liked');
            this.classList.add('far');
        }

    } catch (error) {
        console.error('Error toggling like:', error);
        alert('Failed to toggle like: ' + error.message);
    }
}

async function getTelAvivTemperature() {
    const apiKey = "0457f459bcaf4b15b4f144123251807"; // Your WeatherAPI key
    const city = "Tel Aviv";
    const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Check for HTTP errors (e.g., 401, 403, 404, 500)
            const errorData = await response.json();
            console.error("WeatherAPI error:", errorData);
            throw new Error(`Failed to fetch weather data: ${errorData.error.message || response.statusText}`);
        }

        const data = await response.json();

        // Extract temperature in Celsius
        const temperatureC = data.current.temp_c;
        const condition = data.current.condition.text;
        document.getElementById('temp').innerHTML = `${temperatureC}°C (${condition})`

    } catch (error) {
        console.error("Error getting Tel Aviv temperature:", error);
        return `Error: ${error.message}`;
    }
}

// --- Friend Suggestions & Filter Modal Logic (existing) ---
async function toggleFriend(friendId, buttonElement, buttonText) {
    try {
        const response = await fetch('/users/toggle-friend', { // Changed to relative path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendId: friendId })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Friend status toggled successfully:', result);

            if (buttonText === 'Add') {
                usersFriends.push(friendId);
                buttonElement.textContent = 'Remove';
                buttonElement.classList.remove('add-friend-btn');
                buttonElement.classList.add('remove-friend-btn');
            } else {
                usersFriends = usersFriends.filter(id => id.toString() !== friendId);
                buttonElement.textContent = 'Add';
                buttonElement.classList.remove('remove-friend-btn');
                buttonElement.classList.add('add-friend-btn');
            }
        } else {
            const errorData = await response.json();
            console.error('Failed to toggle friend status:', errorData.message);
            alert(`Error toggling friend status: ${errorData.message}`);
        }
    } catch (error) {
        console.error('An error occurred during the friend toggle operation:', error);
        alert('An unexpected error occurred. Please try again.');
    }
}

async function fetchAndRenderSuggestions(filters) {
    try {
        const response = await fetch('/users/search', { // Changed to relative path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters)
        });

        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }

        const users = await response.json();
        suggestionsList.innerHTML = '';

        const filteredUsers = users.filter(user => user._id.toString() !== userId.toString());

        if (filteredUsers.length === 0) {
            suggestionsList.innerHTML = '<p style="color:white; text-align: center; margin-top: 20px;">No users found matching your criteria.</p>';
            return;
        }

        filteredUsers.forEach(user => {
            const div = document.createElement('div');
            div.className = 'friend';
            const isFriend = usersFriends.some(friendId => friendId.toString() === user._id.toString());
            const buttonText = isFriend ? 'Remove' : 'Add';
            const buttonClass = isFriend ? 'remove-friend-btn' : 'add-friend-btn';

            div.innerHTML = `
                <img src="${user.profileAvatar || '/uploads/avatars/1.jpg'}" alt="User Profile Picture" />
                <div class="friend-info">
                    <span class="name">${user.firstName} ${user.lastName}</span>
                </div>
                <button class="${buttonClass}" data-friend-id="${user._id}">${buttonText}</button>
            `;
            suggestionsList.appendChild(div);

            const toggleButton = div.querySelector('button');
            toggleButton.addEventListener('click', () => toggleFriend(user._id, toggleButton, toggleButton.textContent));
        });

    } catch (error) {
        console.error('Error fetching filtered users:', error);
        alert('Failed to load user suggestions.');
    }
}

// MODAL FUNCTIONS
function openFilterModal() {
    filterModal.style.display = 'flex';
}

function closeFilterModal() {
    filterModal.style.display = 'none';
}

openFilterModalBtn.addEventListener('click', openFilterModal);
closeFilterModalBtn.addEventListener('click', closeFilterModal);
filterModal.addEventListener('click', (event) => {
    if (event.target === filterModal) {
        closeFilterModal();
    }
});

applyFiltersBtn.addEventListener('click', () => {
    const filters = {};
    if (searchName.value.trim()) filters.name = searchName.value.trim();
    if (!isNaN(parseInt(filterAgeMin.value, 10))) filters.ageMin = parseInt(filterAgeMin.value, 10);
    if (!isNaN(parseInt(filterAgeMax.value, 10))) filters.ageMax = parseInt(filterAgeMax.value, 10);
    if (filterCity.value.trim()) filters.city = filterCity.value.trim();
    if (filterHobbySelect.value) filters.hobby = filterHobbySelect.value;
    // New: Add gender and preferred communication to filters
    if (filterGenderSelect.value) filters.gender = filterGenderSelect.value;
    if (filterPreferredCommunicationSelect.value) filters.preferredCommunication = filterPreferredCommunicationSelect.value;

    console.log('Applying filters:', filters);
    fetchAndRenderSuggestions(filters);
    closeFilterModal();
});

// --- Textarea Character/Word Count (old logic, but retained) ---
postContentTextarea.addEventListener("input", () => {
    const text = postContentTextarea.value;
    // Removed charCount and wordCount elements from HTML, but keeping logic just in case you re-add them
    // getEl("charCount").textContent = text.length;
    // const words = text.trim().split(/\s+/).filter(Boolean);
    // getEl("wordCount").textContent = words.length;
});

// --- Logout Function (existing) ---
async function logout() {
    try {
        const response = await fetch('/users/logout', { // Changed to relative path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        window.location.href = "/users/home" // Changed to relative path
    } catch (error) {
        console.error('An error occurred during logout:', error);
        alert('An unexpected error occurred during logout. Please try again.');
    }
}
getTelAvivTemperature()

document.addEventListener('DOMContentLoaded', () => {
    // Event delegation for edit icons
    document.getElementById('posts').addEventListener('click', async (event) => {
        const editIcon = event.target.closest('.edit-post-icon');
        if (editIcon) {
            const postId = editIcon.dataset.postId;
            const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
            const postContent = postElement.querySelector('.post-content');
            const editActions = postElement.querySelector('.edit-actions');

            if (postContent && editActions) {
                // Hide edit icon, delete icon
                if (postElement.querySelector('.delete-post-icon')) {
                    postElement.querySelector('.delete-post-icon').style.display = 'none';
                }
                editIcon.style.display = 'none';

                // Store original content (already done with data-original-content)
                const originalContent = postContent.dataset.originalContent;

                // Replace <p> with <textarea> for editing
                const textarea = document.createElement('textarea');
                const parent = document.createElement('div');
                parent.append(textarea);
                parent.classList.add('post-content-editing')
                textarea.value = originalContent;
                textarea.rows = 4;
                textarea.classList.add('post-edit-textarea'); // Add a class for potential styling

                postContent.replaceWith(parent);
                editActions.style.display = 'flex'; // Show Save/Cancel buttons
            }
        }
    });

    // Event delegation for save/cancel buttons
    document.getElementById('posts').addEventListener('click', async (event) => {
        const saveBtn = event.target.closest('.save-btn');
        const cancelBtn = event.target.closest('.cancel-edit-btn');
         const postElement = cancelBtn ? cancelBtn.closest('.post') : saveBtn.closest('.post');
         const textarea = postElement.querySelector('.post-edit-textarea');


        if (saveBtn) {
            const postId = postElement.dataset.postId;
            const newContent = textarea.value.trim();

            // if (!newContent) {
            //     alert('Post content cannot be empty!');
            //     return;
            // }

            try {
                const response = await fetch(`/posts/${postId}`, { // Assuming your API endpoint for updating a post is PUT /posts/:id
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: newContent })
                });

                if (response.ok) {
                    const updatedPost = await response.json();
                    // Revert textarea back to paragraph
                    const p = document.createElement('p');
                    p.classList.add('post-content');
                    p.textContent = updatedPost.content; // Use content from server response
                    p.dataset.originalContent = updatedPost.content; // Update original content
                    const parent = textarea.parentElement;
                        parent.parentElement.insertBefore(textarea, parent);
                        parent.remove();
                    textarea.replaceWith(p);

                    // Hide edit actions
                    postElement.querySelector('.edit-actions').style.display = 'none';
                    // Show edit and delete icons again
                    if (postElement.querySelector('.edit-post-icon')) {
                        postElement.querySelector('.edit-post-icon').style.display = 'inline-block';
                    }
                    if (postElement.querySelector('.delete-post-icon')) {
                        postElement.querySelector('.delete-post-icon').style.display = 'inline-block';
                    }
                    console.log('Post updated successfully!');
                } else {
                    const errorData = await response.json();
                    alert(`Failed to update post: ${errorData.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error updating post:', error);
                alert('An error occurred while updating the post. Please try again.');
            }
        } else if (cancelBtn) {
            const postElement = cancelBtn.closest('.post');
            const postContent = postElement.querySelector('.post-edit-textarea'); // It's currently a textarea
            const editActions = postElement.querySelector('.edit-actions');
           const parent = textarea.parentElement;
            parent.parentElement.insertBefore(textarea, parent);
            parent.remove();
            // Revert textarea back to original paragraph
            const originalContent = postContent.value; // The textarea still holds the original value
            const p = document.createElement('p');
            p.classList.add('post-content');
            p.textContent = originalContent;
            p.dataset.originalContent = originalContent; // Ensure this is reset or kept correct
            postContent.replaceWith(p);

            // Hide edit actions
            editActions.style.display = 'none';
            // Show edit and delete icons again
            if (postElement.querySelector('.edit-post-icon')) {
                postElement.querySelector('.edit-post-icon').style.display = 'inline-block';
            }
            if (postElement.querySelector('.delete-post-icon')) {
                postElement.querySelector('.delete-post-icon').style.display = 'inline-block';
            }
        }
    });
});
