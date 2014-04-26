ROCKS_RADIUS = 20;
AREA_RADIUS = 200;


S.KeyboardInputSystem = ECS.System.extend({
    update: function(dt) {
        this.engine.getEntities(
            'keyboardArrowsInput',
            'actionInput'
        ).iterate(function(entity) {
            var keys = G.input.keys;
            entity.components.actionInput.left = keys.left || keys.a;
            entity.components.actionInput.right = keys.right || keys.d || keys.e;
            entity.components.actionInput.up = keys.up || keys.w || keys.comma;
            entity.components.actionInput.down = keys.down || keys.s || keys.o;
            //entity.components.actionInput.pause = G.input.keys.space;
        }.bind(this));
    }
});

S.SimpleMovementSystem = ECS.System.extend({
    update: function(dt) {
        this.engine.getEntities(
            'camera',
            'actionInput'
        ).iterate(function(entity) {
            var speed = 20 * dt;
            if (entity.components.actionInput.left) {
                entity.components.camera.camera.position.x -= speed;
            }
            if (entity.components.actionInput.right) {
                entity.components.camera.camera.position.x += speed;
            }
            if (entity.components.actionInput.up) {
                entity.components.camera.pitchObject.position.z -= speed;
            }
            if (entity.components.actionInput.down) {
                entity.components.camera.pitchObject.position.z += speed;
            }
        }.bind(this));
    }
});

// Based off of the PointerLockControls from the ThreeJS examples
S.CameraLookSystem = ECS.System.extend({
    update: function(dt) {
         var entities = this.engine.getEntities(
             'camera'
         ).iterate(function(entity) {
             var camera = entity.components.camera.camera;
             var yawObject = entity.components.camera.yawObject;
             var pitchObject = entity.components.camera.pitchObject;

             camera.rotation.set(0, 0, 0);

             var PI_2 = Math.PI / 2;

             yawObject.rotation.y -= G.input.mouse.movementX * 0.3 * dt;
             pitchObject.rotation.x -= G.input.mouse.movementY * 0.3 * dt;

             pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
         }.bind(this));
    }
});

S.TweenSystem = ECS.System.extend({
    init: function(input) {
        this._super();
    },

    update: function(dt) {
        TWEEN.update();
    }
});

S.SoundSystem = ECS.System.extend({
    init: function(soundManager) {
        this._super();
        this.soundManager = soundManager;
    },

    update: function(dt) {
         var entities = this.engine.getEntities('playSound');
         entities.iterate(function(entity) {
             this.soundManager.play(entity.components.playSound.url);
             this.engine.removeEntity(entity);
         }.bind(this));
    }
});

S.ThreeJSRenderingSystem = ECS.System.extend({
    init: function(assets) {
        this._super();
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.008);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        //this.renderer.shadowMapEnabled = true;
        //this.renderer.shadowMapSoft = true;
        //this.renderer.setClearColor(0x91D9FF, 1);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight('#333333');
        this.scene.add(this.ambientLight);

        this.pointLight = new THREE.PointLight('#f8de91', 1, AREA_RADIUS * 1.4);
        this.pointLight.position.y = 5;
        this.scene.add(this.pointLight);
        this.pointLight = new THREE.PointLight('#f8de91', 1, AREA_RADIUS * 1.4);
        this.pointLight.position.y = -5;
        this.scene.add(this.pointLight);

        this.wallsTexture = G.loader.cloneTexture('ground');
        this.wallsTexture.wrapS = this.wallsTexture.wrapT = THREE.RepeatWrapping;
        this.wallsTexture.repeat.set(10, 10);
        this.wallsTexture.needsUpdate = true;
        this.wallsMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(ROCKS_RADIUS + 1, ROCKS_RADIUS + 1, AREA_RADIUS * 2, 12, 5, true),
            new THREE.MeshPhongMaterial({
                specular: '#222222',
                color: '#111111',
                emissive: '#000000',
                shininess: 10,
                side: THREE.DoubleSide,
                map: this.wallsTexture
            })
        );
        this.scene.add(this.wallsMesh);
    },

    componentAdded: function(entity, componentName) {
        if (componentName === 'mesh') {
            this.scene.add(entity.components.mesh.mesh);
        }
        if (componentName === 'camera') {
            this.scene.add(entity.components.camera.pivot);
        }
    },

    componentRemoved: function(entity, componentName) {
        if (componentName === 'mesh') {
            this.scene.remove(entity.components.mesh.mesh);
        }
        if (componentName === 'camera') {
            this.scene.remove(entity.components.camera.pivot);
        }
    },

    pause: function() {
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.zIndex = -1000;
    },

    restart: function() {
        this.renderer.domElement.style.position = 'static';
        this.renderer.domElement.style.zIndex = 1000;
    },

    update: function(dt) {
        this.wallsTexture.offset.y -= 4 * dt;
        this.wallsTexture.offset.y %= 1;
        this.wallsTexture.needsUpdate = true;
        this.engine.getEntities('camera').iterate(function(entity) {
            this.renderer.render(this.scene, entity.components.camera.camera);
        }.bind(this));
    }
});

