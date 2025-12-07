import { useEffect, useRef } from "react";
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { UserPosition } from "../types";
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Feature, View } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

export const useUserMarker = (map: any, position: UserPosition, view: View) => {
    const markerLayerRef = useRef<any>(null);

    useEffect(() => {
        if (map && !markerLayerRef.current) {
            const vectorSource = new VectorSource();
            const vectorLayer = new VectorLayer({ source: vectorSource });
            markerLayerRef.current = { layer: vectorLayer, source: vectorSource };
            map.addLayer(vectorLayer);
        }
    }, [map]);

    useEffect(() => {
        if (!markerLayerRef.current) return;
        if (!position || !position.lat || !position.lon) return;

        const coords = fromLonLat([position.lon!, position.lat!]);
        view.setCenter(coords);
        view.setZoom(15);

        const marker = new Feature({ geometry: new Point(coords) });
        marker.setStyle(new Style({
            image: new Circle({ radius: 8, fill: new Fill({ color: 'purple' }), stroke: new Stroke({ color: 'white', width: 2 }) })
        }));

        markerLayerRef.current.source.clear();
        markerLayerRef.current.source.addFeature(marker);
    }, [position, view]);

};