const initTeaser = () => {
  const gui = new dat.GUI();
  const canvas = document.querySelector("canvas.webgl");
  const scene = new THREE.Scene();

  /* -------------------------------------------------------------------------- */
  /*                                 parameters                                 */
  /* -------------------------------------------------------------------------- */
  const PARAMETERS = {
    colormode: false, // false is dark, true is light
    showHelper: false,
    shapeTransformFactor: 5,
  };

  const layer = 12;
  const segments = 157;
  const sq = segments * segments;
  const ss = 24964;
  const cameraEasing = 0.12;
  const cameraPositionMultiplier = 1.5;

  /* -------------------------------------------------------------------------- */
  /*                                     GUI                                    */
  /* -------------------------------------------------------------------------- */
  gui.add(PARAMETERS, "colormode");
  gui.add(PARAMETERS, "showHelper").onChange(() => {
    helper.visible = PARAMETERS.showHelper;
  });
  gui.add(PARAMETERS, "shapeTransformFactor").min(0).max(20);

  /* -------------------------------------------------------------------------- */
  /*                                 Variables                                  */
  /* -------------------------------------------------------------------------- */

  const mouse = {
    x: 0,
    y: 0,
  };
  const group = new THREE.Group();
  const clock = new THREE.Clock();
  let mousep = new THREE.Vector3(0, 0, 0);

  const createBlob = () => {
    if (group !== null) {
      scene.remove(group);
    }
    const pindex = new Float32Array(ss);
    const pindexj = new Float32Array(ss);
    const pindexlayer = new Float32Array(ss);

    /* -------------------------------------------------------------------------- */
    /*                                  material                                  */
    /* -------------------------------------------------------------------------- */
    const generateMaterial = (val = 1) => {
      return new THREE.ShaderMaterial({
        depthWrite: true,
        depthTest: true,
        vertexShader: VertexShader,
        fragmentShader: FragmentShader,
        side: THREE.BackSide,
        uniforms: {
          uTime: {
            value: 0,
          },
          uMx: {
            value: new THREE.Vector3(0, 0, 0),
          },
          uFrequency: {
            value: 0.02,
          },
          u: {
            value: val,
          },
          c: {
            value: 1,
          },
        },
      });
    };

    /* -------------------------------------------------------------------------- */
    /*                                  geometry                                  */
    /* -------------------------------------------------------------------------- */
    const geometry = [];

    for (let i = 0; i < layer; i++) {
      geometry[i] = new THREE.BufferGeometry();
      let internal = i;
      let indices = [];
      let vertices = [];
      let normals = [];
      let positions = [];

      /* -------------------------------- position -------------------------------- */
      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const spinAngle = (Math.PI * 2) / segments;
          const radius = j * 0.36;

          const x = Math.sin(spinAngle * i) * radius;
          const y = Math.cos(spinAngle * i) * radius;
          const z = Math.pow(j, 0.5) * 10 - 0.03 * j * internal;

          normals.push(0, 0, 1);
          vertices.push(x, -y, z);
          positions.push(x, y, z);
        }
      }

      for (let i = 0; i < sq; i++) {
        pindex[i] = i;
        pindexj[i] = i % 158;
        pindexlayer[i] = internal;
      }

      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
          const a = i * (segments + 1) + (j + 1);
          const b = i * (segments + 1) + j;
          const c = (i + 1) * (segments + 1) + j;
          const d = (i + 1) * (segments + 1) + (j + 1);
          indices.push(a, b, d); // face one
          indices.push(b, c, d); // face two
        }
      }
      geometry[i].setIndex(indices);
      geometry[i].setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(normals, 3)
      );
      geometry[i].setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry[i].setAttribute("pIndex", new THREE.BufferAttribute(pindex, 1));
      geometry[i].setAttribute(
        "pIndexj",
        new THREE.BufferAttribute(pindexj, 1)
      );
      geometry[i].setAttribute(
        "pIndexlayer",
        new THREE.BufferAttribute(pindexlayer, 1)
      );
    }

    for (let s = 0; s < 4; s++) {
      const cone = new THREE.Group();

      const thisMat = generateMaterial(s + 1);

      for (let i = 0; i < layer; i++) {
        const plane = new THREE.Mesh(geometry[i], thisMat);
        plane.scale.x -= i * 0.07;
        plane.scale.y -= i * 0.07;
        plane.scale.z -= i * 0.07;
        cone.add(plane);
      }

      const rotationFactorY = s % 2 === 0 ? -1 : 1; // - + - +
      const rotationFactorX = s < 2 ? 1 : -1; // + + - -
      const rotationFactorZ = s === 0 || s === 3 ? -1 : 1; // - + + -

      const rotationMaxZ = s < 2 ? 0.25 : 1.25;

      cone.rotation.y = rotationFactorY * Math.PI * 0.15;
      cone.rotation.x = rotationFactorX * Math.PI * 0.15;
      cone.rotation.z = rotationFactorZ * Math.PI * rotationMaxZ;
      group.add(cone);
    }

    scene.add(group);
  };

  document.addEventListener(
    "mousemove",
    (e) => onMouseMove(e.clientX, e.clientY),
    false
  );
  document.addEventListener(
    "touchmove",
    (e) => onMouseMove(e.layerX, e.layerY),
    false
  );

  /* -------------------------------------------------------------------------- */
  /*                             do not change here                             */
  /* -------------------------------------------------------------------------- */
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  let cameraaspect = sizes.width / sizes.height;
  const height = 200;
  const camera = new THREE.OrthographicCamera(
    -height * cameraaspect,
    height * cameraaspect,
    height,
    -height,
    1000,
    2500
  );
  camera.position.z = -1500;
  scene.add(camera);

  const helper = new THREE.GridHelper(1000, 40, 0x303030, 0x303030);
  helper.position.y = 0;
  helper.visible = PARAMETERS.showHelper;
  scene.add(helper);

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enabled = false;
  // controls.enabled = true;
  // controls.target = new THREE.Vector3(0,0,0)

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  createBlob();

  let xxx = 0;
  let yyy = 0;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // update camera
    const dx = mousep.x - xxx;
    const dy = mousep.y - yyy;

    xxx = Math.abs(dx) > 0.05 ? xxx + dx * cameraEasing : mousep.x;
    yyy = Math.abs(dx) > 0.05 ? yyy + dy * cameraEasing : mousep.y;

    camera.position.x = xxx * cameraPositionMultiplier;
    camera.position.y = yyy * cameraPositionMultiplier;

    // updata material
    group.children.forEach((g) => {
      const mat = g.children[0].material;
      mat.uniforms.uTime.value =
        elapsedTime + PARAMETERS.shapeTransformFactor * mouse.x;
      mat.uniforms.uMx.value = mousep;
      mat.uniforms.c.value = PARAMETERS.colormode;
    });

    // render
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  function onMouseMove(x, y) {
    // Update the mouse variable
    event.preventDefault();
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    // Make the sphere follow the mouse
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    mousep = pos;
  }
};

// initiate visual
document.addEventListener("DOMContentLoaded", () => {
  console.log("init teaser visualization");
  initTeaser();
});