S.PauseSystem = ECS.System.extend({
    init: function() {
        this._super();
        this.pauseState = new T.PauseState();
    },
    update: function(dt) {
        if (G.input.keys.space) {
            G.pushState(this.pauseState);
        }
    }
});

S.TitleScreenSystem = ECS.System.extend({
    init: function(game, selector, playStateClass) {
        this._super();
        this.$container = $(selector);
        this.$wrapper = $('<div style="width: 100%; height: 100%;"></div>');
        $button = $('<button>Click me to start</button>').click(function() {
            game.pushState(playStateClass);
        });
        this.$wrapper.append($button);
        this.$container.append(this.$wrapper);
    },

    pause: function() {
        this.$wrapper.css('display', 'none');   
    },

    restart: function() {
        this.$wrapper.css('display', 'block');   
    },

    destroy: function() {
        this.$container.remove(this.$wrapper);
    }
});

S.PauseScreenSystem = ECS.System.extend({
    init: function() {
        this._super();
        this.$container = $(G.selector);
        this.$wrapper = $('<div></div>');
        $button = $('<button>Click me to go back</button>').click(function() {
            G.popStateAndPause();
        });
        this.$wrapper.append($button);
        this.$container.append(this.$wrapper);
    },

    pause: function() {
        this.$wrapper.css('display', 'none');
    },

    restart: function() {
        this.$wrapper.css('display', 'block');
    },

    destroy: function() {
        this.$container.remove(this.$wrapper);
    }
});

S.ObstacleFlyingSystem = ECS.System.extend({
    init: function() {
        this._super();
        this.pool = [];
        _.times(2000, function() {
            var rock = P.makeRock();
            rock.components.mesh.mesh.position.y = -10000;
            rock.components.mesh.mesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(ROCKS_RADIUS, 0, 0));
            rock.components.mesh.mesh.rotation.y = Math.random() * 2 * Math.PI;
            this.pool.push(rock);
            this.engine.addEntity(rock);
        }.bind(this));
    },
    spawnRock: function() {
        var rock = this.pool.pop();
        if (!rock) {
            return;
        }
        rock.components.mesh.mesh.position.set(0, -AREA_RADIUS, 0);

        // Give this rock a random position around the center
        //var vector = rock.components.mesh.mesh.position;
        //var axis = new THREE.Vector3(0, 1, 0);
        //var angle = Math.random() * 2 * Math.PI;
        //var matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
        //vector.applyMatrix4(matrix);
    },
    update: function(dt) {
        console.log(dt);
         var entities = this.engine.getEntities(
             'rock',
             'mesh'
         ).iterate(function(rock) {
            var mesh = rock.components.mesh.mesh;
            mesh.position.y += 150 * dt;
            if (mesh.position.y > AREA_RADIUS + 10) {
                this.pool.push(rock);
            }
            if (Math.random() < 0.001) {
                this.spawnRock();
            }
         }.bind(this));
    }
});

S.GameManagerSystem = ECS.System.extend({
    init: function() {
        this._super();
        var player = P.makePlayer();
        player.components.camera.pitchObject.rotation.x = -Math.PI/2;
        this.engine.addEntity(player);
    },

    update: function(dt) {
    }
});

/*
var entities = this.engine.getEntities(
    'camera'
).iterate(function(entity) {
}.bind(this));
*/
