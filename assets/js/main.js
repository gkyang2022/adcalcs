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
});
