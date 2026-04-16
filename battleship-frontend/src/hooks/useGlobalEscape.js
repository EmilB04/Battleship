import { useEffect, useRef } from 'react';

export default function useGlobalEscape(onEscape, enabled = true) {
    const onEscapeRef = useRef(onEscape);

    useEffect(() => {
        onEscapeRef.current = onEscape;
    }, [onEscape]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') {
                return;
            }

            onEscapeRef.current?.(event);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled]);
}