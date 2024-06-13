// Scene Declartion
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// This defines the initial distance of the camera, you may ignore this as the camera is expected to be dynamic
camera.applyMatrix4(new THREE.Matrix4().makeTranslation(-5, 3, 110));
camera.lookAt(0, -4, 1)


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// helper function for later on
function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}


// Here we load the cubemap and pitch images, you may change it

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'src/pitch/right.jpg',
  'src/pitch/left.jpg',
  'src/pitch/top.jpg',
  'src/pitch/bottom.jpg',
  'src/pitch/front.jpg',
  'src/pitch/back.jpg',
]);
scene.background = texture;


// TODO: Texture Loading
// We usually do the texture loading before we start everything else, as it might take processing time
const textureLoader = new THREE.TextureLoader();
const ballTexture = textureLoader.load('hw6/src/textures/soccer_ball.jpg');


// TODO: Add Lighting
let directionalLightStart = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLightStart);

let directionalLightEnd = new THREE.DirectionalLight(0xffffff, 1);
directionalLightEnd.applyMatrix4(translation(0, 0, 100));
scene.add(directionalLightEnd);

let ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);


// TODO: Goal
// You should copy-paste the goal from the previous exercise here
// Geometry constants.
const SKELETON_RADIUS = 0.05;
const CROSSBAR_LENGTH = 3.0;
const GOAL_POST_LENGTH = CROSSBAR_LENGTH / 3;
const POSTS_ANGLE = 35;

// Materials
const goalMaterial = new THREE.MeshPhongMaterial({color: "white", wireframe: isWireFrameEnabled});
const netMaterial = new THREE.MeshBasicMaterial({color: 0x888888, side: THREE.DoubleSide, wireframe: isWireFrameEnabled});
const ballMaterial = new THREE.MeshPhongMaterial({ map: ballTexture });


// Setting up lighting for the MeshPhongMaterial
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Structure setup
const goal = new THREE.Group();
scene.add(goal);
const skeleton = new THREE.Group();
goal.add(skeleton);
const nets = new THREE.Group();
goal.add(nets);


/* Goal - Skeleton elements:*/
// Crossbar
const crossbarGeometry = new THREE.CylinderGeometry(SKELETON_RADIUS, SKELETON_RADIUS, CROSSBAR_LENGTH, 32);

const crossbar = new THREE.Mesh(crossbarGeometry, goalMaterial);
crossbar.applyMatrix4(rotate(90, 'z'));
skeleton.add(crossbar);

// Goal posts
const goalPostGeometry = new THREE.CylinderGeometry(SKELETON_RADIUS, SKELETON_RADIUS, GOAL_POST_LENGTH, 32);

const leftGoalPost = new THREE.Mesh(goalPostGeometry, goalMaterial);
leftGoalPost.applyMatrix4(translation(-CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, 0));
skeleton.add(leftGoalPost);

const rightGoalPost = new THREE.Mesh(goalPostGeometry, goalMaterial);
rightGoalPost.applyMatrix4(translation(CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, 0));
skeleton.add(rightGoalPost);

// Back supports
let zSupport = -GOAL_POST_LENGTH / 2 * Math.tan(degrees_to_radians(POSTS_ANGLE));
const BackSupportGeometry = new THREE.CylinderGeometry(SKELETON_RADIUS, SKELETON_RADIUS, GOAL_POST_LENGTH / Math.cos(degrees_to_radians(POSTS_ANGLE)), 32);

const rightBackSupport = new THREE.Mesh(BackSupportGeometry, goalMaterial);
rightBackSupport.applyMatrix4(rotate(POSTS_ANGLE, 'x'));
rightBackSupport.applyMatrix4(translation(CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, zSupport));
skeleton.add(rightBackSupport);

const leftBackSupport = new THREE.Mesh(BackSupportGeometry, goalMaterial);
leftBackSupport.applyMatrix4(rotate(POSTS_ANGLE, 'x'));
leftBackSupport.applyMatrix4(translation(-CROSSBAR_LENGTH / 2, -GOAL_POST_LENGTH / 2, zSupport));
skeleton.add(leftBackSupport);

// Handles the post and support intersections
const postSupportIntersection = new THREE.SphereGeometry(SKELETON_RADIUS, 32, 16);

const rightIntersection = new THREE.Mesh(postSupportIntersection, goalMaterial);
rightIntersection.applyMatrix4(translation(0, CROSSBAR_LENGTH / 2, 0));
crossbar.add(rightIntersection);

const leftIntersection = new THREE.Mesh(postSupportIntersection, goalMaterial);
leftIntersection.applyMatrix4(translation(0, -CROSSBAR_LENGTH / 2, 0));
crossbar.add(leftIntersection);

/* Goal - Nets elements (rectangular and triangular) */
const netGeometry = new THREE.PlaneGeometry(CROSSBAR_LENGTH, GOAL_POST_LENGTH / Math.cos(degrees_to_radians(POSTS_ANGLE)));

const backNet = new THREE.Mesh(netGeometry, netMaterial);
backNet.applyMatrix4(rotate(POSTS_ANGLE,'x'));
backNet.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zSupport));
nets.add(backNet);

