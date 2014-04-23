GAME.world = new ECS.World();

ECS.assetManager.loadSoundEffect('gunshot.wav');
ECS.assetManager.start(function() {
    GAME.world
        .addSystem(new GAME.InputSystem(), 0)
        .addSystem(new GAME.PlaySoundOnSpacebarSystem(), 1)
        .addSystem(new GAME.SoundSystem(), 2)
    ;

    GAME.world.addEntity(GAME.makePlayer());

    GAME.update = function (dt) {
        requestAnimationFrame(GAME.update);
        GAME.world.update(dt);
    };
    requestAnimationFrame(GAME.update);
});
