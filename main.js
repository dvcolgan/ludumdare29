function createDieFaceTexture(faceSize, pips, pipColor, faceColor) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = faceSize;
    canvas.height = faceSize;
    var pipRadius = faceSize/9;
    var pipOffset = faceSize/4;
    ctx.fillStyle = faceColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = pipColor;

    var pipFns = {
        makeULPip: function() {
            ctx.beginPath();
            ctx.arc(pipOffset, pipOffset, pipRadius, 0, Math.PI*2);
            ctx.fill();
        },
        makeURPip: function() {
            ctx.beginPath();
            ctx.arc(faceSize - pipOffset, pipOffset, pipRadius, 0, Math.PI*2);
            ctx.fill();
        },
        makeLLPip: function() {
            ctx.beginPath();
            ctx.arc(pipOffset, faceSize - pipOffset, pipRadius, 0, Math.PI*2);
            ctx.fill();
        },
        makeLRPip: function() {
            ctx.beginPath();
            ctx.arc(faceSize - pipOffset, faceSize - pipOffset, pipRadius, 0, Math.PI*2);
            ctx.fill();
        },
        makeCenterPip: function() {
            ctx.beginPath();
            ctx.arc(faceSize/2, faceSize/2, pipRadius, 0, Math.PI*2);
            ctx.fill();
        },
        makeCenterLPip: function() {
            ctx.beginPath();
            ctx.arc(pipOffset, faceSize/2, pipRadius, 0, Math.PI*2);
            ctx.fill();
        },
        makeCenterRPip: function() {
            ctx.beginPath();
            ctx.arc(faceSize - pipOffset, faceSize/2, pipRadius, 0, Math.PI*2);
            ctx.fill();
        }
    };
    if (pips === 1) {
        pipFns.makeCenterPip();
    }
    else if (pips === 2) {
        pipFns.makeLLPip();
        pipFns.makeURPip();
    }
    else if (pips === 3) {
        pipFns.makeLLPip();
        pipFns.makeCenterPip();
        pipFns.makeURPip();
    }
    else if (pips === 4) {
        pipFns.makeLLPip();
        pipFns.makeLRPip();
        pipFns.makeULPip();
        pipFns.makeURPip();
    }
    else if (pips === 5) {
        pipFns.makeLLPip();
        pipFns.makeLRPip();
        pipFns.makeCenterPip();
        pipFns.makeULPip();
        pipFns.makeURPip();
    }
    else if (pips === 6) {
        pipFns.makeLLPip();
        pipFns.makeLRPip();
        pipFns.makeCenterLPip();
        pipFns.makeCenterRPip();
        pipFns.makeULPip();
        pipFns.makeURPip();
    }
        
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createDie() {
    var materials = [];
    var pipCounts = [1, 6, 3, 4, 2, 5];
    for (var i=0; i <6; i++) {
        materials.push(new THREE.MeshLambertMaterial({
            color: 0xdddddd,
            shading: THREE.FlatShading,
            map: createDieFaceTexture(256, pipCounts[i], '#ffffff', '#880000')
        }));
        //materials.push(new THREE.MeshPhongMaterial({
        //    map: createDieFaceTexture(256, pipCounts[i], '#ffffff', '#000000'),
        //    specular: '#a9fcff',
        //    color: '#ffffff',
        //    emissive: '#000000',
        //    shininess: 100,
        //    shading: THREE.FlatShading,
        //}));
    }
    var mesh = new THREE.Mesh(
        new THREE.CubeGeometry(100, 100, 100),
        new THREE.MeshFaceMaterial(materials)
    );
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    mesh.position.y += 50;

    var die = new Die();
    die.mesh = mesh;
    return die;
}

var Die = Class.extend({
    init: function() {
    },

    rotateToShowNumber: function(number) {
        if (number === 1) {
            this.mesh.rotation.set(0, 0, Math.PI/2);
        }
        if (number === 2) {
            this.mesh.rotation.set(-Math.PI/2, 0, 0);
        }
        if (number === 3) {
            this.mesh.rotation.set(0, 0, 0);
        }
        if (number === 4) {
            this.mesh.rotation.set(Math.PI, 0, 0);
        }
        if (number === 5) {
            this.mesh.rotation.set(Math.PI/2, 0, 0);
        }
        if (number === 6) {
            this.mesh.rotation.set(0, 0, -Math.PI/2);
        }
    }
});

function createBaseplate(scene) {
    for (var x=0; x<10; x++) {
        for (var z=0; z<10; z++) {
            if (x > z) continue;
            var cube = new THREE.Mesh(
                new THREE.CubeGeometry(100, 100, 100),
                new THREE.MeshLambertMaterial({ color: 0x444444 })
            );

            cube.position.y += 100;
            cube.position.x = x * Math.sqrt(2) * 100 - 50 * z;
            cube.position.z = z * Math.sqrt(2) * 100;
            cube.rotation.x += Math.PI / 4;
            cube.rotation.y += Math.PI / 4;
            scene.add(cube);
        }
    }
};

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


var ambient = new THREE.AmbientLight( 0x444444 );
scene.add( ambient );

light = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 1 );
light.position.set(300, 1500, 300);
light.target.position.set(0, 0, 0);

light.castShadow = true;

light.shadowCameraNear = 1200;
light.shadowCameraFar = 2500;
light.shadowCameraFov = 50;

//light.shadowCameraVisible = true;

light.shadowBias = 0.0001;
light.shadowDarkness = 0.3;

light.shadowMapWidth = 1024;
light.shadowMapHeight = 1024;

scene.add( light );

floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000, 10, 10),
    new THREE.MeshLambertMaterial({ color: 0x118811 })
);
floor.castShadow = false;
floor.receiveShadow = true;
scene.add(floor);
floor.rotation.x = -Math.PI / 2;

for (var z=0; z<4; z++) {
    for (var x=0; x<4; x++) {
        var die = createDie();
        die.mesh.position.x = x * 200 - 300;
        die.mesh.position.z = z * 200 - 300;
        die.rotateToShowNumber(Math.ceil(Math.random() * 6));
        scene.add(die.mesh);
    }
}

createBaseplate(scene);

controls = new THREE.OrbitControls(camera);
//controls.addEventListener('change', render);
camera.position.z = 100;
camera.position.y = 800;
camera.position.x = 0;
camera.lookAt(new THREE.Vector3(0, 0, 0));
var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};
requestAnimationFrame(render);
