GAME.PlayerComponent = ECS.Component.extend({
    init: function() {
        this.name = 'player';

    }
});

GAME.ThreeJSObjectComponent = ECS.Component.extend({
    init: function(mesh) {
        this.name = 'threejsObject';
        this.mesh = mesh;
    }
});

GAME.PlaySoundComponent = ECS.Component.extend({
    init: function(url) {
        this.name = 'playSound';
        this.url = url;
    }
});

GAME.ActionInputComponent = ECS.Component.extend({
    init: function() {
        this.name = 'actionInput';
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.pause = false;
    }
});

GAME.KeyboardArrowsInputComponent = ECS.Component.extend({
    init: function() {
        this.name = 'keyboardArrowsInput';
    }
});
