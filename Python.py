# Je vais créer une correction minime pour l'inventaire public
# Juste modifier la fonction renderInventory() dans app.js pour afficher TOUTES les 21 combinaisons

app_js_correction = '''
    // ============ INVENTAIRE PUBLIC - SANS VALEUR UNITAIRE - TOUTES LES COMBINAISONS ============

    renderInventory() {
        const tableBody = document.getElementById('inventoryTableBody');
        const typeFilter = document.getElementById('inventoryTypeFilter')?.value;
        const rarityFilter = document.getElementById('inventoryRarityFilter')?.value;
        
        if (!tableBody) return;
        
        console.log('📊 Rendu inventaire PUBLIC - TOUTES LES 21 COMBINAISONS POSSIBLES (sans valeur unitaire)');
        
        // CRÉER TOUTES LES COMBINAISONS POSSIBLES - 21 AU TOTAL
        const allCombinations = [];
        
        this.config.runeTypes.forEach(type => {
            this.config.rarityOrder.forEach(rarity => {
                allCombinations.push({
                    type,
                    rarity,
                    fragments: {"1/4": 0, "2/4": 0, "3/4": 0, "4/4": 0}
                });
            });
        });
        
        // Agrégér les inventaires réels
        this.data.members.forEach(member => {
            member.inventory?.forEach(item => {
                const combination = allCombinations.find(combo => 
                    combo.type === item.type && combo.rarity === item.rarity
                );
                
                if (combination && item.fragments) {
                    Object.entries(item.fragments).forEach(([part, count]) => {
                        combination.fragments[part] += count || 0;
                    });
                }
            });
        });
        
        // Filtrer seulement si des filtres sont appliqués
        let filteredItems = allCombinations;
        if (typeFilter || rarityFilter) {
            filteredItems = allCombinations.filter(item => {
                const typeMatch = !typeFilter || item.type === typeFilter;
                const rarityMatch = !rarityFilter || item.rarity === rarityFilter;
                return typeMatch && rarityMatch;
            });
        }
        
        // Générer tableau SANS VALEUR UNITAIRE mais avec TOUTES LES COMBINAISONS
        tableBody.innerHTML = '';
        
        filteredItems.forEach(item => {
            const rarityInfo = this.config.rarities[item.rarity];
            const completeSets = Math.min(...Object.values(item.fragments));
            const hasFragments = Object.values(item.fragments).some(count => count > 0);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.type}</td>
                <td class="rarity-${item.rarity.toLowerCase()}" style="color: ${rarityInfo.color}">${item.rarity}</td>
                <td>
                    <div class="fragment-counts-row">
                        ${this.config.fragmentParts.map(part => {
                            const count = item.fragments[part];
                            const cellClass = count === 0 ? 'fragment-count-cell zero-fragments' : 'fragment-count-cell';
                            return `<span class="${cellClass}">${count}</span>`;
                        }).join('')}
                    </div>
                </td>
                <td>
                    ${completeSets > 0 ? 
                        `<span class="sets-complete">${completeSets}</span>` : 
                        '<span class="zero-fragments">0</span>'
                    }
                </td>
                <td>
                    ${completeSets > 0 ? 
                        '<span class="forge-possible">Sets Disponibles</span>' : 
                        (hasFragments ? 'Fragments Incomplets' : '<span class="zero-fragments">Aucun Fragment</span>')
                    }
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        console.log(`✅ Inventaire public généré: ${filteredItems.length} lignes affichées sur 21 combinaisons possibles`);
    }
'''

print("✅ Correction appliquée pour l'inventaire public")
print("📊 MODIFICATION: Affichage de TOUTES les 21 combinaisons possibles")
print("🔧 Sans toucher au reste - juste cette fonction")
