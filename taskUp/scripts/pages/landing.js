/**
 * Landing page scripts for TaskUp
 * 
 * Provides smooth animations, hero transitions, and responsive features
 * for the landing page of TaskUp, following Apple's animation style
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements to animate
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const ctaButton = document.querySelector('.cta-button');
    const appPreview = document.querySelector('.preview-image');
    const featureCards = document.querySelectorAll('.feature-card');
    
    // Intersection Observer options
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    // Animation classes and timings
    const animationClasses = {
      fadeIn: 'animate-fade-in',
      slideInUp: 'animate-slide-in-up',
      scaleIn: 'animate-scale-in',
      staggerDelay: 100 // milliseconds between staggered animations
    };
    
    // Apply initial animation state
    const setInitialState = (elements, transform = 'translateY(20px)', opacity = '0') => {
      if (!elements) return;
      
      const applyStyles = (el) => {
        el.style.opacity = opacity;
        el.style.transform = transform;
        el.style.transition = 'opacity 0.6s var(--ease-apple-out), transform 0.6s var(--ease-spring-1)';
      };
      
      if (elements instanceof NodeList) {
        elements.forEach(applyStyles);
      } else {
        applyStyles(elements);
      }
    };
    
    // Animation function
    const animateElement = (element, delay = 0) => {
      if (!element) return;
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0) scale(1)';
      }, delay);
    };
    
    // Create intersection observer
    const createObserver = (elements, stagger = false) => {
      return new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const delay = stagger ? index * animationClasses.staggerDelay : 0;
            animateElement(entry.target, delay);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
    };
    
    // Setup hero section animations
    const setupHeroAnimations = () => {
      setInitialState(heroTitle, 'translateY(20px) scale(0.98)', '0');
      setInitialState(heroSubtitle, 'translateY(20px)', '0');
      setInitialState(ctaButton, 'translateY(20px) scale(0.95)', '0');
      
      // Animate hero elements with timing
      setTimeout(() => animateElement(heroTitle), 100);
      setTimeout(() => animateElement(heroSubtitle), 300);
      setTimeout(() => animateElement(ctaButton), 500);
    };
    
    // Setup feature card animations
    const setupFeatureCardAnimations = () => {
      setInitialState(featureCards, 'translateY(30px)', '0');
      
      const observer = createObserver(featureCards, true);
      featureCards.forEach(card => observer.observe(card));
    };
    
    // Setup app preview animation
    const setupAppPreviewAnimation = () => {
      if (!appPreview) return;
      
      setInitialState(appPreview, 'translateY(30px) scale(0.98)', '0');
      appPreview.style.transition = 'opacity 0.8s var(--ease-apple-out), transform 0.8s var(--ease-spring-1)';
      
      const observer = createObserver(appPreview);
      observer.observe(appPreview);
    };
    
    // Initialize all animations
    const initAnimations = () => {
      setupHeroAnimations();
      setupFeatureCardAnimations();
      setupAppPreviewAnimation();
    };
    
    // Parallax effect for hero section
    const setupParallax = () => {
      const hero = document.querySelector('.hero');
      if (!hero) return;
      
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < 600) {
          const yOffset = scrollY * 0.2;
          hero.style.transform = `translateY(${yOffset}px)`;
          
          // Adjust opacity for fade-out effect
          const opacity = 1 - (scrollY / 600);
          hero.style.opacity = Math.max(opacity, 0);
        }
      });
    };
    
    // Smooth scrolling for anchor links
    const setupSmoothScrolling = () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (!targetElement) return;
          
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Account for fixed header
            behavior: 'smooth'
          });
        });
      });
    };
    
    // Header scroll effect
    const setupHeaderScroll = () => {
      const header = document.querySelector('.header');
      if (!header) return;
      
      let lastScrollY = window.scrollY;
      const scrollThreshold = 100;
      
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add shadow and background when scrolled
        if (currentScrollY > 20) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
        
        // Hide header when scrolling down
        if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
          header.classList.add('header-hidden');
        } else {
          header.classList.remove('header-hidden');
        }
        
        lastScrollY = currentScrollY;
      });
    };
    
    // Run all initializations
    const init = () => {
      initAnimations();
      setupParallax();
      setupSmoothScrolling();
      setupHeaderScroll();
      
      // Check and apply theme preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('theme-dark');
      }
      
      // Watch for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (e.matches) {
          document.documentElement.classList.add('theme-dark');
        } else {
          document.documentElement.classList.remove('theme-dark');
        }
      });
    };
    
    // Start initialization
    init();
  });