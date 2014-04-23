GAME.InputSystem = ECS.System.extend({
    init: function(callback) {
        this.soundManager = window.soundManager;
        this.input = new ECS.Input();
    },

    update: function(dt) {
        this.input.update();

        this.world.getEntities(
            'keyboardArrowsInput',
            'actionInput'
        ).iterate(function(entity) {
            entity.components.actionInput.left = this.input.keys.left;
            entity.components.actionInput.right = this.input.keys.right;
            entity.components.actionInput.up = this.input.keys.up;
            entity.components.actionInput.down = this.input.keys.down;
            entity.components.actionInput.action = this.input.keys.space;
        }.bind(this));
    }
});

GAME.SoundSystem = ECS.System.extend({
    init: function(callback) {
        this.soundManager = window.soundManager;
    },

    update: function(dt) {
         var entities = this.world.getEntities('playSound');
         entities.iterate(function(entity) {
             console.log(entities);
             console.log('playing sound');
             this.soundManager.play(entity.components.playSound.url);
             this.world.removeEntity(entity);
         }.bind(this));
    }
});

GAME.ThreeJSRenderingSystem = ECS.System.extend({
    init: function() {
        this.soundManager = window.soundManager;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth/window.innerHeight, 0.1, 5000);
    },

    update: function(dt) {
         //this.world.getEntities('playSound').iterate(function(entity) {
         //    this.soundManager.play(entity.url);
         //});
    }
});

GAME.PlaySoundOnSpacebarSystem = ECS.System.extend({
    init: function() {
    },

    update: function(dt) {
        this.world.getEntities(
            'keyboardArrowsInput',
            'actionInput'
        ).iterate(function(entity) {
            if (entity.components.actionInput.action === 'hit') {
                this.world.addEntity(
                    new ECS.Entity().addComponent(
                        new GAME.PlaySoundComponent('gunshot.wav')));
            }
        }.bind(this));
    }
});
