import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import audioFiles from './pianoAudio';
import Lights from './Lights';
import {keymaps} from './keyMaps';


function createKey(dimensions, positions = [0, 0, 0], color = 'white') {
  const geometry = new RoundedBoxGeometry(
    dimensions.width,
    dimensions.height,
    dimensions.depth,
    dimensions.segments,
    dimensions.radius
  );
  const material = new THREE.MeshStandardMaterial({ color });
  const key = new THREE.Mesh(geometry, material);
  key.position.set(...positions);
  key.receiveShadow = true;
  key.castShadow = true;
  key.userData = { originalColor: color, originalPosition: positions };
  return key;
}
function whitekeypresseffect(key) {
  key.material.color.set(0xcfcfcf)
  key.scale.set(1, 1, 0.8)
  key.position.z = -0.2;
}
function blackkeypresseffect(key) {
  key.material.color.set(0x373737)
  key.scale.set(1, 1, 0.7)
}

const PianoKeys = () => {
  const mountRef = useRef(null);
  const keysRef = useRef([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const keymap = useRef(keymaps);
  useEffect(() => {
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor('#303030');
    currentMount.appendChild(renderer.domElement);

    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    Lights(scene);

    const whiteKeys = [];
    const whiteKeyDimensions = {
      width: 4,
      height: 10,
      depth: 2.5,
      segments: 2,
      radius: 0.3
    };
    for (let i = 0; i < 7; i++) {
      const whiteKey = createKey(whiteKeyDimensions, [4.03 * i - 12, 0, 0]);
      whiteKeys.push(whiteKey);
      scene.add(whiteKey);
    }

    const blackKeys = [];
    const blackKeyDimensions = {
      width: 1.8,
      height: 5.2,
      depth: 1.3,
      segments: 2,
      radius: 0.3
    };
    for (let i = 0; i < 6; i++) {
      const blackKey = createKey(blackKeyDimensions, [4.03 * i - 10, 2.2, 1.5], 'black');
      blackKeys.push(blackKey);
      scene.add(blackKey);
    }

    keysRef.current = [...whiteKeys, ...blackKeys];

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const pressdown = (event) => {
      const key = event.key;
      if (keymap.current.hasOwnProperty(key)) {
        keymap.current[key] = true;
      }
    };
    window.addEventListener('keydown', pressdown);

    const pressup = (event) => {
      const key = event.key;
      if (keymap.current.hasOwnProperty(key)) {
        keymap.current[key] = false;

      }
    };
    window.addEventListener('keyup', pressup);

    

    const animate = () => {
      requestAnimationFrame(animate);

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(keysRef.current);

      keysRef.current.forEach((key) => {
        key.material.color.set(key.userData.originalColor);
        key.position.set(...key.userData.originalPosition);
        key.scale.set(1, 1, 1);
      });

      if (intersects.length > 0) {
        const intersectedKey = intersects[0].object;
        intersectedKey.material.color.set(0x727171);
        intersectedKey.scale.set(1.1, 1.1, 1.1);
      }
      
      Object.entries(keymap.current).forEach(([key, boolValue], index) => {
        if (boolValue) {
          index < 7?
            whitekeypresseffect(keysRef.current[index]):
            blackkeypresseffect(keysRef.current[index]);
          if (audioFiles[index]) {
            console.log('played index ' , index) ;
            audioFiles[index].play().catch(error => {
              console.error('Error playing audio:', error);
            });
          }
        } else {
          if (audioFiles[index] && !audioFiles[index].paused && !(audioFiles[index].currentTime <= 1)) {
            audioFiles[index].pause();
            console.log('paused function on ',index);
            audioFiles[index].currentTime = 0;
          }
        }
      });
      
    
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      currentMount.removeChild(renderer.domElement);
      controls.dispose();
      window.removeEventListener('keyup', pressup);
      window.removeEventListener('keypressed', pressdown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  useEffect(()=>{

  },[])

  return <div ref={mountRef} />;
};

export default PianoKeys;
