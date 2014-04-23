GAME.makePlayer = function() {
    var player = ECS.Entity.createWithComponents(
        new GAME.ActionInputComponent(),
        new GAME.KeyboardArrowsInputComponent()
    );
    return player;
};
