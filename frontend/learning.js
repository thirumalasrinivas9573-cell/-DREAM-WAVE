const API_URL = "https://YOUR-RENDER-URL.onrender.com";
// ============================================
// PHASE 3: LEARNING + CONTENT SYSTEM
// Krishna AI - Books, Exams, Learning, Voice
// ============================================

// ✅ GLOBAL FLAGS TO PREVENT DUPLICATE API CALLS
let learningBooksInProgress = false;
let learningExamInProgress = false;
let learningTopicInProgress = false;

const LEARNING = {
  // ==================== BOOK LIBRARY ====================
  books: [],
  
  initBooks: function() {
    const stored = localStorage.getItem('krishna_books');
    if (stored) {
      this.books = JSON.parse(stored);
    } else {
      this.books = [
        { id: 1, name: 'Bhagavad Gita', author: 'Lord Krishna', category: 'Spirituality', url: '#', uploaded: false },
        { id: 2, name: 'The Power of Now', author: 'Eckhart Tolle', category: 'Mindfulness', url: '#', uploaded: false },
        { id: 3, name: 'Atomic Habits', author: 'James Clear', category: 'Personal Development', url: '#', uploaded: false },
        { id: 4, name: 'Deep Work', author: 'Cal Newport', category: 'Productivity', url: '#', uploaded: false }
      ];
      this.saveBooks();
    }
    return this.books;
  },
  
  saveBooks: function() {
    localStorage.setItem('krishna_books', JSON.stringify(this.books));
  },
  
  addBook: function(name, author, category, file) {
    const newBook = {
      id: Date.now(),
      name: name,
      author: author,
      category: category,
      url: URL.createObjectURL(file),
      uploaded: true,
      uploadedDate: new Date().toLocaleDateString(),
      size: (file.size / 1024).toFixed(2) + ' KB'
    };
    this.books.push(newBook);
    this.saveBooks();
    return newBook;
  },
  
  getBooksByGoal: async function(goal) {
    // ✅ PREVENT DUPLICATE CALLS
    if (learningBooksInProgress) {
      console.warn('⚠️ Book suggestions already in progress');
      return null;
    }

    learningBooksInProgress = true;
    console.log('🚀 SINGLE API CALL: getBooksByGoal');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await fetch(API_URL + '/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Suggest 5 best books for: ${goal}. Format: Book Name | Author | Why useful`,
          type: 'books'
        }),
        signal: controller.signal
      });
      } catch (error) {
        console.error('API error:', error);
        learningBooksInProgress = false;
        return 'Unable to fetch suggestions. Please try again.';
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ API ERROR: ' + response.status);
        return 'Unable to fetch suggestions. Please try again.';
      }

      const data = await response.json();
      const reply = data.reply || '';
      
      if (!reply) {
        console.warn('⚠️ Empty response from book API');
        return 'Unable to fetch suggestions. Please try again.';
      }

      console.log('✅ SINGLE RESPONSE RECEIVED (' + reply.length + ' chars)');
      return reply;

    } catch (error) {
      console.error('❌ Error fetching book suggestions:', error.message);
      return 'Unable to fetch suggestions. Please try again.';
    } finally {
      // ✅ ALWAYS RESET FLAG
      learningBooksInProgress = false;
    }
  },
  
  renderBookLibrary: function() {
    const container = document.getElementById('books-list-container');
    if (!container || this.books.length === 0) return;
    
    let html = '';
    this.books.forEach((book, index) => {
      html += `
        <div class="book-item" data-id="${book.id}">
          <div class="book-icon">📖</div>
          <div class="book-info">
            <div class="book-name">${book.name}</div>
            <div class="book-author">By: ${book.author}</div>
            <div class="book-category">${book.category}</div>
            ${book.uploadedDate ? `<div class="book-size">${book.size} • ${book.uploadedDate}</div>` : ''}
          </div>
          <button class="book-action" onclick="LEARNING.downloadBook(${book.id})" title="Download">
            ⬇️ Download
          </button>
          ${book.uploaded ? `<button class="book-delete" onclick="LEARNING.deleteBook(${book.id})" title="Delete">🗑️</button>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  },
  
  downloadBook: function(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (book && book.url && book.url !== '#') {
      const a = document.createElement('a');
      a.href = book.url;
      a.download = book.name + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showBookMessage(`📥 Downloading: ${book.name}`);
    } else {
      this.showBookMessage('📌 This book is not yet available for download');
    }
  },
  
  deleteBook: function(bookId) {
    if (confirm('Delete this book?')) {
      this.books = this.books.filter(b => b.id !== bookId);
      this.saveBooks();
      this.renderBookLibrary();
      this.showBookMessage('🗑️ Book deleted');
    }
  },
  
  showBookMessage: function(msg) {
    const msgDiv = document.getElementById('books-message');
    if (msgDiv) {
      msgDiv.textContent = msg;
      msgDiv.style.display = 'block';
      setTimeout(() => msgDiv.style.display = 'none', 3000);
    }
  },
  
  // ==================== EXAM MODE ====================
  currentExam: null,
  
  startExam: async function(subject, topic, difficulty) {
    // ✅ PREVENT DUPLICATE CALLS
    if (learningExamInProgress) {
      console.warn('⚠️ Exam generation already in progress');
      return;
    }

    learningExamInProgress = true;
    const msgDiv = document.getElementById('exam-message');
    if (msgDiv) msgDiv.textContent = '🔄 Generating exam questions...';

    console.log('🚀 SINGLE API CALL: startExam');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await fetch(API_URL + '/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate 10 multiple choice exam questions for: Subject: ${subject}, Topic: ${topic}, Difficulty: ${difficulty}. Format each as: Q1) Question? A) Option A B) Option B C) Option C D) Option D. After all questions, put "ANSWERS: 1-A, 2-B..." on new lines.`,
          type: 'exam'
        }),
        signal: controller.signal
      });
      } catch (error) {
        console.error('API error:', error);
        learningExamInProgress = false;
        if (msgDiv) msgDiv.textContent = '❌ Error generating exam. Please try again.';
        return;
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ API ERROR: ' + response.status);
        if (msgDiv) msgDiv.textContent = '❌ Error generating exam. Please try again.';
        return;
      }

      const data = await response.json();
      const reply = data.reply || '';
      
      if (!reply) {
        console.warn('⚠️ Empty response from exam API');
        if (msgDiv) msgDiv.textContent = '❌ Error generating exam. Please try again.';
        return;
      }

      console.log('✅ SINGLE RESPONSE RECEIVED (' + reply.length + ' chars)');
      this.parseExamQuestions(reply);
      if (msgDiv) msgDiv.textContent = '✅ Exam loaded! Complete all questions and click "Submit Exam"';

    } catch (error) {
      console.error('❌ Error generating exam:', error.message);
      if (msgDiv) msgDiv.textContent = '❌ Error generating exam. Please try again.';
    } finally {
      // ✅ ALWAYS RESET FLAG
      learningExamInProgress = false;
    }
  },
  
  parseExamQuestions: function(text) {
    const lines = text.split('\n');
    const questions = [];
    let currentQuestion = null;
    let answers = {};
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      // Check for answer key
      if (line.startsWith('ANSWERS:') || line.startsWith('Answer Key:')) {
        const answerText = line.replace(/^ANSWERS:|^Answer Key:/i, '').trim();
        const parts = answerText.split(',');
        parts.forEach(part => {
          const match = part.match(/(\d+)\s*-\s*([A-D])/i);
          if (match) answers[parseInt(match[1]) - 1] = match[2].toUpperCase();
        });
        continue;
      }
      
      // Parse question
      const qMatch = line.match(/^([QqPp]\d+\)?\s*)(.*)/);
      if (qMatch) {
        if (currentQuestion) questions.push(currentQuestion);
        currentQuestion = {
          question: qMatch[2],
          options: [],
          number: questions.length + 1,
          correctAnswer: answers[questions.length] || ''
        };
      } else if (currentQuestion && /^[A-D]\)\s*/.test(line)) {
        const option = line.substring(3).trim();
        currentQuestion.options.push(option);
      }
    }
    if (currentQuestion) questions.push(currentQuestion);
    
    this.currentExam = {
      questions: questions,
      answers: answers,
      userAnswers: new Array(questions.length).fill(''),
      startTime: new Date(),
      score: 0,
      completed: false
    };
    
    this.renderExamQuestions();
  },
  
  renderExamQuestions: function() {
    const container = document.getElementById('exam-questions-container');
    if (!container || !this.currentExam) return;
    
    let html = `<div class="exam-header">📝 Exam: ${this.currentExam.questions.length} Questions</div>`;
    
    this.currentExam.questions.forEach((q, idx) => {
      html += `
        <div class="exam-question-item">
          <div class="exam-q-number">Q${idx + 1}. ${q.question}</div>
          <div class="exam-options">
      `;
      q.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        html += `
          <label class="exam-option">
            <input type="radio" name="q${idx}" value="${letter}" 
              ${this.currentExam.userAnswers[idx] === letter ? 'checked' : ''}
              onchange="LEARNING.currentExam.userAnswers[${idx}] = '${letter}'">
            <span>${letter}) ${opt}</span>
          </label>
        `;
      });
      html += `
          </div>
        </div>
      `;
    });
    
    html += `
      <button class="exam-submit-btn" onclick="LEARNING.submitExam()">
        ✅ Submit Exam
      </button>
    `;
    
    container.innerHTML = html;
  },
  
  submitExam: function() {
    if (!this.currentExam) return;
    
    let score = 0;
    this.currentExam.questions.forEach((q, idx) => {
      if (this.currentExam.userAnswers[idx] === this.currentExam.answers[idx]) {
        score++;
      }
    });
    
    this.currentExam.score = score;
    this.currentExam.completed = true;
    const percentage = Math.round((score / this.currentExam.questions.length) * 100);
    
    const container = document.getElementById('exam-questions-container');
    container.innerHTML = `
      <div class="exam-result">
        <div class="result-title">📊 Your Score</div>
        <div class="result-score">${score} / ${this.currentExam.questions.length}</div>
        <div class="result-percentage">${percentage}%</div>
        <div class="result-message">
          ${percentage >= 80 ? '🌟 Excellent! You mastered this topic!' 
            : percentage >= 60 ? '👍 Good effort! Review weak areas.' 
            : '📚 Keep practicing! You can do better.'}
        </div>
        <button class="exam-retry-btn" onclick="LEARNING.resetExam()">
          🔄 Try Another Exam
        </button>
      </div>
    `;
    
    // Award XP for exam completion
    if (typeof GAMIFICATION !== 'undefined') {
      GAMIFICATION.addXP(score * 5, `Exam: ${percentage}% Score`);
      updateGamificationWidget();
    }
  },
  
  resetExam: function() {
    this.currentExam = null;
    document.getElementById('exam-questions-container').innerHTML = '<div style="text-align:center;color:#888;padding:20px;">📝 Exam cleared. Start a new exam!</div>';
  },
  
  // ==================== SMART LEARNING MODE ====================
  learnTopic: async function(topic) {
    // ✅ PREVENT DUPLICATE CALLS
    if (learningTopicInProgress) {
      console.warn('⚠️ Topic learning already in progress');
      return;
    }

    learningTopicInProgress = true;
    const msgDiv = document.getElementById('learn-message');
    if (msgDiv) msgDiv.textContent = '🔄 Preparing learning content...';

    console.log('🚀 SINGLE API CALL: learnTopic');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await fetch(API_URL + '/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Teach me about: ${topic}. Include: 1) Core Concept (2-3 lines), 2) Real-World Example (2-3 lines), 3) Step-by-Step Guide (4-5 bullet points), 4) Key Takeaway (1 line)`,
          type: 'learn'
        }),
        signal: controller.signal
      });
      } catch (error) {
        console.error('API error:', error);
        if (msgDiv) msgDiv.textContent = '❌ Error loading content. Please try again.';
        return;
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ API ERROR: ' + response.status);
        if (msgDiv) msgDiv.textContent = '❌ Error loading content. Please try again.';
        return;
      }

      const data = await response.json();
      const reply = data.reply || '';
      
      if (!reply) {
        console.warn('⚠️ Empty response from learning API');
        if (msgDiv) msgDiv.textContent = '❌ Error loading content. Please try again.';
        return;
      }

      console.log('✅ SINGLE RESPONSE RECEIVED (' + reply.length + ' chars)');
      this.renderLearningContent(topic, reply);
      if (msgDiv) msgDiv.innerHTML = `✅ Content loaded! <button onclick="LEARNING.toggleVoice('learn')" class="voice-btn">🔊 Play Audio</button>`;

    } catch (error) {
      console.error('❌ Error fetching learning content:', error.message);
      if (msgDiv) msgDiv.textContent = '❌ Error loading content. Please try again.';
    } finally {
      // ✅ ALWAYS RESET FLAG
      learningTopicInProgress = false;
    }
  },
  
  renderLearningContent: function(topic, content) {
    const container = document.getElementById('learn-content-container');
    if (!container) return;
    
    const sections = content.split(/\n(?=\d\)|\*\*|###)/);
    
    let html = `
      <div class="learn-header">📚 Learning: ${topic}</div>
      <div class="learn-content">
    `;
    
    sections.forEach((section, idx) => {
      if (section.trim()) {
        html += `
          <div class="learn-section">
            <div class="learn-text">${section.trim()}</div>
          </div>
        `;
      }
    });
    
    html += `
      </div>
      <div class="learn-action-buttons">
        <button class="learn-btn" onclick="LEARNING.toggleVoice('learn')">🔊 Speak Content</button>
        <button class="learn-btn" onclick="LEARNING.resetLearning()">✨ Learn Another Topic</button>
      </div>
    `;
    
    container.innerHTML = html;
    this.currentLearningContent = content;
  },
  
  resetLearning: function() {
    document.getElementById('learn-content-container').innerHTML = '<div style="text-align:center;color:#888;padding:20px;">📖 Ready to learn something new!</div>';
    this.currentLearningContent = '';
  },
  
  currentLearningContent: '',
  
  // ==================== KRISHNA VOICE SYSTEM ====================
  voiceEnabled: window.speechSynthesis !== undefined,
  currentUtterance: null,
  isPlaying: false,
  
  toggleVoice: function(source) {
    if (!this.voiceEnabled) {
      alert('Voice synthesis not supported in this browser');
      return;
    }
    
    if (this.isPlaying) {
      window.speechSynthesis.cancel();
      this.isPlaying = false;
      this.updateVoiceButton(source);
      return;
    }
    
    let textToSpeak = '';
    
    if (source === 'learn') {
      textToSpeak = this.currentLearningContent;
    } else if (source === 'exam') {
      if (this.currentExam && !this.currentExam.completed) {
        textToSpeak = this.currentExam.questions
          .map((q, i) => `Question ${i + 1}: ${q.question} Options: ${q.options.join(', ')}`)
          .join('. Next question. ');
      }
    } else {
      textToSpeak = document.getElementById(source + '-message')?.textContent || '';
    }
    
    if (!textToSpeak) {
      alert('No content to speak');
      return;
    }
    
    this.speakText(textToSpeak, source);
  },
  
  speakText: function(text, source) {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = 0.8; // Slow voice
    this.currentUtterance.pitch = 0.9; // Calm pitch
    this.currentUtterance.volume = 1.0;
    
    this.currentUtterance.onstart = () => {
      this.isPlaying = true;
      this.updateVoiceButton(source);
    };
    
    this.currentUtterance.onend = () => {
      this.isPlaying = false;
      this.updateVoiceButton(source);
    };
    
    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isPlaying = false;
      this.updateVoiceButton(source);
    };
    
    window.speechSynthesis.speak(this.currentUtterance);
  },
  
  updateVoiceButton: function(source) {
    const btn = document.querySelector(`button[onclick*="toggleVoice('${source}')"]`);
    if (btn) {
      btn.textContent = this.isPlaying ? '⏹️ stop Audio' : '🔊 Play Audio';
      btn.style.background = this.isPlaying ? 'rgba(220, 100, 100, 0.3)' : 'rgba(245, 200, 66, 0.15)';
    }
  },
  
  // ==================== FILE UPLOAD HANDLER ====================
  handlePdfUpload: function(file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50 MB');
      return;
    }
    
    const name = prompt('Book name:', file.name.replace('.pdf', ''));
    if (!name) return;
    
    const author = prompt('Author name:', 'Unknown');
    if (!author) return;
    
    const category = prompt('Category:', 'Personal Development');
    if (!category) return;
    
    const book = this.addBook(name, author, category, file);
    this.renderBookLibrary();
    this.showBookMessage(`✅ "${name}" uploaded successfully!`);
  }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', function() {
  LEARNING.initBooks();
  LEARNING.renderBookLibrary();
   const form = document.getElementById('learningForm');
   const output = document.getElementById('learningOutput');
   const spinner = document.getElementById('learningSpinner');
   if (!form) return;
   form.addEventListener('submit', async (e) => {
     e.preventDefault();
     output.innerHTML = '';
     spinner.style.display = 'inline-block';
     const goal = form.goal.value.trim();
     try {
       let res;
       try {
         res = await fetch(API_URL + '/api/learning', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ goal })
       });
         if (!res.ok) throw new Error('API error');
         const data = await res.json();
         output.innerHTML = formatLearning(data.learning);
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

 function formatLearning(text) {
   if (!text) return '';
   text = text.replace(/^(\d+\.[^\n]+)/gm, '<h4>$1</h4>');
   text = text.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
   text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
   return text;
 }
