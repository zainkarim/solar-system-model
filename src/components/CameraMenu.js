import React from 'react';

const CameraMenu = ({ celestialBodies, onBodySelect }) => {
    console.log(celestialBodies); // Check the data received
    
    return (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 100 }}>
            {celestialBodies.map((body, index) => (
                <button key={index} onClick={() => onBodySelect(body.position)}>
                    Jump to {body.name}
                </button>
            ))}
        </div>
    );
};

export default CameraMenu;
