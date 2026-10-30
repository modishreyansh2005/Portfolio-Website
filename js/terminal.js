/**
 * Interactive AI Engineer Terminal Console
 * Allows visitors, recruiters, and engineers to query Shreyansh Modi's profile,
 * inspect RAG architectures, run synthetic model evaluations, and download resume.
 */

class InteractiveTerminal {
  constructor() {
    this.container = document.getElementById('terminal-body');
    this.input = document.getElementById('terminal-input');
    if (!this.container || !this.input) return;

    this.history = [];
    this.historyIndex = -1;

    this.commands = {
      help: () => `
Available system commands:
  <span class="cmd-hl">about</span>        - Summary of Shreyansh's AI/ML background & education
  <span class="cmd-hl">experience</span>   - Work history (Trentium Solution, BISAG-N, Sahana)
  <span class="cmd-hl">projects</span>     - Production AI projects (Agentic AI, PDF RAG, Price Prediction)
  <span class="cmd-hl">skills</span>       - Core technical skills (Python, LangChain, RAG, Scikit-learn, SQL)
  <span class="cmd-hl">education</span>    - B.Tech IT (CGPA: 8.23) & Diploma (CGPA: 8.35)
  <span class="cmd-hl">resume</span>       - Direct link to download Shreyansh_Modi_Resume.pdf
  <span class="cmd-hl">contact</span>      - Phone (+91-9016421928) & email coordinates
  <span class="cmd-hl">clear</span>        - Clear terminal buffer
`,
      about: () => `
<span class="term-bold">SHREYANSH MODI // AI & MACHINE LEARNING ENGINEER</span>
Education  : B.Tech IT Software Engineering @ Gandhinagar University (CGPA 8.23)
Focus Areas: Agentic AI, Retrieval-Augmented Generation (RAG), LLMs, Scikit-learn, Python
Current    : AI ML Engineer I @ Trentium Solution (GMB Pro AI review management)
Phone      : +91 - 9016421928 | Email: modishreyansh21928@gmail.com
`,
      experience: () => `
[1] <span class="term-bold">Trentium Solution</span> | AI ML Engineer I (1 June 2025 - Present)
    - Built AI-powered review management for GMB Pro with AI replies & Magic QR.
[2] <span class="term-bold">BISAG - N</span> | AI ML Internship (1 Jan 2025 - 30 April 2025)
    - Developed multi-document PDF RAG chatbot with embeddings & vector search.
[3] <span class="term-bold">Sahana System Limited</span> | AI ML Internship (20 June 2024 - 5 Aug 2024)
    - ML model development, data preprocessing, Scikit-learn, Pandas & NumPy.
`,
      projects: () => `
[1] <span class="term-bold">Agentic AI Customer Support System</span> | Python, LLMs, LangChain, RAG, FastAPI
    - Multi-agent automated query analysis, information retrieval, and verifiable responses.
[2] <span class="term-bold">PDF RAG Chatbot</span> | LangChain, Vector Embeddings, Streamlit
    - Accurate document Q&A grounded strictly on uploaded PDF content.
[3] <span class="term-bold">House Price Prediction</span> | Regression, Scikit-learn, Pandas, NumPy
    - End-to-end regression model with feature engineering and cross-validation.
`,
      skills: () => `
Core Languages: Python Programming, SQL, C++
Machine Learning: Scikit-learn, Supervised/Unsupervised Learning, Regression, NumPy, Pandas
Generative AI : Large Language Models (LLMs), RAG, LangChain, Vector Search, Embeddings
Web & Tools   : FastAPI, Streamlit, Git & GitHub, Model Evaluation, Data Analytics
`,
      education: () => `
- <span class="term-bold">Bachelor of Technology - IT Software Engineering</span>
  Gandhinagar University | CGPA: 8.23 | 2023 - 2026
- <span class="term-bold">Diploma in Engineering</span>
  Government Polytechnic Himatnagar | CGPA: 8.35 | 2020 - 2023
`,
      resume: () => `
Downloading Resume...
<a href="assets/Shreyansh_Modi_Resume.pdf" target="_blank" class="term-link"><i class="fa-solid fa-file-pdf"></i> Click here to open Shreyansh_Modi_Resume.pdf</a>
`,
      contact: () => `
Name     : Shreyansh Modi
Phone    : <a href="tel:+919016421928" class="term-link">+91 - 9016421928</a>
Email    : <a href="mailto:modishreyansh21928@gmail.com" class="term-link">modishreyansh21928@gmail.com</a>
Location : Gujarat, India
`,
      clear: () => {
        this.container.innerHTML = '';
        return null;
      }
    };

    this.bindEvents();
  }

  bindEvents() {
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const raw = this.input.value.trim();
        if (raw) {
          this.execute(raw);
          this.history.push(raw);
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      }
    });

    // Chip buttons
    const chips = document.querySelectorAll('.term-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.dataset.cmd;
        if (cmd) {
          this.input.value = cmd;
          this.execute(cmd);
          this.input.value = '';
          if (window.classicalAudio) window.classicalAudio.playTick(950);
        }
      });
    });
  }

  execute(rawCmd) {
    const cmd = rawCmd.toLowerCase().split(' ')[0];
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = `<span class="term-prompt">shreyansh@ai-terminal:~$</span> <span class="term-input-text">${rawCmd}</span>`;
    this.container.appendChild(line);

    if (this.commands[cmd]) {
      const output = this.commands[cmd]();
      if (output !== null) {
        const outDiv = document.createElement('div');
        outDiv.className = 'term-output';
        outDiv.innerHTML = output;
        this.container.appendChild(outDiv);
      }
    } else {
      const errDiv = document.createElement('div');
      errDiv.className = 'term-output term-error';
      errDiv.innerHTML = `command not found: "${rawCmd}". Type <span class="cmd-hl">help</span> for available routines.`;
      this.container.appendChild(errDiv);
    }

    this.container.scrollTop = this.container.scrollHeight;
    if (window.classicalAudio) window.classicalAudio.playTick(800);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.interactiveTerminal = new InteractiveTerminal();
});
