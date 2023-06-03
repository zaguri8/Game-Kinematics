const canvas = document.getElementById("glCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");
function init() {
    context.lineWidth = 2;
    context.lineCap = "round";
    if (context === null) {
        alert("Unable to initialize Canvas 2D. Your browser or machine may not support it.");
    }
    else {
        context.transform(1, 0, 0, -1, 0, canvas.height);
        let LineStart = vec2.fromValues(0, 0);
        let LineEnd = vec2.fromValues(LineStart[0], LineStart[1] + Math.floor(canvas.height / 2));
        const Origin = vec2.fromValues(100, 500);
        const xOffset = 150;
        const AxisReflectionAngle = 45;
        LineStart = rotatePoint(LineStart, 90 - AxisReflectionAngle);
        LineEnd = rotatePoint(LineEnd, 90 - AxisReflectionAngle);
        const [pStart, pEnd] = [
            translatePoint(LineStart, vec2.fromValues(Origin[0] + xOffset, Origin[1])),
            translatePoint(LineEnd, vec2.fromValues(Origin[0] + xOffset, Origin[1])),
        ];
        plotLine(context, pStart, pEnd);
        const TriangleP1 = vec2.fromValues(Origin[0] + 20 + xOffset, Origin[1]);
        const TriangleP2 = vec2.fromValues(Origin[0] + 40 + xOffset, Origin[1] + 20);
        const TriangleP3 = vec2.fromValues(Origin[0] + 60 + xOffset, Origin[1]);
        const [p1, p2, p3] = reflectTriangle(TriangleP1, TriangleP2, TriangleP3, AxisReflectionAngle);
        const [q1, q2, q3] = reflectTriangle(p1, p2, p3, 90);
        plotTriangle(context, TriangleP1, TriangleP2, TriangleP3);
        plotTriangle(context, p1, p2, p3, vec3.fromValues(255, 0, 255));
        plotTriangle(context, q1, q2, q3, vec3.fromValues(255, 0, 0));
    }
}
window.onload = init;
function centroid(...vecs) {
    const centroidPoint = vec2.create();
    const totalVecs = vecs.length;
    for (const vec of vecs) {
        vec2.add(centroidPoint, centroidPoint, vec);
    }
    vec2.scale(centroidPoint, centroidPoint, 1 / totalVecs);
    return centroidPoint;
}
function translatePoint(p, center) {
    let matTranslate = mat2d.create();
    mat2d.translate(matTranslate, matTranslate, center);
    let pOut = vec2.create();
    vec2.transformMat2d(pOut, vec2.clone(p), matTranslate);
    return pOut;
}
function rotatePoint(p, tetha) {
    const pOut = vec2.rotate(vec2.clone(p), p, vec2.fromValues(0, 0), -(tetha * Math.PI) / 180);
    return pOut;
}
function reflect(theta) {
    const cosTwoTheta = Math.cos(2 * theta);
    const sinTwoTheta = Math.sin(2 * theta);
    const result = mat2d.fromValues(cosTwoTheta, sinTwoTheta, sinTwoTheta, -cosTwoTheta, 0, 0);
    return mat2d.invert(result, result);
}
function reflectTriangle(p1, p2, p3, tetha = 90) {
    const reflection = reflect(tetha * (Math.PI) / 180);
    let p1Out = vec2.create(), p2Out = vec2.create(), p3Out = vec2.create();
    const p1In = vec2.clone(p1);
    const p2In = vec2.clone(p2);
    const p3In = vec2.clone(p3);
    const center = centroid(p1, p2, p3);
    const cX = center[0];
    const cY = center[1];
    p1In[0] -= cX - 25;
    p2In[0] -= cX - 25;
    p3In[0] -= cX - 25;
    p1In[1] -= cY - 25;
    p2In[1] -= cY - 25;
    p3In[1] -= cY - 25;
    vec2.transformMat2d(p1Out, p1In, reflection);
    vec2.transformMat2d(p2Out, p2In, reflection);
    vec2.transformMat2d(p3Out, p3In, reflection);
    p1Out[0] += cX - 25;
    p2Out[0] += cX - 25;
    p3Out[0] += cX - 25;
    p1Out[1] += cY - 25;
    p2Out[1] += cY - 25;
    p3Out[1] += cY - 25;
    return [p1Out, p2Out, p3Out];
}
function plotTriangle(context, p1, p2, p3, color = vec3.fromValues(0, 0, 0)) {
    plotLine(context, p1, p2, color);
    plotLine(context, p2, p3, color);
    plotLine(context, p3, p1, color);
}
function plotLine(context, start, end, color = vec3.fromValues(0, 0, 0)) {
    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.closePath();
    context.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
    context.stroke();
}
export {};
