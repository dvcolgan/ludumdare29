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

    var mass = 5;
    var radius = 3;
    var body = new CANNON.RigidBody(mass,
        new CANNON.Sphere(radius)
    );

    return new ECS.Entity.createWithComponents(
        new C.KeyboardArrowsInput(),
        new C.ActionInput(),
        new C.RigidBody(body),
        new C.Camera(camera)
    );
};

P.makeRock = function() {
    var mesh = new THREE.Mesh(
        new THREE.CubeGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 'brown' })
    );
    var mass = 1;
    var radius = 1;
    var body = new CANNON.RigidBody(mass,
        new CANNON.Sphere(radius),
        window.stone
    );
    //var body = new CANNON.RigidBody(mass,
    //    new CANNON.Box(new CANNON.Vec3(2, 2, 2))
    //);

    return new ECS.Entity.createWithComponents(
        new C.Rock(),
        new C.RigidBody(body),
        new C.Mesh(mesh)
    );
};

P.makeGameStats = function() {
    return new ECS.Entity.createWithComponents(
        new C.Score()
    );
};
