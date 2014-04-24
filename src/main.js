GAME.TitleState = ECS.GameState.extend({
    name: 'TitleState',
    create: function() {
        this.engine
            .addSystem(new GAME.TitleScreenSystem(this.game, this.selector, new GAME.PlayState()), 0)
        ;
    }
});

GAME.PlayState = ECS.GameState.extend({
    name: 'PlayState',
    create: function() {
        this.engine
            .addSystem(new GAME.TweenSystem(this.prefabs), 0)
            .addSystem(new GAME.KeyboardInputSystem(this.input), 0)
            .addSystem(new GAME.PauseSystem(this.game, this.input, new GAME.PauseState()), 1)
            .addSystem(new GAME.SoundSystem(), 2)
            .addSystem(new GAME.ThreeJSRenderingSystem(this.assets), 3)
        ;
    }
});

GAME.PauseState = ECS.GameState.extend({
    name: 'PauseState',
    create: function() {
        this.engine
            .addSystem(new GAME.PauseScreenSystem(this.game, this.selector), 0)
        ;
    }
});

window.game2048 = new ECS.Game({
    selector: 'body',
    startingState: new GAME.PlayState(),
    prefabs: new GAME.Prefabs(),
    preload: function() {
        //this.assets.loadImage('texture', 'assets/images/texture.png');
    }
});
