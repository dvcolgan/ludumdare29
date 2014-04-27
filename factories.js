function makeThreeJSScene() {
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.008);
    return scene;
}

function makeThreeJSRenderer(parentElement) {
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.setClearColor(0x8888ff, 1);
    $(parentElement).append(renderer.domElement);
    return renderer;
}

function makeThreeJSCamera() {
    return new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
}

function makePlayer() {
    return {
        canReorient: false,
        isInvincible: false
    };
}

function makeLights(scene) {
    var ambientLight = new THREE.AmbientLight('#333333');
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight('#f8de91', 1, G.AREA_RADIUS * 1.4);
    pointLight.position.y = 5;
    scene.add(pointLight);
    pointLight = new THREE.PointLight('#f8de91', 1, G.AREA_RADIUS * 1.4);
    pointLight.position.y = -5;
    scene.add(pointLight);

    pointLight = new THREE.PointLight('#f8de91', 1, G.AREA_RADIUS * 1.4);
    pointLight.position.y = 20;
    scene.add(pointLight);
}

function makeStats() {
    return {
        metersFallen: 10.0,
        metersToMonster: 0.0
    };
}

var MonsterDirtEmitter = Class.extend({
    init: function(scene, count) {
        this.pivot = new THREE.Object3D();
        this.count = count;
        this.particles = new THREE.Geometry();
        this.available = [];
        this.unavailable = [];
        this.material = new THREE.ParticleBasicMaterial({
            color: 0x722F1E,
            size: 0.8
        });

        for (var i=0; i < this.count; i++) {
            var particle = new THREE.Vector3(
                new THREE.Vector3(0, 10000, 0)
            );
            particle.velocity = new THREE.Vector3(0,0,0);
            this.particles.vertices.push(particle);
            this.available.push(particle);
        }

        this.particleSystem = new THREE.ParticleSystem(
            this.particles,
            this.material
        );
        this.particleSystem.sortParticles = true;

        scene.add(this.particleSystem);
    },
    spawn: function() {
        var particle = this.available.pop();
        if (!particle) {
            return;
        }
        particle.set(
            (Math.random() * G.ROCKS_RADIUS * 2 - G.ROCKS_RADIUS * 0.9),
            G.AREA_RADIUS,
            (Math.random() * G.ROCKS_RADIUS * 2 - G.ROCKS_RADIUS * 0.9)
        );

        //particle.velocity.set(0, -1, 0);
        //particle.setLength(G.ROCKS_RADIUS);

        this.unavailable.push(particle);
    },
    update: function(dt) {
        var toRemove = [];
        for (var i=0; i<this.unavailable.length; i++) {
            var particle = this.unavailable[i];
            particle.y -= 200 * dt;
            if (particle.y < -G.AREA_RADIUS) {
                this.available.push(particle);
                toRemove.push(particle);
            }
        }
        for (var j=0; j<toRemove.length; j++) {
            _.pull(this.unavailable, toRemove[j]);
        }
        this.spawn();

        //this.particles.needsUpdate = true;
    }
});





var ObjectPool = Class.extend({
    init: function(objects, spawnChance, speed) {
        this.unavailable = [];
        this.available = _.clone(objects);
        this.spawnChance = spawnChance;
        this.speed = speed;
        for (var i=0; i<this.available.length; i++) {
            var object = this.available[i];
            object.mesh.position.y = 10000;
        }
    },
    getSpawnedObjects: function() {
        return this.unavailable;
    },
    spawn: function() {
        var object = this.available.pop();
        if (!object) {
            return;
        }
        object.mesh.position.set(
            Math.random() * G.ROCKS_RADIUS * 2 - G.ROCKS_RADIUS,
            -G.AREA_RADIUS,
            Math.random() * G.ROCKS_RADIUS * 2 - G.ROCKS_RADIUS
        );

        moveObjectInsideLevelIfOutside(object.mesh);
        this.unavailable.push(object);
    },
    update: function(dt) {
        var toRemove = [];
        for (var i=0; i<this.unavailable.length; i++) {
            var object = this.unavailable[i];
            object.mesh.position.y += this.speed * dt;
            if (object.mesh.position.y > G.AREA_RADIUS + 10) {
                this.available.push(object);
                toRemove.push(object);
            }
        }
        for (var j=0; j<toRemove.length; j++) {
            _.pull(this.unavailable, toRemove[j]);
        }

        if (Math.random() < this.spawnChance) {
            this.spawn();
        }
    }
});

function makeDirt(scene) {
    var fireball = {};
    fireball.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(5, 12),
        new THREE.MeshLambertMaterial({ color: 'red' })
    );
    fireball.outerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(6, 12),
        new THREE.MeshPhongMaterial({
            specular: '#ffffdd',
            color: '#ff8800',
            emissive: 'red',
            shininess: 1,
            transparent: true,
            opacity: 0.5
        })
    );
    fireball.outerMesh.scale.y = 1.5;
    fireball.outerMesh.position.y -= 0.5;
    //fireball.light = new THREE.PointLight(0xff8800, 2, G.ROCKS_RADIUS * 2);
    //fireball.mesh.add(fireball.light);
    scene.add(fireball.mesh);
    fireball.mesh.add(fireball.outerMesh);
    return fireball;
}

