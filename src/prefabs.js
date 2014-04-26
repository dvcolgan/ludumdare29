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

P.makePlayer = function() {
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

    return new ECS.Entity.createWithComponents(
        new C.KeyboardArrowsInput(),
        new C.ActionInput(),
        new C.Camera(camera)
    );
    //new C.RigidBody(body)
};

P.makeRock = function() {
    var mesh = new THREE.Mesh(
        new THREE.CubeGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 'brown' })
    );

    return new ECS.Entity.createWithComponents(
        new C.Rock(),
        new C.Mesh(mesh)
    );
};
