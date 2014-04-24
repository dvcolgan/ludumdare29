var tileStyles = {
    '2': {
        color: '#776e65',
        background: '#eee4da'
    },
    '4': {
        color: '#776e65',
        background: '#ede0c8'
    },
    '8': {
        color: '#f9f6f2',
        background: '#f2b179'
    },
    '16': {
        color: '#f9f6f2',
        background: '#f59563'
    },
    '32': {
        color: '#f9f6f2',
        background: '#f67c5f'
    },
    '64': {
        color: '#f9f6f2',
        background: '#f65e3b'
    },
    '128': {
        color: '#f9f6f2',
        background: '#edcf72'
    },
    '256': {
        color: '#f9f6f2',
        background: '#edcc61'
    },
    '512': {
        color: '#f9f6f2',
        background: '#edc850'
    },
    '1024': {
        color: '#f9f6f2',
        background: '#edc53f'
    },
    '2048': {
        color: '#f9f6f2',
        background: '#edc22e'
    }
};

function createNumberTexture(number) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;
    ctx.fillStyle = tileStyles[number].background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = tileStyles[number].color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 192px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(number, 128, 128);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

GAME.prefabs.makePlayer = function() {
    var shape = new CANNON.Box(new CANNON.Vec3(100, 100, 100));
    var body = new CANNON.RigidBody(5, shape);
    body.position.set(0,200,0);

    var mesh = new THREE.Mesh(
        new THREE.CubeGeometry(200, 200, 200, 1, 1, 1),
        new THREE.MeshLambertMaterial({
            color: '#ffffff',
            map: this.assets['leaves.png']
        })
    );
    mesh.castShadow = true;

    var player = ECS.Entity.createWithComponents(
        new GAME.ActionInputComponent(),
        new GAME.KeyboardArrowsInputComponent(),
        new GAME.ThreeJSObjectComponent(mesh),
        new GAME.CannonPhysicsObjectComponent(body)
    );
    return player;
};

GAME.Prefabs = Class.extend({

    makeTile: function(col, row, number) {
        // TODO cache textures in the asset manager that are created from canvases
        var mesh = new THREE.Mesh(
            new THREE.CubeGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial({
                color: '#888888',
                map: createNumberTexture(number)
            })
        );
        var tile = ECS.Entity.createWithComponents(
            new GAME.GridPositionComponent(col, row),
            new GAME.NumericValueComponent(number),
            new GAME.ThreeJSObjectComponent(mesh)
        );
        return tile;
    },

    makeFloor: function() {
        //var texture = this.assets.cloneTexture('leaves', 'tiledLeaves');
        //texture.needsUpdate = true;
        //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        //texture.repeat.set(10, 10);
        var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(7, 7, 1, 1),
            new THREE.MeshPhongMaterial({
                specular: '#222222',
                color: '#111111',
                emissive: '#000000',
                shininess: 10 
            })
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y -= 0.5;
        var floor = ECS.Entity.createWithComponents(
            new GAME.ThreeJSObjectComponent(mesh)
        );
        return floor;

    }
});
