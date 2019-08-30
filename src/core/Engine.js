import {
    Fog,
    Mesh,
    Color,
    Clock,
    Scene,
    Vector2,
    Vector3,
    Vector4,
    Object3D,
    ArrayCamera,
    WebGLRenderer,
    TextureLoader,
    AnimationMixer,
    HemisphereLight,
    DirectionalLight,
    PerspectiveCamera,
    OrthographicCamera,
    MeshBasicMaterial,
    BoxBufferGeometry,
    PlaneBufferGeometry,
    MeshLambertMaterial,
    HemisphereLightHelper,
    DirectionalLightHelper,
    Euler,DataTexture, RGBFormat, NearestFilter, SpriteMaterial, Sprite
} from 'three'
import SkyDome from './SkyDome'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import PersonControls from './Controls/PersonControls'

class Engine {
    constructor() {
        this.updates = []

        this.clock = new Clock()

        this.scene = new Scene()
        this.sceneOrtho = new Scene()

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera = new PerspectiveCamera(30, width / height, 1, 5000)
        this.camera.position.set(0, 30, 250)

        this.camera2 = new PerspectiveCamera( 70, 1, 1, 1000 );
        this.camera2.position.set(0, 20, -70);
        this.camera2.lookAt(new Vector3())


        this.renderer = new WebGLRenderer({
            antialias: true
        })

        this.scene.background = new Color().setHSL(0.6, 0, 1)
        this.scene.fog = new Fog(this.scene.background, 1, 5000)

        this.hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6)
        this.hemiLight.color.setHSL(0.6, 1, 0.6)
        this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75)
        this.hemiLight.position.set(0, 50, 0)
        this.scene.add(this.hemiLight)

        this.hemiLightHelper = new HemisphereLightHelper(this.hemiLight, 10)
        this.scene.add(this.hemiLightHelper)

        this.dirLight = new DirectionalLight(0xffffff, 1)
        this.dirLight.color.setHSL(0.1, 1, 0.95)
        this.dirLight.position.set(- 1, 1.75, 1)
        this.dirLight.position.multiplyScalar(30)
        this.scene.add(this.dirLight)
        this.dirLight.castShadow = true
        this.dirLight.shadow.mapSize.width = 2048
        this.dirLight.shadow.mapSize.height = 2048

        const d = 50;
        this.dirLight.shadow.camera.left = - d
        this.dirLight.shadow.camera.right = d
        this.dirLight.shadow.camera.top = d
        this.dirLight.shadow.camera.bottom = - d
        this.dirLight.shadow.camera.far = 3500
        this.dirLight.shadow.bias = - 0.0001

        this.dirLightHeper = new DirectionalLightHelper(this.dirLight, 10)
        this.scene.add(this.dirLightHeper)



        const texture1 = new TextureLoader().load( 'textures/stone-gray.jpg')
        const geometry1 = new BoxBufferGeometry(50, 50, 50);
        const material1 = new MeshBasicMaterial({ map: texture1 })
        const mesh1 = new Mesh(geometry1, material1)
        mesh1.position.set(40, -10, -80);
        this.scene.add(mesh1)

        const texture2 = new TextureLoader().load( 'textures/stone-clean.jpg')
        const geometry2 = new BoxBufferGeometry(50, 50, 50);
        const material2 = new MeshBasicMaterial({ map: texture2 })
        const mesh2 = new Mesh(geometry2, material2)
        mesh2.position.set(50, -10, -180);
        this.scene.add(mesh2)

        const texture3 = new TextureLoader().load( 'textures/stone-wall.jpg')
        const geometry3 = new BoxBufferGeometry(50, 50, 50);
        const material3 = new MeshBasicMaterial({ map: texture3 })
        const mesh3 = new Mesh(geometry3, material3)
        mesh3.position.set(-50, -10, 180);
        this.scene.add(mesh3)


        // GROUND
        const groundGeo = new PlaneBufferGeometry(10000, 10000)
        const groundMat = new MeshLambertMaterial({ color: 0xffffff })
        groundMat.color.setHSL(0.095, 1, 0.75)
        const ground = new Mesh(groundGeo, groundMat)
        ground.position.y = - 33
        ground.rotation.x = - Math.PI / 2
        ground.receiveShadow = true
        this.scene.add(ground)

        // SKYDOME
        const sky = new SkyDome()
        this.scene.add(sky)

        this.mixers = []
        const loader = new GLTFLoader()
        loader.load('models/Soldier.glb', (gltf) => {

            const mesh = gltf.scene.children[0]
            const s = 0.20
            mesh.scale.set(s, s, s)
            mesh.position.y = - 33
            mesh.position.z = 10
            mesh.castShadow = true
            mesh.receiveShadow = true

            this.scene.add(mesh)

            const mixer = new AnimationMixer(mesh)
            mixer.clipAction(gltf.animations[1]).setDuration(1).play()
            this.mixers.push(mixer)

            this.controls = new PersonControls(mesh, this.camera, this.renderer.domElement)
            this.updates.push(this.controls)


            this.controls.getObject().add(mesh)
            this.scene.add(this.controls.getObject())
        })

        loader.load('models/Soldier.glb', (gltf) => {
            const mesh = gltf.scene.children[0]
            const s = 0.20
            mesh.scale.set(s, s, s)
            mesh.position.set(0, -33, 0)
            mesh.castShadow = true
            mesh.receiveShadow = true

            this.scene.add(mesh)

            const mixer = new AnimationMixer(mesh)
            mixer.clipAction(gltf.animations[3]).setDuration(1).play()
            this.mixers.push(mixer)
        })
    }

    /**
     *
     * @param {Element} container
     * @returns {Engine}
     */
    render(container) {
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        container.appendChild(this.renderer.domElement)

        this.renderer.gammaInput = true
        this.renderer.gammaOutput = true
        this.renderer.shadowMap.enabled = true

        window.addEventListener('resize', () => this.onWindowResize(), false )
        return this
    }

    /**
     *
     * @returns {Engine}
     */
    animate() {
        requestAnimationFrame(() => this.animate())

        const delta = this.clock.getDelta()

        for (const item of this.updates) {
            item.update(delta)
        }

        for (let i = 0; i < this.mixers.length; i ++) {
            this.mixers[i].update(delta)
        }

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        let left = Math.floor( 0 );
        let bottom = Math.floor( 0 );
        let width = Math.floor( windowWidth );
        let height = Math.floor( windowHeight );

        this.renderer.setViewport( left, bottom, width, height );
        this.renderer.setScissor( left, bottom, width, height );
        this.renderer.setScissorTest( true );
        this.renderer.setClearColor( new Color( 0.5, 0.5, 0.7 ) );
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.render(this.scene, this.camera)


        windowWidth = window.innerHeight;
        windowHeight = window.innerHeight;

        left = Math.floor( 0 );
        bottom = Math.floor( windowHeight - (windowHeight * 0.3) );
        width = Math.floor( windowWidth * 0.3 );
        height = Math.floor( windowHeight * 0.3 );

        this.renderer.setViewport( left, bottom, width, height );
        this.renderer.setScissor( left, bottom, width, height );
        this.renderer.setScissorTest( true );
        this.renderer.setClearColor( new Color( 0.5, 0.5, 0.7 ) );
        this.camera2.aspect = width / height;

        this.camera2.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera2)
        return this
    }

    onWindowResize() {
        // this.camera.aspect = window.innerWidth / window.innerHeight
        // this.camera.updateProjectionMatrix()
        // this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
}

export default Engine