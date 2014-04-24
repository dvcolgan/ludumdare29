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

GAME.CannonPhysicsObjectComponent = ECS.Component.extend({
    init: function(body) {
        this.name = 'cannonPhysicsObject';
        this.body = body;
        
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


GAME.GridPositionComponent = ECS.Component.extend({
    init: function(col, row) {
        this.name = 'gridPosition';
        this.col = col;
        this.row = row;
    },

    getX: function() {
        return this.col * 1.5 - 2.25;
    },

    getZ: function() {
        return this.row * 1.5 - 2.25;
    }
});


GAME.NumericValueComponent = ECS.Component.extend({
    init: function(value) {
        this.name = 'numericValue';
        this.value = value;
    }
});
