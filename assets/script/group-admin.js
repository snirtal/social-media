// public/assets/js/group-admin.js

document.addEventListener('DOMContentLoaded', () => {
    const currentHobbyId = document.getElementById('currentHobbyId').value;

    // --- Add Member Modal Logic ---
    const openAddMemberModalBtn = document.getElementById('openAddMemberModalBtn');
    const addMemberModal = document.getElementById('addMemberModal');
    const closeAddMemberModalBtn = document.getElementById('closeAddMemberModalBtn');
    const addMemberBtn = document.getElementById('addMemberBtn');
        const addMemberSelect = document.getElementById('addMemberSelect');
    const addMemberMessage = document.getElementById('addMemberMessage');

    if (openAddMemberModalBtn) {
        openAddMemberModalBtn.addEventListener('click', () => {
            addMemberModal.style.display = 'flex'; // Use 'flex' for centering
            addMemberMessage.textContent = '';
        });
    }

    if (closeAddMemberModalBtn) {
        closeAddMemberModalBtn.addEventListener('click', () => {
            addMemberModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === addMemberModal) {
            addMemberModal.style.display = 'none';
        }
        if (event.target === removeMemberModal) {
            removeMemberModal.style.display = 'none';
        }
    });

    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', async () => {
            const userIdToAdd =addMemberSelect.value


            try {
                const response = await fetch(`http://localhost:3000/users/${userIdToAdd}/hobby/${currentHobbyId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setTimeout(() => location.reload(), 1500);
                } else {
                    addMemberMessage.textContent = 'Error adding member.';
                    addMemberMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Error adding member:', error);
                addMemberMessage.textContent = 'An unexpected error occurred. Please try again.';
                addMemberMessage.style.color = 'red';
            }
        });
    }

    // --- Remove Member Modal Logic ---
    const openRemoveMemberModalBtn = document.getElementById('openRemoveMemberModalBtn');
    const removeMemberModal = document.getElementById('removeMemberModal');
    const closeRemoveMemberModalBtn = document.getElementById('closeRemoveMemberModalBtn');
    const removeMemberBtn = document.getElementById('removeMemberBtn');
    const removeMemberSelect = document.getElementById('removeMemberSelect');
    const removeMemberMessage = document.getElementById('removeMemberMessage');

    if (openRemoveMemberModalBtn) {
        openRemoveMemberModalBtn.addEventListener('click', () => {
            removeMemberModal.style.display = 'flex'; // Use 'flex' for centering
            removeMemberMessage.textContent = '';
        });
    }

    if (closeRemoveMemberModalBtn) {
        closeRemoveMemberModalBtn.addEventListener('click', () => {
            removeMemberModal.style.display = 'none';
        });
    }

    if (removeMemberBtn) {
        removeMemberBtn.addEventListener('click', async () => {
            const memberIdToRemove = removeMemberSelect.value;
            if (!memberIdToRemove) {
                removeMemberMessage.textContent = 'Please select a member to remove.';
                removeMemberMessage.style.color = 'red';
                return;
            }

            if (!confirm('Are you sure you want to remove this member from the group?')) {
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/users/${memberIdToRemove}/hobby/${currentHobbyId}`, {
                    method: 'POST', // Or DELETE if your API design prefers, ensure consistency with server
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: memberIdToRemove })
                });

                // const data = await response.json();
                if (response.ok) {
                    setTimeout(() => location.reload(), 1500);
                } else {
                    removeMemberMessage.textContent =  'Error removing member.';
                    removeMemberMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Error removing member:', error);
                removeMemberMessage.textContent = 'An unexpected error occurred. Please try again.';
                removeMemberMessage.style.color = 'red';
            }
        });
    }

    // You might also want to ensure the other modals (like post search) close
    // if you click outside them. You can add them to the window click listener.
    const postSearchModal = document.getElementById('postSearchModal');
    if (postSearchModal) {
        window.addEventListener('click', (event) => {
            if (event.target === postSearchModal) {
                postSearchModal.style.display = 'none';
            }
        });
    }
});
