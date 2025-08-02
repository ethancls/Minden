"use server";

import { db } from "@/server/db";
import { teamDatasets, teamDatasetInsertSchema } from "@/server/db/schema";
import { protectedProcedure } from "@/server/procedures";
import { getOrganizations } from "@/server/actions/organization/queries";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const importTeamDatasetSchema = z.object({
    name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
    description: z.string().optional(),
    fileName: z.string().min(1, "Le nom du fichier est requis"),
    rawData: z.any(), // JSON data
});

export async function importTeamDatasetAction(input: z.infer<typeof importTeamDatasetSchema>) {
    try {
        const { user } = await protectedProcedure();
        const { currentOrg } = await getOrganizations();
        
        // Valider les données d'entrée
        const validatedData = importTeamDatasetSchema.parse(input);

        const newDataset = await db.insert(teamDatasets).values({
            name: validatedData.name,
            description: validatedData.description,
            fileName: validatedData.fileName,
            orgId: currentOrg.id,
            importedBy: user.id,
            rawData: validatedData.rawData,
            status: "pending",
        }).returning();

        // TODO: Déclencher le traitement en arrière-plan
        // Pour l'instant, on marque comme completed
        await db.update(teamDatasets)
            .set({ 
                status: "completed",
                processedData: validatedData.rawData, // Simple copie pour l'instant
                lastAnalyzedAt: new Date(),
            })
            .where(eq(teamDatasets.id, newDataset[0]!.id));

        revalidatePath("/teams");

        return {
            success: true,
            data: newDataset[0],
            message: "Dataset importé avec succès",
        };
    }
    catch (error) {
        console.error("Erreur lors de l'importation du dataset:", error);
        
        return {
            success: false,
            data: null,
            message: error instanceof z.ZodError ? error.errors : "Erreur lors de l'importation du dataset",
        };
    }
}

/**
 * Génère et sauvegarde les données de graphe pour un dataset
 */
export async function generateDatasetGraphAction(datasetId: string) {
    try {
        const { user } = await protectedProcedure();
        const { currentOrg } = await getOrganizations();

        // Récupérer le dataset
        const dataset = await db.query.teamDatasets.findFirst({
            where: and(
                eq(teamDatasets.id, datasetId),
                eq(teamDatasets.orgId, currentOrg.id)
            ),
        });

        if (!dataset) {
            throw new Error("Dataset non trouvé");
        }

        if (!dataset.rawData || !Array.isArray(dataset.rawData)) {
            throw new Error("Données du dataset invalides");
        }

        // Importer et utiliser la fonction de génération de graphe
        const { generateGraphDataAction } = await import("@/server/actions/ai/graph-generation");
        const graphResult = await generateGraphDataAction(dataset.rawData as any[]);

        if (!graphResult.success) {
            throw new Error(graphResult.message);
        }

        // Sauvegarder les données de graphe
        await db.update(teamDatasets)
            .set({
                graphData: graphResult.data,
                lastAnalyzedAt: new Date(),
            })
            .where(eq(teamDatasets.id, datasetId));

        revalidatePath(`/teams/${datasetId}`);
        revalidatePath(`/teams/${datasetId}/visualize`);

        return {
            success: true,
            data: graphResult.data,
            message: "Graphe généré et sauvegardé avec succès",
        };

    } catch (error) {
        console.error("Erreur lors de la génération du graphe:", error);
        
        return {
            success: false,
            data: null,
            message: error instanceof Error ? error.message : "Erreur lors de la génération du graphe",
        };
    }
}
