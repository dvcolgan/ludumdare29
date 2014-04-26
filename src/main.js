T.TitleState = ECS.GameState.extend({
    name: 'TitleState',
    create: function() {
        this.engine
            .addSystem(new S.TitleScreenSystem(), 0)
        ;
    }
});

T.PlayState = ECS.GameState.extend({
    name: 'PlayState',
    create: function() {
        this.engine
            .addSystem(new S.TweenSystem(), 0)
            .addSystem(new S.KeyboardInputSystem(), 0)
            .addSystem(new S.SimpleMovementSystem(), 1)
            .addSystem(new S.CameraLookSystem(), 1)
            .addSystem(new S.PauseSystem(), 1)
            .addSystem(new S.SoundSystem(), 2)
            .addSystem(new S.ObstacleFlyingSystem(), 3)
            .addSystem(new S.ThreeJSRenderingSystem(), 3)
            .addSystem(new S.GameManagerSystem(), 4)
        ;
        var element = $('canvas').get(0);
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    }
});

T.PauseState = ECS.GameState.extend({
    name: 'PauseState',
    create: function() {
        this.engine
            .addSystem(new S.PauseScreenSystem(), 0)
        ;
    }
});

T.GameOverState = ECS.GameState.extend({
    name: 'GameOverState',
    create: function() {
        document.exitPointerLock = document.exitPointerLock ||
            document.mozExitPointerLock ||
            document.webkitExitPointerLock;
        document.exitPointerLock();
        this.engine
            .addSystem(new S.GameOverScreenSystem(), 0)
        ;
    }
});

G = new ECS.Game({
    selector: 'body',
    startingState: new T.TitleState(),
    preload: function() {
        this.loader.loadImage('ground', 'assets/images/ground.png');
        this.loader.loadBGM('digging', 'assets/audio/digging-through-dirt.wav');
        for (var i=1; i<=7; i++) {
        this.loader.loadSoundEffect('crunch' + i, 'assets/audio/crunch'+i+'.wav');
        this.loader.loadSoundEffect('satisfied', 'assets/audio/satisfied-monster.wav');
        }
    }
});

