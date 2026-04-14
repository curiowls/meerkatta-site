import './style.css';

// ─── How It Works Video/Voice Toggle ───
document.querySelectorAll('.flow-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.flow-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const mode = tab.dataset.tab;
    document.querySelectorAll('.flow-content').forEach(content => {
      content.style.display = content.dataset.mode === mode ? 'block' : 'none';
    });
  });
});

// ─── FAQ Accordion ───
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const isExpanded = question.getAttribute('aria-expanded') === 'true';

    question.setAttribute('aria-expanded', !isExpanded);
    answer.hidden = isExpanded;
  });
});

// ─── Model 2 Interest Button ───
const interestBtn = document.getElementById('interestBtn');
const interestCount = document.getElementById('interestCount');

if (interestBtn && interestCount) {
  const STORAGE_KEY = 'meerkatta_interest_voted';
  let count = parseInt(localStorage.getItem('meerkatta_interest_count') || '0', 10);
  const hasVoted = localStorage.getItem(STORAGE_KEY) === 'true';

  function updateCount() {
    interestCount.textContent = count > 0 ? `${count} interested` : '';
  }
  updateCount();

  if (hasVoted) {
    interestBtn.style.opacity = '0.6';
    interestBtn.querySelector('span:first-child').textContent = 'Voted!';
  }

  interestBtn.addEventListener('click', () => {
    if (hasVoted) return;
    count++;
    localStorage.setItem('meerkatta_interest_count', count.toString());
    localStorage.setItem(STORAGE_KEY, 'true');
    interestBtn.querySelector('span:first-child').textContent = 'Voted!';
    interestBtn.style.opacity = '0.6';
    updateCount();
  });
}
