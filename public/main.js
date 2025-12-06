const socket = io();

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,5,10);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera,renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff,0.7);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff,1);
dirLight.position.set(10,20,10);
scene.add(dirLight);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50,50),
  new THREE.MeshStandardMaterial({color:0x228B22})
);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// Local player
const localPlayer = new THREE.Mesh(
  new THREE.BoxGeometry(0.5,1,0.5),
  new THREE.MeshStandardMaterial({color:0xff0000})
);
localPlayer.position.y = 0.5;
scene.add(localPlayer);

// Remote players
const remotePlayers = {};

// Loot
const lootMeshes = {};
const lootSize = 0.5;

// Socket events
socket.on('currentPlayers', players => {
  for(const id in players){
    if(id !== socket.id){
      const p = players[id];
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5,1,0.5),
        new THREE.MeshStandardMaterial({color:0x0000ff})
      );
      mesh.position.set(p.x,p.y,p.z);
      scene.add(mesh);
      remotePlayers[id] = mesh;
    }
  }
});

socket.on('newPlayer', data => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.5,1,0.5),
    new THREE.MeshStandardMaterial({color:0x0000ff})
  );
  mesh.position.set(data.pos.x,data.pos.y,data.pos.z);
  scene.add(mesh);
  remotePlayers[data.id] = mesh;
});

socket.on('playerMoved', data => {
  if(remotePlayers[data.id]){
    remotePlayers[data.id].position.set(data.pos.x,data.pos.y,data.pos.z);
  }
});

socket.on('playerDisconnected', id => {
  if(remotePlayers[id]){
    scene.remove(remotePlayers[id]);
    delete remotePlayers[id];
  }
});

socket.on('currentLoot', lootArray => {
  lootArray.forEach(l => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(lootSize,lootSize,lootSize),
      new THREE.MeshStandardMaterial({color:0xffff00})
    );
    mesh.position.set(l.x,lootSize/2,l.z);
    scene.add(mesh);
    lootMeshes[l.id] = mesh;
  });
});

socket.on('lootRemoved', lootId => {
  if(lootMeshes[lootId]){
    scene.remove(lootMeshes[lootId]);
    delete lootMeshes[lootId];
  }
});

// Player movement
const keys = {};
window.addEventListener('keydown', e=>keys[e.key.toLowerCase()]=true);
window.addEventListener('keyup', e=>keys[e.key.toLowerCase()]=false);

function movePlayer(){
  const speed = 0.1;
  if(keys['w']) localPlayer.position.z -= speed;
  if(keys['s']) localPlayer.position.z += speed;
  if(keys['a']) localPlayer.position.x -= speed;
  if(keys['d']) localPlayer.position.x += speed;

  socket.emit('playerMovement',{
    x: localPlayer.position.x,
    y: localPlayer.position.y,
    z: localPlayer.position.z
  });

  camera.position.x = localPlayer.position.x + 5;
  camera.position.z = localPlayer.position.z + 10;
  camera.lookAt(localPlayer.position);
}

// Click loot
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', e=>{
  mouse.x = (e.clientX/window.innerWidth)*2-1;
  mouse.y = -(e.clientY/window.innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  for(const id in lootMeshes){
    const intersects = raycaster.intersectObject(lootMeshes[id]);
    if(intersects.length>0){
      socket.emit('lootCollected', id);
    }
  }
});

// Animate
function animate(){
  requestAnimationFrame(animate);
  movePlayer();
  renderer.render(scene,camera);
  controls.update();
}
animate();

// Resize
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
