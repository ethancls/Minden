"use server";

import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "@/server/actions/organization/queries";
import { env } from "@/env.js";

/**
 * Génère des données de graphe mockées en cas d'indisponibilité de l'API OpenAI
 */
function generateMockGraphData(rawData: any[]) {
    const nodes: any[] = [];
    const edges: any[] = [];
    
    // Extraire les données uniques
    const teams = new Set(rawData.map(user => user.team));
    const departments = new Set(rawData.map(user => user.department));
    const allRights = rawData.flatMap(user => user.rights || []);
    const uniqueRights = new Map();
    const applications = new Set();
    
    // Collecter les droits uniques et applications
    allRights.forEach(right => {
        uniqueRights.set(right.rightId, right);
        applications.add(right.application);
    });
    
    // Créer les nœuds utilisateurs
    rawData.forEach(user => {
        nodes.push({
            id: `user_${user.userId}`,
            type: "user",
            label: user.userName,
            data: {
                position: user.position,
                hireDate: user.hireDate,
                rightsCount: user.rights?.length || 0
            },
            style: { color: "#3b82f6", size: 8 }
        });
    });
    
    // Créer les nœuds équipes
    teams.forEach(team => {
        nodes.push({
            id: `team_${team}`,
            type: "team",
            label: team,
            data: { 
                memberCount: rawData.filter(user => user.team === team).length 
            },
            style: { color: "#10b981", size: 12 }
        });
    });
    
    // Créer les nœuds départements
    departments.forEach(dept => {
        nodes.push({
            id: `dept_${dept}`,
            type: "department",
            label: dept,
            data: { 
                memberCount: rawData.filter(user => user.department === dept).length 
            },
            style: { color: "#f59e0b", size: 10 }
        });
    });
    
    // Créer les nœuds droits
    Array.from(uniqueRights.values()).forEach(right => {
        nodes.push({
            id: `right_${right.rightId}`,
            type: "right",
            label: right.rightName,
            data: {
                description: right.description,
                usersCount: rawData.filter(user => 
                    user.rights?.some((r: any) => r.rightId === right.rightId)
                ).length
            },
            style: { color: "#ef4444", size: 6 }
        });
    });
    
    // Créer les nœuds applications
    applications.forEach(app => {
        nodes.push({
            id: `app_${app}`,
            type: "application",
            label: app,
            data: {
                rightsCount: Array.from(uniqueRights.values()).filter(
                    right => right.application === app
                ).length
            },
            style: { color: "#8b5cf6", size: 10 }
        });
    });
    
    // Créer les liens
    let edgeCounter = 0;
    
    // Liens utilisateur -> équipe
    rawData.forEach(user => {
        edges.push({
            id: `edge_${edgeCounter++}`,
            source: `user_${user.userId}`,
            target: `team_${user.team}`,
            type: "member_of",
            style: { color: "#e5e7eb", width: 1 }
        });
    });
    
    // Liens utilisateur -> département
    rawData.forEach(user => {
        edges.push({
            id: `edge_${edgeCounter++}`,
            source: `user_${user.userId}`,
            target: `dept_${user.department}`,
            type: "belongs_to",
            style: { color: "#e5e7eb", width: 1 }
        });
    });
    
    // Liens utilisateur -> droits
    rawData.forEach(user => {
        user.rights?.forEach((right: any) => {
            edges.push({
                id: `edge_${edgeCounter++}`,
                source: `user_${user.userId}`,
                target: `right_${right.rightId}`,
                type: "has_right",
                style: { color: "#fca5a5", width: 1 }
            });
        });
    });
    
    // Liens droits -> applications
    Array.from(uniqueRights.values()).forEach(right => {
        edges.push({
            id: `edge_${edgeCounter++}`,
            source: `right_${right.rightId}`,
            target: `app_${right.application}`,
            type: "uses_app",
            style: { color: "#c4b5fd", width: 1 }
        });
    });
    
    return {
        nodes,
        edges,
        layout: {
            type: "force",
            settings: {
                attraction: 0.1,
                repulsion: 100,
                iterations: 50
            }
        }
    };
}

/**
 * Appelle l'API OpenAI pour générer un graphe de visualisation
 */
