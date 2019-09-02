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
    MeshPhongMaterial,
    BoxBufferGeometry,
    PlaneBufferGeometry,
    MeshLambertMaterial,
    HemisphereLightHelper,
    DirectionalLightHelper,
    Euler,DataTexture, RGBFormat,
    NearestFilter, SpriteMaterial, Sprite,
    FrontSide, BackSide, DoubleSide, RepeatWrapping, MirroredRepeatWrapping,ClampToEdgeWrapping,
    AmbientLight,
    PointLight
} from 'three'
import SkyDome from './SkyDome'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import PersonControls from './Controls/PersonControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
import Shape from './Helpers/Shape'

const gui = new GUI();

class Engine {
    constructor() {
        this.updates = []

        this.stats = new Stats()

        this.clock = new Clock()

        this.scene = new Scene()

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera = new PerspectiveCamera(40, width / height, 1, 5000)
        this.camera.position.set(0, 30, 250)

        this.camera2 = new PerspectiveCamera(30, 1, 1, 5000);
        this.camera2.position.set(-200, 600, -200);
        this.camera2.lookAt(new Vector3())

        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true
        })

        this.scene.background = new Color().setHSL(0.6, 0, 1)
        this.scene.fog = new Fog(this.scene.background, 1, 3000)

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

        // CUBES
        const counts = 5
        for (let i = - counts; i < counts; i++) {
            for (let a = - counts; a < counts; a++) {
                const shape = new Shape()
                    .setTextureMaterial('textures/1.png')
                    .setPositionY(50 / 2)
                    .setPositionX(i * 250)
                    .setPositionZ(a * 250)
                    .cube(50)
                this.scene.add(shape)
            }
        }


        // GROUND
        const ground = new Shape().setTextureMaterial('textures/2.png', 50, 50, true).ground(5000, 5000)
        this.scene.add(ground)

        // SKYDOME
        this.sky = new SkyDome()
        this.scene.add(this.sky)



        this.mixers = []

        // PERSON
        const loader = new GLTFLoader()
        loader.load('models/Soldier.glb', (gltf) => {

            const mesh = gltf.scene.children[0]
            const s = 0.20
            mesh.scale.set(s, s, s)
            mesh.position.y = 0
            // mesh.position.z = 10
            mesh.castShadow = true
            mesh.receiveShadow = true

            this.scene.add(mesh)

            const mixer = new AnimationMixer(mesh)
            // mixer.clipAction(gltf.animations[0]).setDuration(0.6).play()
            this.mixers.push(mixer)

            this.controls = new PersonControls(mesh, this.camera, this.renderer.domElement)
            this.updates.push(this.controls)

            const idleAction = mixer.clipAction(gltf.animations[ 0 ]);
            const runAction = mixer.clipAction(gltf.animations[ 1 ]);
            const actions = [idleAction, runAction]

            activateAllActions()

            function prepareCrossFade( startAction, endAction, duration ) {
                unPauseAllActions();
                // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
                // else wait until the current action has finished its current loop
                if ( startAction === idleAction ) {
                    executeCrossFade( startAction, endAction, duration );
                } else {
                    synchronizeCrossFade( startAction, endAction, duration );
                }
            }

            function activateAllActions() {
                setWeight( idleAction, 1 );
                setWeight( runAction, 0 );

                actions.forEach( function ( action ) {
                    action.play();
                } );
            }

            function unPauseAllActions() {
                actions.forEach( function ( action ) {
                    action.paused = false;
                } );
            }

            function executeCrossFade( startAction, endAction, duration ) {
                // Not only the start action, but also the end action must get a weight of 1 before fading
                // (concerning the start action this is already guaranteed in this place)
                setWeight( endAction, 1 );
                endAction.time = 0;
                // Crossfade with warping - you can also try without warping by setting the third parameter to false
                startAction.crossFadeTo( endAction, duration, true );
            }

            function setWeight( action, weight ) {
                action.enabled = true;
                action.setEffectiveTimeScale( 1 );
                action.setEffectiveWeight( weight );
            }

            function synchronizeCrossFade( startAction, endAction, duration ) {
                mixer.addEventListener( 'loop', onLoopFinished );
                function onLoopFinished( event ) {
                    if ( event.action === startAction ) {
                        mixer.removeEventListener( 'loop', onLoopFinished );
                        executeCrossFade( startAction, endAction, duration );
                    }
                }
            }

            this.controls.addEventListener('change-animation', (event) => {
                switch (event.animation) {
                    case 'idle':
                        prepareCrossFade( runAction, idleAction, 0.2 );
                        break
                    case 'run':
                        prepareCrossFade( idleAction, runAction, 0.2 );
                        break
                }
            })


            const eulerCamera = new Euler( 0, 0, 0, 'YXZ' );

            this.updates.push({
                update: () => {
                    const o = this.controls.getObject()

                    const v = this.controls.getDirection(new Vector3()).multiplyScalar(-10)
                    const p = o.position.clone().add(v)
                    mesh.position.x = p.x
                    mesh.position.z = p.z
                    mesh.position.y = p.y - 45

                    eulerCamera.setFromQuaternion( o.quaternion );
                    eulerCamera.x = - Math.PI / 2
                    mesh.quaternion.setFromEuler(eulerCamera);


                    this.camera2.lookAt(mesh.position)
                    this.sky.position.copy(o.position)
                }
            })

            this.scene.add(this.controls.getObject())
        })









        /*loader.load('models/Soldier.glb', (gltf) => {
            const mesh = gltf.scene.children[0]
            const s = 0.20
            mesh.scale.set(s, s, s)
            mesh.position.set(55, -33, 55)
            mesh.castShadow = true
            mesh.receiveShadow = true

            this.scene.add(mesh)

            const mixer = new AnimationMixer(mesh)
            this.mixers.push(mixer)

            const idleAction = mixer.clipAction(gltf.animations[ 0 ]);
            const walkAction = mixer.clipAction(gltf.animations[ 3 ]);
            const runAction = mixer.clipAction(gltf.animations[ 1 ]);
            const actions = [idleAction, walkAction, runAction]

            activateAllActions()

            const settings = {
                'from walk to idle': function () {
                    prepareCrossFade( walkAction, idleAction, 0.2 );
                },
                'from idle to walk': function () {
                    prepareCrossFade( idleAction, walkAction, 0.2 );
                },
                'from walk to run': function () {
                    prepareCrossFade( walkAction, runAction, 0.2 );
                },
                'from run to walk': function () {
                    prepareCrossFade( runAction, walkAction, 0.2 );
                },
                'from run to idle': function () {
                    prepareCrossFade( runAction, idleAction, 0.2 );
                },
                'from idle to run': function () {
                    prepareCrossFade( idleAction, runAction, 0.2 );
                },
            }

            const folderPerson = gui.addFolder('Person')
            folderPerson.add(settings, 'from walk to idle')
            folderPerson.add(settings, 'from idle to walk')
            folderPerson.add(settings, 'from idle to run')
            folderPerson.add(settings, 'from walk to run')
            folderPerson.add(settings, 'from run to walk')
            folderPerson.add(settings, 'from run to idle')

            function prepareCrossFade( startAction, endAction, duration ) {
                unPauseAllActions();
                // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
                // else wait until the current action has finished its current loop
                if ( startAction === idleAction ) {
                    executeCrossFade( startAction, endAction, duration );
                } else {
                    synchronizeCrossFade( startAction, endAction, duration );
                }
            }

            function activateAllActions() {
                setWeight( idleAction, 1 );
                setWeight( walkAction, 0 );
                setWeight( runAction, 0 );

                actions.forEach( function ( action ) {
                    action.play();
                } );
            }

            function unPauseAllActions() {
                actions.forEach( function ( action ) {
                    action.paused = false;
                } );
            }

            function executeCrossFade( startAction, endAction, duration ) {
                // Not only the start action, but also the end action must get a weight of 1 before fading
                // (concerning the start action this is already guaranteed in this place)
                setWeight( endAction, 1 );
                endAction.time = 0;
                // Crossfade with warping - you can also try without warping by setting the third parameter to false
                startAction.crossFadeTo( endAction, duration, true );
            }

            function setWeight( action, weight ) {
                action.enabled = true;
                action.setEffectiveTimeScale( 1 );
                action.setEffectiveWeight( weight );
            }

            function synchronizeCrossFade( startAction, endAction, duration ) {
                mixer.addEventListener( 'loop', onLoopFinished );
                function onLoopFinished( event ) {
                    if ( event.action === startAction ) {
                        mixer.removeEventListener( 'loop', onLoopFinished );
                        executeCrossFade( startAction, endAction, duration );
                    }
                }
            }
        })*/







        // for (let i = 0; i < 3; i++) {
        //     for (let a = 0; a < 6; a++) {
        //
        //         loader.load('models/Soldier.glb', (gltf) => {
        //             const mesh = gltf.scene.children[0]
        //             const s = 0.20
        //             mesh.scale.set(s, s, s)
        //             mesh.position.set((i * 20 - 20), 0, a * 40)
        //             mesh.castShadow = true
        //             mesh.receiveShadow = true
        //
        //             this.scene.add(mesh)
        //
        //             const mixer = new AnimationMixer(mesh)
        //             mixer.clipAction(gltf.animations[0]).setDuration(1).play()
        //             this.mixers.push(mixer)
        //         })
        //
        //     }
        // }













        const folder = gui.addFolder('Small camera')
        folder.add(this.camera2.position, 'x', -500, 500)
        folder.add(this.camera2.position, 'y', 100, 1000)
        folder.add(this.camera2.position, 'z', -500, 500)

    }

    /**
     *
     * @param {Element} container
     * @returns {Engine}
     */
    render(container) {

        container.appendChild(this.stats.dom)

        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        container.appendChild(this.renderer.domElement)

        this.renderer.autoClear = false;
        this.renderer.gammaInput = true
        this.renderer.gammaOutput = true
        // this.renderer.shadowMap.enabled = true

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

        this.renderer.clear();
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
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera2)

        this.stats.update()
        return this
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
}

export default Engine