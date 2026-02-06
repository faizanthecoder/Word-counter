// ===================================
// 3D ANIMATIONS FOR COUNTIT4U
// Combination: GSAP + Three.js + Custom JS
// ===================================

// Load GSAP and Three.js
const script1 = document.createElement('script');
script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
document.head.appendChild(script2);

// ===================================
// THREE.JS PARTICLE BACKGROUND
// ===================================
class ParticleBackground {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.init();
  }

  init() {
    // Wait for Three.js to load
    setTimeout(() => {
      if (typeof THREE !== 'undefined') {
        this.setupScene();
        this.createParticles();
        this.animate();
        this.addEventListeners();
      }
    }, 1000);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);
    document.getElementById('particle-container')?.appendChild(this.renderer.domElement);
    
    this.camera.position.z = 5;
  }

  createParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
      
      colors[i] = 0.3 + Math.random() * 0.2; // R
      colors[i + 1] = 0.7 + Math.random() * 0.3; // G  
      colors[i + 2] = 0.7 + Math.random() * 0.3; // B
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.particles) {
      this.particles.rotation.x += 0.001;
      this.particles.rotation.y += 0.002;
      
      // Mouse interaction
      this.particles.rotation.x += this.mouseY * 0.0001;
      this.particles.rotation.y += this.mouseX * 0.0001;
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  addEventListeners() {
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX - window.innerWidth / 2;
      this.mouseY = e.clientY - window.innerHeight / 2;
    });

    window.addEventListener('resize', () => {
      if (this.camera && this.renderer) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }
}

// ===================================
// GSAP 3D ANIMATIONS
// ===================================
class GSAP3DAnimations {
  constructor() {
    this.init();
  }

  init() {
    // Wait for GSAP to load
    setTimeout(() => {
      if (typeof gsap !== 'undefined') {
        this.setupAnimations();
        this.setupScrollAnimations();
        this.setupCounterAnimations();
        this.setupCardAnimations();
      }
    }, 1500);
  }

  setupAnimations() {
    // Hero text animation
    gsap.from('.hero-title', {
      duration: 2,
      y: 100,
      opacity: 0,
      rotationX: 90,
      transformPerspective: 1000,
      ease: 'power4.out'
    });

    // Navigation items stagger
    gsap.from('.nav-item-3d', {
      duration: 1,
      y: -50,
      opacity: 0,
      rotationY: -90,
      stagger: 0.1,
      delay: 0.5,
      ease: 'power3.out'
    });

    // Tool cards entrance
    gsap.from('.tool-card-3d', {
      duration: 1.5,
      scale: 0,
      rotationY: 180,
      stagger: 0.2,
      delay: 1,
      ease: 'back.out(1.7)'
    });

    // Stats bar animation
    gsap.from('.stat-item-3d', {
      duration: 1,
      x: -100,
      opacity: 0,
      rotationZ: 45,
      stagger: 0.1,
      delay: 1.5,
      ease: 'power2.out'
    });
  }

  setupScrollAnimations() {
    // Parallax scrolling
    gsap.to('.parallax-bg-3d', {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Tool cards on scroll
    gsap.utils.toArray('.tool-card-3d').forEach(card => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true
        },
        y: 100,
        opacity: 0,
        rotationX: 45,
        scale: 0.8
      });
    });

    // Blog cards on scroll
    gsap.utils.toArray('.blog-card-3d').forEach(card => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true
        },
        x: -100,
        opacity: 0,
        rotationY: -30
      });
    });
  }

  setupCounterAnimations() {
    // Animate counters when they come into view
    const counters = document.querySelectorAll('.counter-3d');
    
    counters.forEach(counter => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(counter.dataset.target) || 0;
            this.animateCounter(counter, target);
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(counter);
    });
  }

  animateCounter(element, target) {
    element.classList.add('updating');
    
    gsap.to({ value: 0 }, {
      value: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: function() {
        element.textContent = Math.round(this.targets()[0].value);
      },
      onComplete: () => {
        element.classList.remove('updating');
      }
    });
  }

  setupCardAnimations() {
    // 3D card hover effects
    document.querySelectorAll('.tool-card-3d').forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        gsap.to(card, {
          duration: 0.3,
          rotationY: 5,
          rotationX: -5,
          z: 20,
          scale: 1.02,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', (e) => {
        gsap.to(card, {
          duration: 0.3,
          rotationY: 0,
          rotationX: 0,
          z: 0,
          scale: 1,
          ease: 'power2.out'
        });
      });

      // Card tilt on mouse move
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        gsap.to(card, {
          duration: 0.1,
          rotationX: rotateX,
          rotationY: rotateY,
          ease: 'power2.out'
        });
      });
    });

    // Button press animations
    document.querySelectorAll('.btn-3d').forEach(btn => {
      btn.addEventListener('mousedown', () => {
        gsap.to(btn, {
          duration: 0.1,
          scale: 0.95,
          z: -5,
          ease: 'power2.in'
        });
      });

      btn.addEventListener('mouseup', () => {
        gsap.to(btn, {
          duration: 0.2,
          scale: 1,
          z: 0,
          ease: 'elastic.out(1, 0.3)'
        });
      });
    });
  }
}

