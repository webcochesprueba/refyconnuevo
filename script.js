/**
 * REFYCON - MINIMALIST JAVASCRIPT FRAMEWORK
 * Funcionalidades Minimalistas y Elegantes
 * ==========================================
 */

// Configuración global
const CONFIG = {
  // Animaciones
  animationDuration: 600,
  animationEasing: 'ease-out',
  animationOffset: 50,
  
  // Scroll
  scrollOffset: 80,
  scrollBehavior: 'smooth',
  
  // Performance
  debounceDelay: 300,
  throttleDelay: 100,
  
  // Features
  enableLazyLoading: true,
  enableIntersectionObserver: true,
  enableSmoothScrolling: true,
  enableParallax: false
};

// Utilidades minimalistas
const Utils = {
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return (
      rect.top <= windowHeight * (1 - threshold) &&
      rect.bottom >= windowHeight * threshold
    );
  },

  // Smooth scroll to element
  scrollToElement(element, offset = CONFIG.scrollOffset) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: CONFIG.scrollBehavior
    });
  },

  // Validate email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone
  validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
  },

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  // Check if user prefers reduced motion
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// Gestión de estado global
const State = {
  data: {
    isLoading: false,
    isMenuOpen: false,
    currentSection: 'inicio',
    scrollPosition: 0,
    formData: {},
    notifications: []
  },

  // Getters
  get(key) {
    return this.data[key];
  },

  // Setters
  set(key, value) {
    this.data[key] = value;
    this.notify(key, value);
  },

  // Subscribers
  subscribers: {},

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.subscribers[key]) {
      this.subscribers[key] = [];
    }
    this.subscribers[key].push(callback);
  },

  // Notify subscribers
  notify(key, value) {
    if (this.subscribers[key]) {
      this.subscribers[key].forEach(callback => callback(value));
    }
  }
};

// Sistema de notificaciones minimalista
class NotificationSystem {
  constructor() {
    this.container = this.createContainer();
    this.notifications = new Map();
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container-minimal';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
  }

