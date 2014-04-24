GAME.KeyboardInputSystem = ECS.System.extend({
    init: function(input) {
        this.input = input;
    },

    update: function(dt) {
        this.engine.getEntities(
            'keyboardArrowsInput',
            'actionInput'
        ).iterate(function(entity) {
            entity.components.actionInput.left = this.input.keys.left;
            entity.components.actionInput.right = this.input.keys.right;
            entity.components.actionInput.up = this.input.keys.up;
            entity.components.actionInput.down = this.input.keys.down;
            entity.components.actionInput.pause = this.input.keys.space;
        }.bind(this));
    }
});

GAME.TweenSystem = ECS.System.extend({
    init: function(input) {
    },

    update: function(dt) {
        TWEEN.update();
    }
});

GAME.CubeSliderSystem = ECS.System.extend({
    init: function(input) {
        this.input = input;
    },

    update: function(dt) {
        var left = (this.input.keys.left === 'hit');
        var right = (this.input.keys.right === 'hit');
        var up = (this.input.keys.up === 'hit');
        var down = (this.input.keys.down === 'hit');
        if (left || right || up || down) {
            this.engine.getEntities(
                'gridPosition',
                'threejsObject'
            ).iterate(function(entity) {
                var position = {
                    x: entity.components.gridPosition.getX(),
                    z: entity.components.gridPosition.getZ()
                };
                if (left) {
                    entity.components.gridPosition.col -= 1;
                    if (entity.components.gridPosition.col < 0) {
                        entity.components.gridPosition.col = 0;
                    }
                }
                if (right) {
                    entity.components.gridPosition.col += 1;
                    if (entity.components.gridPosition.col > 3) {
                        entity.components.gridPosition.col = 3;
                    }
                }
                if (up) {
                    entity.components.gridPosition.row -= 1;
                    if (entity.components.gridPosition.row < 0) {
                        entity.components.gridPosition.row = 0;
                    }
                }
                if (down) {
                    entity.components.gridPosition.row += 1;
                    if (entity.components.gridPosition.row > 3) {
                        entity.components.gridPosition.row = 3;
                    }
                }
                if (entity.components.gridPosition.col < 0) {
                    entity.components.gridPosition.col = 0;
                }
                var end = {
                    x: entity.components.gridPosition.getX(),
                    z: entity.components.gridPosition.getZ()
                };
                var tween = new TWEEN.Tween(position)
                    .to(end, 300)
                    .easing(TWEEN.Easing.Elastic.Out)
                    .onUpdate(function() {
                        entity.components.threejsObject.mesh.position.x = position.x;
                        entity.components.threejsObject.mesh.position.z = position.z;
                    })
                    .start();
            }.bind(this));
        }
    }
});

GAME.CubeCombiningSystem = ECS.System.extend({
    init: function() {
    },

    update: function(dt) {
        var entities = this.engine.getEntities(
            'gridPosition',
            'threejsObject'
        );
        for (var thisNode=entities.head; thisNode; thisNode=thisNode.next) {
            for (var otherNode=entities.head; otherNode; otherNode=otherNode.next) {
                if (thisNode.entity !== otherNode.entity) {
                    var thisPosition = thisNode.entity.components.gridPosition;
                    var otherPosition = otherNode.entity.components.gridPosition;
                    if (thisPosition.col === otherPosition.col && thisPosition.col === otherPosition.col) {
                        var thisNumber = thisNode.entity.components.numericValue.value;
                        var otherNumber = otherNode.entity.components.numericValue.value;
                        var newNumber = parseInt(thisNumber) + parseInt(otherNumber);
                        this.engine.addEntity(this.prefabs.makeTile(thisPosition.col, parseInt(newNumber)));
                        this.engine.removeEntity(thisNode.entity);
                        this.engine.removeEntity(otherNode.entity);
                    }
                }
            }
        }
    }
});

