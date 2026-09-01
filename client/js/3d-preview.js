// client/js/3d-preview.js
const Product3DPreview = (() => {
  let scene, camera, renderer, light;
  let currentModel = null;
  let isInitialized = false;
  let hoverTimeout = null;
  let orbitControls = null;
  let modalElement = null;
  let canvasContainer = null;
  let loadingElement = null;
  let isLoading = false;
  let isOpen = false;

  const modelCache = new Map();

  function createFallbackBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3, metalness: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true }));
    mesh.add(line);
    return mesh;
  }

  function createModal() {
    if (modalElement) return;

    modalElement = document.createElement('div');
    modalElement.className = 'global-3d-modal';

    // We click the backdrop to close too
    modalElement.onclick = (e) => {
        if (e.target === modalElement) closeModal();
    };

    canvasContainer = document.createElement('div');
    canvasContainer.className = 'global-3d-canvas-container';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'global-3d-modal-close';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.onclick = closeModal;

    loadingElement = document.createElement('div');
    loadingElement.className = 'global-3d-loading';
    loadingElement.innerHTML = '<div class="spinner"></div><span>ĐANG TẢI MÔ HÌNH 3D...</span>';

    canvasContainer.appendChild(closeBtn);
    canvasContainer.appendChild(loadingElement);
    modalElement.appendChild(canvasContainer);
    document.body.appendChild(modalElement);
  }

  function resizeCanvas() {
    if (!isOpen || !renderer || !camera || !canvasContainer) return;
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function initThreeJs() {
    if (isInitialized) return;
    createModal();

    scene = new THREE.Scene();
    scene.background = null; 

    const width = canvasContainer.clientWidth || 800;
    const height = canvasContainer.clientHeight || 600;

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8); 

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    if (typeof THREE.OrbitControls !== 'undefined') {
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.enableZoom = true;
        orbitControls.minDistance = 2;
        orbitControls.maxDistance = 15;
        orbitControls.enablePan = false;
        orbitControls.autoRotate = true; 
        orbitControls.autoRotateSpeed = 1.0;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    canvasContainer.appendChild(renderer.domElement);
    isInitialized = true;

    renderer.setAnimationLoop(() => {
      if (orbitControls && isOpen) orbitControls.update();
      if (isOpen) renderer.render(scene, camera);
    });

    window.addEventListener('resize', resizeCanvas);
  }

  function loadModel(url) {
    if (modelCache.has(url)) return Promise.resolve(modelCache.get(url));

    return new Promise((resolve) => {
      if (typeof THREE.GLTFLoader === 'undefined') {
        const box = createFallbackBox();
        box.userData.originalScale = 1; // Fallback
        modelCache.set(url, box);
        resolve(box);
        return;
      }

      const loader = new THREE.GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          
          // Use a wrapper to properly center the pivot point
          const wrapper = new THREE.Group();
          wrapper.add(model);
          
          model.position.x = -center.x;
          model.position.y = -center.y;
          model.position.z = -center.z;
          
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scale = 5 / maxDim; 
            wrapper.scale.setScalar(scale);
            wrapper.userData.originalScale = scale; 
          } else {
            wrapper.userData.originalScale = 1;
          }

          modelCache.set(url, wrapper);
          resolve(wrapper);
        },
        undefined,
        (error) => {
          console.error("GLTFLoader error:", error);
          const box = createFallbackBox();
          box.userData.originalScale = 1;
          modelCache.set(url, box);
          resolve(box);
        }
      );
    });
  }

  async function openModal(card) {
    if (isOpen) return;
    const modelUrl = card.getAttribute('data-model-3d');
    if (!modelUrl) return;

    isOpen = true;
    
    // Make sure modal container exists so clientWidth is valid
    if (!modalElement) createModal();
    
    document.body.style.overflow = 'hidden';
    modalElement.classList.add('active');
    loadingElement.style.display = 'flex';
    
    // Force layout update so container has dimensions
    modalElement.getBoundingClientRect(); 
    
    initThreeJs();
    resizeCanvas(); // Make sure canvas matches the container size

    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }

    try {
        const model = await loadModel(modelUrl);
        if (!isOpen) return; 

        loadingElement.style.display = 'none';
        currentModel = model;
        scene.add(currentModel);

        camera.position.set(0, 0, 8);
        if(orbitControls) orbitControls.reset();

        // Use the stored original scale!
        const targetScale = currentModel.userData.originalScale || 1;
        currentModel.scale.setScalar(0.01);
        // Start exactly in the center
        currentModel.position.set(0, 0, 0); 
        currentModel.rotation.set(0, -Math.PI, 0);

        gsap.to(currentModel.scale, {
            x: targetScale, y: targetScale, z: targetScale,
            duration: 1.2,
            ease: 'back.out(1.5)'
        });
        
        gsap.to(currentModel.rotation, {
            y: 0,
            duration: 1.5,
            ease: 'power2.out'
        });

    } catch (err) {
        console.error("Failed to load 3D preview", err);
        loadingElement.innerHTML = '<span>LỖI TẢI MÔ HÌNH</span>';
    }
  }

  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    document.body.style.overflow = '';
    modalElement.classList.remove('active');
    
    if (currentModel) {
        // Animate out
        gsap.to(currentModel.scale, {
            x: 0.01, y: 0.01, z: 0.01,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                if (currentModel) scene.remove(currentModel);
                currentModel = null;
            }
        });
    }
  }

  function init() {
    if (window.innerWidth < 768) return; 

    document.addEventListener('mouseover', (e) => {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const card = e.target.closest('.product-card');
        if (!card) return;
        
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;

        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            const modelUrl = card.getAttribute('data-model-3d');
            if (modelUrl && modelUrl.trim() !== '') {
                openModal(card);
            }
        }, 3000); 
    });

    document.addEventListener('mouseout', (e) => {
        if (!e.target || typeof e.target.closest !== 'function') return;
        const card = e.target.closest('.product-card');
        if (!card) return;

        if (e.relatedTarget && card.contains(e.relatedTarget)) return;

        clearTimeout(hoverTimeout);
    });
  }

  return { init };
})();
