import { useEffect, useState, useRef } from 'react';
import { UserPosition } from '../types';

export const useGeolocation = () => {
    const [position, setPosition] = useState<UserPosition>({ lat: 0, lon: 0 });
    const watchIdRef = useRef<number | null>(null);

    const getPosition = ({ coords }: GeolocationPosition) => {
        setPosition({
            lat: coords.latitude,
            lon: coords.longitude
        });
    };

    const getErrorCoords = () => {
        setPosition({ lat: 0, lon: 0 });
        // Silently fail or notify user
    };

    useEffect(() => {
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                getPosition,
                getErrorCoords,
                { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
            );
        }

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    return position;
};
