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



//var dice_box = function(container) {
//    this.w = container.clientWidth / 2;
//    this.h = container.clientHeight / 2;
//    that.scale = Math.sqrt(this.w * this.w + this.h * this.h) / 13;
//
//    this.renderer = window.WebGLRenderingContext
//        ? new THREE.WebGLRenderer({ antialias: true })
//        : new THREE.CanvasRenderer({ antialias: true });
//    this.renderer.setSize(this.w * 2, this.h * 2);
//    this.renderer.shadowMapEnabled = true;
//    this.renderer.shadowMapSoft = true;
//
//    this.dices = [];
//    this.scene = new THREE.Scene();
//    this.world = new CANNON.World();
//
//    container.appendChild(this.renderer.domElement);
//
//    this.world.gravity.set(0, 0, -9.8 * 800);
//    this.world.broadphase = new CANNON.NaiveBroadphase();
//    this.world.solver.iterations = 10;
//
//    var wh = this.h / Math.tan(10 * Math.PI / 180);
//    this.camera = new THREE.PerspectiveCamera(20, this.w / this.h, 1, wh * 1.3);
//    this.camera.position.z = wh;
//
//    var ambientLight = new THREE.AmbientLight(0xf0f0f0);
//    this.scene.add(ambientLight);
//    var mw = Math.max(this.w, this.h);
//    var light = new THREE.SpotLight(0xffffff);
//    light.position.set(-mw / 2, mw / 2, mw * 2);
//    light.target.position.set(0, 0, 0);
//    light.castShadow = true;
//    light.shadowCameraNear = mw / 10;
//    light.shadowCameraFar = mw * 3;
//    light.shadowCameraFov = 50;
//    light.shadowBias = 0.001;
//    light.shadowDarkness = 0.3;
//    light.shadowMapWidth = 1024;
//    light.shadowMapHeight = 1024;
//    this.scene.add(light);
//
//    this.dice_body_material = new CANNON.Material();
//    var desk_body_material = new CANNON.Material();
//    var barrier_body_material = new CANNON.Material();
//    this.world.addContactMaterial(new CANNON.ContactMaterial(
//                desk_body_material, this.dice_body_material, 0.01, 0.5));
//    this.world.addContactMaterial(new CANNON.ContactMaterial(
//                barrier_body_material, this.dice_body_material, 0, 1.0));
//    this.world.addContactMaterial(new CANNON.ContactMaterial(
//                this.dice_body_material, this.dice_body_material, 0, 0.5));
//
//    this.desk = new THREE.Mesh(new THREE.PlaneGeometry(this.w * 2, this.h * 2, 1, 1), 
//            new THREE.MeshLambertMaterial({ color: 0xffffff }));
//    this.desk.receiveShadow = true;
//    this.scene.add(this.desk);
//
//    this.world.add(new CANNON.RigidBody(0, new CANNON.Plane(), desk_body_material));
//    var barrier;
//    barrier = new CANNON.RigidBody(0, new CANNON.Plane(), barrier_body_material);
//    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
//    barrier.position.set(0, this.h * 0.93, 0);
//    this.world.add(barrier);
//
//    barrier = new CANNON.RigidBody(0, new CANNON.Plane(), barrier_body_material);
//    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
//    barrier.position.set(0, -this.h * 0.93, 0);
//    this.world.add(barrier);
//
//    barrier = new CANNON.RigidBody(0, new CANNON.Plane(), barrier_body_material);
//    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
//    barrier.position.set(this.w * 0.93, 0, 0);
//    this.world.add(barrier);
//
//    barrier = new CANNON.RigidBody(0, new CANNON.Plane(), barrier_body_material);
//    barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
//    barrier.position.set(-this.w * 0.93, 0, 0);
//    this.world.add(barrier);
//
//    this.last_time = 0;
//    this.running = false;
//
//    this.renderer.render(this.scene, this.camera);
//}
//
//this.dice_box.prototype.create_dice = function(type, pos, velocity, angle) {
//    var dice = that['create_' + type]();
//    dice.castShadow = true;
//    dice.dice_type = type;
//    dice.body = new CANNON.RigidBody(that.dice_mass[type],
//            dice.geometry.cannon_shape, this.dice_body_material);
//    dice.body.position.set(pos.x, pos.y, pos.z);
//    dice.body.quaternion.setFromAxisAngle(new CANNON.Vec3(rnd(), rnd(), rnd()), rnd() * Math.PI * 2);
//    dice.body.angularVelocity.set(angle.x, angle.y, angle.z);
//    dice.body.velocity.set(velocity.x, velocity.y, velocity.z);
//    dice.body.linearDamping = 0.1;
//    dice.body.angularDamping = 0.1;
//    this.scene.add(dice);
//    this.dices.push(dice);
//    this.world.add(dice.body);
//}
//
//this.dice_box.prototype.check = function() {
//    var res = true;
//    var e = 4;
//    var time = (new Date()).getTime();
//    if (time - this.running < 10000) {
//        for (var i = 0; i < this.dices.length; ++i) {
//            var dice = this.dices[i];
//            if (dice.dice_stopped == true) continue;
//            var a = dice.body.angularVelocity, v = dice.body.velocity;
//            if (Math.abs(a.x) < e && Math.abs(a.y) < e && Math.abs(a.z) < e &&
//                    Math.abs(v.x) < e && Math.abs(v.y) < e && Math.abs(v.z) < e) {
//                if (dice.dice_stopped) {
//                    if (time - dice.dice_stopped > 100) {
//                        dice.dice_stopped = true;
//                        continue;
//                    }
//                }
//                else dice.dice_stopped = (new Date()).getTime();
//                res = false;
//            }
//            else {
//                dice.dice_stopped = undefined;
//                res = false;
//            }
//        }
//    }
//    if (res) {
//        this.running = false;
//        var values = [];
//        for (var i in this.dices) {
//            var dice = this.dices[i], invert = dice.dice_type == 'd4' ? -1 : 1;
//            var intersects = (new THREE.Raycaster(
//                        new THREE.Vector3(dice.position.x, dice.position.y, 200 * invert),
//                        new THREE.Vector3(0, 0, -1 * invert))).intersectObjects([dice]);
//            var matindex = intersects[0].face.materialIndex - 1;
//            if (dice.dice_type == 'd100') matindex *= 10;
//            values.push(matindex);
//        }
//        if (this.callback) this.callback.call(this, values);
//    }
//}
//
//this.dice_box.prototype.clear = function() {
//    this.running = false;
//    var dice;
//    while (dice = this.dices.pop()) {
//        this.scene.remove(dice); 
//        if (dice.body) this.world.remove(dice.body);
//    }
//    if (this.pane) this.scene.remove(this.pane);
//    this.renderer.render(this.scene, this.camera);
//}
//
//function make_random_vector(vector) {
//    var random_angle = rnd() * Math.PI / 5 - Math.PI / 5 / 2;
//    var vec = {
//        x: vector.x * Math.cos(random_angle) - vector.y * Math.sin(random_angle),
//        y: vector.x * Math.sin(random_angle) + vector.y * Math.cos(random_angle)
//    };
//    if (vec.x == 0) vec.x = 0.01;
//    if (vec.y == 0) vec.y = 0.01;
//    return vec;
//}
//
//this.dice_box.prototype.roll = function(notation, vector, boost, callback) {
//    this.clear();
//    for (var i in notation.set) {
//        var vec = make_random_vector(vector);
//        var pos = {
//            x: this.w * (vec.x > 0 ? -1 : 1) * 0.9,
//            y: this.h * (vec.y > 0 ? -1 : 1) * 0.9,
//            z: rnd() * 200 + 200
//        };
//        var projector = Math.abs(vec.x / vec.y);
//        if (projector > 1.0) pos.y /= projector; else pos.x *= projector;
//        var velvec = make_random_vector(vector);
//        var velocity = { x: velvec.x * boost, y: velvec.y * boost, z: -10 };
//        var inertia = that.dice_inertia[notation.set[i]];
//        var angle = {
//            x: -(rnd() * vec.y * 5 + inertia * vec.y),
//            y: rnd() * vec.x * 5 + inertia * vec.x,
//            z: 0
//        };
//        this.create_dice(notation.set[i], pos, velocity, angle);
//    }
//    this.callback = callback;
//    this.running = (new Date()).getTime();
//    this.last_time = 0;
//    this.__animate(this.running);
//}
