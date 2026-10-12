(function () {
  'use strict';

  let MOBILE_QUERY = window.matchMedia('(max-width: 1023px)');
  let PRODUCTS_PER_SHOWCASE = 15;
  let DEPARTMENTS_COUNT = 8;

  function initSearch() {
    let form = document.querySelector('[data-search-form]');
    let input = document.querySelector('[data-search-input]');
    let result = document.querySelector('[data-search-result]');
    if (!form || !input || !result) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      let term = input.value.trim();

      if (!term) {
        result.hidden = true;
        result.textContent = '';
        input.focus();
        return;
      }

      result.textContent = '';
      result.append('Você buscou por: ');
      let strong = document.createElement('strong');
      strong.textContent = "'" + term + "'";
      result.append(strong);
      result.hidden = false;
    });

    input.addEventListener('input', function () {
      if (!input.value.trim()) result.hidden = true;
    });
  }

  function buildCategoryColumns() {
    let columns = document.querySelectorAll('[data-category-columns]');
    columns.forEach(function (container) {
      for (let c = 0; c < 3; c++) {
        let list = document.createElement('ul');
        list.className = 'dropdown__column';
        for (let i = 0; i < 8; i++) {
          let item = document.createElement('li');
          let link = document.createElement('a');
          link.href = '#';
          link.textContent = 'Categoria';
          item.appendChild(link);
          list.appendChild(item);
        }
        container.appendChild(list);
      }
    });
  }

  function initNav() {
    let template = document.querySelector('[data-dept-template]');
    if (template) {
      template.querySelector('.nav__link').setAttribute('data-label', 'Departamento');
      buildCategoryColumns();
      for (let i = 1; i < DEPARTMENTS_COUNT; i++) {
        template.parentNode.appendChild(template.cloneNode(true));
      }
    } else {
      buildCategoryColumns();
    }

    let mobileList = document.querySelector('[data-mobile-menu-list]');
    if (mobileList) {
      for (let j = 0; j < DEPARTMENTS_COUNT; j++) {
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.href = '#';
        a.className = 'mobile-menu__link';
        a.textContent = 'Departamento';
        li.appendChild(a);
        mobileList.appendChild(li);
      }
    }
  }

  function initMobileMenu() {
    let menu = document.querySelector('[data-mobile-menu]');
    let openBtn = document.querySelector('[data-menu-open]');
    if (!menu || !openBtn) return;

    function setOpen(isOpen) {
      menu.classList.toggle('is-open', isOpen);
      menu.setAttribute('aria-hidden', String(!isOpen));
      openBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    openBtn.addEventListener('click', function () { setOpen(true); });
    menu.querySelectorAll('[data-menu-close]').forEach(function (el) {
      el.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
    });
    MOBILE_QUERY.addEventListener('change', function (event) {
      if (!event.matches) setOpen(false);
    });
  }

  function fillProducts() {
    let template = document.getElementById('product-card-template');
    if (!template) return;

    document.querySelectorAll('[data-products]').forEach(function (wrapper) {
      let fragment = document.createDocumentFragment();
      for (let i = 0; i < PRODUCTS_PER_SHOWCASE; i++) {
        fragment.appendChild(template.content.cloneNode(true));
      }
      wrapper.appendChild(fragment);
    });
  }

  function createPagination(container, swiper) {
    let DOTS = 3;
    let dots = [];

    for (let i = 0; i < DOTS; i++) {
      let dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'showcase__dot';
      dot.setAttribute('aria-label', 'Ir para o grupo ' + (i + 1));
      dot.addEventListener('click', (function (index) {
        return function () {
          let lastIndex = swiper.snapGrid.length - 1;
          swiper.slideTo(Math.round((index / (DOTS - 1)) * lastIndex) * swiper.params.slidesPerGroup);
        };
      })(i));
      container.appendChild(dot);
      dots.push(dot);
    }

    function update() {
      let lastIndex = swiper.snapGrid.length - 1;
      let progress = lastIndex > 0 ? swiper.snapIndex / lastIndex : 0;
      let active = Math.round(progress * (DOTS - 1));
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === active);
        dot.setAttribute('aria-current', index === active ? 'true' : 'false');
      });
    }

    swiper.on('slideChange', update);
    swiper.on('snapGridLengthChange', update);
    swiper.on('resize', update);
    update();
  }

  function initCarousels() {
    if (typeof Swiper === 'undefined') return;

    document.querySelectorAll('.showcase').forEach(function (section) {
      let el = section.querySelector('[data-showcase]');
      let swiper = new Swiper(el, {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 10,
        speed: 500,
        watchOverflow: true,
        navigation: {
          prevEl: section.querySelector('.showcase__arrow--prev'),
          nextEl: section.querySelector('.showcase__arrow--next')
        },
        a11y: {
          prevSlideMessage: 'Produtos anteriores',
          nextSlideMessage: 'Próximos produtos'
        },
        breakpoints: {
          600: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 12 },
          1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 17 },
          1280: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 17 }
        }
      });

      createPagination(section.querySelector('[data-pagination]'), swiper);
    });
  }

  function initAccordion() {
    document.querySelectorAll('[data-accordion]').forEach(function (col) {
      let toggle = col.querySelector('.footer__toggle');
      toggle.addEventListener('click', function () {
        if (!MOBILE_QUERY.matches) return;
        let isOpen = col.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  function initNewsletter() {
    let form = document.querySelector('[data-newsletter-form]');
    if (!form) return;

    let feedback = document.createElement('p');
    feedback.className = 'newsletter__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.insertAdjacentElement('afterend', feedback);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      feedback.textContent = 'Cadastro realizado com sucesso!';
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSearch();
    initNav();
    initMobileMenu();
    fillProducts();
    initCarousels();
    initAccordion();
    initNewsletter();
  });
})();
