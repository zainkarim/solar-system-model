import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import AudioControl from './AudioControl';
import PlanetInfo from './PlanetInfo';
import axios from 'axios';


const SolarSystem = () => {
    const mountRef = useRef(null);
    const [activeCamera, setActiveCamera] = useState('camera');
    const [planetInfo, setPlanetInfo] = useState(null);
    const [selectedPlanet, setSelectedPlanet] = useState(null);

    useEffect(() => {
        const currentMount = mountRef.current;

        // SCENE, CAMERA, RENDERER
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(25, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 650;
        camera.position.y = 300;
        const renderer = new THREE.WebGLRenderer({ antialias: true }); // set to True for higher fidelity
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        const multicam = {
            camera: camera,
            resetCamera: new THREE.PerspectiveCamera(),
        }

        // WINDOW
        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // LIGHTING
        const ambientLight = new THREE.AmbientLight(0x404040, 0.25); // Soft white light
        scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xffffff, 15000, 500);
        sunLight.position.set(0, 0, 0); // Position at the Sun
        scene.add(sunLight);

        // CONTROLS
        const controls = new OrbitControls(camera, renderer.domElement);
        // controls.enableDamping = true;
        // controls.dampingFactor = 1;
        controls.maxDistance = 800
        controls.update();

        // Solar System Geometry

        // TEXTURE LOADER
        const textureLoader = new THREE.TextureLoader();


        // BACKGROUND
        const background = new THREE.SphereGeometry(1000, 100, 100);
        const backgroundMaterial = new THREE.MeshStandardMaterial({
            map: textureLoader.load('textures/stars.jpeg'),
            side: THREE.DoubleSide
        })
        const bg = new THREE.Mesh(background, backgroundMaterial);
        scene.add(bg);


        // =========== SOLAR SYSTEM =========== //

        // SUN
        const sunGroup = new THREE.Group()
        const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
        const sunMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFF00,
            emissive: 0xFFFFA1,
            emissiveIntensity: 1
        })
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunGroup.add(sunMesh)
        sunGroup.add(multicam.resetCamera)
        multicam.resetCamera.position.set(0, 0, 0);

        scene.add(sunGroup);

        // MERCURY
        const mercuryRadius = 0.383;

        const mercuryTexture = textureLoader.load('textures/mercury.jpeg');
        const mercuryGeometry = new THREE.SphereGeometry(mercuryRadius, 32, 32);
        const mercuryMaterial = new THREE.MeshPhongMaterial({
            map: mercuryTexture
        });
        const mercuryMesh = new THREE.Mesh(mercuryGeometry, mercuryMaterial);

        scene.add(mercuryMesh);

        // Mercury orbit path
        const mercuryCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            50, 50,           // radius x, y
            0, 2 * (Math.PI)    // start, end (0 to 2pi)
        );

        const mercuryPoints = mercuryCurve.getSpacedPoints(200);

        const mercuryCurveGeometry = new THREE.BufferGeometry().setFromPoints(mercuryPoints);
        const mercuryCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const mercuryOrbit = new THREE.Line(mercuryCurveGeometry, mercuryCurveMaterial);
        mercuryOrbit.rotateX((-Math.PI) / 2);
        scene.add(mercuryOrbit);

        // VENUS
        const venusRadius = 0.95;
        const venusTilt = 3.1

        const venusTexture = textureLoader.load('textures/venus.jpeg');
        const venusGeometry = new THREE.SphereGeometry(venusRadius, 32, 32);
        const venusMaterial = new THREE.MeshPhongMaterial({
            map: venusTexture
        });

        const venusMesh = new THREE.Mesh(venusGeometry, venusMaterial);

        venusMesh.rotation.z = venusTilt
        scene.add(venusMesh)

        // Venus orbit path
        const venusCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            60, 60,           // radius x, y
            0.698, 0.698 + (2 * (Math.PI))      // start, end (0 to 2pi)
        );

        const venusPoints = venusCurve.getSpacedPoints(200);

        const venusCurveGeometry = new THREE.BufferGeometry().setFromPoints(venusPoints);
        const venusCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const venusOrbit = new THREE.Line(venusCurveGeometry, venusCurveMaterial);
        venusOrbit.rotateX((-Math.PI) / 2);
        scene.add(venusOrbit);

        // ------ EARTH SYSTEM
        // EARTH
        const earthSystem = new THREE.Group();
        const earthRadius = 1;
        const earthTilt = 0.40; // Axis tilt in radians

        const earthTexture = textureLoader.load(['textures/earth_day.jpeg']);
        const earthGeometry = new THREE.SphereGeometry(earthRadius, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture
        });
        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);

        earthMesh.rotation.z = earthTilt
        earthSystem.add(earthMesh);

        // Earth orbit path
        const earthCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            75, 75,           // radius x, y
            1.396, 1.396 + (2 * (Math.PI))    // start, end (0 to 2pi)
        );

        const earthPoints = earthCurve.getSpacedPoints(200);

        const earthCurveGeometry = new THREE.BufferGeometry().setFromPoints(earthPoints);
        const earthCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const earthOrbit = new THREE.Line(earthCurveGeometry, earthCurveMaterial);
        earthOrbit.rotateX((-Math.PI) / 2);
        scene.add(earthOrbit);


        // MOON
        const moonRadius = 0.273;
        const moonDistance = 40;

        const moonTexture = textureLoader.load(['textures/moon.jpeg']);
        const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32);
        const moonMaterial = new THREE.MeshLambertMaterial({
            map: moonTexture
        })
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

        moonMesh.position.set(moonDistance, 0, 0);
        earthSystem.add(moonMesh)

        scene.add(earthSystem);

        // MARS
        const marsRadius = 0.532;
        const marsTilt = 0.44;  // In radians

        const marsTexture = textureLoader.load('textures/mars.jpeg');
        const marsGeometry = new THREE.SphereGeometry(marsRadius, 32, 32);
        const marsMaterial = new THREE.MeshPhongMaterial({
            map: marsTexture
        });
        const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);

        marsMesh.rotation.z = marsTilt;
        scene.add(marsMesh);

        // Mars orbit path
        const marsCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            90, 90,             // radius x, y
            3.490, 3.490 + (2 * (Math.PI))    // start, end (0 to 2pi)
        );

        const marsPoints = marsCurve.getSpacedPoints(200);

        const marsCurveGeometry = new THREE.BufferGeometry().setFromPoints(marsPoints);
        const marsCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const marsOrbit = new THREE.Line(marsCurveGeometry, marsCurveMaterial);
        marsOrbit.rotateX((-Math.PI) / 2);
        scene.add(marsOrbit);

        // JUPITER
        const jupiterRadius = 11;
        const jupiterTilt = 0.05;  // In radians

        const jupiterTexture = textureLoader.load('textures/jupiter.jpeg');
        const jupiterGeometry = new THREE.SphereGeometry(jupiterRadius, 32, 32);
        const jupiterMaterial = new THREE.MeshPhongMaterial({
            map: jupiterTexture
        });
        const jupiterMesh = new THREE.Mesh(jupiterGeometry, jupiterMaterial);

        jupiterMesh.rotation.z = jupiterTilt;
        scene.add(jupiterMesh);

        // Jupiter orbit path
        const jupiterCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            120, 120,           // radius x, y
            2.792, 2.792 + (2 * (Math.PI))    // start, end (0 to 2pi)
        );

        const jupiterPoints = jupiterCurve.getSpacedPoints(200);

        const jupiterCurveGeometry = new THREE.BufferGeometry().setFromPoints(jupiterPoints);
        const jupiterCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const jupiterOrbit = new THREE.Line(jupiterCurveGeometry, jupiterCurveMaterial);
        jupiterOrbit.rotateX((-Math.PI) / 2);
        scene.add(jupiterOrbit);

        // ------ SATURN SYSTEM
        // SATURN
        const saturnSystem = new THREE.Group()
        const saturnRadius = 9;
        const saturnTilt = 0.47;  // In radians

        const saturnTexture = textureLoader.load('textures/saturn.jpeg');
        const saturnGeometry = new THREE.SphereGeometry(saturnRadius, 32, 32);
        const saturnMaterial = new THREE.MeshPhongMaterial({
            map: saturnTexture
        });
        const saturnMesh = new THREE.Mesh(saturnGeometry, saturnMaterial);

        saturnSystem.rotation.z = saturnTilt;
        saturnSystem.add(saturnMesh);

        // Saturn orbit path
        const saturnCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            160, 160,           // radius x, y
            0.698, 0.698 + (2 * (Math.PI))    // start, end (0 to 2pi)
        );

        const saturnPoints = saturnCurve.getSpacedPoints(200);

        const saturnCurveGeometry = new THREE.BufferGeometry().setFromPoints(saturnPoints);
        const saturnCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const saturnOrbit = new THREE.Line(saturnCurveGeometry, saturnCurveMaterial);
        saturnOrbit.rotateX((-Math.PI) / 2);
        scene.add(saturnOrbit);

        // RINGS
        const innerRadius = 12;
        const outerRadius = 22;
        const thetaSegments = 64;  // Number of segments, increase for smoother rings

        // Create ring geometry using THREE.RingGeometry
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
        ringGeometry.rotateX(Math.PI / 2); // Align the rings horizontally

        // Adjust UV mapping to correctly map the texture
        var pos = ringGeometry.attributes.position;
        var uv = ringGeometry.attributes.uv;
        var v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
            v3.fromBufferAttribute(pos, i);
            uv.setXY(i, v3.length() < (innerRadius + outerRadius) / 2 ? 0 : 1, 1);
        }

        // Load the texture and create material
        const ringTexture = new THREE.TextureLoader().load('textures/saturn_rings.png');
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75
        });

        // Create mesh with the geometry and material
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        saturnSystem.add(ringMesh);

        scene.add(saturnSystem);

        // URANUS
        const uranusRadius = 4;
        const uranusTilt = 1.71;  // In radians

        const uranusTexture = textureLoader.load('textures/uranus.jpeg');
        const uranusGeometry = new THREE.SphereGeometry(uranusRadius, 32, 32);
        const uranusMaterial = new THREE.MeshPhongMaterial({
            map: uranusTexture
        });
        const uranusMesh = new THREE.Mesh(uranusGeometry, uranusMaterial);

        uranusMesh.rotation.z = uranusTilt;
        scene.add(uranusMesh);

        // Uranus orbit path
        const uranusCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            190, 190,           // radius x, y
            4.188, 4.188 + (2 * (Math.PI))    // start, end (0 to 2pi)
        );

        const uranusPoints = uranusCurve.getSpacedPoints(200);

        const uranusCurveGeometry = new THREE.BufferGeometry().setFromPoints(uranusPoints);
        const uranusCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const uranusOrbit = new THREE.Line(uranusCurveGeometry, uranusCurveMaterial);
        uranusOrbit.rotateX((-Math.PI) / 2);
        scene.add(uranusOrbit);

        // NEPTUNE
        const neptuneRadius = 4;
        const neptuneTilt = 0.49;  // In radians

        const neptuneTexture = textureLoader.load('textures/neptune.jpeg');
        const neptuneGeometry = new THREE.SphereGeometry(neptuneRadius, 32, 32);
        const neptuneMaterial = new THREE.MeshPhongMaterial({
            map: neptuneTexture
        });
        const neptuneMesh = new THREE.Mesh(neptuneGeometry, neptuneMaterial);

        neptuneMesh.rotation.z = neptuneTilt;
        scene.add(neptuneMesh);

        // Neptune orbit path
        const neptuneCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            200, 200,           // radius x, y
            4.886, 4.886 + (2 * (Math.PI))    // start, end (0 to 2pi)
        );

        const neptunePoints = neptuneCurve.getSpacedPoints(200);

        const neptuneCurveGeometry = new THREE.BufferGeometry().setFromPoints(neptunePoints);
        const neptuneCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const neptuneOrbit = new THREE.Line(neptuneCurveGeometry, neptuneCurveMaterial);
        neptuneOrbit.rotateX((-Math.PI) / 2);
        scene.add(neptuneOrbit);

        // PLUTO
        const plutoRadius = 0.2;
        const plutoTilt = 2.11;  // In radians

        const plutoTexture = textureLoader.load('textures/pluto.webp');
        const plutoGeometry = new THREE.SphereGeometry(plutoRadius, 32, 32);
        const plutoMaterial = new THREE.MeshPhongMaterial({
            map: plutoTexture
        });
        const plutoMesh = new THREE.Mesh(plutoGeometry, plutoMaterial);

        plutoMesh.rotation.z = plutoTilt;
        scene.add(plutoMesh);

        // Pluto orbit path
        const plutoCurve = new THREE.EllipseCurve(
            0, 0,               // center x, y
            220, 195,           // radius x, y (not perfectly circular)
            5.584, 5.584 + (2 * (Math.PI))    // start, end (0 to 2pi)
        );

        const plutoPoints = plutoCurve.getSpacedPoints(200);

        const plutoCurveGeometry = new THREE.BufferGeometry().setFromPoints(plutoPoints);
        const plutoCurveMaterial = new THREE.LineBasicMaterial({ color: 0xe4e4e3, transparent: true, opacity: 0.5 });

        const plutoOrbit = new THREE.Line(plutoCurveGeometry, plutoCurveMaterial);
        plutoOrbit.rotateX((-Math.PI) / 2);
        scene.add(plutoOrbit);


        // ANIMATION LOOP
        // ANIMATION LOOP
        const baseLoopTime = 1; // Baseline for Earth, one complete orbit in animation terms

        // Relative speeds based on the actual orbital periods
        const mercuryOrbitSpeed = 0.00001 * (1 / 0.24);  // Mercury orbits faster
        const venusOrbitSpeed = 0.00001 * (1 / 0.62);    // Venus orbits faster
        const earthOrbitSpeed = 0.00001;                 // Baseline for Earth
        const marsOrbitSpeed = 0.00001 * (1 / 1.88);     // Mars orbits slower
        const jupiterOrbitSpeed = 0.00001 * (1 / 11.86); // Jupiter orbits much slower
        const saturnOrbitSpeed = 0.00001 * (1 / 29.46);  // Saturn orbits much slower
        const uranusOrbitSpeed = 0.00001 * (1 / 84.01);  // Uranus orbits much slower
        const neptuneOrbitSpeed = 0.00001 * (1 / 164.8); // Neptune orbits much slower
        const plutoOrbitSpeed = 0.00001 * (1 / 248);     // Pluto orbits much slower

        const moonOrbitRadius = 5;                      // Moon's orbit radius, static value
        const moonOrbitSpeed = 80;                       // Moon's orbital speed around Earth

        const animate = function () {

            // Move Mercury around Sun
            const mercuryTime = mercuryOrbitSpeed * performance.now();
            const mt = mercuryTime % baseLoopTime;

            let mp = mercuryCurve.getPoint(mt);
            console.log(mp, mt);

            mercuryMesh.position.x = mp.x;
            mercuryMesh.position.z = mp.y;

            // Move Venus around Sun
            const venusTime = venusOrbitSpeed * performance.now();
            const vt = venusTime % baseLoopTime;

            let vp = venusCurve.getPoint(vt);
            console.log(vp, vt);

            venusMesh.position.x = vp.x;
            venusMesh.position.z = vp.y;

            // Move Earth around Sun
            const time = earthOrbitSpeed * performance.now();
            const t = time % baseLoopTime;

            let p = earthCurve.getPoint(t);
            console.log(p, t);

            earthSystem.position.x = p.x;
            earthSystem.position.z = p.y;

            // Move moon around Earth
            moonMesh.position.x = -Math.cos(time * moonOrbitSpeed) * moonOrbitRadius;
            moonMesh.position.z = -Math.sin(time * moonOrbitSpeed) * moonOrbitRadius;

            // Move Mars around Sun
            const marsTime = marsOrbitSpeed * performance.now();
            const mtMars = marsTime % baseLoopTime;

            let mpMars = marsCurve.getPoint(mtMars);
            console.log(mpMars, mtMars);

            marsMesh.position.x = mpMars.x;
            marsMesh.position.z = mpMars.y;

            // Move Jupiter around Sun
            const jupiterTime = jupiterOrbitSpeed * performance.now();
            const jt = jupiterTime % baseLoopTime;

            let jp = jupiterCurve.getPoint(jt);
            console.log(jp, jt);

            jupiterMesh.position.x = jp.x;
            jupiterMesh.position.z = jp.y;

            // Move Saturn around Sun
            const saturnTime = saturnOrbitSpeed * performance.now();
            const st = saturnTime % baseLoopTime;

            let sp = saturnCurve.getPoint(st);
            console.log(sp, st);

            saturnSystem.position.x = sp.x;
            saturnSystem.position.z = sp.y;

            // Move Uranus around Sun
            const uranusTime = uranusOrbitSpeed * performance.now();
            const ut = uranusTime % baseLoopTime;

            let up = uranusCurve.getPoint(ut);
            console.log(up, ut);

            uranusMesh.position.x = up.x;
            uranusMesh.position.z = up.y;

            // Move Neptune around Sun
            const neptuneTime = neptuneOrbitSpeed * performance.now();
            const nt = neptuneTime % baseLoopTime;

            let np = neptuneCurve.getPoint(nt);
            console.log(np, nt);

            neptuneMesh.position.x = np.x;
            neptuneMesh.position.z = np.y;

            // Move Pluto around Sun
            const plutoTime = plutoOrbitSpeed * performance.now();
            const pt = plutoTime % baseLoopTime;

            let pp = plutoCurve.getPoint(pt);
            console.log(pp, pt);

            plutoMesh.position.x = pp.x;
            plutoMesh.position.z = pp.y;


            // rotate planets on Axis
            const baseRotationSpeed = 0.005;

            // rotate planets on Axis
            mercuryMesh.rotation.y += baseRotationSpeed * (1 / 58.6);
            venusMesh.rotation.y -= baseRotationSpeed * (1 / 243);  // Note: Venus rotates in the opposite direction
            earthMesh.rotation.y += baseRotationSpeed;
            marsMesh.rotation.y += baseRotationSpeed * (24 / 24.6);
            jupiterMesh.rotation.y += baseRotationSpeed * (24 / 9.9);
            saturnSystem.rotation.y += baseRotationSpeed * (24 / 10.7);
            uranusMesh.rotation.y += baseRotationSpeed * (24 / 17.2);
            neptuneMesh.rotation.y += baseRotationSpeed * (24 / 16.1);
            plutoMesh.rotation.y += baseRotationSpeed * (24 / 153.3);

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // Clean up
        return () => {
            mountRef.current.removeChild(renderer.domElement);
            window.removeEventListener('resize', handleResize);
        };
    }, [activeCamera]);

    const switchCamera = (cameraName) => {
        setActiveCamera(cameraName);
    }

    const bodies = [
        { name: 'Mercury', apiName: 'mercury'},
        { name: 'Venus', apiName: 'venus'},
        { name: 'Earth', apiName: 'earth'},
        { name: 'Moon', apiName: 'moon'},
        { name: 'Mars', apiName: 'mars'},
        { name: 'Jupiter', apiName: 'jupiter'},
        { name: 'Saturn', apiName: 'saturn'},
        { name: 'Uranus', apiName: 'uranus'},
        { name: 'Pluto', apiName: 'pluto'},
        { name: 'Sun', apiName: 'sun'}
    ]

    const handlePlanetClick = (planetName) => {
        setSelectedPlanet(planetName);  // This should just handle the name
        axios.get(`http://127.0.0.1:5001/planets/${planetName}`)
            .then(response => {
                console.log("Data received:", response.data);
                setPlanetInfo(response.data);  // This handles the full planet data
            })
            .catch(error => {
                console.error('Error fetching planet data:', error);
            });
    };    

    return (
        <div ref={mountRef} style={{ width: '100%', height: '100vh' }}>
            <AudioControl src="Ambient Pad in C Major.mp3" />
            <button onClick={() => switchCamera('resetCamera')} style={{ position: 'absolute', top: 10, left: 90, zIndex: 100 }}>
                Reset Camera
            </button>
            {bodies.map((planet, index) => (
                <button key={index} onClick={() => handlePlanetClick(planet.apiName)} style={{ position: 'absolute', top: 20 + index * 30, left: 10, zIndex: 100 }}>
                    {planet.name}
                </button>
            ))}
            {planetInfo && <PlanetInfo planetName={selectedPlanet} onClose={() => setPlanetInfo(null)} />}
        </div>
    );
};

export default SolarSystem;