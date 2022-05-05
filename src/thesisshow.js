import './style.css'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import './perlin.js'
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import VertexShader from './shader/thesisshow/vertex.vs.glsl'
import VertexShader2 from './shader/thesisshow/vertex2.vs.glsl'
import VertexShader3 from './shader/thesisshow/vertex3.vs.glsl'
import VertexShader4 from './shader/thesisshow/vertex4.vs.glsl'
import FragmentShader from './shader/thesisshow/fragment.fs.glsl'
import {
    Group
} from 'three'

// 1 is bright mode
// 0 is dark mode
let colormode = 0


// let gui = new dat.GUI()
let canvas = document.querySelector('canvas.webgl');
// const stats = new Stats();
// document.body.appendChild(stats.dom);
let scene = new THREE.Scene()
if (colormode == 1) {
    scene.background = new THREE.Color(0xffffff);
} else if (colormode == 0) {
    scene.background = new THREE.Color(0x000000);
}


/* -------------------------------------------------------------------------- */
/*                                 parameters                                 */
/* -------------------------------------------------------------------------- */
let clock;
var mouse = {
    x: 0,
    y: 0
};
let mousep = new THREE.Vector3(0, 0, 0);
let geometry = []
let material, material2, material3, material4
let group, group2, group3, group4
let plane
let layer = 12
let segments = 157;
let sq = segments * segments;
let ss = 24964;

group = new THREE.Group()
group2 = new THREE.Group()
group3 = new THREE.Group()
group4 = new THREE.Group()
clock = new THREE.Clock()

const apple = () => {
    if (group !== null) {
        scene.remove(group)
        scene.remove(group2)
        scene.remove(group3)
        scene.remove(group4)
    }
    const pindex = new Float32Array(ss);
    const pindexj = new Float32Array(ss);
    const pindexlayer = new Float32Array(ss);

    /* -------------------------------------------------------------------------- */
    /*                                  geometry                                  */
    /* -------------------------------------------------------------------------- */
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
                let spinAngle = Math.PI * 2 / segments;
                let radius = j * .36;

                let x = Math.sin(spinAngle * i) * radius;
                let y = Math.cos(spinAngle * i) * radius;
                // let y = Math.cos(spinAngle * i) * radius - internal;
                // let z = j * 2.2 - internal * .1 * j;
                let z = Math.pow(j, .5) * 10 - .03 * j * internal;

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
                let a = i * (segments + 1) + (j + 1);
                let b = i * (segments + 1) + j;
                let c = (i + 1) * (segments + 1) + j;
                let d = (i + 1) * (segments + 1) + (j + 1);
                indices.push(a, b, d); // face one
                indices.push(b, c, d); // face two
            }
        }
        geometry[i].setIndex(indices);
        geometry[i].setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry[i].setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry[i].setAttribute('pIndex', new THREE.BufferAttribute(pindex, 1))
        geometry[i].setAttribute('pIndexj', new THREE.BufferAttribute(pindexj, 1))
        geometry[i].setAttribute('pIndexlayer', new THREE.BufferAttribute(pindexlayer, 1))

        // console.log(pindexlayer);
        // console.log(pindexj);
        // console.log(pindex);
    }

    /* -------------------------------------------------------------------------- */
    /*                                  mateiral                                  */
    /* -------------------------------------------------------------------------- */
    material = new THREE.ShaderMaterial({
        depthWrite: true,
        depthTest: true,
        // depthFunc: THREE.NotEqualDepth,
        // blending: THREE.CustomBlending,
        vertexShader: VertexShader,
        fragmentShader: FragmentShader,
        side: THREE.BackSide,
        // side: THREE.DoubleSide,
        uniforms: {
            uTime: {
                value: 0
            },
            uMx: {
                value: new THREE.Vector3(0, 0, 0)
            },
            uFrequency: {
                value: 0.02
            },
            u: {
                value: 1
            },
            c: {
                value: 1
            }
        }
    })

    material2 = new THREE.ShaderMaterial({
        depthWrite: true,
        depthTest: true,
        // depthFunc: THREE.LessDepth,
        // blending: THREE.CustomBlending,
        vertexShader: VertexShader2,
        fragmentShader: FragmentShader,
        side: THREE.BackSide,
        uniforms: {
            uTime: {
                value: 0
            },
            uMx: {
                value: new THREE.Vector3(0, 0, 0)
            },
            uFrequency: {
                value: 0.02
            },
            u: {
                value: 2
            },
            c: {
                value: 1
            }
        }
    })

    material3 = new THREE.ShaderMaterial({
        depthWrite: true,
        depthTest: true,
        // depthFunc: THREE.LessDepth,
        // blending: THREE.NoBlending,
        vertexShader: VertexShader3,
        fragmentShader: FragmentShader,
        side: THREE.BackSide,
        uniforms: {
            uTime: {
                value: 0
            },
            uMx: {
                value: new THREE.Vector3(0, 0, 0)
            },
            uFrequency: {
                value: 0.02
            },
            u: {
                value: 3
            },
            c: {
                value: 1
            }
        }
    })

    material4 = new THREE.ShaderMaterial({
        depthWrite: true,
        depthTest: true,
        // depthFunc: THREE.LessDepth,
        // blending: THREE.CustomBlending,
        vertexShader: VertexShader4,
        fragmentShader: FragmentShader,
        side: THREE.BackSide,
        uniforms: {
            uTime: {
                value: 0
            },
            uMx: {
                value: new THREE.Vector3(0, 0, 0)
            },
            uFrequency: {
                value: 0.02
            },
            u: {
                value: 4
            },
            c: {
                value: 1
            }
        }
    })



    for (let i = 0; i < layer; i++) {
        plane = new THREE.Mesh(geometry[i], material)
        plane.scale.x -= i * .07
        plane.scale.y -= i * .07
        plane.scale.z -= i * .07
        group.add(plane);
    }
    group.rotation.y = -Math.PI * .15
    group.rotation.x = Math.PI * .15
    group.rotation.z = -Math.PI * .25
    scene.add(group);

    for (let i = 0; i < layer; i++) {
        plane = new THREE.Mesh(geometry[i], material2)
        plane.scale.x -= i * .07
        plane.scale.y -= i * .07
        plane.scale.z -= i * .07
        group2.add(plane);
    }
    group2.rotation.y = Math.PI * .15
    group2.rotation.x = Math.PI * .15
    group2.rotation.z = Math.PI * .25
    scene.add(group2);

    for (let i = 0; i < layer; i++) {
        plane = new THREE.Mesh(geometry[i], material3)
        plane.scale.x -= i * .07
        plane.scale.y -= i * .07
        plane.scale.z -= i * .07
        group3.add(plane);
    }
    group3.rotation.y = -Math.PI * .15
    group3.rotation.x = -Math.PI * .15
    group3.rotation.z = Math.PI * 1.25
    scene.add(group3);

    group4 = new THREE.Group()
    for (let i = 0; i < layer; i++) {
        plane = new THREE.Mesh(geometry[i], material4)
        plane.scale.x -= i * .07
        plane.scale.y -= i * .07
        plane.scale.z -= i * .07
        group4.add(plane);
    }
    group4.rotation.y = Math.PI * .15
    group4.rotation.x = -Math.PI * .15
    group4.rotation.z = -Math.PI * 1.25
    scene.add(group4);
}


