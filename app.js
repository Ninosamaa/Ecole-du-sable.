// Registre des Runes - Système Complet avec Administration Restaurée - CORRIGÉ
class RuneRegistry {
    constructor() {
        // Configuration des données de l'application
        this.data = {
            runeTypes: ["Armure", "Dégât", "Réduction de cooldown", "Réduction de dégât", "Vie", "Vitesse", "Vol de vie"],
            rarities: {
                "Rare": { 
                    color: "#3b82f6", 
                    declarable: true, 
                    fragmentValue: 10, 
                    runePrice: 50 
                },
                "Épique": { 
                    color: "#8b5cf6", 
                    declarable: true, 
                    fragmentValue: 40, 
                    runePrice: 250 
                },
                "Légendaire": { 
                    color: "#f59e0b", 
                    declarable: true, 
                    fragmentValue: 100, 
                    runePrice: 500 
                }
            },
            declarableRarities: ["Rare", "Épique", "Légendaire"],
            fragmentParts: ["1/4", "2/4", "3/4", "4/4"],
            members: [],
            anonymousInventory: [],
            isAdminAuthenticated: false,
            adminPassword: "0711",
            activityLog: []
        };

        // Attendre le chargement complet du DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initialisation du Registre des Runes...');
        
        // Initialiser les données et l'interface
        this.loadData();
        this.initializeDefaultData();
        this.setupEventListeners();
        this.populateSelects();
        this.updateStats();
        this.renderPublicInventory();
        this.calculateTotalPoints();
        
        // Afficher la section d'accueil par défaut
        this.showSection('home');
        
        // Ajouter le premier input de fragment après un court délai
        setTimeout(() => {
            this.addFragmentInput();
        }, 200);
    }

