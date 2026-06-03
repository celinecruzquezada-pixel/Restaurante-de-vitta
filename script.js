(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (!navbar) return;

  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); 

  if (hamburger && navLinks) {
   
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
})();


(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  reveals.forEach(function (el) {
    const siblings = Array.from(el.parentElement.querySelectorAll('.reveal'));
    const idx = siblings.indexOf(el);
    if (idx > 0 && idx <= 4) {
      el.classList.add('delay-' + idx);
    }
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Solo animar una vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(function (el) { observer.observe(el); });
})();


(function initMenuPage() {
  const menuGrid    = document.getElementById('menuGrid');
  const menuLoading = document.getElementById('menuLoading');
  const menuError   = document.getElementById('menuError');
  const menuFilter  = document.getElementById('menuFilter');
  const retryBtn    = document.getElementById('retryBtn');

  if (!menuGrid) return;

  const CATEGORY_MAP = {
    Beef:      { label: 'Plato principal', type: 'Main'    },
    Chicken:   { label: 'Plato principal', type: 'Main'    },
    Seafood:   { label: 'Plato principal', type: 'Main'    },
    Pasta:     { label: 'Plato principal', type: 'Main'    },
    Lamb:      { label: 'Plato principal', type: 'Main'    },
    Starter:   { label: 'Entrada',         type: 'Starter' },
    Dessert:   { label: 'Postre',          type: 'Dessert' },
    Vegetarian:{ label: 'Entrada',         type: 'Starter' },
    Side:      { label: 'Entrada',         type: 'Starter' },
    Breakfast: { label: 'Entrada',         type: 'Starter' },
  };

  const CATEGORIES_TO_FETCH = {
    Starter: ['Starter', 'Vegetarian', 'Side', 'Breakfast'],
    Main:    ['Beef', 'Chicken', 'Seafood', 'Pasta', 'Lamb'],
    Dessert: ['Dessert'],
    Drink:   null, 
  };

  const PRICE_RANGES = {
    Starter: [450, 550, 620, 700, 480],
    Main:    [1200, 1450, 1650, 1850, 2100, 1350, 1550, 1980],
    Dessert: [450, 520, 600, 650, 580],
    Drink:   [280, 320, 350, 420, 380, 300],
  };

  const STATIC_DRINKS = [
    {
      idMeal: 'drink_1',
      strMeal: 'Limonada de albahaca y jengibre',
      strMealThumb: 'https://images.unsplash.com/photo-1523371054106-bbf80586c79c?w=400&q=80',
      strArea: 'House',
      strInstructions: 'Refrescante limonada artesanal con hojas de albahaca fresca, jengibre rallado, limón exprimido al momento y sirope natural. Sin azúcar refinada.',
      _type: 'Drink',
      _label: 'Bebida',
    },
    {
      idMeal: 'drink_2',
      strMeal: 'Agua de jamaica con rosas',
      strMealThumb: 'https://images.unsplash.com/photo-1560508180-03f285f67ded?w=400&q=80',
      strArea: 'House',
      strInstructions: 'Infusión fría de flor de jamaica con pétalos de rosa comestibles, miel de flores silvestres y un toque de agua de azahar. Antioxidante natural.',
      _type: 'Drink',
      _label: 'Bebida',
    },
    {
      idMeal: 'drink_3',
      strMeal: 'Smoothie tropical de mango y maracuyá',
      strMealThumb: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80',
      strArea: 'House',
      strInstructions: 'Mezcla cremosa de mango Keitt dominicano, maracuyá fresco, leche de coco y una pizca de cayena para despertar los sentidos.',
      _type: 'Drink',
      _label: 'Bebida',
    },
    {
      idMeal: 'drink_4',
      strMeal: 'Cold brew con cardamomo',
      strMealThumb: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
      strArea: 'House',
      strInstructions: 'Café de origen dominicano extraído en frío durante 18 horas, servido con hielo esférico, leche de avena y cardamomo molido.',
      _type: 'Drink',
      _label: 'Bebida',
    },
    {
      idMeal: 'drink_5',
      strMeal: 'Mocktail de granada y romero',
      strMealThumb: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80',
      strArea: 'House',
      strInstructions: 'Jugo de granada natural con agua con gas artesanal, sirope de romero y rodajas de naranja sanguina. Elegante y refrescante.',
      _type: 'Drink',
      _label: 'Bebida',
    },
    {
      idMeal: 'drink_6',
      strMeal: 'Té verde matcha latte helado',
      strMealThumb: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&q=80',
      strArea: 'House',
      strInstructions: 'Matcha ceremonial japonés batido con leche de almendras y sirope de agave. Servido frío sobre hielo con canela en rama.',
      _type: 'Drink',
      _label: 'Bebida',
    },
  ];

  let allMeals    = []; 
  let activeFilter = 'all';

  /**
   * Obtiene comidas de una categoría específica desde TheMealDB
   * @param {string} category - Categoría de TheMealDB (Beef, Dessert, etc.)
   * @returns {Promise<Array>}
   */
  async function fetchMealsByCategory(category) {
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error al obtener categoría: ${category}`);
    const data = await res.json();
    return data.meals || [];
  }

  /**
   * Obtiene los detalles completos de un plato por su ID
   * @param {string} id - ID del plato
   * @returns {Promise<Object>}
   */
  async function fetchMealDetail(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error al obtener detalle: ${id}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  }

  /**
   * Genera un precio pseudoaleatorio pero determinista basado en el ID del plato
   * @param {string} id - ID del plato
   * @param {string} type - Tipo (Starter, Main, Dessert, Drink)
   * @returns {string} - Precio formateado "RD$ X,XXX"
   */
  function generatePrice(id, type) {
    const prices = PRICE_RANGES[type] || PRICE_RANGES.Main;
    const digit = parseInt(String(id).slice(-1)) || 0;
    const price  = prices[digit % prices.length];
    return `RD$ ${price.toLocaleString('es-DO')}`;
  }

  /**
   * Construye la tarjeta HTML de un plato
   * @param {Object} meal - Datos del plato
   * @returns {HTMLElement}
   */
  function createMealCard(meal) {
    const type  = meal._type  || 'Main';
    const label = meal._label || 'Plato principal';
    const desc  = meal.strInstructions
      ? meal.strInstructions.replace(/\r\n/g, ' ').replace(/\n/g, ' ').split('.').slice(0, 2).join('. ').trim() + '.'
      : 'Una preparación excepcional creada por nuestro chef.';

    const card = document.createElement('article');
    card.className = 'meal-card reveal';
    card.dataset.type = type;

    card.innerHTML = `
      <div class="meal-card-img-wrap">
        <img
          src="${meal.strMealThumb}"
          alt="${meal.strMeal}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60'"
        />
        <span class="meal-card-category">${label}</span>
      </div>
      <div class="meal-card-body">
        <h3 class="meal-card-name">${meal.strMeal}</h3>
        <p class="meal-card-desc">${desc}</p>
        <div class="meal-card-footer">
          <span class="meal-card-price">${generatePrice(meal.idMeal, type)}</span>
          <span class="meal-card-area">${meal.strArea || 'House'}</span>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Renderiza las tarjetas filtradas por tipo
   * @param {string} filter - 'all' | 'Starter' | 'Main' | 'Dessert' | 'Drink'
   */
  function renderMeals(filter) {
    const filtered = filter === 'all'
      ? allMeals
      : allMeals.filter(m => m._type === filter);

    menuGrid.innerHTML = '';

    if (!filtered.length) {
      menuGrid.innerHTML = '<p style="text-align:center;color:#7a736a;padding:3rem;grid-column:1/-1">No hay platos en esta categoría por el momento.</p>';
      return;
    }

    filtered.forEach(function (meal) {
      menuGrid.appendChild(createMealCard(meal));
    });

    setTimeout(function () {
      const newCards = menuGrid.querySelectorAll('.reveal:not(.visible)');
      newCards.forEach(function (el) {
        revealObserver.observe(el);
      });
    }, 50);
  }

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  /**
   * Carga principal: obtiene platos de múltiples categorías
   */
  async function loadMenu() {
    
    menuLoading.classList.remove('hidden');
    menuGrid.classList.add('hidden');
    menuError.classList.add('hidden');
    allMeals = [];

    try {
      
      const MEALS_PER_CATEGORY = 4;

      const fetchPromises = [];

      for (const [type, apiCategories] of Object.entries(CATEGORIES_TO_FETCH)) {
        if (!apiCategories) continue; 
        for (const cat of apiCategories) {
          fetchPromises.push({ type, cat });
        }
      }

      const categoryResults = await Promise.allSettled(
        fetchPromises.map(({ cat }) => fetchMealsByCategory(cat))
      );

      const mealIdSet = new Set();
      const mealTypeMap = {}; 

      categoryResults.forEach(function (result, idx) {
        if (result.status !== 'fulfilled') return;
        const { type, cat } = fetchPromises[idx];
        const info  = CATEGORY_MAP[cat] || { label: 'Plato', type };
        const meals = result.value.slice(0, MEALS_PER_CATEGORY);

        meals.forEach(function (m) {
          if (!mealIdSet.has(m.idMeal)) {
            mealIdSet.add(m.idMeal);
            mealTypeMap[m.idMeal] = { type, label: info.label };
          }
        });
      });

      const detailPromises = Array.from(mealIdSet).map(id => fetchMealDetail(id));
      const detailResults  = await Promise.allSettled(detailPromises);
      const ids            = Array.from(mealIdSet);

      detailResults.forEach(function (res, idx) {
        if (res.status !== 'fulfilled' || !res.value) return;
        const meal = res.value;
        const typeInfo = mealTypeMap[ids[idx]];
        meal._type  = typeInfo.type;
        meal._label = typeInfo.label;
        allMeals.push(meal);
      });

      STATIC_DRINKS.forEach(function (drink) { allMeals.push(drink); });

      const ORDER = { Starter: 0, Main: 1, Dessert: 2, Drink: 3 };
      allMeals.sort(function (a, b) {
        return (ORDER[a._type] || 0) - (ORDER[b._type] || 0);
      });

      menuLoading.classList.add('hidden');
      menuGrid.classList.remove('hidden');
      renderMeals(activeFilter);

    } catch (err) {
      console.error('[Aurum] Error al cargar el menú:', err);
      menuLoading.classList.add('hidden');
      menuError.classList.remove('hidden');
    }
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', loadMenu);
  }

  if (menuFilter) {
    menuFilter.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        menuFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.category;
        renderMeals(activeFilter);
        
        menuGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  loadMenu();
})();


(function initContactForm() {
  const submitBtn      = document.getElementById('contactSubmit');
  if (!submitBtn) return; 

  const nameInput    = document.getElementById('contactName');
  const emailInput   = document.getElementById('contactEmail');
  const phoneInput   = document.getElementById('contactPhone');
  const messageInput = document.getElementById('contactMessage');
  const formSuccess  = document.getElementById('formSuccess');
  const formWrap     = document.getElementById('contactFormWrap');

  const errors = {
    name:    document.getElementById('nameError'),
    email:   document.getElementById('emailError'),
    phone:   document.getElementById('phoneError'),
    message: document.getElementById('messageError'),
  };

  /**
   * Muestra o borra un mensaje de error
   * @param {string} field - Nombre del campo
   * @param {string} msg   - Mensaje (vacío para limpiar)
   */
  function setError(field, msg) {
    const el    = errors[field];
    const input = document.getElementById('contact' + field.charAt(0).toUpperCase() + field.slice(1));
    if (!el || !input) return;
    el.textContent = msg;
    input.classList.toggle('error-field', !!msg);
  }

  function clearErrors() {
    Object.keys(errors).forEach(function (f) { setError(f, ''); });
  }

  /**
   * Valida todos los campos
   * @returns {boolean} - true si el formulario es válido
   */
  function validateForm() {
    let valid = true;
    clearErrors();

    
    if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
      setError('name', 'Por favor escribe tu nombre completo (mínimo 3 caracteres).');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      setError('email', 'Por favor introduce un correo electrónico válido.');
      valid = false;
    }

    const phoneClean  = phoneInput.value.replace(/[\s\-\+\(\)]/g, '');
    const phoneDigits = phoneClean.replace(/\D/g, '');
    if (!phoneInput.value.trim() || phoneDigits.length < 7) {
      setError('phone', 'Por favor introduce un número de teléfono válido (mínimo 7 dígitos).');
      valid = false;
    }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      setError('message', 'Por favor escribe un mensaje o petición (mínimo 10 caracteres).');
      valid = false;
    }

    return valid;
  }

  [nameInput, emailInput, phoneInput, messageInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener('blur', function () {
      
      const fieldMap = {
        contactName:    'name',
        contactEmail:   'email',
        contactPhone:   'phone',
        contactMessage: 'message',
      };
      const field = fieldMap[input.id];
      if (field) {
        
        if (field === 'name' && (!input.value.trim() || input.value.trim().length < 3)) {
          setError('name', 'Por favor escribe tu nombre completo (mínimo 3 caracteres).');
        } else if (field === 'name') {
          setError('name', '');
        }
        if (field === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!input.value.trim() || !emailRegex.test(input.value.trim())) {
            setError('email', 'Por favor introduce un correo electrónico válido.');
          } else {
            setError('email', '');
          }
        }
        if (field === 'phone') {
          const phoneDigits = input.value.replace(/\D/g, '');
          if (!input.value.trim() || phoneDigits.length < 7) {
            setError('phone', 'Por favor introduce un número de teléfono válido.');
          } else {
            setError('phone', '');
          }
        }
        if (field === 'message' && (!input.value.trim() || input.value.trim().length < 10)) {
          setError('message', 'Por favor escribe un mensaje (mínimo 10 caracteres).');
        } else if (field === 'message') {
          setError('message', '');
        }
      }
    });

    input.addEventListener('input', function () {
      const fieldMap = {
        contactName:    'name',
        contactEmail:   'email',
        contactPhone:   'phone',
        contactMessage: 'message',
      };
      const field = fieldMap[input.id];
      if (field) setError(field, '');
    });
  });

  submitBtn.addEventListener('click', function () {
    if (!validateForm()) {
      
      const firstError = document.querySelector('.error-field');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    submitBtn.textContent    = 'Enviando...';
    submitBtn.disabled       = true;
    submitBtn.style.opacity  = '.7';
    submitBtn.style.cursor   = 'not-allowed';

    setTimeout(function () {
      
      const inputs = formWrap.querySelectorAll('.form-group, .form-row, .btn-primary, .form-note');
      inputs.forEach(function (el) { el.style.display = 'none'; });

      const labelEl = formWrap.querySelector('.section-label');
      const titleEl = formWrap.querySelector('.section-title');
      const introEl = formWrap.querySelector('.contact-intro');
      [labelEl, titleEl, introEl].forEach(function (el) { if (el) el.style.display = 'none'; });

      if (formSuccess) {
        formSuccess.classList.remove('hidden');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1500);
  });
})();


(function setMinDate() {
  const dateInput = document.getElementById('contactDate');
  if (!dateInput) return;

  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
})();
