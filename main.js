import * as THREE from './three.module.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { SVGLoader } from './jsm/loaders/SVGLoader.js';

let renderer, scene, camera, gui, guiData;

init();
animate();

function init() {
    const container = document.getElementById( 'character' );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 0, 0, 200 );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.screenSpacePanning = true;

    window.addEventListener( 'resize', onWindowResize );

    guiData = {
        currentURL: 'images/suapapa_face_color.svg',
        drawFillShapes: true,
        drawStrokes: true,
    };

    loadSVG( guiData.currentURL );
}


function loadSVG( url ) {
    scene = new THREE.Scene();
    const loader = new SVGLoader();

    loader.load( url, function ( data ) {
        const paths = data.paths;

        const group = new THREE.Group();
        group.scale.multiplyScalar( 0.25 );
        group.position.x = - 70;
        group.position.y = 70;
        group.scale.y *= - 1;

        for ( let i = 0; i < paths.length; i ++ ) {

            const path = paths[ i ];

            const fillColor = path.userData.style.fill;
            if ( guiData.drawFillShapes && fillColor !== undefined && fillColor !== 'none' ) {

                const material = new THREE.MeshBasicMaterial( {
                    color: new THREE.Color().setStyle( fillColor ),
                    opacity: path.userData.style.fillOpacity,
                    transparent: path.userData.style.fillOpacity < 1,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    wireframe: false
                } );

                const shapes = SVGLoader.createShapes( path );

                for ( let j = 0; j < shapes.length; j ++ ) {

                    const shape = shapes[ j ];

                    const geometry = new THREE.ShapeGeometry( shape );
                    const mesh = new THREE.Mesh( geometry, material );

                    group.add( mesh );

                }

            }

            const strokeColor = path.userData.style.stroke;

            if ( guiData.drawStrokes && strokeColor !== undefined && strokeColor !== 'none' ) {

                const material = new THREE.MeshBasicMaterial( {
                    color: new THREE.Color().setStyle( strokeColor ),
                    opacity: path.userData.style.strokeOpacity,
                    transparent: path.userData.style.strokeOpacity < 1,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    wireframe: false
                } );

                for ( let j = 0, jl = path.subPaths.length; j < jl; j ++ ) {

                    const subPath = path.subPaths[ j ];

                    const geometry = SVGLoader.pointsToStroke( subPath.getPoints(), path.userData.style );

                    if ( geometry ) {

                        const mesh = new THREE.Mesh( geometry, material );

                        group.add( mesh );

                    }

                }

            }

        }
        scene.add( group );
    } );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    renderer.render( scene, camera );
}