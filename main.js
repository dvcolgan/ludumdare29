window.model = {};

var TitleState = function() {
    $('#title-state').show();
    window.soundManager.play('titleMusic');

    $('#start-button').click(function() {
        $('#title-state').hide();
        window.soundManager.stop('titleMusic');
        $('body').css('overflow', 'hidden');
        PlayState();
    });
};

var PlayState = function() {
    $('#play-state').show();
    model.scene = makeThreeJSScene();
    model.renderer = makeThreeJSRenderer($('#play-state').get(0));
    model.camera = makeThreeJSCamera();
    model.player = makePlayer();

    model.lights = makeLights(model.scene);
    model.monster = makeMonster(model.scene);
    //controls = new THREE.OrbitControls(model.camera);
    //controls.noKeys = true;
    model.walls = makeWalls(model.assetManager, model.scene);

    model.fireballs = makeFireballPool(model.scene, model.camera);
    model.obstacles = makeObstaclePool(model.scene, model.assetManager);

    //model.rocks = makeRocks();
    model.stats = makeStats();

    model.soundManager.play('digging', {volume: 50});
    model.soundManager.play('wind', {volume: 50});
    model.camera.rotation.x -= Math.PI / 2;

    model.monsterDirtParticles = new MonsterDirtEmitter(model.scene, G.NUM_DIRT_PARTICLES);

    //model.camera.position.set(0,0.1,0);

    var clock = new THREE.Clock();
    var update = function () {
        var dt = clock.getDelta();

        // Handle Input
        model.input.update();

        // Update World
        TWEEN.update();
        updateMonster(dt, model.soundManager, model.monster, model.camera);
        updateScoreDisplay(dt, model.stats);
        updateWalls(dt, model.walls);

        // Check for collisions and responses
        var collidesWithWalls = updatePlayerMovement(dt, model.input, model.camera);
        if (!model.player.isInvincible &&
                (collidesWithWalls ||
                    playerCollidesWithObjects(model.fireballs.getSpawnedObjects(), model.camera) ||
                    playerCollidesWithObjects(model.obstacles.getSpawnedObjects(), model.camera))) {
            handleObstacleHit(dt, model.player, model.camera);
        }
        handleReorientingAfterHit(dt, model.input, model.player, model.camera);

        doScreenShake(model.renderer);

        updateFireballAnimations(dt, model.fireballs.getSpawnedObjects());
        model.monsterDirtParticles.update(dt);

        // Render World
        model.renderer.render(model.scene, model.camera);

        model.fireballs.update(dt);
        model.obstacles.update(dt);

        // Check for game over
        if (checkIfGameOver(model.camera)) {
            soundManager.stop('digging');
            soundManager.stop('wind');
            GameOverState();
        }
        else {
            requestAnimationFrame(update);
        }
    };
    requestAnimationFrame(update);
};

var GameOverState = function() {
    $('#game-over-state').show();
    model.soundManager.play('creditsSong');
    $('#final-score-display').text(parseInt(model.stats.metersFallen));

    $('#restart-button').click(function() {
        window.location.href = window.location.href;
    });
};

$(document).ready(function() {
    var assetManager = new UTIL.AssetManager();
    assetManager.loadImage('ground', 'assets/images/wall-dirt.png');
    assetManager.loadImage('vines', 'assets/images/vines.png');
    assetManager.loadBGM('titleMusic', 'assets/audio/title-background-music.wav');
    assetManager.loadSoundEffect('creditsSong', 'assets/audio/song-under-the-credit.wav');
    //assetManager.loadImage('ground', 'assets/images/pepsi.png');
    assetManager.loadBGM('digging', 'assets/audio/digging-through-dirt.wav');
    assetManager.loadBGM('wind', 'assets/audio/wind.wav');
    for (var i=1; i<=7; i++) {
        assetManager.loadSoundEffect('crunch' + i, 'assets/audio/crunch'+i+'.wav');
        assetManager.loadSoundEffect('satisfied', 'assets/audio/satisfied-monster.wav');
    }
    assetManager.start(function() {
        _.extend(model, {
            input: new UTIL.Input(),
            soundManager: assetManager.soundManager,
            assetManager: assetManager
        });
        TitleState();
    });
});