function makeDirtPool(scene) {
    var fireballs = [];
    _.times(100, function() {
        var fireball = makeFireball(scene);
        fireballs.push(fireball);
    });
    var pool = new ObjectPool(fireballs, 0.05, 120);
    return pool;
}

function makeFireball(scene) {
    var fireball = {};
    fireball.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(5, 12),
        new THREE.MeshLambertMaterial({ color: 'red' })
    );
    fireball.outerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(6, 12),
        new THREE.MeshPhongMaterial({
            specular: '#ffffdd',
            color: '#ff8800',
            emissive: 'red',
            shininess: 1,
            transparent: true,
            opacity: 0.5
        })
    );
    fireball.outerMesh.scale.y = 1.5;
    fireball.outerMesh.position.y -= 0.5;
    //fireball.light = new THREE.PointLight(0xff8800, 2, G.ROCKS_RADIUS * 2);
    //fireball.mesh.add(fireball.light);
    scene.add(fireball.mesh);
    fireball.mesh.add(fireball.outerMesh);
    return fireball;
}

function makeFireballPool(scene) {
    var fireballs = [];
    _.times(100, function() {
        var fireball = makeFireball(scene);
        fireballs.push(fireball);
    });
    var pool = new ObjectPool(fireballs, 0.05, 120);
    return pool;
}

function makeMonster(scene) {
    function makeJaw() {
        var jaw = new THREE.Mesh(
            new THREE.SphereGeometry(G.ROCKS_RADIUS + 2, 16, 16, 0, Math.PI*2, 0, Math.PI/2),
            new THREE.MeshPhongMaterial({
                specular: '#222222',
                color: '#111111',
                emissive: '#000000',
                shininess: 5,
                side: THREE.DoubleSide
            })
        );
        var toothMaterial = new THREE.MeshPhongMaterial({
            specular: '#ffffff',
            color: '#cccccc',
            emissive: '#888888',
            shininess: 100,
            side: THREE.DoubleSide
        });

        var palate = new THREE.Mesh(
            new THREE.CircleGeometry(G.ROCKS_RADIUS + 2, 16),
            new THREE.MeshLambertMaterial({ color: '#cc0000', side: THREE.DoubleSide })
        );
        palate.rotation.x = Math.PI/2;
        jaw.add(palate);
        var makeTooth = function(x, z, rot) {
            var tooth = new THREE.Mesh(
                new THREE.CubeGeometry(4.8, 4, 2),
                toothMaterial
            );
            tooth.position.x = x;
            tooth.position.y = -2;
            tooth.position.z = z;
            tooth.rotation.y = rot;
            jaw.add(tooth);
        };
        makeTooth(-15.5, G.ROCKS_RADIUS - 7, -Math.PI/4);
        makeTooth(-9.5, G.ROCKS_RADIUS - 3, -Math.PI/8);
        makeTooth(-3.25, G.ROCKS_RADIUS - 1.5, -Math.PI/16);
        makeTooth(3.25, G.ROCKS_RADIUS - 1.5, Math.PI/16);
        makeTooth(9.5, G.ROCKS_RADIUS - 3, Math.PI/8);
        makeTooth(15.5, G.ROCKS_RADIUS - 7, Math.PI/4);
        return jaw;
    }
    var monster = new THREE.Object3D();
    var bottomJaw = makeJaw();
    var upperJaw = makeJaw();
    bottomJaw.position.z -= 2;
    upperJaw.position.z += 2;
    bottomJaw.rotation.y = Math.PI;
    bottomJaw.rotation.x -= Math.PI / 3;
    upperJaw.rotation.x += Math.PI / 3;
    bottomJaw.direction = 'opening';
    upperJaw.direction = 'opening';
    monster.add(bottomJaw);
    monster.add(upperJaw);
    monster.bottomJaw = bottomJaw;
    monster.upperJaw = upperJaw;
    monster.position.y = G.AREA_RADIUS + G.ROCKS_RADIUS - 2;
    scene.add(monster);
    return monster;
}

function makeWalls(assetManager, scene) {
    var walls = {};
    walls.texture = assetManager.cloneTexture('ground');
    walls.texture.wrapS = walls.texture.wrapT = THREE.RepeatWrapping;
    walls.texture.repeat.set(10, 10);
    walls.texture.needsUpdate = true;
    walls.mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(G.ROCKS_RADIUS + 2, G.ROCKS_RADIUS + 2, G.AREA_RADIUS * 2, 12, 5, true),
        new THREE.MeshPhongMaterial({
            specular: '#222222',
            color: '#111111',
            emissive: '#000000',
            shininess: 10,
            side: THREE.DoubleSide,
            map: walls.texture
        })
    );
    scene.add(walls.mesh);
    return walls;
}

function makeRock(scene) {
    var rock = [];
    rock.mesh = new THREE.Mesh(
        new THREE.CubeGeometry(G.ROCKS_RADIUS * 2, 1, Math.random() * 4 + 1),
        new THREE.MeshBasicMaterial({ color: 'red' })
    );
    scene.add(rock);
    return rock;
}

var RockManager = Class.extend({
    init: function() {
        this.rocks = [];
    }
});
