GAME.makePlayer = function() {
    return ECS.Entity.createWithComponents(
        new GAME.ActionInputComponent(),
        new GAME.KeyboardArrowsInputComponent()
    );
};
