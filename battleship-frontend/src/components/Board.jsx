import { useState, useEffect } from 'react';
import '../styles/components/boardStyle.css';

export default function Board({ selectedShip, setSelectedShip, orientation, placedShips = [], setPlacedShips }) {
    const [gridSize, setGridSize] = useState(() => {
    });
    const [hoveredCells, setHoveredCells] = useState([]);

    useEffect(() => {
    }, []);


    return (
        <section className="board-screen">
            
        </section>
    );
}