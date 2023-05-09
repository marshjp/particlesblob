import*as e from"three";class r extends e.Material{constructor(r){if(!r)throw new Error("Options object must be provided.");r.uniforms||(r.uniforms={}),r.passthrough||(r.passthrough={});const o=new e[r.baseMaterial](r.passthrough);super();for(const e in o)void 0===this[e]&&(this[e]=0);this.setValues(o);const s=/\/\*[\s\S]*?\*\/|\/\/.*/g;this.onBeforeCompile=e=>{var o,i,a,t,l,d;e.vertexShader=n("vert",e.vertexShader,{defines:null===(o=r.vShader.defines)||void 0===o?void 0:o.replace(s,""),header:null===(i=r.vShader.header)||void 0===i?void 0:i.replace(s,""),main:null===(a=r.vShader.main)||void 0===a?void 0:a.replace(s,"")}),r.fShader&&(e.fragmentShader=n("frag",e.fragmentShader,{defines:null===(t=r.fShader.defines)||void 0===t?void 0:t.replace(s,""),header:null===(l=r.fShader.header)||void 0===l?void 0:l.replace(s,""),main:null===(d=r.fShader.main)||void 0===d?void 0:d.replace(s,"")})),e.uniforms=Object.assign(Object.assign({},e.uniforms),r.uniforms),this.uniforms=e.uniforms,this.needsUpdate=!0}}}function n(e,r,n){const{defines:o="",header:s="",main:i=""}=n;let a=r,t=i.includes("csm_Position")?"csm_Position":"position",l=i.includes("csm_Normal")?"csm_Normal":"normal",d=i.includes("csm_DiffuseColor")?"diffuseColor = csm_DiffuseColor":"";i.includes("newPos")&&(t="newPos"),i.includes("newNormal")&&(l="newNormal"),i.includes("newColor")&&(d="diffuseColor = newColor");const c="vert"===e?{"#include <defaultnormal_vertex>":`\n          vec3 transformedNormal = ${l};\n          `,"#include <project_vertex>":`\n          transformed = ${t};\n          #include <project_vertex>\n        `}:{"#include <color_fragment>":`\n          #include <color_fragment>\n          ${d};\n    `};return Object.keys(c).forEach((e=>{var r,n;r=e,n=c[e],a=a.split(r).join(n)})),a=a.replace("void main() {",`\n      ${s}\n      void main() {\n        vec3 csm_Position;\n        vec3 csm_Normal;\n        vec4 csm_DiffuseColor;\n        ${i}\n      `),`\n      ${o}\n      ${a}\n    `}const o={NORMAL:"MeshNormalMaterial",BASIC:"MeshBasicMaterial",PHONG:"MeshPhongMaterial",MATCAP:"MeshMatcapMaterial",TOON:"MeshToonMaterial",PHYSICAL:"MeshPhysicalMaterial",LAMBERT:"MeshLambertMaterial",DEPTH:"MeshDepthMaterial",POINTS:"PointsMaterial"};export{r as CustomShaderMaterial,o as TYPES};
