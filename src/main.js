GAME.world = new ECS.World();

GAME.world
    .addSystem(new GAME.InputSystem(), 0)
    .addSystem(new GAME.SoundSystem(), 1)
    .addSystem(new GAME.ThreeJSRenderingSystem(), 2)
;

GAME.world.addEntity(GAME.makePlayer());

GAME.update = function (dt) {
    requestAnimationFrame(GAME.update);
    world.update(dt);
};
requestAnimationFrame(GAME.render);