// Building the triangle shape for the side nets
const triangleShape = new THREE.Shape();
let zTorus= -GOAL_POST_LENGTH / Math.tan(degrees_to_radians(POSTS_ANGLE)) / 2;
triangleShape.moveTo(0, 0); 
triangleShape.lineTo(0, -GOAL_POST_LENGTH); 
triangleShape.lineTo(zTorus, -GOAL_POST_LENGTH); 
triangleShape.lineTo(0, 0); 

const triangleGeometry = new THREE.ShapeGeometry(triangleShape);

const rightNet = new THREE.Mesh(triangleGeometry, netMaterial);
rightNet.applyMatrix4(rotate(-90, 'y'));
rightNet.applyMatrix4(translation(CROSSBAR_LENGTH / 2, 0, 0));
nets.add(rightNet);

const leftNet = new THREE.Mesh(triangleGeometry, netMaterial);
leftNet.applyMatrix4(rotate(-90, 'y'));
leftNet.applyMatrix4(translation(-CROSSBAR_LENGTH / 2, 0, 0));
nets.add(leftNet);

// Adding the toruses
const torusGeometry = new THREE.TorusGeometry(SKELETON_RADIUS * 1.25, SKELETON_RADIUS * 0.75, 32, 100);

const frontRightTorus = new THREE.Mesh(torusGeometry, goalMaterial);
frontRightTorus.applyMatrix4(rotate(90, 'x'));
frontRightTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, 0));
rightGoalPost.add(frontRightTorus);

const frontLeftTorus = new THREE.Mesh(torusGeometry, goalMaterial);
frontLeftTorus.applyMatrix4(rotate(90, 'x'));
frontLeftTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, 0));
leftGoalPost.add(frontLeftTorus);

const backLeftTorus = new THREE.Mesh(torusGeometry, goalMaterial);
backLeftTorus.applyMatrix4(rotate(90, 'x'));
backLeftTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zTorus));
leftGoalPost.add(backLeftTorus);

const backRightTorus = new THREE.Mesh(torusGeometry, goalMaterial);
backRightTorus.applyMatrix4(rotate(90, 'x'));
backRightTorus.applyMatrix4(translation(0, -GOAL_POST_LENGTH / 2, zTorus));
rightGoalPost.add(backRightTorus);


// TODO: Ball
// You should add the ball with the soccer.jpg texture here
// Ball
const ballGeometry = new THREE.SphereGeometry(GOAL_POST_LENGTH / 16, 32, 16);
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.applyMatrix4(translation(0, -GOAL_POST_LENGTH * 0.25, 0.75));
scene.add(ball);

// TODO: Bezier Curves
const start = new THREE.Vector3(0, 0, 100);
const end = new THREE.Vector3(0, 0.5, -1);
const midRight = new THREE.Vector3(50, 0, 50);  // Right Winger Route
const midCenter = new THREE.Vector3(0, 50, 50);  // Center Forward Route
const midLeft = new THREE.Vector3(-50, 0, 50);  // Left Winger Route

const curves = [
    new THREE.QuadraticBezierCurve3(start, midRight, end),
    new THREE.QuadraticBezierCurve3(start, midCenter, end),
    new THREE.QuadraticBezierCurve3(start, midLeft, end)
];

// Visualizing each curve
curves.forEach(curve => {
    const points = curve.getPoints(50);  // Sample points along the curve
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });  // Red for visibility
    const curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);  // Adding the curve to the scene
});


// TODO: Camera Settings
// Set the camera following the ball here


// TODO: Add collectible cards with textures





// TODO: Add keyboard event
// We wrote some of the function for you
const handle_keydown = (e) => {
	if(e.code == 'ArrowLeft'){
		// TODO
	} else if (e.code == 'ArrowRight'){
		// TODO
	}
}
document.addEventListener('keydown', handle_keydown);



function animate() {

	requestAnimationFrame( animate );

	// TODO: Animation for the ball's position


	// TODO: Test for card-ball collision

	
	renderer.render( scene, camera );

}
animate()

// Rotation matrix about the x,y,z axes.
function rotate(theta, axis) {
	let m = new THREE.Matrix4();
	theta = degrees_to_radians(theta)

	if(axis == 'x'){
		m.set(1, 0, 0, 0,
			0, Math.cos(theta), -Math.sin(theta), 0,
			0, Math.sin(theta), Math.cos(theta), 0,
			0, 0, 0, 1);
	}
	else if(axis == 'y'){
		m.set(Math.cos(theta), 0, Math.sin(theta), 0, 
		0, 1, 0, 0,
		-Math.sin(theta), 0, Math.cos(theta), 0, 
		0, 0, 0, 1);
	}
	else if(axis == 'z'){
		m.set(Math.cos(theta), -Math.sin(theta), 0, 0,
		Math.sin(theta), Math.cos(theta), 0, 0, 
		0, 0, 1, 0, 
		0, 0, 0, 1);
	}

	return m;
}


// General translation matrix.
function translation(x, y, z) {
    let m = new THREE.Matrix4();
    m.set(1, 0, 0, x, 
		  0, 1, 0, y,
          0, 0, 1, z,
          0, 0, 0, 1);
    return m
}