    // === GESTION DES DONNÉES ===
    loadData() {
        try {
            const savedData = localStorage.getItem('runeRegistryComplete');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.data.members = parsedData.members || [];
                this.data.activityLog = parsedData.activityLog || [];
            }
        } catch (error) {
            console.warn('Impossible de charger les données:', error);
            this.logActivity('error', 'Erreur lors du chargement des données');
        }
    }

    saveData() {
        try {
            const dataToSave = {
                members: this.data.members,
                activityLog: this.data.activityLog,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('runeRegistryComplete', JSON.stringify(dataToSave));
            this.logActivity('info', 'Données sauvegardées automatiquement');
        } catch (error) {
            console.warn('Impossible de sauvegarder:', error);
            this.logActivity('error', 'Erreur lors de la sauvegarde');
        }
    }

    initializeDefaultData() {
        if (this.data.members.length === 0) {
            // Données d'exemple du JSON fourni
            this.data.members = [
                {
                    id: 1,
                    firstName: "Tanjiro",
                    lastName: "Kamado",
                    inventory: [
                        {
                            type: "Dégât",
                            rarity: "Épique",
                            fragments: {"1/4": 2, "2/4": 1, "3/4": 2, "4/4": 1}
                        },
                        {
                            type: "Vitesse",
                            rarity: "Rare",
                            fragments: {"1/4": 3, "2/4": 2, "3/4": 1, "4/4": 2}
                        }
                    ]
                },
                {
                    id: 2,
                    firstName: "Zenitsu",
                    lastName: "Agatsuma",
                    inventory: [
                        {
                            type: "Vitesse",
                            rarity: "Légendaire",
                            fragments: {"1/4": 1, "2/4": 0, "3/4": 1, "4/4": 1}
                        }
                    ]
                }
            ];

            this.logActivity('info', 'Données d\'exemple initialisées');
        }

        this.updateAnonymousInventory();
        this.saveData();
    }

    // === SYSTÈME DE LOGS ===
    logActivity(type, message) {
        const logEntry = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date().toLocaleString('fr-FR')
        };
        
        this.data.activityLog.unshift(logEntry);
        
        // Limiter à 50 entrées
        if (this.data.activityLog.length > 50) {
            this.data.activityLog = this.data.activityLog.slice(0, 50);
        }
        
        // Mettre à jour l'affichage si on est dans l'admin
        if (this.data.isAdminAuthenticated) {
            this.renderActivityLog();
        }
    }

    renderActivityLog() {
        const container = document.getElementById('activityLog');
        if (!container) return;

        if (this.data.activityLog.length === 0) {
            container.innerHTML = '<p class="text-center">Aucune activité enregistrée</p>';
            return;
        }

        container.innerHTML = this.data.activityLog.map(entry => `
            <div class="log-entry log-entry--${entry.type}">
                <div>${entry.message}</div>
                <div class="log-time">${entry.timestamp}</div>
            </div>
        `).join('');
    }

    // === ÉVÉNEMENTS ===
    setupEventListeners() {
        console.log('Configuration des événements...');
        
        // Navigation - CORRIGÉ
        const navButtons = document.querySelectorAll('.nav__btn');
        navButtons.forEach(btn => {
            const section = btn.getAttribute('data-section');
            if (section) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Navigation vers:', section);
                    this.showSection(section);
                });
            }
        });

        // Formulaire de déclaration
        const declarationForm = document.getElementById('declarationForm');
        if (declarationForm) {
            declarationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDeclaration();
            });
        }

        // Bouton ajouter fragment
        const addFragmentBtn = document.getElementById('addFragment');
        if (addFragmentBtn) {
            addFragmentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addFragmentInput();
            });
        }

        // Formulaire d'accès admin
        const adminAccessForm = document.getElementById('adminAccessForm');
        if (adminAccessForm) {
            adminAccessForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminAccess();
            });
        }

        // Filtres d'inventaire
        const filterType = document.getElementById('filterType');
        const filterRarity = document.getElementById('filterRarity');
        
        [filterType, filterRarity].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.renderPublicInventory());
            }
        });

        // Boutons d'administration
        this.setupAdminButtons();

        // Événements de modal
        this.setupModalEvents();
    }

    setupAdminButtons() {
        // Export des données
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Import des données
        const importBtn = document.getElementById('importData');
        const importInput = document.getElementById('importFileInput');
        
        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => this.importData(e));
        }

        // Actualiser
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Vider tout
        const clearBtn = document.getElementById('clearAllData');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.confirmClearAll());
        }
    }

    setupModalEvents() {
        const modal = document.getElementById('confirmationModal');
        const modalCancel = document.getElementById('modalCancel');

        if (modalCancel) {
            modalCancel.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    e.preventDefault();
                    this.hideModal();
                }
            });
        }
    }

    // === NAVIGATION - CORRIGÉE ===
    showSection(sectionId) {
        console.log('Affichage de la section:', sectionId);
        
        // Masquer toutes les sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('section--active');
        });

        // Afficher la section sélectionnée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('section--active');
            console.log('Section activée:', sectionId);
        } else {
            console.error('Section non trouvée:', sectionId);
        }

        // Mettre à jour l'état de navigation actif
        const navButtons = document.querySelectorAll('.nav__btn');
        navButtons.forEach(btn => {
            btn.classList.remove('nav__btn--active');
        });
        
        const activeButton = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeButton) {
            activeButton.classList.add('nav__btn--active');
        }

        // Rafraîchir les données pour certaines sections
        switch(sectionId) {
            case 'home':
                this.updateStats();
                break;
            case 'declare':
                // S'assurer qu'il y a au moins un input de fragment
                setTimeout(() => {
                    const fragmentInputs = document.getElementById('fragmentInputs');
                    if (fragmentInputs && fragmentInputs.children.length === 0) {
                        this.addFragmentInput();
                    }
                }, 100);
                break;
            case 'inventory':
                this.populateSelects(); // Re-peupler les filtres
                this.renderPublicInventory();
                break;
            case 'donations':
                this.calculateTotalPoints();
                break;
            case 'admin':
                if (this.data.isAdminAuthenticated) {
                    this.renderAdminPanel();
                }
                break;
        }
    }

    // === GESTION DES FRAGMENTS ===
    populateSelects() {
        console.log('Population des selects...');
        
        // Filtre par type
        const filterType = document.getElementById('filterType');
        if (filterType) {
            // Conserver la valeur actuelle
            const currentValue = filterType.value;
            
            // Vider et repeupler
            filterType.innerHTML = '<option value="">Tous les types</option>';
            
            this.data.runeTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                filterType.appendChild(option);
            });
            
            // Restaurer la valeur
            if (currentValue) {
                filterType.value = currentValue;
            }
            
            console.log('Filtre type peuplé avec', this.data.runeTypes.length, 'options');
        } else {
            console.warn('Element filterType non trouvé');
        }
        
        // Filtre par rareté (déjà dans le HTML, mais on peut vérifier)
        const filterRarity = document.getElementById('filterRarity');
        if (filterRarity) {
            console.log('Filtre rareté trouvé avec', filterRarity.options.length, 'options');
        } else {
            console.warn('Element filterRarity non trouvé');
        }
    }

    addFragmentInput() {
        const container = document.getElementById('fragmentInputs');
        if (!container) return;

        const fragmentIndex = container.children.length;
        const fragmentInput = document.createElement('div');
        fragmentInput.className = 'fragment-input';
        fragmentInput.setAttribute('data-fragment-index', fragmentIndex);
        
        fragmentInput.innerHTML = `
            <select class="form-control fragment-type" data-field="type" required>
                <option value="">Type de rune</option>
                ${this.data.runeTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>
            <select class="form-control fragment-rarity" data-field="rarity" required>
                <option value="">Rareté</option>
                ${this.data.declarableRarities.map(rarity => 
                    `<option value="${rarity}">${rarity}</option>`
                ).join('')}
            </select>
            <select class="form-control fragment-part" data-field="part" required>
                <option value="">Partie</option>
                ${this.data.fragmentParts.map(part => `<option value="${part}">${part}</option>`).join('')}
            </select>
            <input type="number" class="form-control fragment-quantity" data-field="quantity" placeholder="Qté" min="1" value="1" required>
            <button type="button" class="fragment-input__remove">×</button>
        `;

        // Bouton de suppression
        const removeBtn = fragmentInput.querySelector('.fragment-input__remove');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fragmentInput.remove();
        });

        // Prévenir les problèmes de focus
        const formElements = fragmentInput.querySelectorAll('select, input');
        formElements.forEach(element => {
            element.addEventListener('focus', (e) => e.stopPropagation());
            element.addEventListener('click', (e) => e.stopPropagation());
            element.addEventListener('change', (e) => e.stopPropagation());
        });

        container.appendChild(fragmentInput);
    }

    // === DÉCLARATION ===
    handleDeclaration() {
        const firstName = document.getElementById('slayerFirstName').value.trim();
        const lastName = document.getElementById('slayerLastName').value.trim();
        const fragmentInputs = document.querySelectorAll('.fragment-input');

        if (!firstName || !lastName) {
            alert('Veuillez remplir le nom et le prénom !');
            return;
        }

        const inventory = {};
        let hasValidFragments = false;
        
        // Traitement des fragments avec validation améliorée
        fragmentInputs.forEach(input => {
            const typeSelect = input.querySelector('.fragment-type');
            const raritySelect = input.querySelector('.fragment-rarity');
            const partSelect = input.querySelector('.fragment-part');
            const quantityInput = input.querySelector('.fragment-quantity');
            
            const type = typeSelect ? typeSelect.value : '';
            const rarity = raritySelect ? raritySelect.value : '';
            const part = partSelect ? partSelect.value : '';
            const quantity = quantityInput ? parseInt(quantityInput.value) || 0 : 0;
            
            // Vérifier que la rareté est déclarable
            if (type && rarity && part && quantity > 0 && this.data.declarableRarities.includes(rarity)) {
                hasValidFragments = true;
                const key = `${type}_${rarity}`;
                if (!inventory[key]) {
                    inventory[key] = {
                        type,
                        rarity,
                        fragments: {"1/4": 0, "2/4": 0, "3/4": 0, "4/4": 0}
                    };
                }
                inventory[key].fragments[part] += quantity;
            }
        });

        if (!hasValidFragments) {
            alert('Veuillez déclarer au moins un fragment Rare, Épique ou Légendaire valide !');
            return;
        }

        const inventoryArray = Object.values(inventory);

        // Vérifier si le membre existe déjà
        const existingMemberIndex = this.data.members.findIndex(m => 
            m.firstName === firstName && m.lastName === lastName);
        
        if (existingMemberIndex !== -1) {
            // Mettre à jour le membre existant
            this.data.members[existingMemberIndex].inventory = inventoryArray;
            this.logActivity('info', `Mise à jour de l'inventaire de ${firstName} ${lastName}`);
        } else {
            // Ajouter un nouveau membre
            const newMember = {
                id: Date.now(),
                firstName,
                lastName,
                inventory: inventoryArray
            };
            this.data.members.push(newMember);
            this.logActivity('info', `Nouveau membre ajouté: ${firstName} ${lastName}`);
        }

        // Mettre à jour l'inventaire anonyme
        this.updateAnonymousInventory();
        this.saveData();
        this.updateStats();
        this.calculateTotalPoints();
        
        // Réinitialiser le formulaire
        this.resetDeclarationForm();
        
        this.showModal(
            'Déclaration Enregistrée',
            `Déclaration de ${firstName} ${lastName} enregistrée avec succès !`,
            () => {
                this.showSection('home');
            }
        );
    }

    resetDeclarationForm() {
        const form = document.getElementById('declarationForm');
        if (form) form.reset();
        
        const fragmentInputsContainer = document.getElementById('fragmentInputs');
        if (fragmentInputsContainer) fragmentInputsContainer.innerHTML = '';

        // Ajouter un nouvel input de fragment
        setTimeout(() => this.addFragmentInput(), 100);
    }

    // === INVENTAIRE ANONYME ===
    updateAnonymousInventory() {
        // Agréger tous les inventaires des membres
        const aggregated = {};
        
        this.data.members.forEach(member => {
            member.inventory.forEach(item => {
                const key = `${item.type}_${item.rarity}`;
                if (aggregated[key]) {
                    // Ajouter les fragments
                    this.data.fragmentParts.forEach(part => {
                        aggregated[key].fragments[part] += item.fragments[part];
                    });
                } else {
                    aggregated[key] = {
                        type: item.type,
                        rarity: item.rarity,
                        fragments: { ...item.fragments }
                    };
                }
            });
        });

        // Calculer les sets complets et trier alphabétiquement
        this.data.anonymousInventory = Object.values(aggregated)
            .map(item => {
                item.completeSets = this.calculateCompleteSets(item.fragments);
                return item;
            })
            .sort((a, b) => {
                // Tri par type puis rareté
                const typeCompare = a.type.localeCompare(b.type);
                if (typeCompare !== 0) return typeCompare;
                
                const rarityOrder = ["Rare", "Épique", "Légendaire"];
                return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
            });
    }

    calculateCompleteSets(fragments) {
        const parts = Object.values(fragments);
        return Math.min(...parts);
    }

    // === STATISTIQUES ===
    updateStats() {
        const totalMembers = this.data.members.length;
        const totalFragments = this.data.anonymousInventory.reduce((sum, item) => 
            sum + Object.values(item.fragments).reduce((a, b) => a + b, 0), 0
        );
        const totalSets = this.data.anonymousInventory.reduce((sum, item) => sum + item.completeSets, 0);
        const totalTypes = this.data.anonymousInventory.length;

        const elements = {
            totalMembers: document.getElementById('totalMembers'),
            totalFragments: document.getElementById('totalFragments'),
            totalSets: document.getElementById('totalSets'),
            totalTypes: document.getElementById('totalTypes')
        };

        if (elements.totalMembers) elements.totalMembers.textContent = totalMembers;
        if (elements.totalFragments) elements.totalFragments.textContent = totalFragments;
        if (elements.totalSets) elements.totalSets.textContent = totalSets;
        if (elements.totalTypes) elements.totalTypes.textContent = totalTypes;
    }

    // === CALCUL DES POINTS ===
    calculateTotalPoints() {
        let totalPoints = 0;
        
        this.data.anonymousInventory.forEach(item => {
            const rarity = this.data.rarities[item.rarity];
            if (rarity) {
                // Points des fragments individuels
                Object.values(item.fragments).forEach(count => {
                    totalPoints += count * rarity.fragmentValue;
                });
                
                // Bonus pour les sets complets (différence avec les fragments individuels)
                const completeSets = item.completeSets;
                if (completeSets > 0) {
                    const individualFragmentPoints = completeSets * 4 * rarity.fragmentValue;
                    const completeRunePoints = completeSets * rarity.runePrice;
                    totalPoints = totalPoints - individualFragmentPoints + completeRunePoints;
                }
            }
        });

        const totalPointsElement = document.getElementById('totalPoints');
        if (totalPointsElement) {
            totalPointsElement.textContent = totalPoints.toLocaleString();
        }
    }

    // === RENDU INVENTAIRE PUBLIC MODIFIÉ ===
    renderPublicInventory() {
        const tbody = document.querySelector('#publicInventoryTable tbody');
        if (!tbody) {
            console.warn('Tableau d\'inventaire public non trouvé');
            return;
        }

        const typeFilter = document.getElementById('filterType')?.value || '';
        const rarityFilter = document.getElementById('filterRarity')?.value || '';

        console.log('Filtres appliqués - Type:', typeFilter, 'Rareté:', rarityFilter);

        // Créer le tableau complet de toutes les combinaisons possibles (21 au total)
        const allCombinations = [];
        this.data.runeTypes.forEach(type => {
            this.data.declarableRarities.forEach(rarity => {
                // Chercher si cette combinaison existe dans l'inventaire
                const existingItem = this.data.anonymousInventory.find(item => 
                    item.type === type && item.rarity === rarity
                );
                
                if (existingItem) {
                    allCombinations.push(existingItem);
                } else {
                    // Créer une entrée vide pour cette combinaison
                    allCombinations.push({
                        type,
                        rarity,
                        fragments: {"1/4": 0, "2/4": 0, "3/4": 0, "4/4": 0},
                        completeSets: 0
                    });
                }
            });
        });

        // Appliquer les filtres
        const filteredInventory = allCombinations.filter(item => {
            const matchesType = !typeFilter || item.type === typeFilter;
            const matchesRarity = !rarityFilter || item.rarity === rarityFilter;
            return matchesType && matchesRarity;
        });

        console.log(`Affichage de ${filteredInventory.length} combinaisons sur ${allCombinations.length} possibles`);

        // Générer le HTML
        tbody.innerHTML = filteredInventory.map(item => {
            const rarityClass = item.rarity.toLowerCase().replace('é', 'e');
            
            return `
                <tr>
                    <td>${item.type}</td>
                    <td><span class="rarity-tag rarity-tag--${rarityClass}">${item.rarity}</span></td>
                    <td><span class="fragment-count">${item.fragments['1/4']}</span></td>
                    <td><span class="fragment-count">${item.fragments['2/4']}</span></td>
                    <td><span class="fragment-count">${item.fragments['3/4']}</span></td>
                    <td><span class="fragment-count">${item.fragments['4/4']}</span></td>
                    <td><span class="complete-sets">${item.completeSets}</span></td>
                </tr>
            `;
        }).join('');
    }

    // === ADMINISTRATION ===
    handleAdminAccess() {
        const password = document.getElementById('adminPassword')?.value;
        
        if (password === this.data.adminPassword) {
            this.data.isAdminAuthenticated = true;
            this.logActivity('warning', 'Accès administrateur accordé');
            this.renderAdminPanel();
            
            const accessControl = document.querySelector('.access-control');
            const adminPanel = document.getElementById('adminPanel');
            
            if (accessControl) accessControl.style.display = 'none';
            if (adminPanel) adminPanel.classList.remove('hidden');
            
        } else {
            alert('Code d\'accès incorrect !');
            this.logActivity('warning', 'Tentative d\'accès administrateur échouée');
        }
    }

    renderAdminPanel() {
        if (!this.data.isAdminAuthenticated) return;
        
        this.renderActivityLog();
        
        const container = document.getElementById('membersList');
        if (!container) return;

        if (this.data.members.length === 0) {
            container.innerHTML = '<p class="text-center">Aucun membre enregistré</p>';
            return;
        }

        container.innerHTML = this.data.members.map(member => `
            <div class="member-card">
                <div class="member-header">
                    <div class="member-name">${member.firstName} ${member.lastName}</div>
                    <div class="member-actions">
                        <button class="btn btn--sm btn--danger" onclick="registry.confirmDeleteMember(${member.id})">
                            <span class="btn__icon">🗑️</span>
                            Supprimer ce membre
                        </button>
                    </div>
                </div>
                <div class="member-inventory">
                    ${member.inventory.map((item, itemIndex) => `
                        <div class="inventory-item">
                            <div class="inventory-item-header">
                                <div class="inventory-item-title">${item.type} - <span class="rarity-tag rarity-tag--${item.rarity.toLowerCase().replace('é', 'e')}">${item.rarity}</span></div>
                                <div class="inventory-item-actions">
                                    <div class="complete-sets">Sets: ${this.calculateCompleteSets(item.fragments)}</div>
                                    <button class="btn btn--sm btn--danger" onclick="registry.confirmDeleteItem(${member.id}, ${itemIndex})">
                                        <span class="btn__icon">🗑️</span>
                                        Supprimer cet item
                                    </button>
                                </div>
                            </div>
                            <div class="fragment-controls">
                                ${this.data.fragmentParts.map(part => `
                                    <div class="fragment-control">
                                        <div class="fragment-control-label">${part}</div>
                                        <div class="fragment-control-buttons">
                                            <button class="control-btn control-btn--minus" 
                                                    onclick="registry.updateFragment(${member.id}, ${itemIndex}, '${part}', -1)">-</button>
                                            <input type="number" 
                                                   class="fragment-control-input" 
                                                   value="${item.fragments[part]}" 
                                                   onchange="registry.setFragment(${member.id}, ${itemIndex}, '${part}', this.value)"
                                                   min="0">
                                            <button class="control-btn control-btn--plus" 
                                                    onclick="registry.updateFragment(${member.id}, ${itemIndex}, '${part}', 1)">+</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // === GESTION DES FRAGMENTS ADMIN ===
    updateFragment(memberId, itemIndex, part, change) {
        const member = this.data.members.find(m => m.id === memberId);
        if (member && member.inventory[itemIndex]) {
            const currentValue = member.inventory[itemIndex].fragments[part];
            const newValue = Math.max(0, currentValue + change);
            member.inventory[itemIndex].fragments[part] = newValue;
            
            this.logActivity('info', `Fragment ${part} ${member.inventory[itemIndex].type} ${member.inventory[itemIndex].rarity} de ${member.firstName} ${member.lastName} modifié: ${currentValue} → ${newValue}`);
            
            this.updateAnonymousInventory();
            this.saveData();
            this.updateStats();
            this.calculateTotalPoints();
            this.renderAdminPanel();
            this.renderPublicInventory();
        }
    }

    setFragment(memberId, itemIndex, part, value) {
        const member = this.data.members.find(m => m.id === memberId);
        if (member && member.inventory[itemIndex]) {
            const oldValue = member.inventory[itemIndex].fragments[part];
            const newValue = Math.max(0, parseInt(value) || 0);
            member.inventory[itemIndex].fragments[part] = newValue;
            
            this.logActivity('info', `Fragment ${part} ${member.inventory[itemIndex].type} ${member.inventory[itemIndex].rarity} de ${member.firstName} ${member.lastName} défini: ${oldValue} → ${newValue}`);
            
            this.updateAnonymousInventory();
            this.saveData();
            this.updateStats();
            this.calculateTotalPoints();
            this.renderAdminPanel();
            this.renderPublicInventory();
        }
    }

    // === SUPPRESSIONS ADMIN ===
    confirmDeleteMember(memberId) {
        const member = this.data.members.find(m => m.id === memberId);
        if (!member) return;

        this.showModal(
            'Supprimer le membre',
            `Êtes-vous sûr de vouloir supprimer définitivement ${member.firstName} ${member.lastName} et tout son inventaire ?`,
            () => this.deleteMember(memberId)
        );
    }

    deleteMember(memberId) {
        const memberIndex = this.data.members.findIndex(m => m.id === memberId);
        if (memberIndex !== -1) {
            const deletedMember = this.data.members[memberIndex];
            this.data.members.splice(memberIndex, 1);
            
            this.logActivity('warning', `Membre supprimé: ${deletedMember.firstName} ${deletedMember.lastName} (${deletedMember.inventory.length} items)`);
            
            this.updateAnonymousInventory();
            this.saveData();
            this.updateStats();
            this.calculateTotalPoints();
            this.renderAdminPanel();
            this.renderPublicInventory();
        }
    }

    confirmDeleteItem(memberId, itemIndex) {
        const member = this.data.members.find(m => m.id === memberId);
        if (!member || !member.inventory[itemIndex]) return;

        const item = member.inventory[itemIndex];
        this.showModal(
            'Supprimer l\'item',
            `Êtes-vous sûr de vouloir supprimer définitivement l'item ${item.type} ${item.rarity} de ${member.firstName} ${member.lastName} ?`,
            () => this.deleteItem(memberId, itemIndex)
        );
    }

    deleteItem(memberId, itemIndex) {
        const member = this.data.members.find(m => m.id === memberId);
        if (member && member.inventory[itemIndex]) {
            const deletedItem = member.inventory[itemIndex];
            member.inventory.splice(itemIndex, 1);
            
            this.logActivity('warning', `Item supprimé: ${deletedItem.type} ${deletedItem.rarity} de ${member.firstName} ${member.lastName}`);
            
            this.updateAnonymousInventory();
            this.saveData();
            this.updateStats();
            this.calculateTotalPoints();
            this.renderAdminPanel();
            this.renderPublicInventory();
        }
    }

    // === FONCTIONS D'ADMINISTRATION ===
    exportData() {
        const exportData = {
            members: this.data.members,
            activityLog: this.data.activityLog,
            exportDate: new Date().toISOString(),
            version: "1.0"
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `runes_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.logActivity('info', 'Données exportées avec succès');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.members && Array.isArray(importedData.members)) {
                    this.data.members = importedData.members;
                    if (importedData.activityLog) {
                        this.data.activityLog = importedData.activityLog;
                    }
                    
                    this.updateAnonymousInventory();
                    this.saveData();
                    this.updateStats();
                    this.calculateTotalPoints();
                    this.renderAdminPanel();
                    this.renderPublicInventory();
                    
                    this.logActivity('info', `Données importées: ${importedData.members.length} membres`);
                    alert('Import réussi !');
                } else {
                    alert('Format de fichier invalide !');
                    this.logActivity('error', 'Import échoué: format invalide');
                }
            } catch (error) {
                alert('Erreur lors de l\'import : ' + error.message);
                this.logActivity('error', 'Import échoué: ' + error.message);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    refreshData() {
        this.updateAnonymousInventory();
        this.updateStats();
        this.calculateTotalPoints();
        this.renderAdminPanel();
        this.renderPublicInventory();
        this.logActivity('info', 'Données actualisées manuellement');
    }

    confirmClearAll() {
        this.showModal(
            'Vider toutes les données',
            'ATTENTION: Cette action supprimera définitivement TOUTES les données (membres, inventaires, logs). Cette action est irréversible !',
            () => this.clearAllData()
        );
    }

    clearAllData() {
        this.data.members = [];
        this.data.activityLog = [];
        this.data.anonymousInventory = [];
        
        localStorage.removeItem('runeRegistryComplete');
        
        this.updateStats();
        this.calculateTotalPoints();
        this.renderAdminPanel();
        this.renderPublicInventory();
        
        this.logActivity('error', 'TOUTES LES DONNÉES ONT ÉTÉ SUPPRIMÉES');
        alert('Toutes les données ont été supprimées !');
    }

    // === SYSTÈME DE MODAL ===
    showModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmationModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalConfirm = document.getElementById('modalConfirm');

        if (modal && modalTitle && modalMessage && modalConfirm) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modal.classList.remove('hidden');

            // Nettoyer les anciens événements
            modalConfirm.onclick = null;
            modalConfirm.onclick = (e) => {
                e.preventDefault();
                this.hideModal();
                if (onConfirm) onConfirm();
            };
        }
    }

    hideModal() {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

// Initialiser l'application et exposer globalement
let registry;

// S'assurer que le script s'exécute après le chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        registry = new RuneRegistry();
    });
} else {
    registry = new RuneRegistry();
}
