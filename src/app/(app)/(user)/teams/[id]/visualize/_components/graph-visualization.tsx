"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ZoomInIcon, ZoomOutIcon, MoveIcon } from "lucide-react";

interface GraphVisualizationProps {
    data: {
        nodes: Array<{
            id: string;
            type: string;
            label: string;
            data?: any;
            style?: { color?: string; size?: number };
        }>;
        edges: Array<{
            id: string;
            source: string;
            target: string;
            type?: string;
            style?: { color?: string; width?: number };
        }>;
        layout?: {
            type: string;
            settings?: any;
        };
    };
    datasetId: string;
}

export function GraphVisualization({ data, datasetId }: GraphVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // Dimensions du conteneur
    const width = 800;
    const height = 600;

    useEffect(() => {
        if (!svgRef.current || !data) return;

        // Simulation d'un layout force-directed simple
        const nodes = data.nodes.map((node, index) => ({
            ...node,
            x: Math.random() * (width - 100) + 50,
            y: Math.random() * (height - 100) + 50,
            vx: 0,
            vy: 0
        }));



        // Animation simple de layout
        const simulation = () => {
            for (let i = 0; i < 50; i++) {
                // Force de répulsion entre nœuds
                for (let j = 0; j < nodes.length; j++) {
                    for (let k = j + 1; k < nodes.length; k++) {
                        const nodeA = nodes[j];
                        const nodeB = nodes[k];
                        const dx = nodeB.x - nodeA.x;
                        const dy = nodeB.y - nodeA.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) {
                            const force = (100 - distance) / distance * 0.1;
                            nodeA.vx -= dx * force;
                            nodeA.vy -= dy * force;
                            nodeB.vx += dx * force;
                            nodeB.vy += dy * force;
                        }
                    }
                }

                // Force d'attraction pour les edges
                data.edges.forEach(edge => {
                    const source = nodes.find(n => n.id === edge.source);
                    const target = nodes.find(n => n.id === edge.target);
                    if (source && target) {
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const force = (distance - 80) * 0.01;
                        
                        source.vx += dx * force;
                        source.vy += dy * force;
                        target.vx -= dx * force;
                        target.vy -= dy * force;
                    }
                });

                // Appliquer les vitesses
                nodes.forEach(node => {
                    node.x += node.vx;
                    node.y += node.vy;
                    node.vx *= 0.9; // Friction
                    node.vy *= 0.9;
                    
                    // Garder dans les limites
                    node.x = Math.max(20, Math.min(width - 20, node.x));
                    node.y = Math.max(20, Math.min(height - 20, node.y));
                });
            }
        };

        simulation();
    }, [data, width, height]);

    const getNodeColor = (type: string) => {
        switch (type) {
            case 'user': return '#3b82f6';
            case 'team': return '#10b981';
            case 'department': return '#f59e0b';
            case 'right': return '#ef4444';
            case 'application': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getNodeSize = (type: string) => {
        switch (type) {
            case 'user': return 8;
            case 'team': return 12;
            case 'department': return 10;
            case 'right': return 6;
            case 'application': return 10;
            default: return 8;
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
    const handleReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    if (!data || !data.nodes || !data.edges) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Aucune donnée de graphe disponible</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[600px]">
            {/* Contrôles */}
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomInIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOutIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <MoveIcon className="h-4 w-4" />
                </Button>
            </div>

            {/* SVG Graph */}
            <svg
                ref={svgRef}
                width="100%"
                height="600"
                viewBox={`${-pan.x} ${-pan.y} ${width / zoom} ${height / zoom}`}
                className="border rounded-lg bg-background"
            >
                {/* Liens */}
                <g>
                    {data.edges.map((edge, index) => {
                        const sourceNode = data.nodes.find(n => n.id === edge.source);
                        const targetNode = data.nodes.find(n => n.id === edge.target);
                        
                        if (!sourceNode || !targetNode) return null;

                        // Positions simulées pour la démo
                        const sourceX = (index % 10) * 80 + 100;
                        const sourceY = Math.floor(index / 10) * 80 + 100;
                        const targetX = ((index + 1) % 10) * 80 + 100;
                        const targetY = Math.floor((index + 1) / 10) * 80 + 100;

                        return (
                            <line
                                key={edge.id}
                                x1={sourceX}
                                y1={sourceY}
                                x2={targetX}
                                y2={targetY}
                                stroke={edge.style?.color || "#e5e7eb"}
                                strokeWidth={edge.style?.width || 1}
                                opacity={0.6}
                            />
                        );
                    })}
                </g>

                {/* Nœuds */}
                <g>
                    {data.nodes.map((node, index) => {
                        // Position simulée pour la démo
                        const x = (index % 10) * 80 + 100;
                        const y = Math.floor(index / 10) * 80 + 100;
                        const color = node.style?.color || getNodeColor(node.type);
                        const size = node.style?.size || getNodeSize(node.type);

                        return (
                            <g key={node.id}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={size}
                                    fill={color}
                                    stroke={selectedNode === node.id ? "#000" : color}
                                    strokeWidth={selectedNode === node.id ? 2 : 1}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                                />
                                <text
                                    x={x}
                                    y={y + size + 12}
                                    textAnchor="middle"
                                    className="text-xs fill-current"
                                    style={{ fontSize: '10px' }}
                                >
                                    {node.label.length > 12 ? node.label.substring(0, 12) + '...' : node.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* Panneau d'informations sur le nœud sélectionné */}
            {selectedNode && (
                <Card className="absolute bottom-4 left-4 w-80 z-10">
                    <CardContent className="p-4">
                        {(() => {
                            const node = data.nodes.find(n => n.id === selectedNode);
                            if (!node) return null;
                            
                            return (
                                <div>
                                    <h4 className="font-semibold">{node.label}</h4>
                                    <p className="text-sm text-muted-foreground capitalize mb-2">
                                        Type: {node.type}
                                    </p>
                                    {node.data && (
                                        <div className="text-xs space-y-1">
                                            {Object.entries(node.data).map(([key, value]) => (
                                                <div key={key}>
                                                    <strong>{key}:</strong> {String(value)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
