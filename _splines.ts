/// <reference path="types.d.ts" />

const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const context = canvas.getContext("2d");


const origin = vec2.fromValues(200, 200);
const controls: vec2[] = [
    origin,
    vec2.fromValues(origin[0] - 50, origin[1] - 150),
    vec2.fromValues(origin[0] + 150, origin[1] + 50),
    vec2.fromValues(origin[0] + 100, origin[1] - 100),
]
const knots: Float[] = [
    0, 0, 0, 0, 1, 1, 1, 1
]
let movePoint = -1;
function init() {
    context.lineWidth = 2
    context.lineCap = "round";

    if (context === null) {
        alert("Unable to initialize Canvas 2D. Your browser or machine may not support it.");
    }
    else {
        drawSpline()
    }
}

const drawSpline = () => {
    const points = b_spline_points(controls, knots, 3, 500);

    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        context.fillRect(point[0], point[1], 2, 2);
    }
    const colors = ['red','green','blue','purple']
    for (let i  = 0;i < controls.length; i++) {
        let p = controls[i];
        context.fillStyle = colors[i];
        context.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5);
        context.fillStyle = 'black'
    }
}

const getNearestControlIndex = (to: vec2) => {
    let nearest = Infinity;
    let idx = -1;
    for (let i = 0; i < controls.length; i++) {
        let distance = vec2.distance(controls[i], to);
        if (distance < nearest) {
            idx = i;
            nearest = Math.min(distance, nearest);
        }

    }
    return idx;
}



document.body.addEventListener('mousedown', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const loc = vec2.fromValues(x, y);
    const controlIdx = getNearestControlIndex(loc);
    if (controlIdx != -1) {
        movePoint = controlIdx;
    }
})
document.body.addEventListener('mouseup', (e) => {
    // if (movePoint != -1) {
    //     context.clearRect(0, 0, canvas.width, canvas.height);
    //     drawSpline();
    // }
    movePoint = -1;
});

document.body.addEventListener('mousemove', (e) => {
    if (movePoint != -1) {
        controls[movePoint][0] = e.clientX;
        controls[movePoint][1] = e.clientY;
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawSpline();
    }
})

window.onload = init

type Float = number
type Int = number


function blend(u: Float, k: Int, d: Int, knots: Float[]) {
    if (d == 0) {
        return Number(u >= knots[k] && u <= knots[k + 1]);
    }
    let A = 0;
    let B = 0;

    let A_Denominator = (knots[k + d] - knots[k])
    let B_Denominator = (knots[k + d + 1] - knots[k + 1])

    if (A_Denominator != 0) {
        A = ((u - knots[k]) / A_Denominator) * blend(u, k, d - 1, knots);
    }
    if (B_Denominator != 0) {
        B = (((knots[k + d + 1] - u)) / B_Denominator) * blend(u, k + 1, d - 1, knots);
    }
    return (A + B);

}

function b_spline_points(controls: vec2[], knots: Float[], d: Int, size: Int) {
    let points = []
    for (let i = 0; i <= size; i++) { // Approximate  size points
        let u = i / size;
        let p = vec2.fromValues(0, 0);
        for (let k = 0; k < controls.length; k++) {
            const B_k_d = blend(u, k, d, knots);
            vec2.add(p, p, vec2.fromValues(B_k_d * controls[k][0], B_k_d * controls[k][1]));
        }
        points.push(p);
    }
    return points;
}



export { }