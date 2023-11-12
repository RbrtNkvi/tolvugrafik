        

  const canvas = document.querySelector('#c');
  const scoreTag = document.querySelector('#score');

  let score = 0;
  let lose = 0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('black');

  const camera = new THREE.PerspectiveCamera( 75, canvas.clientWidth/canvas.clientHeight, 0.1, 1000 );
	camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({canvas});

  const controls = new THREE.OrbitControls( camera, canvas );

  const gnomeBase = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const gnomeHat = new THREE.ConeGeometry(0.3, 0.5, 10);
  const gnomeBaseMat = new THREE.MeshPhongMaterial( { color: 0x44aa88 } );
  const gnomeHatMat = new THREE.MeshPhongMaterial( { color: 0xff0000})
  const gnomeBaseMesh = new THREE.Mesh( gnomeBase, gnomeBaseMat );
  const gnomeHatMesh = new THREE.Mesh( gnomeHat, gnomeHatMat );
  gnomeBaseMesh.position.y = -0.25;
  gnomeHatMesh.position.y = 0.25;
  const gnome = new THREE.Object3D();
  scene.add(gnome);
  gnome.add(gnomeBaseMesh);
  gnome.add(gnomeHatMesh);
  gnome.position.z = 7.5;

  let fungi = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ];

  function createFungi(x,z) {
    const fungiBase = new THREE.CylinderGeometry( 0.25, 0.25, 1, 12 );
    const fungiHat = new THREE.SphereGeometry( 0.7, 5, 5, 0, 2*Math.PI, 0, 0.5*Math.PI );
    const fungiColor = new THREE.MeshPhongMaterial({ color: 0xbc00bf });
    const fungiBaseMesh = new THREE.Mesh( fungiBase, fungiColor );
    const fungiHatMesh = new THREE.Mesh( fungiHat, fungiColor );
    const fungus = new THREE.Object3D();

    scene.add(fungus);
    fungus.add(fungiBaseMesh);
    fungus.add(fungiHatMesh);

    fungus.position.set( x, 0, z );

    fungi[z + 7.5][x+7] = [fungus, 4];
  }

  for( let i = 0; i < 14; i++ ){
    let xCoord = Math.floor(Math.random()*15 - 7);
    createFungi(xCoord, i - 6.5);
  }

  const planeGeo = new THREE.PlaneGeometry(15,16,2,2);
  const planeMat = new THREE.MeshPhongMaterial( { color: 0x82e709 });
  const plane = new THREE.Mesh( planeGeo, planeMat );
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(0, -0.5, 0);
  scene.add( plane );

  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(-1, 5, 4);
  scene.add(light);

  let centipede = [0,0,0,0,0,0];
  let centipedeAlive = [0,0,0,0,0,0];

  function createCentipede() {
    for( let i = 0; i < 6; i++ ){
      const centipedeGeometry = new THREE.SphereGeometry(0.4, 10, 10);
      const centipedeMaterial = new THREE.MeshPhongMaterial({ color: 0x2109e7 });
      const centipedeMesh = new THREE.Mesh(centipedeGeometry, centipedeMaterial);
      scene.add(centipedeMesh);
      centipedeMesh.position.z = -7.5 - i;
      centipede[i] = [centipedeMesh, 10, -1];
      centipedeAlive[i] = 1;
    }
    centipede[0][1] = 100;
  }

  createCentipede();

  function centipedeAnim() {
    let dir = 0;
    let newLoc = 0;
    for( let i = 0; i < centipede.length; i++ ){
      if(centipedeAlive[i] == 1){
        dir = centipede[i][2];
        newLoc = centipede[i][0].position.x + dir*0.1;
        if(centipede[i][0].position.z < -7.5){
          centipede[i][0].position.z += 0.125;
          continue;
        }

        if(fungi[Math.round(centipede[i][0].position.z - 0.5 + 8)][Math.round(newLoc + 7)] != 0 
          || (newLoc < - 7.1 && dir < 0) 
          || (newLoc> 7.1 && dir > 0)) {
          centipede[i][2] = (-1)*dir;
          if(centipede[i][0].position.z < 7) {
            centipede[i][0].position.z += 1;
          }
          continue;
        }

        if(centipede[i][0].position.z > 7){
          if(gnome.position.x + 0.25 > centipede[i][0].position.x && gnome.position.x - 0.25 < centipede[i][0].position.x){
            lose = 1;
            break;
          }
        }
        centipede[i][0].position.x = newLoc;
      }
    }
  }

  let shotCooldown = 0;
  let shots = [];
  let shotsAvailable = [];
  function shoot() {
    let index = shots.length;
    for( let i = 0; i < shots.length; i++ ){
      if(shotsAvailable[i] == 0){
        index = i;
        break;
      }
    }
    const shotGeometry = new THREE.SphereGeometry( 0.1, 10, 10 );
    const shotMaterial = new THREE.MeshPhongMaterial( { emissive: 0x03fff2 } );
    const shotMesh = new THREE.Mesh( shotGeometry, shotMaterial );

    scene.add(shotMesh);
    shotMesh.position.set( gnome.position.x, -0.25, gnome.position.z - 0.25);
    
    if( index < shots.length ){
      shots[index] = shotMesh;
      shotsAvailable[index] = 1;
    } else {
      shots.push(shotMesh);
      shotsAvailable.push(1);
    }
  }

  function shotAnim() {
    for( let i = 0; i < shots.length; i++ ){
      let shotZ = shots[i].position.z;
      let shotX = shots[i].position.x;
      if(shotsAvailable[i] == 1){
        shotZ -= 0.2;
        shots[i].position.z = shotZ;
        if(shotZ < -8){
          scene.remove(shots[i]);
          shotsAvailable[i] = 0;
        
        } else {
          let z = Math.round(shotZ)+8;
          let x = Math.round(shotX)+7;
          if(fungi[z][x] != 0){
            fungi[z][x][1] -= 1;
            if(fungi[z][x][1] <= 0){
              scene.remove(fungi[z][x][0]);
              fungi[z][x] = 0;
              score += 1;
            }
            shotsAvailable[i] = 0;
            scene.remove(shots[i]);
          } else {
            for(let j = 0; j < centipede.length; j++){
              if(centipedeAlive[j] == 1) {
                let centipedeZ = centipede[j][0].position.z;
                let centipedeX = centipede[j][0].position.x;
                if(((shotZ < centipedeZ + 0.4) && (shotZ > centipedeZ - 0.4)) && 
                   ((shotX < centipedeX + 0.4) && (shotX > centipedeX - 0.4))){
                    let fungiX = Math.round(centipedeX);
                    createFungi(fungiX, centipedeZ);
                    score += centipede[j][1];
                    if(j+1 < centipede.length){
                      centipede[j+1][1] = 100;
                    }
                    scene.remove(centipede[j][0]);
                    centipedeAlive[j] = 0;
                    scene.remove(shots[i]);
                    shotsAvailable[i] = 0;
                }
              }
            }
          }
        }
      }
    }
  }

  const animate = function () {
    setTimeout( function() {
    requestAnimationFrame( animate );

    scoreTag.innerHTML = "Stig: " + score;

    document.onkeydown = function(e) {
      switch(e.keyCode){
        case 76: //l
          camera.position.y = 3;
          camera.position.z = gnome.position.z + 5;
          break;
        case 75: //k
          camera.position.y = 0;
          camera.position.z = gnome.position.z;
          break;
        case 37: //left
          if(gnome.position.x > -7.1 ){
            controls.target.x -= 0.3;
            camera.position.x -= 0.3;
            gnome.position.x -= 0.3;
          }
          break;
        case 39: //right
          if(gnome.position.x < 7.1){
            controls.target.x += 0.3;
            camera.position.x += 0.3;
            gnome.position.x += 0.3;
          }
          break;
        case 32: //space
          if(shotCooldown > 10){
            shoot();
            shotCooldown = 0;
          }
          break;
      }
    }
    shotAnim();
    shotCooldown++;
    centipedeAnim();
    let centipedeDead = centipedeAlive.reduce((a, b) => a + b, 0);
    if( centipedeDead == 0 ){
      createCentipede();
    }
    
    controls.update();
    if(lose == 0){
      renderer.render( scene, camera );
    }
  }, 15 );
  }

  animate();


