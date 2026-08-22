/**
 * site-search.js
 * Instant Search & Command Palette for ElectraSim
 * Pure Vanilla JavaScript • Zero Runtime Dependencies • Accessible & Fast
 */

(() => {
  let searchIndex = null;
  let isFetching = false;
  let activeFilter = 'all';
  let activeIndex = -1;
  let currentResults = [];

  const QUICK_LINKS = [
    {
      title: 'Voltage Drop Calculator',
      description: 'Calculate voltage drop, % loss, and cable limits under BS 7671 / IEC.',
      url: '/tools/voltage-drop-calculator/',
      type: 'tool',
      category: 'Calculators',
    },
    {
      title: 'How to Wire a Two-Way Switch',
      description: 'Complete guide for 2-way staircase and corridor lighting circuits.',
      url: '/blog/how-to-wire-a-two-way-switch-complete-guide/',
      type: 'article',
      category: 'Guides',
    },
    {
      title: 'What is an RCBO? Difference Between RCD, MCB & RCBO',
      description: 'Understand modern consumer unit protection devices and trip characteristics.',
      url: '/blog/what-is-an-rcbo-difference-between-rcd-mcb-rcbo/',
      type: 'article',
      category: 'Regulations',
    },
    {
      title: 'ElectraSim vs Online Circuit Simulators',
      description: 'Compare ElectraSim with Tinkercad, CircuitLab, Falstad, and EveryCircuit.',
      url: '/compare/',
      type: 'page',
      category: 'Pages',
    },
  ];

  async function loadSearchIndex() {
    if (searchIndex || isFetching) return searchIndex;
    isFetching = true;
    try {
      const response = await fetch('/search.json');
      if (response.ok) {
        searchIndex = await response.json();
      } else {
        console.warn('Search index fetch failed:', response.status);
      }
    } catch (err) {
      console.warn('Unable to load search index:', err);
    } finally {
      isFetching = false;
    }
    return searchIndex;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightMatches(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!cleanQuery) return escaped;
    const regex = new RegExp(`(${cleanQuery})`, 'gi');
    return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  function scoreItem(item, queryTokens, fullQuery) {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const tagsLower = item.tags ? item.tags.map((t) => t.toLowerCase()) : [];

    // Exact full query matches
    if (titleLower === fullQuery) score += 200;
    else if (titleLower.startsWith(fullQuery)) score += 120;
    else if (titleLower.includes(fullQuery)) score += 80;

    if (descLower.includes(fullQuery)) score += 30;

    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 40;
      if (descLower.includes(token)) score += 15;
      if (tagsLower.some((t) => t.includes(token))) score += 25;
    }

    // Boost calculators slightly as high-utility tools
    if (item.type === 'tool') score += 10;

    return score;
  }

  function search(query) {
    if (!searchIndex) return [];
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const tokens = cleanQuery.split(/\s+/).filter(Boolean);

    let list = searchIndex;
    if (activeFilter !== 'all') {
      list = list.filter((item) => {
        if (activeFilter === 'tool') return item.type === 'tool';
        if (activeFilter === 'article') return item.type === 'article';
        if (activeFilter === 'guide') return item.type === 'guide';
        return true;
      });
    }

    const scored = [];
    for (const item of list) {
      const score = scoreItem(item, tokens, cleanQuery);
      if (score > 0) {
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map((s) => s.item);
  }

  function renderItem(item, query, isSelected, index) {
    const titleHtml = highlightMatches(item.title, query);
    const descHtml = highlightMatches(item.description, query);
    const typeClass = `type-badge-${item.type}`;
    const typeLabel =
      item.type === 'tool'
        ? 'Calculator'
        : item.type === 'guide'
          ? 'Guide'
          : item.type === 'article'
            ? 'Article'
            : 'Page';

    return `
      <li
        role="option"
        id="search-opt-${index}"
        aria-selected="${isSelected ? 'true' : 'false'}"
        class="search-result-item ${isSelected ? 'selected' : ''}"
        data-url="${item.url}"
      >
        <a href="${item.url}" class="search-result-link" tabindex="-1">
          <div class="search-result-header">
            <span class="search-type-badge ${typeClass}">${typeLabel}</span>
            <span class="search-category-tag">${escapeHtml(item.category)}</span>
          </div>
          <div class="search-result-title">${titleHtml}</div>
          <div class="search-result-desc">${descHtml}</div>
        </a>
      </li>
    `;
  }

  function updateResultsView(dialog, query) {
    const listEl = dialog.querySelector('#site-search-results');
    const emptyEl = dialog.querySelector('#site-search-empty');
    const quickLinksEl = dialog.querySelector('#site-search-quicklinks');

    if (!listEl) return;

    const trimmed = query.trim();

    if (!trimmed) {
      currentResults = QUICK_LINKS;
      if (emptyEl) emptyEl.hidden = true;
      if (quickLinksEl) quickLinksEl.hidden = false;
      listEl.innerHTML = currentResults
        .map((item, idx) => renderItem(item, '', idx === activeIndex, idx))
        .join('');
      return;
    }

    if (quickLinksEl) quickLinksEl.hidden = true;
    currentResults = search(trimmed);

    if (currentResults.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.hidden = false;
        const queryDisplay = emptyEl.querySelector('#search-empty-query');
        if (queryDisplay) queryDisplay.textContent = trimmed;
      }
    } else {
      if (emptyEl) emptyEl.hidden = true;
      listEl.innerHTML = currentResults
        .map((item, idx) => renderItem(item, trimmed, idx === activeIndex, idx))
        .join('');
    }
  }

  function selectOption(index) {
    const listEl = document.querySelector('#site-search-results');
    if (!listEl || currentResults.length === 0) return;

    activeIndex = Math.max(0, Math.min(index, currentResults.length - 1));

    const options = listEl.querySelectorAll('.search-result-item');
    options.forEach((opt, idx) => {
      if (idx === activeIndex) {
        opt.classList.add('selected');
        opt.setAttribute('aria-selected', 'true');
        opt.scrollIntoView({ block: 'nearest' });
      } else {
        opt.classList.remove('selected');
        opt.setAttribute('aria-selected', 'false');
      }
    });

    const input = document.querySelector('#site-search-input');
    if (input) {
      input.setAttribute('aria-activedescendant', `search-opt-${activeIndex}`);
    }
  }

  function navigateToActive() {
    if (activeIndex >= 0 && activeIndex < currentResults.length) {
      const item = currentResults[activeIndex];
      if (item?.url) {
        window.location.href = item.url;
      }
    }
  }

  function openSearchModal() {
    const dialog = document.getElementById('site-search-dialog');
    if (!dialog) return;

    // Load search index in background
    loadSearchIndex().then(() => {
      const input = dialog.querySelector('#site-search-input');
      updateResultsView(dialog, input ? input.value : '');
    });

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    const input = dialog.querySelector('#site-search-input');
    if (input) {
      input.value = '';
      activeIndex = 0;
      updateResultsView(dialog, '');
      setTimeout(() => input.focus(), 50);
    }
  }

  function closeSearchModal() {
    const dialog = document.getElementById('site-search-dialog');
    if (!dialog) return;

    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  function init() {
    const dialog = document.getElementById('site-search-dialog');
    if (!dialog) return;

    const input = dialog.querySelector('#site-search-input');
    const filterBtns = dialog.querySelectorAll('.search-filter-pill');
    const closeBtn = dialog.querySelector('#site-search-close-btn');

    // Trigger button listeners
    const triggers = document.querySelectorAll('[data-search-trigger]');
    triggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSearchModal();
      });
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSearchModal);
    }

    // Light-dismiss fallback for browsers without native closedby support
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (!isDialogContent) {
          closeSearchModal();
        }
      });
    }

    // Input typing & keyboard navigation
    if (input) {
      let debounceTimer;
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          activeIndex = 0;
          updateResultsView(dialog, input.value);
        }, 50);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectOption(activeIndex + 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectOption(activeIndex - 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          navigateToActive();
        } else if (e.key === 'Escape') {
          closeSearchModal();
        }
      });
    }

    // Filter pill buttons
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        activeIndex = 0;
        if (input) {
          updateResultsView(dialog, input.value);
        }
      });
    });

    // Global keyboard shortcuts: Cmd+K, Ctrl+K, or "/"
    window.addEventListener('keydown', (e) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isSlash =
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '');

      if (isCmdK || isSlash) {
        e.preventDefault();
        if (dialog.open) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
      }
    });

    // Preload index on idle or initial hover
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadSearchIndex(), { timeout: 3000 });
    } else {
      setTimeout(() => loadSearchIndex(), 2000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
