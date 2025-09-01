    function deleteUser(userId) {
      if (!confirm('Delete this user?')) return;
      fetch('/users/' + userId , {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then(res => {
        if (res.ok) {
          document.getElementById('user-' + userId).remove();
        } else {
          return res.json().then(data => {
            alert(data.message || 'Error deleting user.');
          });
        }
      })
      .catch(err => {
        console.error(err);
        alert('Request failed.');
      });
    }

    function toggleAdmin(userId) {
      fetch('/users/' + userId + '/toggle-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then(res => {
        if (res.ok) {
          location.reload();
        } else {
          return res.json().then(data => {
            alert(data.message || 'Error updating admin status.');
          });
        }
      })
      .catch(err => {
        console.error(err);
        alert('Request failed.');
      });
    }

    // Canvas chart rendering
    window.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById('userCanvas');
      const ctx = canvas.getContext('2d');

      const total = users.length;
      const adminCount = users.filter(u => u.isAdmin).length;
      const regularCount = total - adminCount;

      const barWidth = 600;
      const barHeight = 30;
      const padding = 20;

      const adminWidth = (adminCount / total) * barWidth;
      const regularWidth = (regularCount / total) * barWidth;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw admin bar
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(padding, padding, adminWidth, barHeight);

      // Draw regular user bar
      ctx.fillStyle = '#03a9f4';
      ctx.fillRect(padding + adminWidth, padding, regularWidth, barHeight);

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Admins: ${adminCount}`, padding, padding + barHeight + 20);
      ctx.fillText(`Regular Users: ${regularCount}`, padding + 150, padding + barHeight + 20);
    });
