import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, BrainIcon, RefreshCwIcon, FullscreenIcon, DownloadIcon } from "lucide-react";
import Link from "next/link";
import { getTeamDatasetByIdQuery } from "@/server/actions/team-datasets/queries";
import { notFound } from "next/navigation";
import { GraphVisualization } from "./_components/graph-visualization";
import { GenerateGraphButton } from "./_components/generate-graph-button";

interface VisualizePageProps {
    params: {
        id: string;
    };
}

export const metadata = {
    title: "Visualisation graphique",
    description: "Analyse graphique des rôles et permissions d'équipe",
};

export default async function VisualizePage({ params }: VisualizePageProps) {
    try {
        const dataset = await getTeamDatasetByIdQuery(params.id);
        
        if (!dataset || !dataset.rawData) {
            return notFound();
        }

        const hasGraphData = dataset.graphData && typeof dataset.graphData === 'object';

        return (
            <AppPageShell
                title={`Visualisation - ${dataset.name}`}
                description="Analyse graphique des rôles et permissions générée par IA"
            >
                <div className="w-full space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href={`/teams/${dataset.id}`}>
                                <Button variant="outline" size="sm">
                                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                    Retour aux détails
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Visualisation graphique</h1>
                                <p className="text-muted-foreground">
                                    {dataset.name} • Analyse par IA "Den"
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                                <BrainIcon className="mr-1 h-3 w-3" />
                                Powered by Den
                            </Badge>
                            {hasGraphData && (
                                <Button variant="outline" size="sm">
                                    <DownloadIcon className="mr-2 h-4 w-4" />
                                    Exporter
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Status et actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Analyse des rôles et permissions</span>
                                <GenerateGraphButton datasetId={dataset.id} hasExistingGraph={Boolean(hasGraphData)} />
                            </CardTitle>
                            <CardDescription>
                                {hasGraphData 
                                    ? "Graphe généré par l'IA Den pour visualiser les relations entre utilisateurs, équipes, départements et droits d'accès."
                                    : "Générez une visualisation graphique intelligente de vos données d'équipe avec l'IA Den."
                                }
                            </CardDescription>
                        </CardHeader>
                        {!hasGraphData && (
                            <CardContent>
                                <div className="text-center py-8">
                                    <BrainIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Aucune visualisation générée</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Utilisez l'IA Den pour analyser vos données et créer une visualisation graphique interactive.
                                    </p>
                                    <GenerateGraphButton datasetId={dataset.id} hasExistingGraph={false} />
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Visualisation */}
                    {hasGraphData && (
                        <Card className="min-h-[600px]">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Graphe interactif</span>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm">
                                            <RefreshCwIcon className="mr-2 h-4 w-4" />
                                            Réorganiser
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <FullscreenIcon className="mr-2 h-4 w-4" />
                                            Plein écran
                                        </Button>
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    Explorez les relations entre les différents éléments de votre organisation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <GraphVisualization 
                                    data={dataset.graphData as any}
                                    datasetId={dataset.id}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Légende et informations */}
                    {hasGraphData && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Légende</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                            <span className="text-sm">Utilisateurs</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                            <span className="text-sm">Équipes</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                                            <span className="text-sm">Départements</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                            <span className="text-sm">Droits d'accès</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                                            <span className="text-sm">Applications</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Analyse Den</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm space-y-2">
                                        <p><strong>Insights détectés :</strong></p>
                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                            <li>Patterns de droits d'accès</li>
                                            <li>Utilisateurs avec privilèges élevés</li>
                                            <li>Applications les plus utilisées</li>
                                            <li>Redondances potentielles</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </AppPageShell>
        );
    } catch (error) {
        console.error("Erreur lors du chargement de la visualisation:", error);
        return notFound();
    }
}
