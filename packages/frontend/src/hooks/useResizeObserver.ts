import { ResizeObserver } from '@juggle/resize-observer';
import { useState, useEffect, MutableRefObject } from 'react';

export const useResizeObserver = (ref: MutableRefObject<any>) => {
    const [dimensions, setDimensions] = useState<DOMRectReadOnly | null>(null);
    useEffect(() => {
        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                setDimensions(entry.contentRect);
            });
        });
        resizeObserver.observe(observeTarget);
        return () => {
            resizeObserver.unobserve(observeTarget);
        };
    }, [ref]);
    return dimensions;
};

export default useResizeObserver;
