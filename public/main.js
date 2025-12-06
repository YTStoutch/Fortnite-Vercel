const socket = io();

// Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,5,10);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new THREE.OrbitControls(camera,renderer.domElement);

// Joueur local
const localPlayer = new THREE.Mesh(new THREE.BoxGeometry(0.5,1,0.5), new THREE.MeshStandardMaterial({color:0xff0000}));
localPlayer.position.y=0.5;
scene.add(localPlayer);

// Remote players
const remotePlayers = {};
const playersPos = {};

// Ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(50,50), new THREE.MeshStandardMaterial({color:0x228B22}));
ground.rotation.x=-Math.PI/2;
scene.add(ground);

// Lights
scene.add(new THREE.AmbientLight(0xffffff,0.7));
const dirLight = new THREE.DirectionalLight(0xffffff,1);
dirLight.position.set(10,20,10);
scene.add(dirLight);

// Loot
const lootMeshes = {};
const lootSize=0.5;

// Mouvement clavier
const keys={};
window.addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);
window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function movePlayer(){
  const speed=0.1;
  if(keys['z']||keys['w']) localPlayer.position.z-=speed;
  if(keys['s']) localPlayer.position.z+=speed;
  if(keys['q']||keys['a']) localPlayer.position.x-=speed;
  if(keys['d']) localPlayer.position.x+=speed;

  socket.emit('playerMovement',{ code:currentGameCode, playerId:myId, pos:{ x:localPlayer.position.x, y:localPlayer.position.y, z:localPlayer.position.z } });

  camera.position.x=localPlayer.position.x+5;
  camera.position.z=localPlayer.position.z+10;
  camera.lookAt(localPlayer.position);
}

// Interpolation remote players
function animate(){
  requestAnimationFrame(animate);
  movePlayer();
  renderer.render(scene,camera);
  controls.update();
}
animate();
