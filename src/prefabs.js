function createTextTexture(text) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 256;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 192px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(text, 128, 128);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

GAME.Prefabs = Class.extend({

    makeBox: function(col, row, number) {
        // TODO cache textures in the asset manager that are created from canvases
        var mesh = new THREE.Mesh(
            new THREE.CubeGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial({
                color: '#888888',
                map: createNumberTexture(number)
            })
        );
        var box = ECS.Entity.createWithComponents(
            new GAME.ThreeJSObjectComponent(mesh)
        );
        return box;
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
