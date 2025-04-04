/**
 * Dashboard Home page scripts for TaskUp
 * 
 * Manages dashboard functionality including sidebar toggle,
 * task interactions, project cards, and activity feed updates
 */

document.addEventListener('DOMContentLoaded', () => {
    // Dashboard elements
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    // Project elements
    const projectButton = document.querySelector('.project-button');
    const projectDropdown = document.getElementById('project-dropdown');
    
    // Task elements
    const taskCards = document.querySelectorAll('.task-card');
    const taskActionButtons = document.querySelectorAll('.task-action-button');
    
    // Project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    // Current date
    const currentDateElement = document.querySelector('.current-date');
    
    /**
     * Setup sidebar toggling
     */
    const setupSidebar = () => {
      // Sidebar toggle button
      if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
          sidebar.classList.toggle('collapsed');
          mainContent.classList.toggle('sidebar-collapsed');
        });
      }
      
      // Mobile menu toggle
      if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
          sidebar.classList.toggle('active');
          if (sidebarOverlay) {
            sidebarOverlay.classList.toggle('active');
          }
        });
      }
      
      // Click outside to close sidebar on mobile
      if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
          sidebar.classList.remove('active');
          sidebarOverlay.classList.remove('active');
        });
      }
    };
    
    /**
     * Setup project selector dropdown
     */
    const setupProjectSelector = () => {
      if (!projectButton || !projectDropdown) return;
      
      // Toggle dropdown
      projectButton.addEventListener('click', (e) => {
        e.stopPropagation();
        projectDropdown.classList.toggle('active');
        
        // Animation
        if (projectDropdown.classList.contains('active')) {
          projectDropdown.style.animation = 'dropdownIn 0.2s var(--ease-spring-1) forwards';
        } else {
          projectDropdown.style.animation = 'dropdownOut 0.2s var(--ease-apple-in) forwards';
        }
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        if (projectDropdown.classList.contains('active')) {
          projectDropdown.classList.remove('active');
          projectDropdown.style.animation = 'dropdownOut 0.2s var(--ease-apple-in) forwards';
        }
      });
      
      // Prevent dropdown from closing when clicking inside
      projectDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      // Project selection
      const projectOptions = projectDropdown.querySelectorAll('.project-option');
      projectOptions.forEach(option => {
        option.addEventListener('click', () => {
          const projectName = option.textContent.trim();
          const projectButton = document.querySelector('.project-button span');
          
          if (projectButton) {
            projectButton.textContent = projectName;
          }
          
          projectDropdown.classList.remove('active');
        });
      });
    };
    
    /**
     * Setup task card interactions
     */
    const setupTaskCards = () => {
      if (!taskCards.length) return;
      
      taskCards.forEach(card => {
        // Hover effect with subtle transform
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = 'var(--shadow-card-hover)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = 'var(--shadow-card)';
        });
        
        // Click to show details (in a real app, would navigate to task detail page)
        card.addEventListener('click', (e) => {
          // Don't trigger if clicking on action button
          if (e.target.closest('.task-action-button')) return;
          
          // Simulate navigation
          card.style.transform = 'scale(0.98)';
          setTimeout(() => {
            card.style.transform = 'scale(1)';
          }, 150);
        });
      });
      
      // Task action buttons (more options)
      taskActionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Here would be code to show a dropdown menu of actions
          // For demo purposes, we'll just show a tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'task-action-tooltip';
          tooltip.innerHTML = `
            <div class="tooltip-item">Edit Task</div>
            <div class="tooltip-item">Change Status</div>
            <div class="tooltip-item">Delete Task</div>
          `;
          
          // Position tooltip
          const rect = button.getBoundingClientRect();
          tooltip.style.position = 'absolute';
          tooltip.style.top = rect.bottom + 8 + 'px';
          tooltip.style.left = rect.left - 100 + 'px';
          tooltip.style.zIndex = '1000';
          tooltip.style.backgroundColor = 'var(--color-surface)';
          tooltip.style.boxShadow = 'var(--shadow-dropdown)';
          tooltip.style.borderRadius = 'var(--border-radius-md)';
          tooltip.style.padding = '8px 0';
          tooltip.style.width = '140px';
          tooltip.style.opacity = '0';
          tooltip.style.transform = 'translateY(-8px)';
          tooltip.style.transition = 'opacity 0.2s ease, transform 0.2s var(--ease-spring-1)';
          
          // Style tooltip items
          const style = document.createElement('style');
          style.textContent = `
            .tooltip-item {
              padding: 8px 16px;
              cursor: pointer;
              transition: background-color 0.2s ease;
            }
            .tooltip-item:hover {
              background-color: var(--color-surface-secondary);
            }
          `;
          
          document.body.appendChild(tooltip);
          document.head.appendChild(style);
          
          // Animate in
          setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
          }, 10);
          
          // Remove tooltip when clicking outside
          const removeTooltip = () => {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(-8px)';
            
            setTimeout(() => {
              tooltip.remove();
              style.remove();
            }, 200);
            
            document.removeEventListener('click', removeTooltip);
          };
          
          document.addEventListener('click', removeTooltip);
        });
      });
    };
    
    /**
     * Setup project card interactions
     */
    const setupProjectCards = () => {
      if (!projectCards.length) return;
      
      projectCards.forEach(card => {
        // Hover effect with subtle transform
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = 'var(--shadow-card-hover)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = 'var(--shadow-card)';
        });
        
        // Animate progress bars on first view
        const progressFill = card.querySelector('.progress-fill');
        if (progressFill) {
          const width = progressFill.style.width;
          progressFill.style.width = '0';
          
          // Use Intersection Observer to trigger animation when card is visible
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  progressFill.style.transition = 'width 1s var(--ease-spring-1)';
                  progressFill.style.width = width;
                }, 200);
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.1 });
          
          observer.observe(card);
        }
      });
    };
    
    /**
     * Setup activity feed interactions
     */
    const setupActivityFeed = () => {
      const activityItems = document.querySelectorAll('.activity-item');
      if (!activityItems.length) return;
      
      // Animate in activity items when they come into view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      // Set initial state and observe
      activityItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s var(--ease-spring-1)';
        observer.observe(item);
      });
    };
    
    /**
     * Setup current date display
     */
    const setupCurrentDate = () => {
      if (!currentDateElement) return;
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const today = new Date();
      currentDateElement.textContent = today.toLocaleDateString('en-US', options);
    };
    
    /**
     * Setup global search functionality
     */
    const setupSearch = () => {
      const searchInput = document.querySelector('.search-input');
      if (!searchInput) return;
      
      searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('focused');
      });
      
      searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('focused');
      });
      
      // Handle search input (in a real app, would implement search functionality)
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          // Simulate search loading
          const searchContainer = searchInput.parentElement;
          searchContainer.classList.add('searching');
          
          setTimeout(() => {
            searchContainer.classList.remove('searching');
            // Would normally navigate to search results
            alert(`Searching for: ${searchInput.value}`);
          }, 1000);
        }
      });
    };
    
    /**
     * Setup notifications functionality
     */
    const setupNotifications = () => {
      const notificationButton = document.querySelector('.notification-button');
      if (!notificationButton) return;
      
      notificationButton.addEventListener('click', () => {
        // In a real app, would show notifications dropdown
        // For demo, we'll just toggle a class
        notificationButton.classList.toggle('active');
        
        // Animate badge
        const badge = notificationButton.querySelector('.notification-badge');
        if (badge) {
          badge.style.animation = 'none';
          setTimeout(() => {
            badge.style.animation = 'badgePulse 0.3s var(--ease-spring-1) forwards';
          }, 10);
        }
      });
    };
    
    /**
     * Setup create task button functionality
     */
    const setupCreateTask = () => {
      const createTaskButton = document.querySelector('.create-task-button');
      if (!createTaskButton) return;
      
      createTaskButton.addEventListener('click', () => {
        // In a real app, would show task creation modal or navigate to create task page
        // For demo purposes, we'll just show an animation
        createTaskButton.classList.add('clicked');
        
        setTimeout(() => {
          createTaskButton.classList.remove('clicked');
          alert('Create task form would appear here');
        }, 300);
      });
    };
    
    /**
     * Setup entry animations for dashboard
     */
    const setupDashboardAnimations = () => {
      // Elements to animate
      const welcomeTitle = document.querySelector('.welcome-title');
      const welcomeSubtitle = document.querySelector('.welcome-subtitle');
      const dateDisplay = document.querySelector('.date-display');
      const statsCards = document.querySelectorAll('.stat-card');
      const sectionHeaders = document.querySelectorAll('.section-header');
      
      // Set initial state for welcome section
      if (welcomeTitle) {
        welcomeTitle.style.opacity = '0';
        welcomeTitle.style.transform = 'translateY(10px)';
      }
      
      if (welcomeSubtitle) {
        welcomeSubtitle.style.opacity = '0';
        welcomeSubtitle.style.transform = 'translateY(10px)';
      }
      
      if (dateDisplay) {
        dateDisplay.style.opacity = '0';
        dateDisplay.style.transform = 'translateY(10px)';
      }
      
      // Set initial state for stat cards
      statsCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
      });
      
      // Set initial state for section headers
      sectionHeaders.forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(10px)';
      });
      
      // Animate welcome section
      setTimeout(() => {
        if (welcomeTitle) {
          welcomeTitle.style.transition = 'opacity 0.5s ease, transform 0.5s var(--ease-spring-1)';
          welcomeTitle.style.opacity = '1';
          welcomeTitle.style.transform = 'translateY(0)';
        }
      }, 100);
      
      setTimeout(() => {
        if (welcomeSubtitle) {
          welcomeSubtitle.style.transition = 'opacity 0.5s ease, transform 0.5s var(--ease-spring-1)';
          welcomeSubtitle.style.opacity = '1';
          welcomeSubtitle.style.transform = 'translateY(0)';
        }
      }, 200);
      
      setTimeout(() => {
        if (dateDisplay) {
          dateDisplay.style.transition = 'opacity 0.5s ease, transform 0.5s var(--ease-spring-1)';
          dateDisplay.style.opacity = '1';
          dateDisplay.style.transform = 'translateY(0)';
        }
      }, 300);
      
      // Animate stat cards with staggered timing
      statsCards.forEach((card, index) => {
        setTimeout(() => {
          card.style.transition = 'opacity 0.5s ease, transform 0.5s var(--ease-spring-1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 400 + (index * 100));
      });
      
      // Animate section headers
      sectionHeaders.forEach((header, index) => {
        setTimeout(() => {
          header.style.transition = 'opacity 0.5s ease, transform 0.5s var(--ease-spring-1)';
          header.style.opacity = '1';
          header.style.transform = 'translateY(0)';
        }, 800 + (index * 200));
      });
    };
    
    /**
     * Initialize the dashboard
     */
    const init = () => {
      setupSidebar();
      setupProjectSelector();
      setupTaskCards();
      setupProjectCards();
      setupActivityFeed();
      setupCurrentDate();
      setupSearch();
      setupNotifications();
      setupCreateTask();
      setupDashboardAnimations();
      
      // Check and apply theme preference
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('theme-dark');
      } else if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('theme-light');
      }
    };
    
    // Start initialization
    init();
  });