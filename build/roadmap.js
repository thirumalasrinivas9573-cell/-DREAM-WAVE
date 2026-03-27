const API_URL = "https://YOUR-RENDER-URL.onrender.com";
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('roadmapForm');
  const output = document.getElementById('roadmapOutput');
  const spinner = document.getElementById('roadmapSpinner');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    output.innerHTML = '';
    spinner.style.display = 'inline-block';
    const goal = form.goal.value.trim();
    try {
      const res = await fetch(`${API_URL}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      output.innerHTML = formatRoadmap(data.roadmap);
    } catch (e) {
      output.innerHTML = `<span style='color:#f44'>Error: ${e.message}</span>`;
    } finally {
      spinner.style.display = 'none';
    }
  });
});

function formatRoadmap(text) {
  if (!text) return '';
  text = text.replace(/^(\d+\.[^\n]+)/gm, '<h4>$1</h4>');
  text = text.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  return text;
}