// ===================================
// FLOATING WORDS ANIMATION
// ===================================
class FloatingWords {
  constructor() {
    this.words = [
      'Write', 'Create', 'Analyze', 'Improve', 'Edit', 'Draft', 'Polish', 'Compose',
      'Words', 'Text', 'Story', 'Essay', 'Article', 'Blog', 'Content', 'Ideas',
      'Grammar', 'Style', 'Tone', 'Voice', 'Clarity', 'Impact', 'Engage', 'Connect'
    ];
    this.init();
  }

  init() {
    this.createContainer();
    this.createWords();
  }

  createContainer() {
    const container = document.createElement('div');
    container.className = 'floating-words-container';
    container.id = 'floating-words';
    document.body.appendChild(container);
  }

  createWords() {
    const container = document.getElementById('floating-words');
    
    setInterval(() => {
      if (container.children.length < 15) {
        const word = document.createElement('div');
        word.className = 'floating-word';
        word.textContent = this.words[Math.floor(Math.random() * this.words.length)];
        word.style.left = Math.random() * 100 + '%';
        word.style.animationDelay = Math.random() * 5 + 's';
        word.style.animationDuration = (15 + Math.random() * 10) + 's';
        
        container.appendChild(word);
        
        // Remove word after animation
        setTimeout(() => {
          if (word.parentNode) {
            word.remove();
          }
        }, 25000);
      }
    }, 2000);
  }
}

// ===================================
// 3D PARALLAX EFFECTS
// ===================================
class Parallax3D {
  constructor() {
    this.init();
  }

  init() {
    this.createParallaxLayers();
    this.addScrollListener();
  }

  createParallaxLayers() {
    // Create background layer
    const bgLayer = document.createElement('div');
    bgLayer.className = 'parallax-layer-3d parallax-bg-3d';
    bgLayer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -2;
      background: linear-gradient(116deg, #e8f9f7, #44bfb4);
    `;
    document.body.appendChild(bgLayer);

    // Create middle layer
    const midLayer = document.createElement('div');
    midLayer.className = 'parallax-layer-3d parallax-mid-3d';
    midLayer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: radial-gradient(circle at 20% 50%, rgba(79, 209, 197, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 50%, rgba(68, 191, 180, 0.1) 0%, transparent 50%);
    `;
    document.body.appendChild(midLayer);
  }

  addScrollListener() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax-layer-3d');
    
    parallaxElements.forEach((element, index) => {
      const speed = index === 0 ? 0.5 : 0.3;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px) translateZ(${-100 * (index + 1)}px) scale(${1 + (index + 1) * 0.1})`;
    });
  }
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  // Create particle container
  const particleContainer = document.createElement('div');
  particleContainer.id = 'particle-container';
  particleContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  `;
  document.body.appendChild(particleContainer);

  // Initialize all 3D systems
  new ParticleBackground();
  new GSAP3DAnimations();
  new FloatingWords();
  new Parallax3D();

  // Add 3D classes to existing elements
  add3DClasses();
});

// ===================================
// UTILITY FUNCTIONS
// ===================================
function add3DClasses() {
  // Add 3D classes to navigation
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.add('nav-item-3d');
  });

  // Add 3D classes to buttons
  document.querySelectorAll('button').forEach(btn => {
    btn.classList.add('btn-3d');
  });

  // Add 3D classes to counters
  document.querySelectorAll('[data-counter]').forEach(counter => {
    counter.classList.add('counter-3d');
  });

  // Add 3D classes to tool cards
  document.querySelectorAll('.tool-card, .card').forEach(card => {
    card.classList.add('tool-card-3d');
  });

  // Add 3D classes to blog cards
  document.querySelectorAll('.blog-card, article').forEach(card => {
    card.classList.add('blog-card-3d');
  });

  // Add 3D classes to stats
  document.querySelectorAll('.stat, .stats-bar > div').forEach(stat => {
    stat.classList.add('stat-item-3d');
  });
}

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
// Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('reduce-motion');
}

// Disable animations on low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
  document.body.classList.add('low-performance');
}

// ===================================
// EXPORT FOR EXTERNAL USE
// ===================================
window.CountIt4U3D = {
  ParticleBackground,
  GSAP3DAnimations,
  FloatingWords,
  Parallax3D
};