  show(message, type = 'info', duration = 4000) {
    const id = Utils.generateId();
    const notification = this.createNotification(id, message, type);
    
    this.notifications.set(id, notification);
    this.container.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  createNotification(id, message, type) {
    const notification = document.createElement('div');
    notification.className = `notification-minimal notification-${type}`;
    notification.setAttribute('data-id', id);
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    notification.innerHTML = `
      <div class="notification-content-minimal">
        <i class="fas ${icons[type] || icons.info}" aria-hidden="true"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close-minimal" aria-label="Cerrar notificación">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    `;

    // Add styles
    notification.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 4px solid ${this.getTypeColor(type)};
      overflow: hidden;
    `;

    // Add content styles
    const content = notification.querySelector('.notification-content-minimal');
    content.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    `;

    // Add icon styles
    const icon = notification.querySelector('.notification-content-minimal i');
    icon.style.cssText = `
      font-size: 20px;
      color: ${this.getTypeColor(type)};
    `;

    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close-minimal');
    closeBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      font-size: 16px;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s;
    `;

    closeBtn.addEventListener('click', () => this.remove(id));

    return notification;
  }

  getTypeColor(type) {
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };
    return colors[type] || colors.info;
  }

  remove(id) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.notifications.delete(id);
      }, 300);
    }
  }

  clear() {
    this.notifications.forEach((_, id) => this.remove(id));
  }
}

// Sistema de lazy loading minimalista
class LazyLoader {
  constructor() {
    this.observer = null;
    this.images = new Set();
    this.init();
  }

  init() {
    if (!CONFIG.enableLazyLoading) return;

    if ('IntersectionObserver' in window && CONFIG.enableIntersectionObserver) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );
    }

    this.loadImages();
  }

  loadImages() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    images.forEach(img => this.addImage(img));
  }

  addImage(img) {
    if (this.images.has(img)) return;
    
    this.images.add(img);
    
    if (this.observer) {
      this.observer.observe(img);
    } else {
      this.loadImage(img);
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.src || img.src;
    if (!src) return;

    // Create a new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      this.images.delete(img);
    };

    imageLoader.onerror = () => {
      img.classList.add('error');
      console.warn(`Failed to load image: ${src}`);
    };

    imageLoader.src = src;
  }
}

// Gestor de formularios minimalista
class FormManager {
  constructor() {
    this.forms = new Map();
    this.init();
  }

  init() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => this.registerForm(form));
  }

  registerForm(form) {
    const formId = form.id || Utils.generateId();
    this.forms.set(formId, {
      element: form,
      data: {},
      errors: {},
      isValid: false
    });

    this.setupForm(form);
  }

  setupForm(form) {
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', Utils.debounce(() => this.validateField(input), 300));
    });

    // Form submission
    form.addEventListener('submit', (e) => this.handleSubmit(e, form));
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'Este campo es obligatorio';
    }

    // Email validation
    if (fieldType === 'email' && value && !Utils.validateEmail(value)) {
      isValid = false;
      errorMessage = 'Por favor, introduce un email válido';
    }

    // Phone validation
    if (fieldType === 'tel' && value && !Utils.validatePhone(value)) {
      isValid = false;
      errorMessage = 'Por favor, introduce un teléfono válido';
    }

    // Min length validation
    const minLength = field.getAttribute('minlength');
    if (minLength && value.length < parseInt(minLength)) {
      isValid = false;
      errorMessage = `Mínimo ${minLength} caracteres`;
    }

    // Update field state
    this.updateFieldState(field, isValid, errorMessage);
    
    return isValid;
  }

  updateFieldState(field, isValid, errorMessage) {
    const formGroup = field.closest('.form-group-minimal');
    const errorElement = formGroup?.querySelector('.form-error-minimal');
    
    if (formGroup) {
      formGroup.classList.toggle('error', !isValid);
    }

    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = isValid ? 'none' : 'block';
    }

    // Update form validity
    this.updateFormValidity(field.closest('form'));
  }

  updateFormValidity(form) {
    const formId = form.id || Array.from(this.forms.keys()).find(id => 
      this.forms.get(id).element === form
    );
    
    if (formId) {
      const formData = this.forms.get(formId);
      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
      const invalidFields = Array.from(inputs).filter(input => !this.validateField(input));
      
      formData.isValid = invalidFields.length === 0;
    }
  }

  async handleSubmit(event, form) {
    console.log('Form submission started');
    event.preventDefault();

    const formId = form.id || Array.from(this.forms.keys()).find(id =>
      this.forms.get(id).element === form
    );

    console.log('Form ID:', formId);

    if (!formId) {
      console.error('No form ID found');
      return;
    }

    const formData = this.forms.get(formId);
    const submitBtn = form.querySelector('.btn-submit-minimal');
    const statusElement = form.querySelector('.form-status-minimal');

    console.log('Submit button:', submitBtn);
    console.log('Status element:', statusElement);

    // Validate all fields
    const inputs = form.querySelectorAll('input, textarea, select');
    console.log('Found inputs:', inputs.length);
    const validationResults = Array.from(inputs).map(input => this.validateField(input));
    const isFormValid = validationResults.every(result => result);

    console.log('Form validation result:', isFormValid);

    if (!isFormValid) {
      this.showFormStatus(statusElement, 'Por favor, corrige los errores antes de enviar', 'error');
      return;
    }

    // Show loading state
    this.setLoadingState(submitBtn, true);

    try {
      // Collect form data
      const data = new FormData(form);
      const formObject = {};
      data.forEach((value, key) => {
        formObject[key] = value;
      });

      console.log('Form data collected:', formObject);

      // Submit form
      await this.submitForm(formObject);

      // Success
      this.showFormStatus(statusElement, '¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
      form.reset();

      // Show notification
      if (window.RefyconApp) {
        window.RefyconApp.showNotification('Mensaje enviado correctamente', 'success', 3000);
      }

    } catch (error) {
      console.error('Form submission error:', error);
      this.showFormStatus(statusElement, 'Error al enviar el mensaje. Inténtalo de nuevo.', 'error');

      // Show notification
      if (window.RefyconApp) {
        window.RefyconApp.showNotification('Error al enviar el mensaje', 'error', 3000);
      }
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  setLoadingState(button, isLoading) {
    if (!button) return;
    
    button.disabled = isLoading;
    button.classList.toggle('loading', isLoading);
  }

  showFormStatus(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `form-status-minimal ${type}`;
    element.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }

  async submitForm(data) {
    // Create mailto link with form data
    const subject = encodeURIComponent('Consulta desde web - Refycon');
    const body = encodeURIComponent(
      `Nueva consulta desde el formulario web:\n\n` +
      `Nombre: ${data.nombre || 'No especificado'}\n` +
      `Email: ${data.email || 'No especificado'}\n` +
      `Teléfono: ${data.telefono || 'No especificado'}\n` +
      `Tipo de servicio: ${data.servicio || 'No especificado'}\n\n` +
      `Mensaje:\n${data.mensaje || 'No especificado'}\n\n` +
      `Política de privacidad aceptada: ${data.privacidad ? 'Sí' : 'No'}`
    );

    const mailtoUrl = `mailto:refyconpro@gmail.com?subject=${subject}&body=${body}`;

    // Create a temporary link element and click it for better compatibility
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Return success immediately since mailto opens the email client
    return { success: true, data };
  }
}

// Gestor de navegación minimalista
class NavigationManager {
  constructor() {
    this.currentSection = 'inicio';
    this.sections = new Map();
    this.init();
  }

  init() {
    this.setupSections();
    this.setupNavigation();
    this.setupScrollSpy();
    this.setupMobileMenu();
  }

  setupSections() {
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      this.sections.set(section.id, {
        element: section,
        offset: section.offsetTop,
        height: section.offsetHeight
      });
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e, link));
    });
  }

  handleNavClick(event, link) {
    event.preventDefault();
    
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      Utils.scrollToElement(targetSection, CONFIG.scrollOffset);
      
      // Update active state
      this.setActiveLink(link);
      
      // Close mobile menu if open
      this.closeMobileMenu();
    }
  }

  setActiveLink(activeLink) {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    activeLink.classList.add('active');
  }

  setupScrollSpy() {
    const scrollHandler = Utils.throttle(() => {
      this.updateActiveSection();
    }, CONFIG.throttleDelay);

    window.addEventListener('scroll', scrollHandler);
  }

  updateActiveSection() {
    const scrollPosition = window.pageYOffset + CONFIG.scrollOffset + 100;
    
    for (const [id, section] of this.sections) {
      const { offset, height } = section;
      
      if (scrollPosition >= offset && scrollPosition < offset + height) {
        if (this.currentSection !== id) {
          this.currentSection = id;
          this.updateActiveNavLink(id);
          State.set('currentSection', id);
        }
        break;
      }
    }
  }

  updateActiveNavLink(sectionId) {
    const activeLink = document.querySelector(`nav a[href="#${sectionId}"]`);
    if (activeLink) {
      this.setActiveLink(activeLink);
    }
  }

  setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle-minimal');
    const mobileNav = document.querySelector('.mobile-nav-minimal');
    
    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', () => this.toggleMobileMenu());
      
      // Close menu when clicking on links
      const navLinks = document.querySelectorAll('.mobile-nav-list-minimal a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMobileMenu());
      });
      
      // Close menu when clicking outside
      mobileNav.addEventListener('click', (e) => {
        if (e.target === mobileNav) {
          this.closeMobileMenu();
        }
      });
      
      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
          this.closeMobileMenu();
        }
      });
    }
  }

  toggleMobileMenu() {
    const isOpen = State.get('isMenuOpen');
    State.set('isMenuOpen', !isOpen);
    
    const menuToggle = document.querySelector('.menu-toggle-minimal');
    const mobileNav = document.querySelector('.mobile-nav-minimal');
    
    if (menuToggle && mobileNav) {
      if (!isOpen) {
        mobileNav.classList.add('active');
        mobileNav.setAttribute('aria-hidden', 'false');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        this.closeMobileMenu();
      }
    }
  }

  closeMobileMenu() {
    State.set('isMenuOpen', false);
    
    const menuToggle = document.querySelector('.menu-toggle-minimal');
    const mobileNav = document.querySelector('.mobile-nav-minimal');
    
    if (menuToggle && mobileNav) {
      menuToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }
}

// Animador de números minimalista
class NumberAnimator {
  constructor() {
    this.animatedElements = new Set();
    this.init();
  }

  init() {
    if (Utils.prefersReducedMotion()) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateNumber(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const numberElements = document.querySelectorAll('.stat-number-minimal[data-count]');
    numberElements.forEach(el => observer.observe(el));
  }

  animateNumber(element) {
    if (this.animatedElements.has(element)) return;
    
    this.animatedElements.add(element);
    
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * easeOut);
      
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target.toLocaleString();
      }
    };
    
    requestAnimationFrame(animate);
  }
}

// Efectos de parallax minimalistas
class ParallaxEffects {
  constructor() {
    this.init();
  }

  init() {
    if (!CONFIG.enableParallax || Utils.prefersReducedMotion()) return;

    const hero = document.querySelector('.hero-minimal');

    if (hero) {
      const scrollHandler = Utils.throttle(() => {
        this.updateParallax();
      }, CONFIG.throttleDelay);

      window.addEventListener('scroll', scrollHandler);
    }
  }

  updateParallax() {
    const scrollY = window.pageYOffset;
    const hero = document.querySelector('.hero-minimal');

    if (hero) {
      // Fade out hero as scrolling starts
      const fadeStart = 100; // Start fading after 100px scroll
      const fadeEnd = 400;   // Fully faded at 400px scroll

      let opacity = 1;

      if (scrollY > fadeStart) {
        opacity = Math.max(0, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
      }

      hero.style.opacity = opacity;
    }
  }
}

// Inicialización principal
class App {
  constructor() {
    this.notifications = new NotificationSystem();
    this.lazyLoader = new LazyLoader();
    this.formManager = new FormManager();
    this.navigationManager = new NavigationManager();
    this.numberAnimator = new NumberAnimator();
    this.parallaxEffects = new ParallaxEffects();
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.initializeAOS();
    this.setupHeaderScroll();
    this.setupBackToTop();
    this.setupKeyboardNavigation();
    this.setupAccessibility();
    this.prefetchHeroImage();
    this.registerServiceWorker();
    
    // Show welcome notification
    setTimeout(() => {
      this.notifications.show(
        '¡Bienvenido a Refycon! Descubre nuestros servicios premium de construcción.',
        'info',
        3000
      );
    }, 1000);
  }

  prefetchHeroImage() {
    const heroImage = document.querySelector('.hero-image-minimal img');
    if (!heroImage || !heroImage.src) return;

    // Ensure intrinsic loading hints for browsers without markup support
    heroImage.setAttribute('fetchpriority', heroImage.getAttribute('fetchpriority') || 'high');
    heroImage.setAttribute('decoding', heroImage.getAttribute('decoding') || 'async');

    if (!('relList' in document.createElement('link'))) {
      return;
    }

    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = heroImage.currentSrc || heroImage.src;
    if (heroImage.srcset) {
      preloadLink.setAttribute('imagesrcset', heroImage.srcset);
    }
    document.head.appendChild(preloadLink);
  }

  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado', registration.scope);
        })
        .catch((error) => {
          console.error('No se pudo registrar el Service Worker:', error);
        });
    });
  }

  initializeAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: CONFIG.animationDuration,
        easing: CONFIG.animationEasing,
        once: true,
        offset: CONFIG.animationOffset,
        disable: Utils.prefersReducedMotion()
      });
    }
  }

  setupHeaderScroll() {
    const header = document.querySelector('.header-minimal');
    if (!header) return;

    const scrollHandler = Utils.throttle(() => {
      const scrollY = window.pageYOffset;
      
      if (scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      State.set('scrollPosition', scrollY);
    }, CONFIG.throttleDelay);

    window.addEventListener('scroll', scrollHandler);
  }

  setupBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top-minimal');
    if (!backToTopBtn) return;

    const scrollHandler = Utils.throttle(() => {
      const scrollY = window.pageYOffset;
      
      if (scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, CONFIG.throttleDelay);

    window.addEventListener('scroll', scrollHandler);

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: CONFIG.scrollBehavior
      });
    });
  }

  setupKeyboardNavigation() {
    // Skip to main content
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          Utils.scrollToElement(mainContent);
        }
      });
    }

    // Keyboard navigation for cards
    const cards = document.querySelectorAll('.service-card-minimal, .project-item-minimal, .step-item-minimal');
    cards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const link = card.querySelector('a');
          if (link) {
            link.click();
          }
        }
      });
    });
  }

  setupAccessibility() {
    // Add ARIA labels to interactive elements
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label')) {
        const text = button.textContent.trim();
        if (text) {
          button.setAttribute('aria-label', text);
        }
      }
    });

    // Add focus indicators
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.classList.add('focus-visible');
      });
      
      element.addEventListener('blur', () => {
        element.classList.remove('focus-visible');
      });
    });
  }

  // Public API
  showNotification(message, type = 'info', duration = 4000) {
    return this.notifications.show(message, type, duration);
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      Utils.scrollToElement(section);
    }
  }

  getState(key) {
    return State.get(key);
  }

  setState(key, value) {
    State.set(key, value);
  }
}

// Inicializar la aplicación
const app = new App();

// Exponer API global
window.RefyconApp = app;

// Error handling global
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Efectos visuales minimalistas
const MinimalEffects = {
  // Efectos de hover sutiles
  initHoverEffects() {
    const cards = document.querySelectorAll('.service-card-minimal, .project-item-minimal, .step-item-minimal');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
        this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
      });
    });
  },

  // Efectos de botones minimalistas
  initButtonEffects() {
    const buttons = document.querySelectorAll('.btn-minimal');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
      });
    });
  },

  // Inicializar todos los efectos
  init() {
    this.initHoverEffects();
    this.initButtonEffects();
  }
};

// Initialize minimal effects
document.addEventListener('DOMContentLoaded', function() {
  MinimalEffects.init();

  // Handle Formspree form submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // Let Formspree handle the submission, but add our own validation and UX
      handleFormspreeSubmission(e, contactForm);
    });
  }
});

async function handleFormspreeSubmission(event, form) {
  event.preventDefault(); // Always prevent default to handle submission ourselves

  const submitBtn = form.querySelector('.btn-submit-minimal');
  const statusElement = form.querySelector('.form-status-minimal');

  // Basic validation
  const nombre = form.nombre?.value?.trim();
  const email = form.email?.value?.trim();
  const mensaje = form.mensaje?.value?.trim();
  const privacidad = form.privacidad?.checked;

  if (!nombre || !email || !mensaje || !privacidad) {
    showFormMessage(statusElement, 'Por favor, completa todos los campos requeridos y acepta la política de privacidad.', 'error');
    return false;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFormMessage(statusElement, 'Por favor, introduce un email válido.', 'error');
    return false;
  }

  // Show loading state
  setLoadingState(submitBtn, true);

  // Clear any previous messages
  if (statusElement) {
    statusElement.style.display = 'none';
  }

  try {
    // Submit form data using Fetch API
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      // Success
      showFormMessage(statusElement, '¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
      form.reset();

      // Show notification
      if (window.RefyconApp) {
        window.RefyconApp.showNotification('Mensaje enviado correctamente', 'success', 3000);
      }
    } else {
      // Error
      throw new Error('Form submission failed');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showFormMessage(statusElement, 'Error al enviar el mensaje. Inténtalo de nuevo.', 'error');

    // Show notification
    if (window.RefyconApp) {
      window.RefyconApp.showNotification('Error al enviar el mensaje', 'error', 3000);
    }
  } finally {
    // Reset loading state
    setLoadingState(submitBtn, false);
  }
}

function setLoadingState(button, isLoading) {
  if (!button) return;

  button.disabled = isLoading;

  const textSpan = button.querySelector('.btn-text-minimal');
  const loadingSpan = button.querySelector('.btn-loading-minimal');

  if (textSpan && loadingSpan) {
    if (isLoading) {
      textSpan.style.display = 'none';
      loadingSpan.style.display = 'inline-flex';
    } else {
      textSpan.style.display = 'inline-flex';
      loadingSpan.style.display = 'none';
    }
  }
}

function showFormMessage(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = `form-status-minimal ${type}`;
  element.style.display = 'block';

  // Auto hide after 5 seconds for error messages
  if (type === 'error') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, Utils, State, NotificationSystem, MinimalEffects };
}
