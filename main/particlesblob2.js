import * as THREE from 'three';
// import perlinNoise3D from 'perlin-noise-3d';
import { CustomShaderMaterial, TYPES } from '../test/cdn';
// import { loadShadersCSM, Simplex, Curl } from '../test/noise';
import diskImage from '../assets/images/circle-sprite.png';

class PerlinBlob {
    constructor() {

        this.canvasWrapper = document.querySelector('.canvas');

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            45,
            this.canvasWrapper.clientWidth / this.canvasWrapper.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 10);
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(this.canvasWrapper.clientWidth, this.canvasWrapper.clientHeight);
        this.renderer.domElement.classList.add('webgl');
        this.canvasWrapper.appendChild(this.renderer.domElement);


        this.clock = new THREE.Clock()

        this.targetPos = new THREE.Vector3();

        // this.diskSprite = new THREE.TextureLoader().load(diskImage)

        this.init()
    }

    addObject() {
        // this.chunks = [Simplex, Curl];
        this.vertexDefs = {
            defines: ``,
            header: `
            varying vec3 vNormal;
  
            uniform float uTime;
            uniform float uSpeed;
            uniform float uNoiseDensity;
            uniform float uNoiseStrength;


vec3 mod289(vec3 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise, periodic variant
  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
  }
                            `,
            main: `
            float t = uTime * uSpeed;
    float distortion = pnoise((normal + t) * uNoiseDensity, vec3(10.0)) * uNoiseStrength;

    vec3 pos = position + (normal * distortion);
    
    vNormal = normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
`
        }
        // this.vertexShader =  loadShadersCSM(this.vertexDefs, this.chunks);

        this.geometry = new THREE.IcosahedronGeometry(3, 10);
        // this.mat = new THREE.PointsMaterial({ color: 0x000000, size: 0.1 });
        this.mat = new CustomShaderMaterial({
            baseMaterial: TYPES.POINTS,
            vShader: {
                defines: this.vertexDefs.defines,
                header: this.vertexDefs.header,
                main: this.vertexDefs.main
            },
            fShader:
            {
                defines: ``,
                header: `
                varying vec3 vNormal;
  
                uniform float uTime;
                `,
                main: `
                vec3 color = vec3(1.0);
    
                gl_FragColor = vec4(vNormal, 1.0);
                `
            },
            uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: 0.2 },
                uNoiseDensity: { value: 2 },
                uNoiseStrength: { value: 0.2 },
                // uShift: {
                //     value: 0,
                // },
                // uShape: {
                //     value: this.diskSprite,
                // },
                // uScale: {
                //     value: window.innerHeight / 2,
                // },
                // uTime: {
                //     value: 0,
                // },
                // uTargetPos: {
                //     value: new THREE.Vector3(0),
                // },
            },
            passthrough: {
                // color: 0xf38ba0,
                size: 0.1,
            }
        });
        this.mesh = new THREE.Points(this.geometry, this.mat);
        this.geometry.verticesNeedUpdate = true;
        this.scene.add(this.mesh);
    }

    init() {
        this.addObject()
        this.animate()
    }

    animate() {
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.animate.bind(this));
        this.render()
    }

    render() {
        // this.mesh.rotation.x += 0.01;
        this.mesh.rotation.z += 0.005;

        // console.log(this.mesh.material);

        if (this.mesh.material) {
            console.log(this.mesh.material.uniforms.uTime.value);
            this.mesh.material.uniforms.uTime.value = this.clock.getElapsedTime();
            this.mat.uniforms.uSpeed.value = 0.2
            this.mat.uniforms.uNoiseDensity.value = 2
            this.mat.uniforms.uNoiseStrength.value = 0.2
        }

        this.renderer.render(this.scene, this.camera);

    }


}

new PerlinBlob()