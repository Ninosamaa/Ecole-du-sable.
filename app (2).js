// École du Souffle du Sable - Version avec Fresque Art Edo Poétique
// Système d'interactivité ultra-immersif avec Ryoji Aonagi - SILENCE COMPLET

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section, .hero-section');
    const heroSection = document.querySelector('.hero-section');
    const sandOverlay = document.querySelector('.sand-overlay');
    const techniqueCards = document.querySelectorAll('.technique-card');
    const methodCards = document.querySelectorAll('.method-card');
    const hierarchieCards = document.querySelectorAll('.hierarchie-card');
    const portraitFramePremium = document.querySelector('.portrait-frame-premium');
    const portraitImage = document.querySelector('.portrait-img');
    const goldenParticles = document.querySelector('.golden-particles');
    
    // Variables pour les animations
    let isScrolling = false;
    let sandParticles = [];
    let goldenParticleElements = [];
    let animationId = null;
    
    // Navigation fluide perfectionnée
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            let targetSection = document.getElementById(targetId);
            
            // Gestion spéciale pour l'accueil qui pointe vers hero-section
            if (targetId === 'accueil') {
                targetSection = heroSection;
            }
            
            console.log(`Navigation vers: ${targetId}`, targetSection);
            
            if (targetSection) {
                // Calculer la position correcte avec l'offset de la navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const offsetTop = targetSection.offsetTop - navbarHeight - 20;
                
                // Animation de navigation fluide
                window.scrollTo({
                    top: Math.max(0, offsetTop),
                    behavior: 'smooth'
                });
                
                // Mise à jour immédiate du lien actif
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Effet de vague de sable sur le clic
                createNavigationEffect(this, e);
                
                // Son de sable (simulation visuelle)
                createSandRipple(e.clientX, e.clientY);
                
                console.log(`Scroll vers: ${offsetTop}px`);
            } else {
                console.error(`Section non trouvée: ${targetId}`);
            }
        });
    });
    
    // Mise à jour du lien actif au scroll
    function updateActiveNavLink() {
        const scrollPosition = window.scrollY + 120;
        
        // Vérifier si on est dans la section héro
        if (scrollPosition < heroSection.offsetHeight - 100) {
            navLinks.forEach(link => link.classList.remove('active'));
            const accueilLink = document.querySelector('a[href="#accueil"]');
            if (accueilLink) accueilLink.classList.add('active');
            return;
        }
        
        let activeSection = null;
        let closestDistance = Infinity;
        
        // Trouver la section la plus proche
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            const distance = Math.abs(scrollPosition - sectionTop);
            
            if (scrollPosition >= sectionTop - 100 && scrollPosition < sectionTop + sectionHeight - 100) {
                if (distance < closestDistance) {
                    closestDistance = distance;
                    activeSection = sectionId;
                }
            }
        });
        
        if (activeSection) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`a[href="#${activeSection}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                console.log(`Section active: ${activeSection}`);
            }
        }
    }
    
    // Système de particules de sable ultra-avancé
    class SandParticle {
        constructor(x, y, options = {}) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * (options.speed || 2);
            this.vy = Math.random() * (options.fallSpeed || 3) + 1;
            this.size = Math.random() * (options.maxSize || 4) + 1;
            this.life = options.life || 1;
            this.maxLife = this.life;
            this.color = options.color || this.getRandomSandColor();
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 4;
            this.gravity = options.gravity || 0.1;
            this.wind = options.wind || 0;
            this.element = this.createElement();
        }
        
        getRandomSandColor() {
            const colors = [
                'rgba(201, 169, 97, 0.8)',
                'rgba(212, 184, 150, 0.7)',
                'rgba(184, 149, 111, 0.6)',
                'rgba(205, 127, 50, 0.5)',
                'rgba(184, 115, 51, 0.4)'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        createElement() {
            const element = document.createElement('div');
            element.style.position = 'fixed';
            element.style.left = this.x + 'px';
            element.style.top = this.y + 'px';
            element.style.width = this.size + 'px';
            element.style.height = this.size + 'px';
            element.style.backgroundColor = this.color;
            element.style.borderRadius = Math.random() > 0.5 ? '50%' : '20%';
            element.style.pointerEvents = 'none';
            element.style.zIndex = '100';
            element.style.transition = 'opacity 0.3s ease';
            element.style.boxShadow = `0 0 ${this.size * 2}px ${this.color}`;
            document.body.appendChild(element);
            return element;
        }
        
        update() {
            this.vy += this.gravity;
            this.vx += this.wind;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.life -= 0.008;
            
            // Mise à jour de l'élément DOM
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            this.element.style.transform = `rotate(${this.rotation}deg)`;
            this.element.style.opacity = Math.max(0, this.life);
            
            // Retirer si hors écran ou mort
            if (this.life <= 0 || this.y > window.innerHeight + 50 || this.x < -50 || this.x > window.innerWidth + 50) {
                this.element.remove();
                return false;
            }
            return true;
        }
    }
    
    // Classe pour les particules dorées premium
    class GoldenParticle {
        constructor(centerX, centerY, radius, angle) {
            this.centerX = centerX;
            this.centerY = centerY;
            this.radius = radius;
            this.angle = angle;
            this.size = Math.random() * 4 + 2;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.speed = Math.random() * 0.02 + 0.01;
            this.color = this.getGoldenColor();
            this.element = this.createElement();
            this.life = 1;
        }
        
        getGoldenColor() {
            const colors = [
                'rgba(255, 215, 0, 0.9)',
                'rgba(255, 179, 71, 0.8)',
                'rgba(218, 165, 32, 0.7)',
                'rgba(205, 127, 50, 0.6)'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        createElement() {
            const element = document.createElement('div');
            element.style.position = 'fixed';
            element.style.width = this.size + 'px';
            element.style.height = this.size + 'px';
            element.style.backgroundColor = this.color;
            element.style.borderRadius = '50%';
            element.style.pointerEvents = 'none';
            element.style.zIndex = '150';
            element.style.boxShadow = `0 0 ${this.size * 3}px ${this.color}`;
            element.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(element);
            return element;
        }
        
        update() {
            this.angle += this.speed;
            const x = this.centerX + Math.cos(this.angle) * this.radius;
            const y = this.centerY + Math.sin(this.angle) * this.radius;
            
            this.element.style.left = x + 'px';
            this.element.style.top = y + 'px';
            this.element.style.opacity = this.opacity * this.life;
            
            // Scintillement
            this.opacity = 0.2 + Math.abs(Math.sin(Date.now() * 0.005 + this.angle)) * 0.8;
            
            return this.life > 0;
        }
        
        destroy() {
            if (this.element) {
                this.element.remove();
            }
        }
    }
    
    // Gestionnaire de particules
    function createSandParticle(x, y, options = {}) {
        const particle = new SandParticle(x, y, options);
        sandParticles.push(particle);
    }
    
    function updateSandParticles() {
        sandParticles = sandParticles.filter(particle => particle.update());
    }
    
    // Gestionnaire des particules dorées pour Ryoji Aonagi
    function createGoldenParticlesSystem() {
        if (!portraitFramePremium) return;
        
        const rect = portraitFramePremium.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Créer 12 particules dorées en orbite
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 * Math.PI) / 180;
            const radius = 180 + Math.random() * 40;
            const particle = new GoldenParticle(centerX, centerY, radius, angle);
            goldenParticleElements.push(particle);
        }
    }
    
    function updateGoldenParticles() {
        if (!portraitFramePremium) return;
        
        const rect = portraitFramePremium.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        goldenParticleElements.forEach(particle => {
            particle.centerX = centerX;
            particle.centerY = centerY;
            particle.update();
        });
    }
    
    // Animation continue des particules
    function animateSand() {
        updateSandParticles();
        updateGoldenParticles();
        
        // Création de particules ambiantes
        if (Math.random() < 0.1) {
            createSandParticle(
                Math.random() * window.innerWidth,
                -10,
                {
                    speed: 1,
                    fallSpeed: 2,
                    life: 3,
                    wind: Math.sin(Date.now() * 0.001) * 0.5
                }
            );
        }
        
        animationId = requestAnimationFrame(animateSand);
    }
    
    // Effet de navigation
    function createNavigationEffect(element, event) {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                createSandParticle(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    {
                        speed: 3,
                        fallSpeed: 2,
                        maxSize: 3,
                        life: 2,
                        color: 'rgba(201, 169, 97, 0.9)'
                    }
                );
            }, i * 30);
        }
    }
    
    // Effet de vague de sable
    function createSandRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.border = '2px solid rgba(201, 169, 97, 0.6)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '999';
        ripple.style.animation = 'sandRipple 1s ease-out forwards';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    }
    
    // Effets spéciaux pour le portrait de Ryoji Aonagi
    function setupPortraitEffects() {
        if (!portraitFramePremium) return;
        
        // Effet au survol du portrait
        portraitFramePremium.addEventListener('mouseenter', function() {
            console.log('Portrait hover - Ryoji Aonagi effect activated');
            
            // Explosion de particules dorées
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    createSandParticle(centerX, centerY, {
                        color: i % 3 === 0 ? 'rgba(255, 215, 0, 0.9)' : 
                               i % 3 === 1 ? 'rgba(220, 20, 60, 0.8)' : 'rgba(248, 248, 255, 0.7)',
                        speed: 4,
                        fallSpeed: Math.random() * 3 + 1,
                        life: 4,
                        maxSize: 6,
                        gravity: 0.05
                    });
                }, i * 50);
            }
            
            // Effet de lueur rouge pour les yeux
            if (portraitImage) {
                portraitImage.style.filter = 'brightness(1.1) drop-shadow(0 0 15px rgba(220, 20, 60, 0.6))';
            }
        });
        
        portraitFramePremium.addEventListener('mouseleave', function() {
            if (portraitImage) {
                portraitImage.style.filter = '';
            }
        });
        
        // Clic sur le portrait pour effet spécial
        portraitFramePremium.addEventListener('click', function() {
            console.log('Portrait clicked - Special Ryoji Aonagi animation');
            
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Animation du nom en particules
            createNameParticleEffect(centerX, centerY);
            
            // Effet de citation
            showRyojiQuote();
        });
    }
    
    // Effet des particules du nom
    function createNameParticleEffect(centerX, centerY) {
        const nameChars = ['良', '木', '青', '凪'];
        
        nameChars.forEach((char, index) => {
            setTimeout(() => {
                const angle = (index * 90 * Math.PI) / 180;
                const distance = 100;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                // Créer un élément temporaire pour le caractère
                const charElement = document.createElement('div');
                charElement.textContent = char;
                charElement.style.position = 'fixed';
                charElement.style.left = x + 'px';
                charElement.style.top = y + 'px';
                charElement.style.fontSize = '2rem';
                charElement.style.color = 'rgba(255, 215, 0, 0.9)';
                charElement.style.fontWeight = 'bold';
                charElement.style.pointerEvents = 'none';
                charElement.style.zIndex = '200';
                charElement.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
                charElement.style.animation = 'floatAndFade 3s ease-out forwards';
                
                document.body.appendChild(charElement);
                
                setTimeout(() => charElement.remove(), 3000);
            }, index * 300);
        });
    }
    
    // Affichage de la citation de Ryoji
    function showRyojiQuote() {
        const quote = document.createElement('div');
        quote.innerHTML = `
            <div style="text-align: center; color: #2c1810; font-size: 1.2rem; font-weight: 500;">
                "Dans le silence du désert, l'âme trouve sa véritable force"
                <div style="font-size: 1rem; margin-top: 8px; color: #4a3c2a; font-style: italic;">- Ryoji Aonagi</div>
            </div>
        `;
        quote.style.position = 'fixed';
        quote.style.top = '50%';
        quote.style.left = '50%';
        quote.style.transform = 'translate(-50%, -50%)';
        quote.style.background = 'rgba(245, 230, 211, 0.95)';
        quote.style.padding = '20px 30px';
        quote.style.borderRadius = '12px';
        quote.style.border = '3px solid rgba(255, 215, 0, 0.8)';
        quote.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        quote.style.backdropFilter = 'blur(15px)';
        quote.style.zIndex = '1000';
        quote.style.maxWidth = '400px';
        quote.style.animation = 'fadeInScale 0.5s ease-out';
        
        document.body.appendChild(quote);
        
        // Retirer après 4 secondes
        setTimeout(() => {
            quote.style.animation = 'fadeOutScale 0.5s ease-in forwards';
            setTimeout(() => quote.remove(), 500);
        }, 4000);
    }
    
    // Effets parallaxe avancés pour les éléments Edo
    function updateParallaxEffects() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        // Parallaxe pour les éléments Edo
        const edoBackground = document.querySelector('.edo-background');
        const edoMountains = document.querySelector('.edo-mountains');
        const edoClouds = document.querySelector('.edo-clouds');
        const edoWaves = document.querySelector('.edo-waves');
        const edoBirds = document.querySelector('.edo-birds');
        const edoMoon = document.querySelector('.edo-moon');
        const edoCherryBranch = document.querySelector('.edo-cherry-branch');
        const sandParticlesEdo = document.querySelector('.sand-particles-edo');
        
        if (edoBackground && scrolled < heroSection.offsetHeight) {
            edoBackground.style.transform = `translateY(${rate}px)`;
        }
        
        if (edoMountains && scrolled < heroSection.offsetHeight) {
            edoMountains.style.transform = `translateY(${rate * 0.2}px)`;
        }
        
        if (edoClouds && scrolled < heroSection.offsetHeight) {
            edoClouds.style.transform = `translateY(${rate * 0.4}px) translateX(${scrolled * 0.1}px)`;
        }
        
        if (edoWaves && scrolled < heroSection.offsetHeight) {
            edoWaves.style.transform = `translateY(${rate * 0.3}px)`;
        }
        
        if (edoBirds && scrolled < heroSection.offsetHeight) {
            edoBirds.style.transform = `translateY(${rate * 0.5}px) translateX(${scrolled * 0.05}px)`;
        }
        
        if (edoMoon && scrolled < heroSection.offsetHeight) {
            edoMoon.style.transform = `translateY(${rate * 0.1}px) rotate(${scrolled * 0.02}deg)`;
        }
        
        if (edoCherryBranch && scrolled < heroSection.offsetHeight) {
            edoCherryBranch.style.transform = `translateY(${rate * 0.6}px) rotate(${Math.sin(scrolled * 0.01) * 2}deg)`;
        }
        
        if (sandParticlesEdo && scrolled < heroSection.offsetHeight) {
            sandParticlesEdo.style.transform = `translateY(${rate * 0.7}px)`;
        }
    }
    
    // Animations au scroll avec Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animations spéciales par section
                const sectionId = entry.target.getAttribute('id');
                switch(sectionId) {
                    case 'hierarchie':
                        animateHierarchieSection();
                        break;
                    case 'techniques':
                        animateTechniquesSection();
                        break;
                    case 'entrainement':
                        animateTrainingSection();
                        break;
                    case 'referent':
                        animateReferentSection();
                        break;
                    case 'reglement':
                        animateRulesSection();
                        break;
                    case 'serment':
                        animateOathSection();
                        break;
                }
            }
        });
    }, observerOptions);
    
    sections.forEach(section => sectionObserver.observe(section));
    
    // Animation de la hiérarchie
    function animateHierarchieSection() {
        hierarchieCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.7) rotate(-3deg)';
                card.style.transition = 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1) rotate(0)';
                    
                    // Effet spécial pour le référent
                    if (card.classList.contains('referent-special')) {
                        createReferentEffect(card);
                    }
                }, 100);
            }, index * 100);
        });
    }
    
    // Effet spécial référent
    function createReferentEffect(card) {
        const rect = card.getBoundingClientRect();
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                createSandParticle(
                    rect.left + rect.width / 2,
                    rect.top,
                    {
                        color: 'rgba(205, 127, 50, 0.8)',
                        speed: 2,
                        fallSpeed: -1,
                        life: 4,
                        gravity: -0.05
                    }
                );
            }, i * 100);
        }
    }
    
    // Animation des techniques
    function animateTechniquesSection() {
        techniqueCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(50px) scale(0.9)';
                card.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                    
                    // Effet spécial pour la technique secrète
                    if (card.classList.contains('technique-secret')) {
                        createSecretTechniqueEffect(card);
                    }
                }, 100);
            }, index * 150);
        });
    }
    
    // Effet technique secrète
    function createSecretTechniqueEffect(card) {
        const rect = card.getBoundingClientRect();
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                createSandParticle(
                    rect.left + Math.random() * rect.width,
                    rect.top + Math.random() * rect.height,
                    {
                        color: i % 2 === 0 ? 'rgba(198, 52, 52, 0.8)' : 'rgba(142, 68, 173, 0.7)',
                        speed: 3,
                        fallSpeed: 1,
                        life: 3,
                        maxSize: 4
                    }
                );
            }, i * 80);
        }
        
        // Effet de sceau
        card.style.boxShadow = '0 0 30px rgba(198, 52, 52, 0.5)';
        setTimeout(() => {
            card.style.boxShadow = '';
        }, 2000);
    }
    
    // Animation de la section entraînement
    function animateTrainingSection() {
        methodCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateX(-30px) rotateX(15deg)';
                card.style.transition = 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateX(0) rotateX(0)';
                }, 100);
            }, index * 120);
        });
    }
    
    // Animation de la section référent PREMIUM - Ryoji Aonagi
    function animateReferentSection() {
        console.log('🎭 Animation de la section Référent Premium - Ryoji Aonagi');
        
        const portrait = document.querySelector('.portrait-frame-premium');
        const referentCard = document.querySelector('.referent-card-premium');
        
        if (portrait) {
            portrait.style.opacity = '0';
            portrait.style.transform = 'scale(0.8) rotateY(-20deg)';
            portrait.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            setTimeout(() => {
                portrait.style.opacity = '1';
                portrait.style.transform = 'scale(1) rotateY(0)';
                
                // Créer le système de particules dorées
                setTimeout(() => {
                    createGoldenParticlesSystem();
                    createPortraitEffect(portrait);
                }, 500);
            }, 200);
        }
        
        if (referentCard) {
            setTimeout(() => {
                referentCard.style.opacity = '0';
                referentCard.style.transform = 'translateX(50px)';
                referentCard.style.transition = 'all 1s ease-out';
                
                setTimeout(() => {
                    referentCard.style.opacity = '1';
                    referentCard.style.transform = 'translateX(0)';
                }, 100);
            }, 400);
        }
    }
    
    // Effet premium du portrait
    function createPortraitEffect(portrait) {
        const rect = portrait.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Cercle de particules de sable doré
        for (let i = 0; i < 360; i += 20) {
            setTimeout(() => {
                const angle = (i * Math.PI) / 180;
                const radius = rect.width / 2 + 40;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                createSandParticle(x, y, {
                    color: 'rgba(255, 215, 0, 0.8)',
                    speed: 0.5,
                    fallSpeed: 0,
                    life: 6,
                    gravity: 0,
                    maxSize: 4
                });
            }, i * 15);
        }
        
        // Effet spécial pour les yeux rouges
        setTimeout(() => {
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    createSandParticle(centerX, centerY - 20, {
                        color: 'rgba(220, 20, 60, 0.9)',
                        speed: Math.random() * 2,
                        fallSpeed: Math.random() * 2,
                        life: 3,
                        maxSize: 3
                    });
                }, i * 100);
            }
        }, 1000);
    }
    
    // Animation de la section règlement
    function animateRulesSection() {
        const ruleItems = document.querySelectorAll('.rule-item');
        
        ruleItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-40px)';
                item.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                    
                    // Effet de particules sur chaque règle
                    const rect = item.getBoundingClientRect();
                    createSandParticle(
                        rect.left + 20,
                        rect.top + rect.height / 2,
                        {
                            color: 'rgba(201, 169, 97, 0.8)',
                            speed: 2,
                            fallSpeed: 1,
                            life: 3,
                            maxSize: 3
                        }
                    );
                }, 100);
            }, index * 150);
        });
    }
    
    // Animation du serment
    function animateOathSection() {
        const oathCard = document.querySelector('.oath-card');
        const sealCircle = document.querySelector('.seal-circle');
        
        if (oathCard) {
            oathCard.style.opacity = '0';
            oathCard.style.transform = 'scale(0.9) rotateX(10deg)';
            oathCard.style.transition = 'all 1s cubic-bezier(0.23, 1, 0.32, 1)';
            
            setTimeout(() => {
                oathCard.style.opacity = '1';
                oathCard.style.transform = 'scale(1) rotateX(0)';
            }, 200);
        }
        
        if (sealCircle) {
            setTimeout(() => {
                createSealEffect(sealCircle);
            }, 800);
        }
    }
    
    // Effet du sceau
    function createSealEffect(seal) {
        const rect = seal.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const angle = (i * 30 * Math.PI) / 180;
                const radius = 60;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                createSandParticle(x, y, {
                    color: 'rgba(201, 169, 97, 0.9)',
                    speed: 1,
                    fallSpeed: 0,
                    life: 6,
                    gravity: 0,
                    maxSize: 3
                });
            }, i * 100);
        }
    }
    
    // Effets au survol
    function setupHoverEffects() {
        // Techniques
        techniqueCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const rect = this.getBoundingClientRect();
                const isSecret = this.classList.contains('technique-secret');
                
                for (let i = 0; i < (isSecret ? 12 : 6); i++) {
                    setTimeout(() => {
                        createSandParticle(
                            rect.left + Math.random() * rect.width,
                            rect.top,
                            {
                                color: isSecret ? 'rgba(198, 52, 52, 0.8)' : 'rgba(201, 169, 97, 0.7)',
                                speed: 2,
                                fallSpeed: 3,
                                life: 2
                            }
                        );
                    }, i * 50);
                }
            });
        });
        
        // Méthodes d'entraînement
        methodCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const rect = this.getBoundingClientRect();
                
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        createSandParticle(
                            rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width,
                            rect.top + rect.height / 2,
                            {
                                speed: 1,
                                fallSpeed: 2,
                                life: 3,
                                gravity: 0.05
                            }
                        );
                    }, i * 80);
                }
            });
        });
    }
    
    // Gestion du scroll optimisée
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNavLink();
                updateParallaxEffects();
                
                // Création de particules supplémentaires lors du scroll
                if (Math.random() < 0.05) {
                    createSandParticle(
                        Math.random() * window.innerWidth,
                        -10,
                        {
                            speed: 0.5,
                            fallSpeed: 4,
                            life: 2,
                            wind: Math.sin(Date.now() * 0.002) * 1
                        }
                    );
                }
                
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Animation du titre héro avec effet typing
    function animateHeroTitle() {
        const kanji = document.querySelector('.hero-title .kanji');
        const subtitle = document.querySelector('.hero-title .subtitle');
        const description = document.querySelector('.hero-description');
        
        if (kanji) {
            const originalText = kanji.textContent;
            kanji.textContent = '';
            
            let index = 0;
            const typeInterval = setInterval(() => {
                kanji.textContent += originalText[index];
                
                // Effet de particules pendant le typing
                if (index > 0) {
                    const rect = kanji.getBoundingClientRect();
                    createSandParticle(
                        rect.right,
                        rect.top + rect.height / 2,
                        {
                            color: 'rgba(201, 169, 97, 0.9)',
                            speed: 2,
                            fallSpeed: 1,
                            life: 2
                        }
                    );
                }
                
                index++;
                if (index >= originalText.length) {
                    clearInterval(typeInterval);
                    
                    // Animation du sous-titre
                    if (subtitle) {
                        setTimeout(() => {
                            subtitle.style.opacity = '0';
                            subtitle.style.transform = 'translateY(20px)';
                            subtitle.style.transition = 'all 0.8s ease-out';
                            
                            setTimeout(() => {
                                subtitle.style.opacity = '1';
                                subtitle.style.transform = 'translateY(0)';
                            }, 100);
                        }, 300);
                    }
                    
                    // Animation de la description
                    if (description) {
                        setTimeout(() => {
                            description.style.opacity = '0';
                            description.style.transform = 'translateY(20px)';
                            description.style.transition = 'all 0.8s ease-out';
                            
                            setTimeout(() => {
                                description.style.opacity = '1';
                                description.style.transform = 'translateY(0)';
                                
                                // Explosion finale de particules
                                setTimeout(() => {
                                    createHeroExplosion();
                                }, 500);
                            }, 100);
                        }, 600);
                    }
                }
            }, 150);
        }
    }
    
    // Explosion de particules héro
    function createHeroExplosion() {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;
        
        const rect = heroContent.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const angle = (i * 12 * Math.PI) / 180;
                const speed = 3 + Math.random() * 2;
                
                createSandParticle(centerX, centerY, {
                    speed: Math.cos(angle) * speed,
                    fallSpeed: Math.sin(angle) * speed,
                    color: i % 3 === 0 ? 'rgba(198, 52, 52, 0.6)' : 'rgba(201, 169, 97, 0.8)',
                    life: 4,
                    maxSize: 5,
                    gravity: 0.05
                });
            }, i * 50);
        }
    }
    
    // Ajout des styles CSS dynamiques
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        @keyframes sandRipple {
            0% {
                width: 0;
                height: 0;
                opacity: 1;
                margin: -1px;
            }
            100% {
                width: 200px;
                height: 200px;
                opacity: 0;
                margin: -100px;
            }
        }
        
        @keyframes fadeInScale {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes fadeOutScale {
            0% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
        
        @keyframes floatAndFade {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) scale(0.5);
            }
        }
        
        .animate {
            animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .technique-card:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 10px 30px rgba(139, 115, 85, 0.3);
        }
        
        .technique-card:hover .technique-visual {
            animation: techniqueGlow 1s ease-in-out infinite;
        }
        
        @keyframes techniqueGlow {
            0%, 100% { 
                transform: scale(1); 
                box-shadow: 0 0 10px rgba(201, 169, 97, 0.5);
            }
            50% { 
                transform: scale(1.2); 
                box-shadow: 0 0 20px rgba(201, 169, 97, 0.8);
            }
        }
        
        .technique-secret:hover {
            animation: secretPulse 0.5s ease-in-out infinite;
        }
        
        @keyframes secretPulse {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.1) drop-shadow(0 0 10px rgba(198, 52, 52, 0.5)); }
        }
        
        .portrait-frame-premium:hover {
            transform: scale(1.05);
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(dynamicStyles);
    
    // Debug function pour vérifier les sections
    function debugSections() {
        console.log('=== DEBUG SECTIONS - FRESQUE ART EDO POÉTIQUE ===');
        sections.forEach((section, index) => {
            console.log(`${index + 1}. ID: "${section.getAttribute('id')}" - OffsetTop: ${section.offsetTop}px`);
        });
        
        console.log('=== DEBUG NAVIGATION LINKS ===');
        navLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const targetId = href.substring(1);
            const targetExists = document.getElementById(targetId) || (targetId === 'accueil' && heroSection);
            console.log(`${index + 1}. Href: "${href}" - Target: "${targetId}" - Exists: ${!!targetExists}`);
        });
        
        console.log('=== DEBUG PORTRAIT PREMIUM ===');
        console.log('Portrait Frame Premium:', !!portraitFramePremium);
        console.log('Portrait Image:', !!portraitImage);
        console.log('Golden Particles Container:', !!goldenParticles);
        
        console.log('=== DEBUG ÉLÉMENTS EDO ===');
        console.log('Edo Background:', !!document.querySelector('.edo-background'));
        console.log('Edo Mountains:', !!document.querySelector('.edo-mountains'));
        console.log('Edo Moon:', !!document.querySelector('.edo-moon'));
        console.log('Edo Cherry Branch:', !!document.querySelector('.edo-cherry-branch'));
        console.log('Edo Waves:', !!document.querySelector('.edo-waves'));
        console.log('Edo Clouds:', !!document.querySelector('.edo-clouds'));
        console.log('Edo Birds:', !!document.querySelector('.edo-birds'));
        console.log('Sand Particles Edo:', !!document.querySelector('.sand-particles-edo'));
    }
    
    // Initialisation
    function init() {
        console.log('🏜️ École du Souffle du Sable - FRESQUE ART EDO POÉTIQUE');
        console.log('🎨 Fond d\'accueil: Fresque inspirée art japonais Edo');
        console.log('🌸 Éléments: Cerisier, vagues Hokusai, lune, montagnes, oiseaux');
        console.log('🎯 Tons sable: Violet → Orange → Doré avec beige, ocre, cuivre');
        console.log('🌪️ Système de particules de sable activé');
        console.log('✨ Portrait Premium Ryoji Aonagi configuré');
        console.log('👤 Cheveux blancs, yeux rouges, tenue sable');
        console.log('🎭 Hiérarchie thème sable intégrée');
        console.log('🔇 SILENCE COMPLET - Pas d\'audio');
        console.log('📜 Section règlement incluse');
        
        // Debug des sections et du portrait
        debugSections();
        
        // Animation d'entrée
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 1s ease-in-out';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
            
            // Démarrer les animations
            setTimeout(() => {
                animateHeroTitle();
                animateSand();
                setupHoverEffects();
                setupPortraitEffects(); // Configuration des effets du portrait premium
            }, 500);
        }, 100);
        
        // Initialiser la navigation
        updateActiveNavLink();
    }
    
    // Nettoyage au déchargement de la page
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        sandParticles.forEach(particle => {
            if (particle.element) {
                particle.element.remove();
            }
        });
        goldenParticleElements.forEach(particle => {
            particle.destroy();
        });
    });
    
    // Gestion du redimensionnement
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateActiveNavLink();
            
            // Recréer les particules dorées si nécessaire
            if (portraitFramePremium && goldenParticleElements.length > 0) {
                goldenParticleElements.forEach(particle => particle.destroy());
                goldenParticleElements = [];
                setTimeout(() => createGoldenParticlesSystem(), 100);
            }
        }, 250);
    }, { passive: true });
    
    // Démarrage
    init();
});