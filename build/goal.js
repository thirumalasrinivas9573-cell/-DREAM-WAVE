const API_URL = "https://your-render-url.onrender.com";
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goalForm');
  const list = document.getElementById('goalList');
  const spinner = document.getElementById('goalSpinner');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      spinner.style.display = 'inline-block';
      try {
        let res;
        try {
          res = await fetch(API_URL + '/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.value.trim(),
            category: form.category.value.trim(),
            duration: form.duration.value.trim(),
            skillLevel: form.skillLevel.value.trim()
          })
        });
          if (!res.ok) throw new Error('API error');
          await fetchGoals();
          form.reset();
        } catch (e) {
          alert('Error: ' + e.message);
        } finally {
          spinner.style.display = 'none';
        }
      } catch (e) {
        alert('Error: ' + e.message);
      } finally {
        spinner.style.display = 'none';
      }
    });
  }
  fetchGoals();

  async function fetchGoals() {
    list.innerHTML = '';
    spinner.style.display = 'inline-block';
    try {
      let res;
      try {
        res = await fetch(API_URL + '/api/goals');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (data.goals && data.goals.length) {
          data.goals.forEach(goal => {
            const li = document.createElement('li');
            li.textContent = `${goal.name} (${goal.category}, ${goal.duration}, ${goal.skillLevel})`;
            list.appendChild(li);
          });
        } else {
          list.innerHTML = '<li>No goals set.</li>';
        }
      } catch (e) {
        list.innerHTML = `<li style='color:#f44'>Error: ${e.message}</li>`;
      } finally {
        spinner.style.display = 'none';
      }
      if (data.goals && data.goals.length) {
        data.goals.forEach(goal => {
          const li = document.createElement('li');
          li.textContent = `${goal.name} (${goal.category}, ${goal.duration}, ${goal.skillLevel})`;
          list.appendChild(li);
        });
      } else {
        list.innerHTML = '<li>No goals set.</li>';
      }
    } catch (e) {
      list.innerHTML = `<li style='color:#f44'>Error: ${e.message}</li>`;
    } finally {
      spinner.style.display = 'none';
    }
  }
});
