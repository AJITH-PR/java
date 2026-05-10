 const FILES_PATH = 'assets/pdf/Files.json';
  let FILES = [];
  let list;
  let empty;
  let stats;
  let footerCount;
  let searchInput;

  async function fetchFiles() {
    const response = await fetch(FILES_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load ${FILES_PATH}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(`${FILES_PATH} must contain a JSON array.`);
    }

    return data;
  }

  function initializeElements() {
    list = document.getElementById('file-list');
    empty = document.getElementById('empty');
    stats = document.getElementById('stats');
    footerCount = document.getElementById('footer-count');
    searchInput = document.getElementById('search');

    if (!list || !empty || !stats || !footerCount) {
      throw new Error('Required DOM elements are missing.');
    }
  }

  function attachSearchListener() {
    if (!searchInput) {
      return;
    }

    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      render(!q ? FILES : FILES.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.desc?.toLowerCase().includes(q) ||
        f.tags?.some(t => t.toLowerCase().includes(q))
      ));
    });
  }

  async function init() {
    initializeElements();
    attachSearchListener();

    try {
      FILES = await fetchFiles();
      render(FILES);
      footerCount.textContent = `${FILES.length} total`;
    } catch (error) {
      console.error(error);
      list.innerHTML = '';
      empty.style.display = 'block';
      stats.textContent = '0 documents';
      footerCount.textContent = '0 total';
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  function formatDate(str) {
    return new Date(str).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  }

  function render(data) {
    list.innerHTML = '';
    if (!data.length) {
      empty.style.display = 'block';
      stats.textContent = '0 documents';
      return;
    }
    empty.style.display = 'none';
    stats.textContent = `${data.length} document${data.length !== 1 ? 's' : ''}`;

    data.forEach((f, i) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.style.animationDelay = `${i * 50}ms`;

      li.innerHTML = `
        <div class="file-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="file-body">
          <div class="file-name">${f.name}</div>
          <div class="file-meta">
            <span>${f.size}</span>
            <span>${f.pages} pages</span>
            <span>${formatDate(f.date)}</span>
          </div>
          ${f.desc ? `<div class="file-desc">${f.desc}</div>` : ''}
          ${f.tags?.length ? `<div class="file-tags">${f.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : ''}
        </div>
        <a class="btn-dl" href="${f.href}" download title="Download ${f.name}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Download</span>
        </a>`;
      list.appendChild(li);
    });
  }

  // Initial load from JSON file
  // The search listener is attached inside init().
