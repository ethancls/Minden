"use client";

import { Button } from "@/components/ui/button";
import { BrainIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { generateDatasetGraphAction } from "@/server/actions/team-datasets/mutations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GenerateGraphButtonProps {
    datasetId: string;
    hasExistingGraph: boolean;
}

export function GenerateGraphButton({ datasetId, hasExistingGraph }: GenerateGraphButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setIsGenerating(true);
        
        try {
            const result = await generateDatasetGraphAction(datasetId);
            
            if (result.success) {
                toast.success(result.message);
                router.refresh(); // Recharger la page pour afficher le nouveau graphe
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la génération:", error);
            toast.error("Erreur lors de la génération du graphe");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            variant={hasExistingGraph ? "outline" : "default"}
        >
            {isGenerating ? (
                <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <BrainIcon className="mr-2 h-4 w-4" />
            )}
            {isGenerating 
                ? "Génération en cours..." 
                : hasExistingGraph 
                    ? "Régénérer avec Den"
                    : "Générer avec Den"
            }
        </Button>
    );
}
