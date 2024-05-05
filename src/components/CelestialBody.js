import * as THREE from 'three';

const CelestialBody = ({ size, color, emissive, emissiveIntensity, position }) => {
    const sphere = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        metalness: 0.5,
        roughness: 0.5
    });
    const mesh = new THREE.Mesh(sphere, material);
    mesh.position.set(...position);

    return mesh;
};

export default CelestialBody;