GAME.SoundSystem = ECS.System.extend({
    init: function(soundManager) {
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

GAME.ThreeJSRenderingSystem = ECS.System.extend({
    init: function(assets) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.setClearColor(0x91D9FF, 1);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.ambientLight = new THREE.AmbientLight('#333333');
        this.scene.add(this.ambientLight);

        this.spotLight = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 1 );
        this.spotLight.position.set(0, 100, 0);
        this.spotLight.target.position.set(0, 0, 0);

        //this.spotLight.castShadow = true;

        //this.spotLight.shadowCameraNear = 1;
        //this.spotLight.shadowCameraFar = 25;
        //this.spotLight.shadowCameraFov = 50;
        //this.spotLight.shadowBias = 0.0001;
        //this.spotLight.shadowDarkness = 0.8;
        //this.spotLight.shadowCameraVisible = true;

        //this.spotLight.shadowMapWidth = 1024;
        //this.spotLight.shadowMapHeight = 1024;

        this.scene.add(this.spotLight);

        //this.controls = new THREE.OrbitControls(this.camera);
        //controls.addEventListener('change', render);
        this.camera.position.z = 0;
        this.camera.position.y = 7;
        this.camera.position.x = 0;
        this.camera.rotation.x -= Math.PI / 2;
        //this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    },

    componentAdded: function(entity, componentName) {
        if (componentName === 'threejsObject') {
            this.scene.add(entity.components.threejsObject.mesh);
        }
    },

    componentRemoved: function(entity, componentName) {
        if (componentName === 'threejsObject') {
            this.scene.remove(entity.components.threejsObject.mesh);
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
        this.renderer.render(this.scene, this.camera);
        //this.spotLight.position.x += 1;
    }
});

GAME.PlaySoundOnSpacebarSystem = ECS.System.extend({
    init: function() {
    },

    update: function(dt) {
        this.engine.getEntities(
            'keyboardArrowsInput',
            'actionInput'
        ).iterate(function(entity) {
            if (entity.components.actionInput.action === 'hit') {
                this.engine.addEntity(
                    new ECS.Entity().addComponent(
                        new GAME.PlaySoundComponent('gunshot.wav')));
            }
        }.bind(this));
    }
});

GAME.CannonPhysicsSystem = ECS.System.extend({
    init: function() {
        world = new CANNON.World();
        world.gravity.set(0, -20, 0);
        world.broadphase = new CANNON.NaiveBroadphase();

        // Create a plane
        var groundShape = new CANNON.Plane();
        var groundBody = new CANNON.RigidBody(0,groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        world.add(groundBody);

        // Step the simulation
        setInterval(function(){
            world.step(1.0/60.0);
        }, 1000.0/60.0);

        this.world = world;
    },

    componentAdded: function(entity, componentName) {
        if (componentName === 'cannonPhysicsObject') {
            this.world.add(entity.components.cannonPhysicsObject.body);
        }
    },

    componentRemoved: function(entity, componentName) {
        if (componentName === 'cannonPhysicsObject') {
            this.world.remove(entity.components.cannonPhysicsObject.body);
        }
    },

    update: function(dt) {
        this.engine.getEntities(
            'threejsObject',
            'cannonPhysicsObject'
        ).iterate(function(entity) {
            var mesh = entity.components.threejsObject.mesh;
            var body = entity.components.cannonPhysicsObject.body;
            body.position.copy(mesh.position);
            body.quaternion.copy(mesh.quaternion);
        });
    }
});

GAME.PauseSystem = ECS.System.extend({
    init: function(game, input, pauseState) {
        this.game = game;
        this.input = input;
        this.pauseState = pauseState;
    },
    update: function(dt) {
        if (this.input.keys.space) {
            this.game.pushState(this.pauseState);
        }
    }
});

GAME.$2048ManagerSystem = ECS.System.extend({
    init: function(prefabs) {
        this.prefabs = prefabs;
        this.started = false;
    },

    update: function(dt) {
        if (!this.started) {
            this.engine.removeEntities(this.engine.getEntities('threejsObject'));
            this.engine.addEntity(this.prefabs.makeFloor());

            this.engine.addEntity(this.prefabs.makeTile(0, 0, '2'));
            this.engine.addEntity(this.prefabs.makeTile(0, 1, '2'));
            this.engine.addEntity(this.prefabs.makeTile(0, 3, '2'));
            this.engine.addEntity(this.prefabs.makeTile(3, 3, '2'));
            this.started = true;
        }
        else {
            this.engine.getEntities(
                'gridPosition',
                'threejsObject'
            ).iterate(function(entity) {
            }.bind(this));
        }
    }
});

GAME.$2040TitleScreenSystem = ECS.System.extend({
    init: function(game, selector, playStateClass) {
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

GAME.$2048PauseScreenSystem = ECS.System.extend({
    init: function(game, selector) {
        this.$container = $(selector);
        this.$wrapper = $('<div></div>');
        $button = $('<button>Click me to go back</button>').click(function() {
            game.popStateAndPause();
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