document.addEventListener('mousemove', onMouseMove, false);
/* -------------------------------------------------------------------------- */
/*                                     GUI                                    */
/* -------------------------------------------------------------------------- */
// gui.add(parameters, 'q').min(.01).max(.3).step(.01).onFinishChange(apple)
// gui.add(parameters, 'rotation').min(1).max(20).step(1).onFinishChange(generateGalaxy)
// gui.add(material.uniforms.uFrequency, 'value').min(0.01).max(1).step(0.01).onFinishChange(generateGalaxy)


/* -------------------------------------------------------------------------- */
/*                             do not change here                             */
/* -------------------------------------------------------------------------- */
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

let cameraaspect = sizes.width / sizes.height;
const height = 200;
let camera = new THREE.OrthographicCamera(-height * cameraaspect, height * cameraaspect, height, -height, 1000, 2500);
camera.position.z = -1500;
scene.add(camera)

const helper = new THREE.GridHelper(1000, 40, 0x303030, 0x303030);
helper.position.y = -75;
// scene.add(helper);

let controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;
controls.enabled = false;
// controls.enabled = true;
// controls.target = new THREE.Vector3(0,0,0)

let renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

apple();

let easing = 0.12;
let xxx = 0;
let yyy = 0;


let tick = () => {
    let elapsedTime = clock.getElapsedTime()

    
    let dx = mousep.x - xxx;
    let dy = mousep.y - yyy;


    xxx = Math.abs(dx) > 0.05 ? xxx + dx * easing : mousep.x;
    yyy = Math.abs(dx) > 0.05 ? yyy + dy * easing : mousep.y;


    camera.position.x = xxx*1.2
    camera.position.y = yyy*1.2

    // updata material
    material.uniforms.uTime.value = elapsedTime
    material2.uniforms.uTime.value = elapsedTime
    material3.uniforms.uTime.value = elapsedTime
    material4.uniforms.uTime.value = elapsedTime
    material.uniforms.uMx.value = mousep
    material2.uniforms.uMx.value = mousep
    material4.uniforms.uMx.value = mousep
    material3.uniforms.uMx.value = mousep
    material.uniforms.c.value = colormode
    material2.uniforms.c.value = colormode
    material3.uniforms.c.value = colormode
    material4.uniforms.c.value = colormode

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)


    stats.update();

}

tick()

function onMouseMove(event) {
    // Update the mouse variable
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // Make the sphere follow the mouse
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    mousep = pos;
};