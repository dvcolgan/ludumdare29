ROCKS_RADIUS = 20;
AREA_RADIUS = 200;
JAW_MOVEMENT_SPEED = 0.1;


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
                entity.components.camera.pivot.position.x -= speed;
            }
            if (entity.components.actionInput.right) {
                entity.components.camera.pivot.position.x += speed;
            }
            if (entity.components.actionInput.up) {
                entity.components.camera.pivot.position.z -= speed;
            }
            if (entity.components.actionInput.down) {
                entity.components.camera.pivot.position.z += speed;
            }

            //entity.components.camera.pivot.position.y += 0.3;

            var pos = entity.components.camera.pivot.position;
            var distVec = new THREE.Vector3(pos.x, 0, pos.z);
            if (distVec.length() > ROCKS_RADIUS) {
                distVec.setLength(ROCKS_RADIUS);
                entity.components.camera.pivot.position.x = distVec.x;
                entity.components.camera.pivot.position.z = distVec.z;
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
    init: function() {
        this._super();
        this.soundManager = window.soundManager;
    },

    update: function(dt) {
         var entities = this.engine.getEntities('playSound');
         entities.iterate(function(entity) {
            this.soundManager.play(
                entity.components.playSound.soundEffectKey,
                {volume: entity.components.playSound.volume }
            );
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

        this.pointLight = new THREE.PointLight('#f8de91', 1, AREA_RADIUS * 1.4);
        this.pointLight.position.y = 20;
        this.scene.add(this.pointLight);

        this.wallsTexture = G.loader.cloneTexture('ground');
        this.wallsTexture.wrapS = this.wallsTexture.wrapT = THREE.RepeatWrapping;
        this.wallsTexture.repeat.set(10, 10);
        this.wallsTexture.needsUpdate = true;
        this.wallsMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(ROCKS_RADIUS + 2, ROCKS_RADIUS + 2, AREA_RADIUS * 2, 12, 5, true),
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

        this.createMonster();
    },

    createMonster: function() {
        function makeJaw() {
            var jaw = new THREE.Mesh(
                new THREE.SphereGeometry(ROCKS_RADIUS + 2, 16, 16, 0, Math.PI*2, 0, Math.PI/2),
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
                new THREE.CircleGeometry(ROCKS_RADIUS + 2, 16),
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
            makeTooth(-15.5, ROCKS_RADIUS - 7, -Math.PI/4);
            makeTooth(-9.5, ROCKS_RADIUS - 3, -Math.PI/8);
            makeTooth(-3.25, ROCKS_RADIUS - 1.5, -Math.PI/16);
            makeTooth(3.25, ROCKS_RADIUS - 1.5, Math.PI/16);
            makeTooth(9.5, ROCKS_RADIUS - 3, Math.PI/8);
            makeTooth(15.5, ROCKS_RADIUS - 7, Math.PI/4);
            return jaw;
        }
        this.monster = new THREE.Object3D();
        var bottomJaw = makeJaw();
        var upperJaw = makeJaw();
        bottomJaw.position.z -= 2;
        upperJaw.position.z += 2;
        bottomJaw.rotation.y = Math.PI;
        bottomJaw.rotation.x -= Math.PI / 3;
        upperJaw.rotation.x += Math.PI / 3;
        bottomJaw.direction = 'opening';
        upperJaw.direction = 'opening';
        this.monster.add(bottomJaw);
        this.monster.add(upperJaw);
        this.monster.bottomJaw = bottomJaw;
        this.monster.upperJaw = upperJaw;
        this.monster.position.y = AREA_RADIUS;
        this.scene.add(this.monster);
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
        this.wallsTexture.offset.y -= 5 * dt;
        this.wallsTexture.offset.y %= 1;
        this.wallsTexture.needsUpdate = true;


        var bottomJaw = this.monster.bottomJaw;
        var upperJaw = this.monster.upperJaw;
        if (bottomJaw.direction === 'opening') {
            bottomJaw.rotation.x += JAW_MOVEMENT_SPEED;
            if (bottomJaw.rotation.x >= 0) {
                bottomJaw.direction = 'closing';
                this.engine.getEntities('camera').iterate(function(player) {
                    var which = _.sample(['crunch1', 'crunch2', 'crunch3', 'crunch4', 'crunch5', 'crunch6', 'crunch7']);
                    this.engine.addEntity(P.makeSoundEffect(which, (player.components.camera.pivot.position.y / AREA_RADIUS) * 100));
                }.bind(this));
            }
        }
        else {
            bottomJaw.rotation.x -= JAW_MOVEMENT_SPEED;
            if (bottomJaw.rotation.x <= -Math.PI/2) {
                bottomJaw.direction = 'opening';
            }
        }
        if (upperJaw.direction === 'opening') {
            upperJaw.rotation.x -= JAW_MOVEMENT_SPEED;
            if (upperJaw.rotation.x <= 0) {
                upperJaw.direction = 'closing';
            }
        }
        else {
            upperJaw.rotation.x += JAW_MOVEMENT_SPEED;
            if (upperJaw.rotation.x >= Math.PI/2) {
                upperJaw.direction = 'opening';
            }
        }

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
    init: function() {
        this._super();
        this.$container = $(G.selector);
        this.$wrapper = $('<div class="wrapper"></div>');
        this.$wrapper.width(window.innerWidth);
        this.$wrapper.height(window.innerHeight);
        this.$wrapper.append('<h1>Journey<br/>to the center<br/>of the hole</h1>');

        $button = $('<button>Click me to start</button>').click(function() {
            G.pushState(new T.PlayState());
        });

        this.$wrapper.append($button);
        this.$container.append(this.$wrapper);
        this.$wrapper.append('<p>Note: this game steals your mouse pointer, hit escape to exit.</p>');
    },

    pause: function() {
        this.$wrapper.css('display', 'none');   
    },

    restart: function() {
        this.$wrapper.css('display', 'block');   
    },

    destroy: function() {
        this.$wrapper.remove();
    }
});

S.PauseScreenSystem = ECS.System.extend({
    init: function() {
        this._super();
        this.$container = $(G.selector);
        this.$wrapper = $('<div></div>');
        $button = $('<button>Click me to go back</button>').click(function() {
            G.popStateAndDestroy();
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
        this.$wrapper.remove();
    }
});

S.ObstacleFlyingSystem = ECS.System.extend({
    init: function() {
        this._super();
        this.pool = [];
        _.times(100, function() {
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
        var entities = this.engine.getEntities(
            'rock',
            'mesh'
        ).iterate(function(rock) {
            var mesh = rock.components.mesh.mesh;
            mesh.position.y += 150 * dt * 0.02 * (10000 * (window.gameStats.metersFallen / 10000));
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
        this.player = P.makePlayer();
        this.player.components.camera.pitchObject.rotation.x = -Math.PI/2;
        this.engine.addEntity(this.player);

        this.stats = P.makeStats();
        this.engine.addEntity(this.stats);
        window.soundManager.play('digging', {volume: 50});
        window.soundManager.play('wind', {volume: 50});
        this.$container = $(G.selector);
        this.$container.append($('<div class="meters-display"></div>'));
        window.gameStats = this.stats.components.gameStats;
    },

    update: function(dt) {
        var gameStats = this.stats.components.gameStats;
        gameStats.metersFallen += dt * 10;
        $('.meters-display').text(parseInt(this.stats.components.gameStats.metersFallen) + ' m');
        if (gameStats.metersFallen < 10) {
            $('.meters-display').width(150);
        }
        else if (gameStats.metersFallen < 100) {
            $('.meters-display').width(175);
        }
        else if (gameStats.metersFallen < 1000) {
            $('.meters-display').width(200);
        }
        else if (gameStats.metersFallen < 10000) {
            $('.meters-display').width(225);
        }
        else {
            $('.meters-display').width(250);
        }
        if (this.player.components.camera.pivot.position.y >= AREA_RADIUS) {
            window.finalScore = this.stats.components.gameStats.metersFallen;
            window.soundManager.stop('digging');
            window.soundManager.stop('wind');
            G.pushState(new T.GameOverState());
        }
    },

    pause: function() {
        $('.meters-display').hide();
    },

    restart: function() {
        $('.meters-display').show();
    },

    destroy: function() {
        $('.meters-display').remove();
    }
});

/*
var entities = this.engine.getEntities(
    'camera'
).iterate(function(entity) {
}.bind(this));
*/

S.GameOverScreenSystem = ECS.System.extend({
    init: function() {
        this._super();
        this.$container = $(G.selector);
        this.$wrapper = $('<div class="wrapper"></div>');
        this.$wrapper.width(window.innerWidth);
        this.$wrapper.height(window.innerHeight);
        this.$wrapper.append('<h1>The giant jaws<br/>close around you<br/>as you take your<br/>last panicked breath</h1>');
        this.$wrapper.append('<p>But, you did manage to fall</p>');
        this.$wrapper.append('<p><strong>' + parseInt(window.finalScore) + ' m</strong></p>');
        this.$wrapper.append('<h2>beneath the surface&trade;</h2>');
        this.$wrapper.append('<p>before you were eaten!<br/>CONGRATULATIONS</p>');
        var $button = $('<button>Try Again?</button>').click(function() {
            window.location.href = window.location.href;
        });
        this.$wrapper.append($button);
        this.$container.append(this.$wrapper);
        window.soundManager.play('satisfied');
    },

    pause: function() {
        this.$wrapper.css('display', 'none');
    },

    restart: function() {
        this.$wrapper.css('display', 'block');
    },

    destroy: function() {
        this.$wrapper.remove();
    }
});
