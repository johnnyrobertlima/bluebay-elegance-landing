import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CitySalesChart } from './CitySalesChart'; // Keep reference if needed, but not used here
import { CitySalesStat } from '@/service/bluebay/dashboardComercialTypes';
import { brazilCitiesCoordinates, normalizeCityKey } from '@/data/brazil_cities_coords';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesHeatmapProps {
    data: CitySalesStat[];
    onCityClick?: (city: { city: string; uf: string } | null) => void;
    selectedCity?: { city: string; uf: string } | null;
}

export function SalesHeatmap({ data, onCityClick, selectedCity }: SalesHeatmapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    const processedData = useMemo(() => {
        if (!data) return [];

        const mapped = data.map(item => {
            const key = normalizeCityKey(item.city, item.uf);
            const coords = brazilCitiesCoordinates[key];
            if (!coords) {
                // console.log(`[MAP_DEBUG] Missing: ${key}`);
            }
            return { ...item, coords };
        }).filter(item => item.coords);

        console.log(`[MAP_DEBUG] Map Coverage: ${mapped.length} / ${data.length} cities mapped.`);

        return mapped;
    }, [data]);

    const maxValue = useMemo(() => {
        if (processedData.length === 0) return 0;
        return Math.max(...processedData.map(d => d.totalFaturado), 0);
    }, [processedData]);

    const maxOrders = useMemo(() => {
        if (processedData.length === 0) return 0;
        return Math.max(...processedData.map(d => d.totalPedidos), 0);
    }, [processedData]);

    const getColor = (value: number) => {
        if (value === 0) return '#00ff00';
        const ratio = value / (maxValue || 1);

        if (ratio < 0.5) {
            const r = Math.floor(255 * (ratio * 2));
            return `rgb(${r}, 255, 0)`;
        } else {
            const g = Math.floor(255 * (2 - ratio * 2));
            return `rgb(255, ${g}, 0)`;
        }
    };

    const getRadius = (value: number) => {
        const ratio = value / (maxOrders || 1);
        return 5 + (ratio * 15); // Adjust radius scale
    };

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map only once
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView([-15.7975, -47.8919], 4);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(mapInstance.current);
        }

        const map = mapInstance.current;

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        // Add new markers
        processedData.forEach(city => {
            const marker = L.circleMarker([city.coords.lat, city.coords.lng], {
                radius: getRadius(city.totalPedidos), // Size based on Orders
                fillColor: getColor(city.totalFaturado), // Color based on Revenue
                color: getColor(city.totalFaturado),
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.6,
                className: 'cursor-pointer hover:opacity-100 transition-opacity'
            }).addTo(map);

            // Removed Click Event for Filtering

            marker.on('mouseover', function (e) {
                this.setStyle({ weight: 3, fillOpacity: 0.9 });
            });
            marker.on('mouseout', function (e) {
                this.setStyle({ weight: 1, fillOpacity: 0.6 });
            });

            const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(city.totalFaturado);
            marker.bindTooltip(`
                <div style="text-align: center; font-family: sans-serif;">
                    <div style="font-weight: bold;">${city.city} - ${city.uf}</div>
                    <div>${formattedTotal}</div>
                    <div style="font-size: 0.8em; color: gray;">${city.totalPedidos} pedidos</div>
                </div>
            `, { direction: 'top', offset: [0, -5] });
        });

        // Fix for map not sizing correctly if hidden initially
        setTimeout(() => { map.invalidateSize(); }, 200);

    }, [processedData]); // Removed selectedCity dependency

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <Card className="col-span-1 shadow-sm h-[400px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Distribuição Geográfica de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="h-[340px] p-0 relative rounded-md overflow-hidden">
                <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

                {/* Legend Overlay */}
                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded shadow text-xs z-[1000]">
                    <div className="font-bold mb-1">Legenda (Cor: Faturamento)</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[rgb(255,0,0)] rounded-full"></div> Alto</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[rgb(255,255,0)] rounded-full"></div> Médio</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[rgb(0,255,0)] rounded-full"></div> Baixo</div>
                    <div className="mt-2 font-bold mb-1">Tamanho: Nº Pedidos</div>
                </div>
            </CardContent>
        </Card>
    );
}
