import * as THREE from 'three';
import { gsap } from 'gsap';
import ballSprite from '../assets/images/circle-sprite.png'
import Perlin from 'perlin.js'
Perlin.seed(Math.random()); //https://www.npmjs.com/package/perlin.js

//MAGIC BALL ANIMATION
class ScrollStage {
    constructor() {

        this.canvasWrapper = document.querySelector('.canvas');

        this.viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        }

        this.mouse = {
            x: 0,
            y: 0
        }

        this.settings = {
            speed: 0.2,
            density: 2,
            strength: 0.2,
        }

        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setClearColor(0x000000)

        this.canvas = this.renderer.domElement

        this.camera = new THREE.PerspectiveCamera(
            45,
            this.viewport.width / this.viewport.height,
            .1,
            1000
        )

        this.clock = new THREE.Clock()

        this.step = 0;

        this.noiseAmount = 4;

        //LIGHT
        // this.ambientLight = new THREE.AmbientLight(0x6ff7fc, 1);
        // this.scene.add(this.ambientLight);

        // //DIRECTIONAL LIGHT TO REPRESENT THE MOON LIGHT IN THE SKY
        // this.directionalLight = new THREE.SpotLight(0x6ff7fc, 1);
        // this.directionalLight.position.set(0, 10, 25);
        // this.scene.add(this.directionalLight);

        // this.directionalLight2 = new THREE.SpotLight(0x6ff7fc, 1);
        // this.directionalLight2.position.set(0, 0, -25);
        // this.scene.add(this.directionalLight2);

        // const spotLightHelper = new THREE.SpotLightHelper(this.directionalLight);
        // this.scene.add(spotLightHelper);

        // const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x6ff7fc, 1);
        // hemisphereLight.position.set(0, 10, 0);
        // // this.scene.add(hemisphereLight);

        // const hemisophereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight);
        // // this.scene.add(hemisophereLightHelper);

        this.init()
    }

    init() {
        this.addCanvas()
        this.addCamera()
        this.addMesh()
        this.addColors()
        this.addEventListeners()
        this.onResize()
        this.update()
    }

    /**
     * STAGE
     */
    addCanvas() {
        this.canvas.classList.add('webgl')
        this.canvasWrapper.appendChild(this.canvas)
    }

    addCamera() {
        this.camera.position.set(0, 0, 25)
        this.scene.add(this.camera)
    }

    /**
     * OBJECT
     */
    addMesh() {
        this.geometry = new THREE.IcosahedronGeometry(2.2, 15)
        // this.geometry = new THREE.SphereGeometry(1, 100, 100);
        this.material = new THREE.PointsMaterial({
            size: 0.5,
            // color: 0x1d123c,
            // color: 0x6ff7fc,
            map: new THREE.TextureLoader().load(ballSprite),
            blending: THREE.CustomBlending,
            transparent: true,
            depthWrite: false,
            vertexColors: true,
        });

        this.sphereVerticesArray = [];
        this.sphereVerticesNormArray = [];
        for (let v = 0; v < this.geometry.vertices.length; v++) {
            let vertex = this.geometry.vertices[v];
            let vec = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
            this.sphereVerticesArray.push(vec);
            let mag = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
            mag = Math.sqrt(mag);
            let norm = new THREE.Vector3(vertex.x / mag, vec.y / mag, vec.z / mag);
            this.sphereVerticesNormArray.push(norm);
        }

        this.mesh = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    addColors() {
        // for (let i = 0; i < this.geometry.vertices.length / 4; i++) {
        //     this.geometry.colors.push(new THREE.Color(0x6ff7fc))
        // }
        for (let i = 0; i < this.geometry.vertices.length; i++) {
            if (i % 2 === 0) {
                this.geometry.colors.push(new THREE.Color(0x300d5e))
            } else if (i % 10 === 0) {
                this.geometry.colors.push(new THREE.Color(0x850061))
            } else {
                this.geometry.colors.push(new THREE.Color(0x6ff7fc))
            }
        }
    }

    /**
     * EVENTS
     */
    addEventListeners() {
        window.addEventListener('load', this.onLoad.bind(this))

        window.addEventListener('mousemove', this.onMouseMove.bind(this))  // enable for soundcheck (→ console)

        window.addEventListener('resize', this.onResize.bind(this))
    }

    onLoad() {
        document.body.classList.remove('loading')
    }

    onMouseMove(event) {
        // play with it!
        // enable / disable / change x, y, multiplier …

        this.mouse.x = (event.clientX / this.viewport.width).toFixed(2) * 4
        this.mouse.y = (event.clientY / this.viewport.height).toFixed(2) * 2

        gsap.to(this.mesh.rotation, { y: ((this.mouse.x)) / 2 })
        gsap.to(this.mesh.rotation, { x: ((this.mouse.y)) / 2 })

        // console.info(`X: ${this.mouse.x}  |  Y: ${this.mouse.y}`)
    }

    onResize() {
        this.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        this.camera.aspect = this.canvasWrapper.clientWidth / this.canvasWrapper.clientHeight
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.canvasWrapper.clientWidth, this.canvasWrapper.clientHeight)
        // this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    }

    /**
     * LOOP
     */
    update() {
        requestAnimationFrame(this.update.bind(this))
        this.render()
    }

    /**
     * RENDER
     */
    render() {

        // this.mesh.rotation.z += 0.001;
        this.mesh.rotation.x += 0.001;

        this.step += 0.09;

        // Update uniforms
        for (var i = 0; i < this.geometry.vertices.length; i += 1) {
            let vertex = this.geometry.vertices[i];

            // this.sphereVerticesArray.push(vertex);
            let value = Perlin.perlin3((vertex.x + this.step) / 5, vertex.y / 5, vertex.z / 5);
            value = Math.abs(1 - value);
            vertex.x = this.sphereVerticesArray[i].x + this.sphereVerticesNormArray[i].x * value * this.noiseAmount;
            vertex.y = this.sphereVerticesArray[i].y + this.sphereVerticesNormArray[i].y * value * this.noiseAmount;
            vertex.z = this.sphereVerticesArray[i].z + this.sphereVerticesNormArray[i].z * value * this.noiseAmount;

        }
        this.geometry.computeFaceNormals();
        this.geometry.computeVertexNormals();

        this.geometry.verticesNeedUpdate = true;

        this.renderer.render(this.scene, this.camera)
    }
}

new ScrollStage()