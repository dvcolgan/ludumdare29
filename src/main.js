GAME.TitleState = ECS.GameState.extend({
    name: 'TitleState',
    create: function() {
        this.engine
            .addSystem(new GAME.$2040TitleScreenSystem(this.game, this.selector, new GAME.PlayState()), 0)
        ;
    }
});

//GAME.PlayState = ECS.GameState.extend({
//    name: 'PlayState',
//    create: function() {
//        console.log('create');
//        this.engine
//            .addSystem(new GAME.$2040GameScreenSystem(this.game, this.selector), 0)
//        ;
//    }
//});

GAME.PlayState = ECS.GameState.extend({
    name: 'PlayState',
    create: function() {
        this.engine
            .addSystem(new GAME.KeyboardInputSystem(this.input), 0)
            .addSystem(new GAME.PauseSystem(this.game, this.input, new GAME.PauseState()), 1)
            .addSystem(new GAME.SoundSystem(), 2)
            .addSystem(new GAME.ThreeJSRenderingSystem(this.assets), 3)
            .addSystem(new GAME.AlignToGridSystem(this.prefabs), 4)
            .addSystem(new GAME.$2048ManagerSystem(this.prefabs), 4)
        ;
    }
});

GAME.PauseState = ECS.GameState.extend({
    name: 'PauseState',
    create: function() {
        this.engine
            .addSystem(new GAME.$2048PauseScreenSystem(this.game, this.selector), 0)
        ;
    }
});

window.game2048 = new ECS.Game({
    selector: 'body',
    startingState: new GAME.PlayState(),
    prefabs: new GAME.Prefabs(),
    preload: function() {
        this.assets.loadSoundEffect('gunshot', 'assets/audio/gunshot.wav');
        this.assets.loadImage('leaves', 'assets/images/leaves.png');
    }
});
