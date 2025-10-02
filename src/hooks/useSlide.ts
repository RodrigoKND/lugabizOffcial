import { useRef, useState } from "react";

export function useSlide(){
    const sliderRef = useRef<HTMLDivElement>(null);
    const [startX, setStartX] = useState<number>(0);
    const [scrollLeft, setScrollLeft] = useState<number>(0);

    const slide=(direction: "left" | "right")=>{
        if(!sliderRef.current) return;

        const width = sliderRef.current.offsetWidth;
        const scroll = sliderRef.current.scrollLeft;
        const newScroll = direction === "left" ? ((width - scroll)-width): width + scroll;
        sliderRef.current.scrollTo({
            left: newScroll,
            behavior: "smooth"
        });
    }

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!sliderRef.current) return;
        setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!sliderRef.current || startX === null) return;
        const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // factor para suavizar
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };
    
    return {
        sliderRef,
        slide,
        handleTouchStart,
        handleTouchMove
    }
}