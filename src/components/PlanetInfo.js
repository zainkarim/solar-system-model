import React, { useState, useEffect } from 'react';

function PlanetInfo({ planetName }) {
    const [planetData, setPlanetData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlanetData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://127.0.0.1:5001/planets/${planetName}`);
                const data = await response.json();
                setPlanetData(data[0]); // Assuming the API returns an array
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPlanetData();
    }, [planetName]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!planetData) return <p>No data available</p>;

    return (
        <div>
            <h1>{planetData.name}</h1>
            <p>Radius: {planetData.radius}</p>
            <p>Distance from Sun: {planetData.distance_from_sun}</p>
            <p>Length of Day: {planetData.length_of_day}</p>
            <p>Length of Year: {planetData.length_of_year}</p>
            <p>Fun Facts: {planetData.fun_facts}</p>
        </div>
    );
}

export default PlanetInfo;