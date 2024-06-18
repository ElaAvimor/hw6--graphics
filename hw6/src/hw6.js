// Scene Declartion
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// This defines the initial distance of the camera, you may ignore this as the camera is expected to be dynamic
camera.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 4, 107));
camera.lookAt(0, 0, 0);


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


// done Texture Loading
// We usually do the texture loading before we start everything else, as it might take processing time
const textureLoader = new THREE.TextureLoader();
const ballTexture = textureLoader.load('src/textures/soccer_ball.jpg');

// done: Add Lighting
let directionalLightStart = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLightStart);

let directionalLightEnd = new THREE.DirectionalLight(0xffffff, 1);
directionalLightEnd.applyMatrix4(translation(0, 0, 100));
scene.add(directionalLightEnd);

let ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

let clock = new THREE.Clock();
let duration = 10;


// done: Goal
// You should copy-paste the goal from the previous exercise here
// Geometry constants.
const SKELETON_RADIUS = 0.05;
const CROSSBAR_LENGTH = 3.0;
const GOAL_POST_LENGTH = CROSSBAR_LENGTH / 3;
const POSTS_ANGLE = 35;


// Materials
const goalMaterial = new THREE.MeshPhongMaterial({color: "0xffffff"});
const netMaterial = new THREE.MeshBasicMaterial({color: 0x888888, side: THREE.DoubleSide, transparent: true, opacity: 0.5});
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
const flagTexture = textureLoader.load('/src/textures/manchester-united-flag.jpg');

const unitedlagMaterial = new THREE.MeshBasicMaterial({ map: flagTexture, side: THREE.DoubleSide });
const unitedflagGeometry = new THREE.PlaneGeometry(16, 8); 

const unitedFlag = new THREE.Mesh(unitedflagGeometry, unitedlagMaterial);

// Position the flag on top of the goal
unitedFlag.position.set(0, GOAL_POST_LENGTH / 2 + 8, 0);
//flag.rotation.set(degrees_to_radians(90), 0, 0);

// Add the flag to the goal
skeleton.add(unitedFlag);

// Flag Constants
const FLAG_POST_HEIGHT = GOAL_POST_LENGTH * 1.2;  // Make the flag post taller than the goal post.
const FLAG_POST_RADIUS = SKELETON_RADIUS;  // Same radius as the skeleton of the goal.
const FLAG_WIDTH = CROSSBAR_LENGTH / 4;
const FLAG_HEIGHT = GOAL_POST_LENGTH / 2;

// Flag Materials
const flagPostMaterial = new THREE.MeshPhongMaterial({ color: 'black', side: THREE.DoubleSide});
const flagMaterial = new THREE.MeshPhongMaterial({ color: 'red', side: THREE.DoubleSide });

// Flag Post Geometry
const flagPostGeometry = new THREE.CylinderGeometry(FLAG_POST_RADIUS, FLAG_POST_RADIUS, FLAG_POST_HEIGHT, 32);

// Flag Geometry
const flagShape = new THREE.Shape();
flagShape.moveTo(0, 0);
flagShape.lineTo(FLAG_WIDTH, 0);
flagShape.lineTo(FLAG_WIDTH / 2, FLAG_HEIGHT);
flagShape.lineTo(0, 0);
const flagGeometry = new THREE.ShapeGeometry(flagShape);

// Creating flags
function createFlag(xPosition) {
    const flagPost = new THREE.Mesh(flagPostGeometry, flagPostMaterial);
    // Set the bottom of the flag post to align with the bottom of the goal post
    flagPost.position.set(xPosition, -GOAL_POST_LENGTH / 2, 0);

    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    // Position the triangle at the top of the post
    flag.position.set(xPosition, GOAL_POST_LENGTH / 3.5 - FLAG_POST_HEIGHT + FLAG_HEIGHT / 2, 0);
    flag.rotation.z = Math.PI / 2;  // Rotate to position perpendicular

    // Orient the flag based on the side to point away from the goal
    if (xPosition < 0) {
        flag.rotation.y = Math.PI * 2;  // For the left flag, rotate to ensure it points outward to the left
    } else {
        flag.rotation.y =  - Math.PI;  // For the right flag, rotate to ensure it points outward to the right
    }
    // Add to the scene
    skeleton.add(flagPost);
    skeleton.add(flag);
}
// Add flags to both sides of the goal, slightly outside the crossbar ends
const flagOffset = FLAG_WIDTH / 2 + FLAG_POST_RADIUS;  // Calculate the flag offset from the goal ends
createFlag(-CROSSBAR_LENGTH / 2 - flagOffset);  // Left flag
createFlag(CROSSBAR_LENGTH / 2 + flagOffset);  // Right flag





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


// done: Ball
// You should add the ball with the soccer.jpg texture here
// Ball
const ballGeometry = new THREE.SphereGeometry(GOAL_POST_LENGTH / 4, 132, 64);
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.applyMatrix4(translation(0, 0, 100));
scene.add(ball);

// done: Bezier Curves
const start = new THREE.Vector3(0, 0, 100);
const end = new THREE.Vector3(0, 0.5, -1);
const midRight = new THREE.Vector3(50, 0, 50);  // Right Winger Route
const midCenter = new THREE.Vector3(0, 50, 50);  // Center Forward Route
const midLeft = new THREE.Vector3(-50, 0, 50);  // Left Winger Route

const curves = {
    middleCurve: addCurve(start, midCenter, end),
    rightCurve: addCurve(start, midRight, end),
    leftCurve: addCurve(start, midLeft, end)
}

