import React, { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CitySalesStat } from '@/service/bluebay/dashboardComercialTypes';
import { brazilCitiesCoordinates, normalizeCityKey } from '@/data/brazil_cities_coords';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface SalesHeatmapProps {
    data: CitySalesStat[];
    onCityClick?: (city: { city: string; uf: string } | null) => void;
    selectedCity?: { city: string; uf: string } | null;
}

export function SalesHeatmap({ data, onCityClick, selectedCity }: SalesHeatmapProps) {
    const [viewMode, setViewMode] = useState<'faturado' | 'pedidos'>('faturado');
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    const processedData = useMemo(() => {
        if (!data) return [];

        let missing = 0;
        const mapped = data.map(item => {
            const key = normalizeCityKey(item.city, item.uf);
            let coords = brazilCitiesCoordinates[key];

            if (!coords && item.uf) {
                coords = brazilCitiesCoordinates[`STATE-${item.uf.toUpperCase()}`];
            }

            if (!coords) missing++;
            return { ...item, coords };
        }).filter(item => item.coords);

        console.log(`[MAP_DEBUG] Coverage: ${mapped.length} / ${data.length} cities. Missing coords: ${missing}`);

        return mapped;
    }, [data]);

    const maxVal = useMemo(() => {
        if (processedData.length === 0) return 1;
        return Math.max(...processedData.map(d =>
            viewMode === 'faturado' ? d.totalFaturado : d.totalPedidosValue
        ), 1);
    }, [processedData, viewMode]);

    const getColor = (value: number) => {
        const ratio = value / (maxVal || 1);

        // Red (0) -> Yellow (0.5) -> Green (1)
        if (ratio < 0.5) {
            // Red (255,0,0) to Yellow (255,255,0)
            const g = Math.floor(255 * (ratio * 2));
            return `rgb(255, ${g}, 0)`;
        } else {
            // Yellow (255,255,0) to Green (0,255,0)
            const r = Math.floor(255 * (2 - ratio * 2));
            return `rgb(${r}, 255, 0)`;
        }
    };

    const getRadius = (value: number) => {
        const ratio = value / (maxVal || 1);
        return 5 + (ratio * 20); // Scale from 5 to 25
    };

    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([-15.7975, -47.8919], 4);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO'
            }).addTo(mapInstance.current);
        }

        const map = mapInstance.current;

        map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        processedData.forEach(city => {
            const currentVal = viewMode === 'faturado' ? city.totalFaturado : city.totalPedidosValue;
            if (currentVal <= 0) return;

            const marker = L.circleMarker([city.coords.lat, city.coords.lng], {
                radius: getRadius(currentVal),
                fillColor: getColor(currentVal),
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7,
                className: 'cursor-pointer hover:scale-110 transition-transform'
            }).addTo(map);

            marker.on('mouseover', function (e) {
                this.setStyle({ weight: 2, fillOpacity: 0.9 });
            });
            marker.on('mouseout', function (e) {
                this.setStyle({ weight: 1, fillOpacity: 0.7 });
            });

            const formattedVal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentVal);
            const secondVal = viewMode === 'faturado'
                ? `${city.totalFaturadoCount} notas`
                : `${city.totalPedidosCount} pedidos`;

            marker.bindTooltip(`
                <div style="text-align: center; font-family: sans-serif; padding: 4px; pointer-events: none;">
                    <div style="font-weight: bold; border-bottom: 1px solid #eee; margin-bottom: 4px; padding-bottom: 2px;">
                        ${city.city} - ${city.uf}
                    </div>
                    <div style="font-size: 1.1em; font-weight: bold; color: #2563eb;">${formattedVal}</div>
                    <div style="font-size: 0.85em; color: #666;">${secondVal}</div>
                </div>
            `, { direction: 'top', offset: [0, -20], opacity: 0.95, interactive: false, className: 'non-interactive-tooltip' });
        });

        setTimeout(() => { map.invalidateSize(); }, 200);

    }, [processedData, viewMode]);

    useEffect(() => {
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <Card className="col-span-1 shadow-sm h-[400px] border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Distribuição Geográfica
                </CardTitle>
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                    <Button
                        variant={viewMode === 'faturado' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('faturado')}
                        className={`h-7 px-2 text-[10px] uppercase tracking-tighter transition-all ${viewMode === 'faturado' ? 'bg-white text-blue-600 shadow-sm hover:bg-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        Faturamento
                    </Button>
                    <Button
                        variant={viewMode === 'pedidos' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('pedidos')}
                        className={`h-7 px-2 text-[10px] uppercase tracking-tighter transition-all ${viewMode === 'pedidos' ? 'bg-white text-blue-600 shadow-sm hover:bg-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        Total Pedidos R$
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="h-[340px] p-0 relative rounded-b-xl overflow-hidden">
                <div ref={mapRef} style={{ height: '100%', width: '100%', outline: 'none' }} />

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg text-[10px] z-[1000] border border-gray-100">
                    <div className="font-bold mb-2 text-gray-700 uppercase tracking-wider">Legenda</div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 w-24 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"></div>
                        </div>
                        <div className="flex justify-between text-gray-500 font-medium">
                            <span>Baixo</span>
                            <span>Médio</span>
                            <span>Alto</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 text-gray-400 font-medium text-center">
                        {(() => {
                            const totalValue = processedData.reduce((acc, curr) =>
                                acc + (viewMode === 'faturado' ? curr.totalFaturado : curr.totalPedidosValue),
                                0);
                            const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue);
                            return `${viewMode === 'faturado' ? 'Total Faturado' : 'Total Pedidos'}: ${formattedTotal}`;
                        })()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
