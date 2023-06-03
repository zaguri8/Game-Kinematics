/// <reference path="types.d.ts" />

const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const context = canvas.getContext("2d");


const PLAYER_SIZE = 3


interface Kinematics {
    position: vec2;
    orientation: number;
    velocity: vec2;
    rotation: number;
}

interface SteeringOutput {
    linear: vec2;
    angular: number;
}

interface KinematicSteeringOutput {
    velocity: vec2;
    rotation: number;
}

interface PlayerInterface {
    kinematics: Kinematics;
    redraw: () => void;
    clear: () => void;
    update: () => void;
}
type PlayerControllerInterface = PlayerInterface & {
    setPosition: (position: vec2) => void
    getPosition: () => vec2
    updateSteering: (steering: SteeringOutput, deltaTime: number) => void
}

function getNewOrientation(currentOrientation: number, velocity: vec2) {
    if (vec2.length(velocity) > 0) {
        return Math.atan2(-vec2[0], vec2[1]);
    }
    return currentOrientation
}

function KinematicSeek(target: Kinematics, character: Kinematics) {

    return {
        maxSpeed: 0.01,
        getSteering: function (): KinematicSteeringOutput {
            let steering = {
                velocity: vec2.create(),
                rotation: 0
            } as KinematicSteeringOutput
            const direction = vec2.subtract(vec2.create(), target.position, character.position);
            vec2.add(steering.velocity, steering.velocity, direction);
            vec2.normalize(steering.velocity, steering.velocity);

            // full speed towards direction
            steering.velocity[0] *= this.maxSpeed;
            steering.velocity[1] *= this.maxSpeed;

            character.orientation =
                getNewOrientation(character.orientation, steering.velocity);

            steering.rotation = 0;
            return steering
        }
    }
}

function KinematicArrive(target: Kinematics, character: Kinematics) {

    return {
        maxSpeed: 0.1,
        maxAccelaration: 0.001,
        targetRadius: 10,
        slowRadius: 100,
        timeToTarget: 1,
        getSteering: function (): SteeringOutput | undefined {
            let steering = {
                linear: vec2.create(),
                angular: 0
            } as SteeringOutput
            const direction = vec2.subtract(vec2.create(), target.position, character.position);
            const distance = vec2.length(direction)
            if (distance < this.targetRadius) {
                return
            }
            let targetSpeed: number;

            if (distance > this.slowRadius) {
                targetSpeed = this.maxSpeed;
            } else {
                targetSpeed = this.maxSpeed * distance / this.slowRadius;
            }

            let targetVelocity = vec2.clone(direction);
            vec2.normalize(targetVelocity, targetVelocity);

            targetVelocity[0] *= targetSpeed;
            targetVelocity[1] *= targetSpeed;

            steering.linear[0] = targetVelocity[0] - character.velocity[0]
            steering.linear[1] = targetVelocity[1] - character.velocity[1]

            steering.linear[1] /= this.timeToTarget



            if (vec2.length(steering.linear) > this.maxAccelaration) {
                vec2.normalize(steering.linear, steering.linear);
                // full speed towards direction
                steering.linear[0] *= this.maxAccelaration;
                steering.linear[1] *= this.maxAccelaration;
            }

            return steering
        }
    }
}



function Player(position: vec2) {

    const commands = {
        kinematics: {
            position,
            velocity: vec2.fromValues(0.0, 0.0),
            rotation: 0,
            orientation: 0
        } as Kinematics,
        clear: function () {
            (this as PlayerInterface)
            context.clearRect(
                this.kinematics.position[0] - 5,
                this.kinematics.position[1] - 5,
                PLAYER_SIZE + 10, PLAYER_SIZE + 10);
        },
        update: function () {
            context.fillRect(this.kinematics.position[0], this.kinematics.position[1], PLAYER_SIZE, PLAYER_SIZE)
        }
    }

    return commands as PlayerInterface
}

const PlayerController = (P: PlayerInterface) => {
    return {
        ...P,
        getPosition: function () {
            return this.kinematics.position;
        },
        setPosition: function (pos: vec2) {
            this.clear();
            this.kinematics.position = pos;
            this.update();
        },
        updateSteering: function (steering: SteeringOutput, deltaTime: number) {
            this.clear();
            const kinematics = this.kinematics as Kinematics;
            kinematics.position[0]
                += kinematics.velocity[0] * deltaTime;
            kinematics.position[1]
                += kinematics.velocity[1] * deltaTime;
            kinematics.orientation += kinematics.rotation * deltaTime;

            kinematics.velocity[0] += steering.linear[0] * deltaTime;
            kinematics.velocity[1] += steering.linear[1] * deltaTime;
            kinematics.rotation += steering.angular * deltaTime;
            this.update();
        }

    } as PlayerControllerInterface
}




const compose = <S, R, T>(
    fn: (args: R) => S,
    fn2: (args: S) => T) => {
    return (args: R): S & T => {
        return fn2(fn(args)) as S & T
    }
}
const compose_3 = <S, R, T, Z>(
    fn: (args: R) => S,
    fn2: (args: S) => T,
    fn3: (args: T) => Z) => {
    return (args: R): S & T & Z => {
        return fn3(fn2(fn(args))) as S & T & Z
    }
}

const Controller = compose(Player, PlayerController)

const player = Controller(vec2.fromValues(200, 200));
const player2 = Controller(vec2.fromValues(200, 300));



function init() {
    context.lineWidth = 2
    context.lineCap = "round";

    if (context) {
        player.update();
    }
    else {
        alert("Unable to initialize Canvas 2D. Your browser or machine may not support it.");
    }
}

window.addEventListener('keydown', (e) => {
    keys[e.key] = 1
})

let keys = {}

window.addEventListener('keyup', (e) => {
    keys[e.key] = 0
})



let lastTime = Date.now();

setInterval(() => {
    let now = Date.now();
    let dt = now - lastTime;
    lastTime = Date.now();
    keys['ArrowRight'] && player.setPosition(vec2.fromValues(
        player.getPosition()[0] + 3,
        player.getPosition()[1]
    ))
    keys['ArrowLeft'] && player.setPosition(vec2.fromValues(
        player.getPosition()[0] - 3,
        player.getPosition()[1]
    ))
    keys['ArrowUp'] && player.setPosition(vec2.fromValues(
        player.getPosition()[0],
        player.getPosition()[1] - 3
    ))

    keys['ArrowDown'] && player.setPosition(vec2.fromValues(
        player.getPosition()[0],
        player.getPosition()[1] + 3
    ))

    const steering = {
        linear: [0, 0],
        angular: 0
    } as SteeringOutput

    // const kinematicSteering = KinematicSeek(player.kinematics, player2.kinematics);
    player.updateSteering(steering, dt);

    const kinematicSteering = KinematicArrive(player.kinematics, player2.kinematics);

    const enemeySteering = kinematicSteering.getSteering()
    if (enemeySteering)
        player2.updateSteering(enemeySteering, dt);

}, 16.6666666) // 60 FPS ?

window.onload = init;