const curveGeometry = []
curveGeometry.push(new THREE.QuadraticBezierCurve3(start, midLeft, end));
curveGeometry.push(new THREE.QuadraticBezierCurve3(start, midCenter, end));
curveGeometry.push(new THREE.QuadraticBezierCurve3(start, midRight, end));

scene.add(curves.middleCurve);
scene.add(curves.rightCurve);
scene.add(curves.leftCurve);

let currentCurve = 1;

// TODO: Camera Settings
// Set the camera following the ball here
let offset = new THREE.Vector3(0, 40, 30);
// const rotationMatrix = new THREE.Matrix4().makeRotationY(degrees_to_radians(45));
// offset.applyMatrix4(rotationMatrix);
let cameraPosition = new THREE.Vector3().addVectors(ball.position, offset);
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
camera.rotation.x = degrees_to_radians(-25.5);


// TODO: Add collectible cards with textures
const cardGeometry = new THREE.PlaneGeometry(0.65, 1);

const yellowCardTexture = textureLoader.load('src/textures/yellow_card.jpg');
const yellowCardMaterial = new THREE.MeshPhongMaterial({ map: yellowCardTexture, side: THREE.DoubleSide });
let yellowCards = createCards(cardGeometry, yellowCardMaterial, curveGeometry, scene);

const redCardTexture = textureLoader.load('src/textures/red_card.jpg');
const redCardMaterial = new THREE.MeshPhongMaterial({ map: redCardTexture, side: THREE.DoubleSide });
let redCards = createCards(cardGeometry, redCardMaterial, curveGeometry, scene);

// Combine yellowCards and redCards into a single array
let cards = [...yellowCards, ...redCards].sort((a, b) => b.position.z - a.position.z);

function createCards(cardGeometry, cardMaterial, curveGeometry, scene) {
    const cards = [];
    for (let j = 0; j < 3; j++) {  
        for (let i = 0; i < curveGeometry.length; i++) {
            const curve = curveGeometry[i];
            const point = curve.getPoint(Math.random());
            const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
            cardMesh.position.copy(point); 
            scene.add(cardMesh);
            cardMesh.curveIndex = i;
            cards.push(cardMesh); 
        }
    }
    return cards;
}

let yellowHits = 0;
let redHits = 0;

// Initialize necessary variables
let currentIncrement = 0; // Initial increment position on the curve
const increments = 5000; // Total increments between start and end of the curve
const curve = new THREE.Curve(); // Replace with your actual curve

// Function to move the ball to a new position on the curve
function moveBall(currentCurve) {
    const ballPosition = curveGeometry[currentCurve].getPoint((100 - ball.position.z) / 100);
    ball.position.set(ballPosition.x, ballPosition.y, ballPosition.z);
}

// Handle keyboard events
const handle_keydown = (e) => {
    if (e.code === 'ArrowRight') {
        currentCurve = (currentCurve + 1) % 3;
    } else if (e.code === 'ArrowLeft') {
        currentCurve = (currentCurve - 1) % 3;
        if (currentCurve < 0) {
            currentCurve = 2;
        }
    }
    moveBall(currentCurve);
    updateCameraPosition(); // Update the camera position after moving the ball
};


document.addEventListener('keydown', handle_keydown);


let t = 0;

function animate() {

	requestAnimationFrame( animate );

	// TODO: Animation for the ball's position
    let elapsedTime = clock.getElapsedTime();

    
    // Calculate the current time along the curve (from 0 to 1)
    t = elapsedTime / duration % 1;

    let point = curveGeometry[currentCurve].getPoint(t);

    let ballMatrix = new THREE.Matrix4().makeTranslation(point.x, point.y, point.z);

    ball.matrix.copy(ballMatrix);
    ball.matrix.decompose(ball.position, ball.quaternion, ball.scale);

    // TODO: Test for card-ball collision
    if (cards.length > 0 && cards[0].position.z > ball.position.z) {
        if (cards[0].curveIndex == currentCurve) {
            cards[0].visible = false;
            if (cards[0].material === redCardMaterial) {
                redHits += 1;
            } else if (cards[0].material === yellowCardMaterial) {
                yellowHits += 1;
            }
        }
        cards.shift();
    }
    if (ball.position.z < -0.5) {
        const fairPlay = 100 * (Math.pow(2, -(yellowHits + 10 * redHits) / 10));
        resetCards();
        alert('Your fair play score is ' + fairPlay);
        yellowHits = 0;
        redHits = 0;
        currentCurve = 1;
        t = 0;
        ball.applyMatrix4(translation(0, -0.5, 100.5));
        
        updateCameraPosition();
    }

	renderer.render( scene, camera );
    updateCameraPosition();
}

animate()

function updateCameraPosition() {
    camera.position.set(0, camera.position.y, ball.position.z + offset.z);
    //camera.lookAt(ball.position);
}



function resetCards() {
    // for (let i = 0; i < yellowCards.length; i++) {
    //     yellowCards[i].visible = false;
    // }
    // for (let i = 0; i < redCards.length; i++) {
    //     redCards[i].visible = false;
    // }
    // yellowCards = createCards(cardGeometry, yellowCardMaterial, curveGeometry, scene);
    // redCards = createCards(cardGeometry, redCardMaterial, curveGeometry, scene);
    // cards = [...yellowCards, ...redCards].sort((a, b) => b.position.z - a.position.z);

    // yellowHits = 0;
    // redHits = 0;
    window.location.reload()
    
}
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

function addCurve(start, pos, end) {
    const curve = new THREE.QuadraticBezierCurve3(start, pos, end);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0 });
    const curveObject = new THREE.Line(geometry, material);

    return curveObject;
}
