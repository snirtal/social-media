    document.getElementById('editForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const messageEl = document.getElementById('message');
      messageEl.textContent = '';
      messageEl.className = 'message';

      const data = {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        practiceTime: Number(document.getElementById('practiceTime').value),
        maxParticipants: Number(document.getElementById('maxParticipants').value)
      };
      let id = document.getElementById('id').value;
      try {
        const response = await fetch(`http://${window.location.host}/hobbies/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          messageEl.textContent = 'Hobby updated successfully!';
          messageEl.classList.add('success');
          // Optionally redirect:
          // window.location.href = '/hobbies/view';
        } else {
          const error = await response.text();
          messageEl.textContent = 'Update failed: ' + error;
          messageEl.classList.add('error');
        }
      } catch (err) {
        console.error(err);
        messageEl.textContent = 'An error occurred.';
        messageEl.classList.add('error');
      }
    });
