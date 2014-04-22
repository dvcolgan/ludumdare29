GAME.InputSystem = ECS.System.extend({
    init: function(callback) {
        this.soundManager = window.soundManager;
        this.input = new ECS.Input();
    },

    update: function(dt) {
        this.input.update();

        this.world.getEntities(
            'keyboardArrowsInput',
            'actionInput',
            function(entity) {
                entity.actionInput.left = this.input.keys.left;
                entity.actionInput.right = this.input.keys.right;
                entity.actionInput.up = this.input.keys.up;
                entity.actionInput.down = this.input.keys.down;
                entity.actionInput.action = this.input.keys.action;
                entity.actionInput.cancel = this.input.keys.cancel;
                entity.actionInput.enabled = this.input.keys.enabled;
            }
        );
    }
});

GAME.SoundSystem = ECS.System.extend({
    init: function(callback) {
        this.soundManager = window.soundManager;
    },

    update: function(dt) {
         this.world.getEntities('play-sound').iterate(function(entity) {
             this.soundManager.play(entity.url);
         });
    }
});

GAME.ThreeJSRenderingSystem = ECS.System.extend({
    init: function(callback) {
        this.soundManager = window.soundManager;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth/window.innerHeight, 0.1, 5000);
    },

    update: function(dt) {
         this.world.getEntities('play-sound').iterate(function(entity) {
             this.soundManager.play(entity.url);
         });
    }
});

