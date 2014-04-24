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

GAME.TitleScreenSystem = ECS.System.extend({
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

GAME.PauseScreenSystem = ECS.System.extend({
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