export async function generateGraphDataAction(rawData: any[]) {
    try {
        const { user } = await protectedProcedure();
        const { currentOrg } = await getOrganizations();

        // Vérifier si l'API OpenAI est configurée
        if (!env.OPENAI_API_KEY) {
            console.warn("Clé API OpenAI non configurée, utilisation du fallback");
            return {
                success: true,
                data: generateMockGraphData(rawData),
                message: 'Graphe généré avec les données locales (API OpenAI non configurée)'
            };
        }

        // Préparation du prompt pour ChatGPT
        const prompt = `
Tu es un expert en analyse organisationnelle et en role mining. 

Voici des données JSON d'une équipe avec les utilisateurs, leurs équipes, départements et droits d'accès :

${JSON.stringify(rawData, null, 2)}

Génère un objet JSON pour créer une visualisation en graphe de ces données avec les spécifications suivantes :

1. **Nodes** : Crée différents types de nœuds :
   - Type "user" pour chaque utilisateur
   - Type "team" pour chaque équipe
   - Type "department" pour chaque département  
   - Type "right" pour chaque droit d'accès unique
   - Type "application" pour chaque application

2. **Edges** : Crée des liens entre :
   - Utilisateurs et leurs équipes
   - Utilisateurs et leurs départements
   - Utilisateurs et leurs droits d'accès
   - Droits d'accès et leurs applications

3. **Format de sortie** : Un objet JSON avec cette structure :
\`\`\`json
{
  "nodes": [
    {
      "id": "unique_id",
      "type": "user|team|department|right|application",
      "label": "Nom affiché",
      "data": { ...données_additionnelles },
      "style": { "color": "#couleur", "size": taille }
    }
  ],
  "edges": [
    {
      "id": "unique_edge_id", 
      "source": "node_id_source",
      "target": "node_id_target",
      "type": "relation_type",
      "style": { "color": "#couleur", "width": épaisseur }
    }
  ],
  "layout": {
    "type": "force",
    "settings": { ...paramètres_layout }
  }
}
\`\`\`

4. **Couleurs suggérées** :
   - Utilisateurs: #3b82f6 (bleu)
   - Équipes: #10b981 (vert)
   - Départements: #f59e0b (orange)
   - Droits: #ef4444 (rouge)
   - Applications: #8b5cf6 (violet)

5. **Analyse** : Identifie les patterns intéressants (utilisateurs avec beaucoup de droits, droits partagés, etc.)

Réponds UNIQUEMENT avec le JSON valide, sans texte d'introduction ou d'explication.
`;

        // Appel à l'API OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un expert en analyse de données organisationnelles et en visualisation de graphes. Tu génères toujours du JSON valide.'
                    },
                    {
                        role: 'user', 
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 4000,
            }),
        });

        if (!response.ok) {
            console.warn(`Erreur API OpenAI: ${response.status}, utilisation du fallback`);
            return {
                success: true,
                data: generateMockGraphData(rawData),
                message: `Graphe généré avec les données locales (API OpenAI indisponible: ${response.status})`
            };
        }

        const result = await response.json();
        const graphDataText = result.choices[0]?.message?.content;

        if (!graphDataText) {
            console.warn('Aucune réponse de ChatGPT, utilisation du fallback');
            return {
                success: true,
                data: generateMockGraphData(rawData),
                message: 'Graphe généré avec les données locales (aucune réponse de ChatGPT)'
            };
        }

        // Parse le JSON retourné par ChatGPT
        let graphData;
        try {
            // Nettoie la réponse au cas où il y aurait du texte en plus
            const jsonMatch = graphDataText.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : graphDataText;
            graphData = JSON.parse(cleanJson);
            
            return {
                success: true,
                data: graphData,
                message: 'Graphe généré avec succès par l\'IA Den'
            };
        } catch (parseError) {
            console.warn('Erreur de parsing JSON de ChatGPT, utilisation du fallback:', parseError);
            return {
                success: true,
                data: generateMockGraphData(rawData),
                message: 'Graphe généré avec les données locales (erreur de parsing ChatGPT)'
            };
        }

    } catch (error) {
        console.warn('Erreur lors de l\'appel à l\'API OpenAI, utilisation du fallback:', error);
        
        // En cas d'erreur complète, utiliser le fallback
        try {
            return {
                success: true,
                data: generateMockGraphData(rawData),
                message: 'Graphe généré avec les données locales (API OpenAI indisponible)'
            };
        } catch (fallbackError) {
            console.error('Erreur même avec le fallback:', fallbackError);
            return {
                success: false,
                data: null,
                message: 'Impossible de générer le graphe'
            };
        }
    }
}
