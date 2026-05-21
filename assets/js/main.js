/* ============================================
   AdCalcs.com - 主 JavaScript
   ============================================ */

// DOM Ready
document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Menu Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-item').forEach(function (item) {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        item.classList.toggle('active');
      });
    }
  });

  // --- Active Nav Link ---
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && currentPath.indexOf(href) !== -1 && href !== '/') {
      link.classList.add('active');
    } else if (href === '/' && (currentPath === '/' || currentPath === '')) {
      link.classList.add('active');
    }
  });

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Navbar Scroll Class ---
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
    // Trigger on load
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    }
  }

  // --- Scroll Reveal (Intersection Observer) ---
  function createRevealObserver() {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }
  createRevealObserver();

  // --- Number Counting Animation ---
  function animateCounters() {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-target'));
          var prefix = el.getAttribute('data-prefix') || '';
          var suffix = el.getAttribute('data-suffix') || '';
          var duration = 2000;
          var startTime = performance.now();

          function updateCounter(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            var current = eased * target;
            var display = prefix;

            if (Number.isInteger(target)) {
              display += Math.round(current).toLocaleString();
            } else {
              display += current.toFixed(2);
            }
            display += suffix;
            el.textContent = display;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              // Final value
              var finalDisplay = prefix;
              if (Number.isInteger(target)) {
                finalDisplay += Math.round(target).toLocaleString();
              } else {
                finalDisplay += target.toFixed(2);
              }
              finalDisplay += suffix;
              el.textContent = finalDisplay;
            }
          }
          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-value').forEach(function (el) {
      counterObserver.observe(el);
    });
  }
  animateCounters();
});

/* ============================================
   Blog Article: TOC Generation
   ============================================ */
(function () {
  var article = document.querySelector('.blog-article');
  if (!article) return;

  var container = article.querySelector('.container');
  var content = article.querySelector('.content');
  if (!container || !content) return;

  var headings = content.querySelectorAll('h2, h3');
  if (headings.length < 2) return;

  // Skip if article already has a hardcoded TOC card
  if (content.querySelector('.toc-card')) return;

  // --- Assign IDs to headings ---
  headings.forEach(function (h, i) {
    if (!h.id) {
      h.id = 'toc-' + i;
    }
  });

  // --- Build TOC List ---
  var tocList = document.createElement('ul');
  tocList.className = 'toc-list';

  headings.forEach(function (h, i) {
    var tag = h.tagName.toLowerCase();
    var li = document.createElement('li');
    li.className = 'toc-item toc-' + tag;
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // --- Build TOC Sidebar ---
  var tocAside = document.createElement('aside');
  tocAside.className = 'blog-toc';
  tocAside.id = 'blog-toc';

  var tocHeader = document.createElement('div');
  tocHeader.className = 'blog-toc-header';

  var tocTitle = document.createElement('span');
  tocTitle.textContent = '📑 文章目录';

  var toggleBtn = document.createElement('button');
  toggleBtn.className = 'toc-toggle';
  toggleBtn.type = 'button';
  toggleBtn.setAttribute('aria-label', '展开目录');
  toggleBtn.textContent = '☰ 目录';

  tocHeader.appendChild(tocTitle);
  tocHeader.appendChild(toggleBtn);
  tocAside.appendChild(tocHeader);
  tocAside.appendChild(tocList);

  // --- Restructure DOM: wrap content + TOC in flex wrapper ---
  var wrapper = document.createElement('div');
  wrapper.className = 'blog-article-content-wrapper';

  // Move content into wrapper
  content.parentNode.insertBefore(wrapper, content);
  wrapper.appendChild(tocAside);
  wrapper.appendChild(content);

  // --- IntersectionObserver for active heading ---
  var tocLinks = tocList.querySelectorAll('a');
  var headingObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        tocLinks.forEach(function (link) {
          link.parentElement.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.parentElement.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0, rootMargin: '-80px 0px -65% 0px' });

  headings.forEach(function (h) { headingObserver.observe(h); });

  // --- Mobile Toggle ---
  toggleBtn.addEventListener('click', function () {
    tocAside.classList.toggle('open');
    toggleBtn.textContent = tocAside.classList.contains('open') ? '✕ 收起' : '☰ 目录';
  });
})();

/* ============================================
   Blog Article: Share Buttons
   ============================================ */
(function () {
  var content = document.querySelector('.blog-article .content');
  if (!content) return;

  // Check if share bar already exists
  if (content.querySelector('.share-bar')) return;

  var url = encodeURIComponent(window.location.href);
  var title = encodeURIComponent((document.querySelector('title') || {}).textContent || '');

  var bar = document.createElement('div');
  bar.className = 'share-bar';

  bar.innerHTML =
    '<span class="share-bar-label">分享</span>' +
    '<a class="share-btn share-twitter" href="https://twitter.com/intent/tweet?text=' + title + '&url=' + url + '" target="_blank" rel="noopener" aria-label="分享到 Twitter">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
    '</a>' +
    '<a class="share-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=' + url + '" target="_blank" rel="noopener" aria-label="分享到 Facebook">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
    '</a>' +
    '<button class="share-btn share-copy" aria-label="复制链接">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
      '<span class="copy-tip">已复制</span>' +
    '</button>';

  content.appendChild(bar);

  // Copy link handler
  var copyBtn = bar.querySelector('.share-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        var tip = copyBtn.querySelector('.copy-tip');
        if (tip) {
          tip.style.opacity = '1';
          setTimeout(function () { tip.style.opacity = '0'; }, 2000);
        }
      }).catch(function () {
        // Fallback
        var tip = copyBtn.querySelector('.copy-tip');
        if (tip) {
          tip.textContent = '复制失败';
          tip.style.opacity = '1';
          setTimeout(function () { tip.style.opacity = '0'; }, 2000);
        }
      });
    });
  }
})();

/* ============================================
   Back to Top Button
   ============================================ */
(function () {
  // Only show on article pages and longer pages
  if (document.body.scrollHeight < 1500) return;

  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', '返回顶部');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(btn);

  var scrollHandler = function () {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================
   Image Lazy Loading
   ============================================ */
(function () {
  document.querySelectorAll('.blog-article .content img:not([loading])').forEach(function (img) {
    img.setAttribute('loading', 'lazy');
  });
})();

/* ============================================
   Category Tag Filter (for blog listing pages)
   ============================================ */
(function () {
  var tags = document.querySelectorAll('.category-tags a');
  // Category tags are real links to /blog/{category}/ pages
  // Update active state on page load based on current URL
  var currentPath = window.location.pathname;
  tags.forEach(function (tag) {
    var href = tag.getAttribute('href');
    if (href && href !== '/blog/' && currentPath.indexOf(href) !== -1) {
      tags.forEach(function (t) { t.classList.remove('active'); t.removeAttribute('aria-selected'); });
      tag.classList.add('active');
      tag.setAttribute('aria-selected', 'true');
    }
    // Click navigates naturally to the category page
  });
})();

