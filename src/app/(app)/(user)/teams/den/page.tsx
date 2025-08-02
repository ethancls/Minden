import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainIcon, NetworkIcon, BarChart3Icon, UsersIcon, GemIcon } from "lucide-react";

export const metadata = {
    title: "Den",
    description: "Intelligence artificielle pour l'analyse des rôles et permissions",
};

export default function DenPage() {
    return (
        <AppPageShell
            title="Den"
            description="Intelligence artificielle pour l'analyse des rôles et permissions"
        >
            <div className="w-full space-y-6">
                {/* Header */}
                <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                        <GemIcon className="h-16 w-16 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Den</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Votre assistant IA pour analyser les structures d'équipes, 
                        identifier les patterns de rôles et optimiser les permissions
                    </p>
                </div>

                {/* Features */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <NetworkIcon className="h-5 w-5 text-purple-600" />
                                <span>Visualisation graphique</span>
                            </CardTitle>
                            <CardDescription>
                                Représentation interactive des relations entre membres et rôles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Graphes interactifs avec zones de rôles, clustering automatique 
                                et détection d'anomalies dans les permissions.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3Icon className="h-5 w-5 text-purple-600" />
                                <span>Analyse des patterns</span>
                            </CardTitle>
                            <CardDescription>
                                Identification automatique des rôles similaires et redondances
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Algorithmes de machine learning pour détecter les groupes 
                                de permissions similaires et proposer des optimisations.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <UsersIcon className="h-5 w-5 text-purple-600" />
                                <span>Recommandations</span>
                            </CardTitle>
                            <CardDescription>
                                Suggestions intelligentes pour l'optimisation des rôles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Recommandations basées sur l'IA pour simplifier les structures 
                                de rôles et améliorer la sécurité.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status */}
                <Card className="border-dashed border-2 border-muted-foreground/25">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <BrainIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Den arrive bientôt</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Notre IA d'analyse des rôles est en cours de développement. 
                            Importez d'abord vos datasets d'équipes pour préparer l'analyse.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span>En développement</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppPageShell>
    );
}
