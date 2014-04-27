function updateMonster(dt, soundManager, monster, camera) {
    var bottomJaw = monster.bottomJaw;
    var upperJaw = monster.upperJaw;
    if (bottomJaw.direction === 'opening') {
        bottomJaw.rotation.x += G.JAW_MOVEMENT_SPEED;
        if (bottomJaw.rotation.x >= 0) {
            bottomJaw.direction = 'closing';
            var which = _.sample([
                'crunch1', 'crunch2', 'crunch3',
                'crunch4', 'crunch5', 'crunch6', 'crunch7'
            ]);
            soundManager.play(which, {
                volume: (camera.position.y / G.AREA_RADIUS) * 70 + 30
            });
        }
    }
    else {
        bottomJaw.rotation.x -= G.JAW_MOVEMENT_SPEED;
        if (bottomJaw.rotation.x <= -Math.PI/2) {
            bottomJaw.direction = 'opening';
        }
    }
    if (upperJaw.direction === 'opening') {
        upperJaw.rotation.x -= G.JAW_MOVEMENT_SPEED;
        if (upperJaw.rotation.x <= 0) {
            upperJaw.direction = 'closing';
        }
    }
    else {
        upperJaw.rotation.x += G.JAW_MOVEMENT_SPEED;
        if (upperJaw.rotation.x >= Math.PI/2) {
            upperJaw.direction = 'opening';
        }
    }
}

function updateScoreDisplay(dt, stats) {
    stats.metersFallen += dt * 10;
    $('.meters-display').text(parseInt(stats.metersFallen) + ' m');
    if (stats.metersFallen < 10) {
        $('.meters-display').width(150);
    }
    else if (stats.metersFallen < 100) {
        $('.meters-display').width(175);
    }
    else if (stats.metersFallen < 1000) {
        $('.meters-display').width(200);
    }
    else if (stats.metersFallen < 10000) {
        $('.meters-display').width(225);
    }
    else {
        $('.meters-display').width(250);
    }
}

function checkIfGameOver(camera) {
    return camera.position.y >= G.AREA_RADIUS;
}

function updateWalls(dt, walls) {
    walls.texture.offset.y -= 5 * dt;
    walls.texture.offset.y %= 1;
    walls.texture.needsUpdate = true;
}

function playerCollidesWithObjects(fireballs, camera) {
    for (var i=0; i<fireballs.length; i++) {
        var fireball = fireballs[i];
        if (fireball.mesh.position.distanceTo(camera.position) < 5) {
            return true;
        }
    }
    return false;
}

function handleObstacleHit(dt, player, camera) {
    player.isInvincible = true;
    // Move the player closer to the monster
    camera.position.y += G.AMOUNT_MOVED_BACK_ON_HIT;

    // Rotate the player around
    var rotation = { x: camera.rotation.x };
    new TWEEN.Tween(rotation)
        .to({ x: Math.PI - Math.PI/2  }, 200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function() {
            camera.rotation.x = rotation.x;
        })
        .onComplete(function() {
            player.canReorient = true;
            player.isInvincible = false;
        }).start();
}

function handleReorientingAfterHit(dt, input, player, camera) {
    if (input.keys.space && player.canReorient) {
        var rotation = { x: camera.rotation.x };
        new TWEEN.Tween(rotation)
            .to({x: 2*Math.PI - Math.PI/2}, 700)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(function() {
                camera.rotation.x = rotation.x;
            })
            .onComplete(function() {
                camera.rotation.x = -Math.PI/2;
                player.canReorient = false;
            }).start();
    }
}

function updatePlayerMovement(dt, input, camera) {
    // Move the player according to the arrow keys on the x, z plane
    var speed = G.PLAYER_MOVEMENT_SPEED * dt;
    var left = input.keys.left || input.keys.a;
    var right = input.keys.right || input.keys.d || input.keys.e;
    var up = input.keys.up || input.keys.w || input.keys.comma;
    var down = input.keys.down || input.keys.s || input.keys.o;

    if (left) {
        camera.position.x -= speed;
    }
    if (right) {
        camera.position.x += speed;
    }
    if (up) {
        camera.position.z -= speed;
    }
    if (down) {
        camera.position.z += speed;
    }

    return moveObjectInsideLevelIfOutside(camera.position);
}

function moveObjectInsideLevelIfOutside(position) {
    var distVec = new THREE.Vector3(position.x, 0, position.z);
    if (distVec.length() > G.ROCKS_RADIUS) {
        distVec.setLength(G.ROCKS_RADIUS - 10);
        position.x = distVec.x;
        position.z = distVec.z;
        return true;
    }
    return false;

}

// Based off of the PointerLockControls from the ThreeJS examples
//function updateCameraRotation(dt, input, player, camera) {
//    camera.rotation.set(0, 0, 0);
//
//    var PI_2 = Math.PI / 2;
//
//    player.yawObject.rotation.y -= input.mouse.movementX * 0.3 * dt;
//    player.pitchObject.rotation.x -= input.mouse.movementY * 0.3 * dt;
//
//    player.pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, player.pitchObject.rotation.x));
//}

function updateRocks(dt, rocks) {
    for (var i=0; i<rocks.length; i++) {
        var rock = rocks[i];
        var mesh = rock.components.mesh.mesh;
        mesh.position.y += 150 * dt * 0.02 * (10000 * (window.gameStats.metersFallen / 10000));
        if (mesh.position.y > AREA_RADIUS + 10) {
            this.pool.push(rock);
        }
        if (Math.random() < 0.001) {
            this.spawnRock();
        }
    }
}

function doScreenShake(renderer) {
    $(renderer.domElement)
        .css('top', Math.random() * 8 - 4)
        .css('left', Math.random() * 8 - 4);
}

function updateFireballAnimations(dt, fireballs) {
    for (var i=0; i<fireballs.length; i++) {
        var fireball = fireballs[i];
        //fireball.mesh.rotation.x += 0.1;
        fireball.outerMesh.rotation.y += 2 * dt;
    }
}
