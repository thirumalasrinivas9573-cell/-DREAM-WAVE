const API_URL = "https://YOUR-RENDER-URL.onrender.com";
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('examPrepForm');
  const output = document.getElementById('examPrepOutput');
  const spinner = document.getElementById('examPrepSpinner');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    output.innerHTML = '';
    spinner.style.display = 'inline-block';
    const subject = form.subject.value.trim();
    const topic = form.topic.value.trim();
    try {
      let res;
      try {
        res = await fetch(API_URL + '/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic })
      });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        output.innerHTML = formatExamOutput(data.answer);
      } catch (e) {
        output.innerHTML = `<span style='color:#f44'>Error: ${e.message}</span>`;
      } finally {
        spinner.style.display = 'none';
      }
    } catch (e) {
      output.innerHTML = `<span style='color:#f44'>Error: ${e.message}</span>`;
    } finally {
      spinner.style.display = 'none';
    }
  });
});

function formatExamOutput(text) {
  if (!text) return '';
  text = text.replace(/^(\d+\.[^\n]+)/gm, '<h4>$1</h4>');
  text = text.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/^Q:/gm, '<b>Q:</b>');
  text = text.replace(/^A:/gm, '<b>A:</b>');
  text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  return text;
}
