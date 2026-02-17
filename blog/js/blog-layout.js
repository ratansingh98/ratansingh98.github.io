(function () {
  function getDepth() {
    if (location.pathname.indexOf('/blog/lesson/') !== -1) {
      return 2;
    }
    return 1;
  }

  function up(depth) {
    return '../'.repeat(depth);
  }

  function renderNav(container, depth) {
    if (container.querySelector('nav')) {
      return;
    }

    var prefix = up(depth);
    container.innerHTML =
      '<nav class="blog-solid-nav">' +
      '  <div class="blog-solid-nav__inner">' +
      '    <a href="' + prefix + 'index.html" class="blog-solid-nav__brand">Grandmaster.dev</a>' +
      '    <a href="' + prefix + 'about.html" class="blog-solid-nav__link">About</a>' +
      '    <a href="' + prefix + 'blog/index.html" class="blog-solid-nav__link is-active">Blog</a>' +
      '    <a href="' + prefix + 'contact.html" class="blog-solid-nav__link">Contact</a>' +
      '  </div>' +
      '</nav>';
  }

  function setupResponsiveNav(container) {
    var nav = container.querySelector('.blog-solid-nav');
    if (!nav) {
      return;
    }

    var inner = nav.querySelector('.blog-solid-nav__inner');
    var brand = nav.querySelector('.blog-solid-nav__brand');
    if (!inner || !brand) {
      return;
    }

    var links = Array.prototype.slice.call(inner.querySelectorAll('.blog-solid-nav__link'));
    if (!links.length) {
      return;
    }

    var linksWrap = nav.querySelector('.blog-solid-nav__links');
    if (!linksWrap) {
      linksWrap = document.createElement('div');
      linksWrap.className = 'blog-solid-nav__links';
      links.forEach(function (link) {
        linksWrap.appendChild(link);
      });
      inner.appendChild(linksWrap);
    }

    var toggle = nav.querySelector('.blog-solid-nav__toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'blog-solid-nav__toggle';
      toggle.setAttribute('aria-label', 'Toggle navigation');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span></span><span></span><span></span>';
      inner.insertBefore(toggle, linksWrap);
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    linksWrap.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.classList && target.classList.contains('blog-solid-nav__link')) {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 640) {
        closeMenu();
      }
    });
  }

  function renderFooter(container) {
    container.innerHTML =
      '<footer>' +
      '  <div class="container">' +
      '    <ul class="socials">' +
      '      <li><a target="_blank" href="mailTo:ratansinghdharra@gmail.com" title="ratansinghdharra@gmail.com" class="social-mail"><i class="fa fa-envelope"></i></a></li>' +
      '      <li><a target="_blank" href="https://www.linkedin.com/in/ratan-singh-198931144/" title="LinkedIn.com/in/ratan-singh-dharra-198931144" class="social-linkedin"><i class="fa fa-linkedin"></i></a></li>' +
      '      <li><a target="_blank" href="https://github.com/ratansingh98" title="Github.com/ratansingh98" class="social-github"><i class="fa fa-github"></i></a></li>' +
      '    </ul>' +
      '    <div class="copyright">Copyright &copy; 2019 <a href="https://grandmaster.dev" target="_blank">Ratan Singh Dharra</a> | Built with help of Codex</div>' +
      '  </div>' +
      '</footer>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getBannerConfig() {
    var path = location.pathname;
    if (path.indexOf('/blog/lesson/soon.html') !== -1) {
      return null;
    }
    if (path.indexOf('/blog/article-detail.html') !== -1) {
      return {
        text: 'References',
        accent: false,
        color: '#298bc3'
      };
    }
    if (/\/blog\/index(?:[2-5])?\.html$/.test(path)) {
      return {
        text: 'Computer Vision',
        accent: 'Zero To Hero',
        color: '#212020'
      };
    }
    if (path.indexOf('/blog/lesson/') !== -1) {
      return {
        text: (document.title || 'Lesson').trim(),
        accent: false,
        color: '#212020'
      };
    }

    return {
      text: 'Blog',
      accent: false,
      color: '#212020'
    };
  }

  function renderBanner(container) {
    var config = getBannerConfig();
    if (!config) {
      container.innerHTML = '';
      return;
    }

    var main = escapeHtml(config.text);
    var accent = config.accent ? ' : <label style="color:#eece1a;">' + escapeHtml(config.accent) + '</label>' : '';

    container.innerHTML =
      '<div class="home-banner">' +
      '  <div>' +
      '    <ul class="bxslider-subpages">' +
      '      <li style="background-color:' + config.color + '">' +
      '        <div class="slider-inner-shell">' +
      '          <div class="slider-detail"><i class="fa fa-book"></i><span>' + main + accent + '</span></div>' +
      '        </div>' +
      '      </li>' +
      '    </ul>' +
      '  </div>' +
      '</div>';
  }

  function loadScriptOnce(src, callback) {
    var existing = document.querySelector('script[data-particles-lib="true"]');
    if (existing) {
      if (window.particlesJS) {
        callback();
      } else {
        existing.addEventListener('load', callback, { once: true });
      }
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute('data-particles-lib', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function renderParticles() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (!document.getElementById('particles-js')) {
      var holder = document.createElement('div');
      holder.id = 'particles-js';
      holder.setAttribute('aria-hidden', 'true');
      document.body.prepend(holder);
    }
    document.body.classList.add('blog-particles-enabled');

    function initParticles() {
      if (!window.particlesJS) {
        return;
      }

      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 64,
            density: { enable: true, value_area: 1000 }
          },
          color: { value: ['#6897bb', '#cc7832', '#a9b7c6'] },
          shape: { type: 'circle' },
          opacity: {
            value: 0.35,
            random: true,
            anim: { enable: true, speed: 0.5, opacity_min: 0.15, sync: false }
          },
          size: {
            value: 2.6,
            random: true,
            anim: { enable: false }
          },
          line_linked: {
            enable: true,
            distance: 120,
            color: '#cc7832',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 1.4,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: false },
            onclick: { enable: false },
            resize: true
          }
        },
        retina_detect: true
      });
    }

    if (window.particlesJS) {
      initParticles();
      return;
    }

    loadScriptOnce('https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js', initParticles);
  }

  function setupClickFallback() {
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      var target = event.target;
      if (target && target.closest && target.closest('a[href]')) {
        return;
      }

      if (!document.elementsFromPoint) {
        return;
      }

      var stack = document.elementsFromPoint(event.clientX, event.clientY);
      if (!stack || !stack.length) {
        return;
      }

      for (var i = 0; i < stack.length; i++) {
        var el = stack[i];
        if (!el || !el.closest) {
          continue;
        }

        var link = el.closest('.blog-shell .blog-item[href], .pagination a[href], .toggler[href]');
        if (!link) {
          continue;
        }

        var href = link.getAttribute('href');
        if (!href) {
          continue;
        }

        event.preventDefault();
        window.location.href = href;
        return;
      }
    }, true);
  }

  function initLayout() {
    var depth = getDepth();

    var navTarget = document.querySelector('[data-blog-nav]');
    if (navTarget) {
      renderNav(navTarget, depth);
      setupResponsiveNav(navTarget);
    }

    var footerTarget = document.querySelector('[data-blog-footer]');
    if (footerTarget) {
      renderFooter(footerTarget);
    }

    var bannerTarget = document.querySelector('[data-blog-banner]');
    if (bannerTarget) {
      renderBanner(bannerTarget);
    }

    try {
      renderParticles();
    } catch (error) {
      // Keep layout usable even if particle init fails.
    }

    setupClickFallback();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
