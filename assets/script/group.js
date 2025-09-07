document.addEventListener('DOMContentLoaded', () => {
    // Helper function to get elements by ID
    const getEl = (id) => document.getElementById(id);

    // --- Global Variables/Elements ---
    const currentUserId = getEl('currentUserId')?.value; // Using optional chaining in case element is not always present
    const currentHobbyId = getEl('currentHobbyId')?.value;

    // --- Post Creation Elements ---
    const imageUploadArea = getEl('imageUploadArea');
    const imageUploadInput = getEl('imageUpload');
    const imagePreview = getEl('imagePreview');
    const createPostForm = getEl('createPostForm');
    const cancelPostBtn = getEl('cancelPostBtn');
    const postContentTextarea = createPostForm ? createPostForm.querySelector('textarea[name="content"]') : null;
    const postsContainer = document.querySelector('.posts'); // Main container for existing posts

    // --- Post Search Modal Elements ---
    const postSearchModal = getEl('postSearchModal');
    const openPostSearchModalBtn = getEl('openPostSearchModalBtn');
    const closePostSearchModalBtn = getEl('closePostSearchModalBtn');
    const performPostSearchBtn = getEl('performPostSearchBtn');
    const postSearchResultsContainer = getEl('postSearchResults'); // Renamed for clarity

    const searchContentInput = getEl('searchContent'); // Renamed for clarity
    const searchUserNameInput = getEl('searchUserName'); // Renamed for clarity
    const searchStartDateInput = getEl('searchStartDate'); // Renamed for clarity
    const searchEndDateInput = getEl('searchEndDate'); // Renamed for clarity

    // --- Initial Setup and Event Listener Attachment ---
    // This function will attach all necessary event listeners to posts
    // It's called on DOMContentLoaded and again after a new post is added dynamically.
    function attachPostEventListeners() {
        // Delete Post
        document.querySelectorAll('.delete-post-icon').forEach(icon => {
            icon.removeEventListener('click', handleDeletePost); // Prevent duplicate listeners
            icon.addEventListener('click', handleDeletePost);
        });

        // Like Post
        document.querySelectorAll('.like-button').forEach(button => {
            button.removeEventListener('click', handleLikePost); // Prevent duplicate listeners
            button.addEventListener('click', handleLikePost);
        });

        // Edit Post
        document.querySelectorAll('.edit-post-icon').forEach(icon => {
            icon.removeEventListener('click', handleEditPost); // Prevent duplicate listeners
            icon.addEventListener('click', handleEditPost);
        });
    }

    attachPostEventListeners();    
    initializeLikeStatus();
    
    // --- Post Creation Logic ---
    if (imageUploadInput) { // Ensure element exists before adding listeners
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

    }

    if (imageUploadArea) { // Ensure element exists
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
    }

    if (cancelPostBtn) { // Ensure element exists
        cancelPostBtn.addEventListener('click', () => {
            if (postContentTextarea) postContentTextarea.value = '';
            if (imageUploadInput) imageUploadInput.value = '';
            if (imagePreview) imagePreview.innerHTML = '';
        });
    }

    if (createPostForm) { // Ensure element exists
        createPostForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            console.log("FormData Contents (for verification):");
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to create post (Status: ${response.status})`);
                }

                // const newPostData = await response.json();
                alert('Post created successfully!');
                if (postContentTextarea) postContentTextarea.value = '';
                if (imageUploadInput) imageUploadInput.value = '';
                if (imagePreview) imagePreview.innerHTML = '';

                // Dynamically add the new post to the top of the feed
                // prependNewPostToFeed(newPostData);
                window.location.reload();

            } catch (error) {
                console.error('Error creating post:', error);
                alert('Failed to create post: ' + error.message);
            }
        });
    }

    function prependNewPostToFeed(postData) {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        postDiv.dataset.postId = postData._id;

        const isPostOwner = (currentUserId && postData.user && postData.user._id && postData.user._id.toString() === currentUserId.toString());
        // isHobbyOwner is usually a server-side determined flag passed to EJS.
        // For dynamically added posts, we mainly check post ownership.

        const isLikedByCurrentUser = (postData.likes && currentUserId && postData.likes.includes(currentUserId.toString()));

        postDiv.innerHTML = `
            <div class="post-header">
                <div class="avatar">${postData.user.firstName.charAt(0) + postData.user.lastName.charAt(0)}</div>
                <div class="user-info">
                    <strong>${postData.user.firstName} ${postData.user.lastName}</strong>
                    <small>${postData.created ? new Date(postData.created).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date N/A'}</small>
                </div>
                ${isPostOwner ? `<i class="fas fa-edit edit-post-icon" data-post-id="${postData._id}"></i>` : ''}
                ${isPostOwner ? `<i class="fas fa-times delete-post-icon" data-post-id="${postData._id}"></i>` : ''}
            </div>
            ${postData.imagePath ? `<img src="/${postData.imagePath}" alt="Post image" class="post-image">` : ''}
            <p class="post-content" data-original-content="${postData.content}">${postData.content}</p>
            <div class="edit-actions" style="display: none;">
                <button class="cancel-edit-btn">Cancel</button>
                <button class="save-btn">Save</button>
            </div>
            <div class="post-footer">
                <div class="time-info">
                    <i class="far fa-clock"></i>
                    <small>${postData.created ? new Date(postData.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</small>
                </div>
                <div class="post-likes">
                    <i class="far fa-heart like-button ${isLikedByCurrentUser ? 'fas liked' : ''}"
                       data-post-id="${postData._id}" data-user-id="${currentUserId}"></i>
                    <span class="like-count" data-post-id="${postData._id}">${postData.likes ? postData.likes.length : 0}</span>
                </div>
            </div>
        `;

        if (postsContainer) {
            const noPostsMessage = postsContainer.querySelector('.no-posts');
            if (noPostsMessage) {
                noPostsMessage.remove(); // Remove "No posts yet" message
            }
            // Find the h2 "Recent Posts" and insert the new post after it, or prepend to container
            const h2 = postsContainer.querySelector('h2');
            if (h2) {
                h2.insertAdjacentElement('afterend', postDiv);
            } else {
                postsContainer.prepend(postDiv);
            }
        }
        attachPostEventListeners(); // Re-attach for new post
    }

    // --- Post Action Handlers (Delete, Like, Edit) ---
    async function handleDeletePost() {
        const postId = this.dataset.postId;
        if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
            try {
                const response = await fetch(`/posts/${postId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete post');
                }

                this.closest('.post').remove();
                alert('Post deleted successfully!');

                if (postsContainer && postsContainer.querySelectorAll('.post').length === 0) {
                    const h2 = postsContainer.querySelector('h2');
                    if (h2) {
                        // Insert the "No posts yet" message after the H2
                        h2.insertAdjacentHTML('afterend', '<p class="no-posts">No posts yet. Be the first to write something!</p>');
                    }
                }
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post: ' + error.message);
            }
        }
    }

    async function handleLikePost() {
        const postId = this.dataset.postId;
        const userId = this.dataset.userId; // Get the current user's ID from data-user-id
        const likeCountSpan = this.nextElementSibling;

        if (!userId || userId === 'undefined' || userId === '') {
            alert('You must be logged in to like posts.');
            return;
        }

        try {
            const response = await fetch(`/posts/${postId}/like`, { // Ensure this route is correct
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to toggle like (Status: ${response.status})`);
            }

            const result = await response.json();
            likeCountSpan.textContent = result.likesCount;

            if (result.isLiked) {
                this.classList.remove('far'); // outline heart
                this.classList.add('fas', 'liked'); // filled heart, liked color
            } else {
                this.classList.remove('fas', 'liked'); // filled heart, liked color
                this.classList.add('far'); // outline heart
            }

        } catch (error) {
            console.error('Error toggling like:', error);
            alert('Failed to toggle like: ' + error.message);
        }
    }

    // Function to set initial like status based on EJS-rendered `post.likes`
    function initializeLikeStatus() {
        document.querySelectorAll('.like-button').forEach(button => {
            const postId = button.dataset.postId;
            const userId = button.dataset.userId;

            if (!userId || userId === 'undefined' || userId === '') {
                // If user is not logged in, no need to check like status
                return;
            }

            // Get the raw post data that was passed to the EJS template
            // This is a bit of a hacky way to access EJS data directly in JS
            // A more robust solution might involve an API endpoint to check like status
            // For now, let's assume the 'hobby' object from EJS is somehow accessible or
            // the 'liked' class is pre-rendered by EJS (which it should be).
            // Let's rely on the EJS template to render the initial 'liked' class.
            // The logic inside `handleLikePost` will correctly toggle it.
            // No explicit check needed here if EJS is setting the `fas liked` class.
        });
    }

    // --- NEW: Edit Post Functionality ---
    function handleEditPost() {
        const postId = this.dataset.postId;
        const postDiv = this.closest('.post');
        const postContentP = postDiv.querySelector('.post-content');
        const editActionsDiv = postDiv.querySelector('.edit-actions');
        const originalContent = postContentP.dataset.originalContent; // Store original content

        // Hide edit/delete icons when editing
        postDiv.querySelectorAll('.edit-post-icon, .delete-post-icon').forEach(icon => icon.style.display = 'none');

        // Create a textarea and populate with current content
        const textarea = document.createElement('textarea');
        textarea.value = originalContent; // Use original content from data attribute
        postContentP.innerHTML = ''; // Clear current content
        postContentP.appendChild(textarea);
        postContentP.classList.add('editing'); // Add class for styling

        // Show save/cancel buttons
        editActionsDiv.style.display = 'flex';

        // Set up event listeners for save and cancel buttons
        const saveBtn = editActionsDiv.querySelector('.save-btn');
        const cancelEditBtn = editActionsDiv.querySelector('.cancel-edit-btn');

        // Remove previous listeners to prevent duplicates
        saveBtn.removeEventListener('click', saveEditedPost);
        cancelEditBtn.removeEventListener('click', cancelPostEdit);

        // Add new listeners, passing necessary elements
        saveBtn.addEventListener('click', () => saveEditedPost(postId, postContentP, textarea, editActionsDiv, postDiv));
        cancelEditBtn.addEventListener('click', () => cancelPostEdit(postContentP, originalContent, editActionsDiv, postDiv));

        textarea.focus(); // Focus on the textarea for immediate editing
        textarea.setSelectionRange(textarea.value.length, textarea.value.length); // Move cursor to end
    }

    async function saveEditedPost(postId, postContentP, textarea, editActionsDiv, postDiv) {
        const newContent = textarea.value.trim();
        // if (newContent === '') {
        //     alert('Post content cannot be empty!');
        //     return;
        // }

        try {
            const response = await fetch(`/posts/${postId}`, { 
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newContent })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update post');
            }

            // Update the paragraph with the new content
            postContentP.textContent = newContent;
            postContentP.dataset.originalContent = newContent; // Update original content in data attribute
            postContentP.classList.remove('editing'); // Remove editing styling
            editActionsDiv.style.display = 'none'; // Hide buttons

            // Show edit/delete icons again
            postDiv.querySelectorAll('.edit-post-icon, .delete-post-icon').forEach(icon => icon.style.display = '');

            alert('Post updated successfully!');

        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post: ' + error.message);
            // Revert content if save fails
            cancelPostEdit(postContentP, postContentP.dataset.originalContent, editActionsDiv, postDiv);
        }
    }

    function cancelPostEdit(postContentP, originalContent, editActionsDiv, postDiv) {
        postContentP.textContent = originalContent; // Revert to original content
        postContentP.classList.remove('editing'); // Remove editing styling
        editActionsDiv.style.display = 'none'; // Hide buttons

        // Show edit/delete icons again
        postDiv.querySelectorAll('.edit-post-icon, .delete-post-icon').forEach(icon => icon.style.display = '');
    }

    // --- Post Search Modal Logic ---
    if (openPostSearchModalBtn) {
        openPostSearchModalBtn.addEventListener('click', () => {
            if (postSearchModal) postSearchModal.style.display = 'flex';
            // Clear previous search results and inputs when opening
            if (searchContentInput) searchContentInput.value = '';
            if (searchUserNameInput) searchUserNameInput.value = '';
            if (searchStartDateInput) searchStartDateInput.value = '';
            if (searchEndDateInput) searchEndDateInput.value = '';
            if (postSearchResultsContainer) postSearchResultsContainer.innerHTML = '<p class="no-search-results">Enter criteria and click \'Search Posts\' to find results.</p>';
        });
    }

    if (closePostSearchModalBtn) {
        closePostSearchModalBtn.addEventListener('click', () => {
            if (postSearchModal) postSearchModal.style.display = 'none';
        });
    }

    if (postSearchModal) {
        postSearchModal.addEventListener('click', (event) => {
            if (event.target === postSearchModal) {
                postSearchModal.style.display = 'none';
            }
        });
    }

    if (performPostSearchBtn) {
        performPostSearchBtn.addEventListener('click', async () => {
            const filters = {
                hobbyId: currentHobbyId, // Pass the current hobby ID for filtering
            };
            if (searchContentInput && searchContentInput.value.trim()) {
                filters.content = searchContentInput.value.trim();
            }
            if (searchUserNameInput && searchUserNameInput.value.trim()) {
                filters.userName = searchUserNameInput.value.trim();
            }
            if (searchStartDateInput && searchStartDateInput.value) {
                filters.startDate = searchStartDateInput.value;
            }
            if (searchEndDateInput && searchEndDateInput.value) {
                filters.endDate = searchEndDateInput.value;
            }
            try {
                const response = await fetch(`/posts/search/${currentHobbyId}`, { // Updated endpoint based on your HTML, includes hobbyId
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(filters)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to search posts');
                }

                const searchResults = await response.json();
                if (postSearchResultsContainer) postSearchResultsContainer.innerHTML = ''; // Clear previous results

                if (searchResults.length === 0) {
                    if (postSearchResultsContainer) postSearchResultsContainer.innerHTML = '<p class="no-search-results">No posts found matching your criteria.</p>';
                    return;
                }

                searchResults.forEach(post => {
                    const postDiv = document.createElement('div');
                    postDiv.classList.add('post'); // Use your existing post styling
                    // Added a slightly different class for search results if you want to style them distinctly
                    postDiv.classList.add('search-result-post');
                    postDiv.innerHTML = `
                        <div class="post-header">
                            <div class="avatar">${post.user.firstName.charAt(0) + post.user.lastName.charAt(0)}</div>
                            <div class="user-info">
                                <strong>${post.user.firstName} ${post.user.lastName}</strong>
                                <small>${post.created ? new Date(post.created).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date N/A'}</small>
                            </div>
                        </div>
${post.imagePath ? (
  ['mp4', 'webm', 'ogg', 'mov'].includes(post.imagePath.split('.').pop().toLowerCase())
    ? `<video controls class="post-video">
         <source src="/${post.imagePath}" type="video/${post.imagePath.split('.').pop().toLowerCase()}">
         Your browser does not support the video tag.
       </video>`
    : `<img src="/${post.imagePath}" alt="Post image" class="post-image">`
) : ''}                        <p class="post-content">${post.content}</p>
                        <div class="post-footer">
                            <div class="time-info">
                                <i class="far fa-clock"></i> <small>${post.created ? new Date(post.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</small>
                            </div>
                            <div class="post-likes">
                                <i class="far fa-heart"></i>
                                <span class="like-count">${post.likes ? post.likes.length : 0}</span>
                            </div>
                        </div>
                    `;
                    if (postSearchResultsContainer) postSearchResultsContainer.appendChild(postDiv);
                });

            } catch (error) {
                console.error('Error during post search:', error);
                if (postSearchResultsContainer) postSearchResultsContainer.innerHTML = `<p class="no-search-results" style="color: red;">Error searching posts: ${error.message}</p>`;
            }
        });
    }
});
