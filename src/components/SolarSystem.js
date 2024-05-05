import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import CameraMenu from './CameraMenu';


function SolarSystem() {
    const mountRef = useRef(null);
    const [camera, setCamera] = useState();
    const celestialBodies = useRef([]);
    const textureLoader = new THREE.TextureLoader();  // Create a texture loader

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;  // Adjust for best viewpoint

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);
        
        // Define rotation periods relative to Earth's day (in Earth days)
        const rotationSpeeds = {
            Mercury: 58.6,
            Venus: 243,
            Earth: 1,
            Mars: 1.026,
            Jupiter: 0.413,
            Saturn: 0.444,
            Uranus: 0.718,
            Neptune: 0.671,
            Pluto: 6.39
        };

        // Time scale factor (1 second of real time represents this many Earth days)
        const timeScale = 0.0005; // Slow down the rotation by a factor of 10      

        // Convert rotation periods to radians per second
        const rotationRadians = {};
        Object.keys(rotationSpeeds).forEach(planet => {
            rotationRadians[planet] = 2 * Math.PI / (rotationSpeeds[planet]) * timeScale;
        });


        // Lighting
        const sunLight = new THREE.PointLight(0xffffff, 11000, 50000);
        //sunLight.target.position.set(0, 0, 0);  // Pointing outward from the Sun
        sunLight.position.set(0, 0, 0); // Position at the Sun
        scene.add(sunLight);
        //scene.add(sunLight.target);  // Make sure to add the target to the scene

        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
        scene.add(ambientLight);

        // Controls for easy navigation
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();

        // Define textures for each planet
        const textures = {
            Mercury: textureLoader.load('textures/mercury.jpeg'),
            Venus: textureLoader.load('textures/venus.jpeg'),
            Earth: textureLoader.load('textures/earth_day.jpeg'),
            Mars: textureLoader.load('textures/mars.jpeg'),
            Jupiter: textureLoader.load('textures/jupiter.jpeg'),
            Saturn: textureLoader.load('textures/saturn.jpeg'),
            Uranus: textureLoader.load('textures/uranus.jpeg'),
            Neptune: textureLoader.load('textures/neptune.jpeg'),
            Pluto: textureLoader.load('textures/pluto.webp')
        };
        // Define texture for Saturn's rings
        const ringTexture = new THREE.TextureLoader().load('textures/saturn_rings.png');

        // Body configurations.
        const baseDistance = 50;
        // Sun Configuration (remains the same)
        const sunSize = 30;  // Arbitrary size for visualization
        const sunPosition = [0, 0, 0];  // Central position

        // Mercury
        const mercurySize = 0.383;
        const mercuryDistance = baseDistance * 1;
        const mercuryPosition = [mercuryDistance, 0, 0]

        // Venus
        const venusSize = 0.95;
        const venusDistance = baseDistance * 1.2;
        const venusPosition = [venusDistance, 0, 0]

        // Earth Configuration (adjusted for visual scale)
        const earthSize = 1;  // Scaled size relative to the sun
        const earthDistance = baseDistance * 1.5;  // Adjusted for visualization, not exact scale
        const earthPosition = [earthDistance, 0, 0];  // Positioned along the x-axis for simplicity
        
        // Mars
        const marsSize = 0.532;
        const marsDistance = baseDistance * 1.75;
        const marsPosition = [marsDistance, 0, 0]

        // Jupiter
        const jupiterSize = 11;
        const jupiterDistance = baseDistance * 2.5;
        const jupiterPosition = [jupiterDistance, 0, 0]

        // Saturn
        const saturnSize = 9;
        const saturnDistance = baseDistance * 3.5;
        const saturnPosition = [saturnDistance, 0, 0]

        // Uranus
        const uranusSize = 4;
        const uranusDistance = baseDistance * 4.25;
        const uranusPosition = [uranusDistance, 0, 0]

        // Neptune
        const neptuneSize = 4;
        const neptuneDistance = baseDistance * 4.75;
        const neptunePosition = [neptuneDistance, 0, 0]

        // Pluto
        const plutoSize = 0.2;
        const plutoDistance = baseDistance * 5.25;
        const plutoPosition = [plutoDistance, 0, 0]

        const bodies = [
            { name: 'Sun', position: sunPosition, size: sunSize, color: 0xFFFF00, emissive: 0xFFFFA1 },
            { name: 'Mercury', position: mercuryPosition, size: mercurySize },
            { name: 'Venus', position: venusPosition, size: venusSize },
            { name: 'Earth', position: earthPosition, size: earthSize },
            { name: 'Mars', position: marsPosition, size: marsSize },
            { name: 'Jupiter', position: jupiterPosition, size: jupiterSize },
            { name: 'Saturn', position: saturnPosition, size: saturnSize },
            { name: 'Uranus', position: uranusPosition, size: uranusSize },
            { name: 'Neptune', position: neptunePosition, size: neptuneSize },
            { name: 'Pluto', position: plutoPosition, size: plutoSize}
        ];
        
        // Create and add celestial bodies to the scene
        bodies.forEach(body => {
            const { name, size, emissive, position } = body;
            const texture = textures[name];
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            const material = new THREE.MeshLambertMaterial({
                map: texture,
                color: 0xffffff,
                emissive: emissive,
                emissiveIntensity: 1,
                metalness: 0.5,
                roughness: 0.5
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...position);
            mesh.userData.name = name;
            scene.add(mesh);
        
            if (name === 'Saturn') {
                const rings = createSaturnRings();
                rings.position.set(...position);
                scene.add(rings);
                rings.userData.name = name;
                celestialBodies.current.push(rings);  // Also store rings for cleanup
            }            
        
            celestialBodies.current.push(mesh);  // Store reference for cleanup
        });

        // Function to create Saturn's rings
        function createSaturnRings() {
            const innerRadius = 12;
            const outerRadius = 22;
            const thetaSegments = 128;  // Number of segments, increase for smoother rings
        
            // Create ring geometry using THREE.RingGeometry
            const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
            ringGeometry.rotateX(Math.PI / 2); // Align the rings horizontally
        
            // Adjust UV mapping to correctly map the texture
            var pos = ringGeometry.attributes.position;
            var uv = ringGeometry.attributes.uv;
            var v3 = new THREE.Vector3();
            for (let i = 0; i < pos.count; i++){
                v3.fromBufferAttribute(pos, i);
                uv.setXY(i, v3.length() < (innerRadius + outerRadius) / 2 ? 0 : 1, 1);
            }
        
            // Load the texture and create material
            const ringTexture = new THREE.TextureLoader().load('textures/saturn_rings.png');
            const ringMaterial = new THREE.MeshBasicMaterial({
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5
            });
        
            // Create mesh with the geometry and material
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        
            return rings;
        }
        
        const animate = () => {
            requestAnimationFrame(animate);
            celestialBodies.current.forEach(mesh => {
                if (mesh.userData.name && rotationRadians[mesh.userData.name]) {
                    mesh.rotation.y += rotationRadians[mesh.userData.name];
                }
            });
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup function
        return () => {
            mountRef.current.removeChild(renderer.domElement);
            celestialBodies.current.forEach(mesh => {
                scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            });
            renderer.dispose();
        };        
    }, []);

    const handleBodySelect = (position) => {
        if (camera) {
            camera.position.set(position[0], position[1], position[2] + 500); // Zoom out a bit
            camera.lookAt(new THREE.Vector3(...position));
        }
    };

    return (
        <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}>
            {camera && <CameraMenu celestialBodies={celestialBodies.current} onBodySelect={handleBodySelect} />}
        </div>
    );
}

export default SolarSystem;