import * as THREE from 'three';

export default function Lights(scene) {
    const lights = [
        { color: 0xffffff, intensity: 1, position: [0, -30, 30] },
        { color: 0xff00ff, intensity: 0.5, position: [-30, -30, 30] },
        { color: 0xff0000, intensity: 0.5, position: [30, -30, 30] }
    ];

    lights.forEach(({ color, intensity, position }) => {
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...position);
        light.castShadow = true;
        scene.add(light);
        // scene.add(new THREE.DirectionalLightHelper(light, 1));
    });

    const ambientLight = new THREE.AmbientLight('white', 0.4);
    scene.add(ambientLight);
}