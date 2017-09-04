// Encoding: UTF-8
'use strict';

const inputChip = {
    name: 'input',
    type: 'io',
    number: -1,
    description: '输入',
    inputNodes: [],
    outputNodes: [
        {y:0, name:' ', num:0}
    ],
    height: 1
};

const outputChip = {
    name: 'output',
    type: 'io',
    number: -1,
    description: '输出',
    inputNodes: [
        {y:0, name:' ', num:0}
    ],
    outputNodes: [],
    height: 1
};

const vcc = {
    name: 'Vcc',
    type: 'power',
    number: -1,
    description: 'Vcc',
    inputNodes: [],
    outputNodes: [
        {y:0, name:' ', num:0, specieName: 'vcc_i'}
    ],
    height: 1
};

const gnd = {
    name: 'GND',
    type: 'power',
    number: -1,
    description: 'GND',
    inputNodes: [],
    outputNodes: [
        {y:0, name:' ', num:0, specieName: 'gnd_i'}
    ],
    height: 1
};

const blankColor = 'white';
const strokeColor = 'black';
const colors = [strokeColor,'red', 'blue', 'green', 'DarkTurquoise', 'orange'];
var nowColor = 0;

const GRID_SZ = 15;

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;
const SLDR_GRAIN = 2000;

const PORT_R = GRID_SZ / 3.5;

// port node kind
const KIND_IN = 0;
const KIND_OUT = 1;
const nodeColor = 'LimeGreen';
const vccColor = 'red';
const gndColor = 'DarkGrey';
const nodeColors = {
    'in': nodeColor,
    'out': nodeColor,
    'vcc': vccColor,
    'gnd': gndColor,
    'gnd_i': gndColor,
    'vcc_i': vccColor,
    'bus_in': nodeColor,
    'bus_out': nodeColor
};

var nowNode = null;

// line state kind
const LINE_SELF = 0;
const LINE_TRI = 1;
const LINE_QUIN = 2;

// chip number limit
var numChipLeft = {};
for (let chip in c74s) numChipLeft[chip] = c74s[chip].number;

function decreChipNum(name) {
    numChipLeft[name] = numChipLeft[name] - 1;
    $('#'+name+' .badge').text(numChipLeft[name]);
    if (numChipLeft[name] === 0) $('#'+name).addClass('disabled');
}
function increChipNum(name) {
    numChipLeft[name] = numChipLeft[name] + 1;
    $('#'+name+' .badge').text(numChipLeft[name]);
    if (numChipLeft[name] !== 0) $('#'+name).removeClass('disabled');
}

var width = window.innerWidth;
var height = window.innerHeight;

var container = $('#container');

Konva.pixelRatio = 1.6;

var components = [];

var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height * 2
});

function getRelativeX(x) {return (x - stage.x()) / stage.scaleX();}
function getRelativeY(y) {return (y - stage.y()) / stage.scaleY();}
function getAbsoluteX(x) {return x * stage.scaleX() + stage.x();}

var layer = new Konva.Layer();
var dragLayer = new Konva.Layer();
stage.add(layer, dragLayer);

var focusEle = null;

function blurFocus() {
    deleteBtn.addClass('disabled');
    if (focusEle !== null) {
        if (Konva.Layer.prototype.isPrototypeOf(focusEle.parent)) {
            focusEle.strokeWidth(1.3);
        } else {
            focusEle.strokeWidth(1);
        }
        focusEle = null;
    }
}

var getNear = x => Math.round(x / GRID_SZ) * GRID_SZ;

var graph;

var defaultWidth = 5.0;

function sortFunc(aa, bb) {
    var a = aa.ref;
    var b = bb.ref;
    if (a.y() < b.y()) return -1;
    else if (a.y() > b.y()) return 1;
    else {
        if (a.x() < b.x()) return -1;
        else if (a.x() > b.x()) return 1;
        else {
            if (a.getZIndex() < b.getZIndex()) return -1;
            else if (a.getZIndex() > b.getZIndex()) return 1;
            else return 0;
        }
    }
}
function redrawLine(l, kind, xn, yn) {
    var points = l.savedPoints;

    if (kind === KIND_IN) {
        if (l.shapeKind == LINE_SELF) {
            let dx = points[0] - (xn);
            let dy = points[1] - yn;
            for (let i = 0; i < 12; i += 2) {
                points[i] -= dx;
                points[i+1] -= dy;
            }
            setPoints(l, points);
        } else {
            points[0] = xn; points[1] = yn; points[3] = yn;
            if (points[0] - points[2] < GRID_SZ) {
                points[2] = points[0] - GRID_SZ;
                points[4] = points[2];
            }
            if (l.shapeKind === LINE_TRI && points[4]-points[6] < GRID_SZ) {
                l.shapeKind = LINE_QUIN;

                let mid = (points[1] + points[7]) / 2;
                let b4 = points.slice(0, 4);
                let e4 = points.slice(-4);
                points = b4.concat([points[2], mid, points[2], mid]).concat(e4);
                let le = points.length;
                points[le-4] = points[le-2] + GRID_SZ;
                points[le-6] = points[le-4];
            }

            setPoints(l, points);
        }
    } else {
        if (l.shapeKind !== LINE_SELF) {
            var le = points.length;
            points[le-2] = xn; points[le-1] = yn; points[le-3] = yn;
            if (points[le-4] - points[le-2] < GRID_SZ) {
                points[le-4] = points[le-2] + GRID_SZ + 1;
                points[le-6] = points[le-4];
            }
            if (l.shapeKind === LINE_TRI && points[0]-points[2] < GRID_SZ) {
                l.shapeKind = LINE_QUIN;

                let mid = (points[1] + points[7]) / 2;
                let b4 = points.slice(0, 4);
                let e4 = points.slice(-4);
                points = b4.concat([points[2], mid, points[2], mid]).concat(e4);
                points[2] = points[0] - GRID_SZ;
                points[4] = points[2];
            }
            setPoints(l, points);
        }
    }
}

function updateLineControl(line) {
    var points = line.points();
    var controls = line.control;
    controls[0].points(points.slice(0,4));
    controls[1].points(points.slice(-4));
    controls[2].points(points.slice(2,6));
    if (line.shapeKind === LINE_TRI) {
        controls[3].setVisible(false);
        controls[4].setVisible(false);
    } else {
        controls[4].points(points.slice(4,8)).setVisible(true);
        controls[3].points(points.slice(6,10)).setVisible(true);
    }
}

function initLineControl(line) {
    line.control = [];
    function onStart(i) {
        return function() {
            if (i === 4) {
                container.css('cursor', 'ns-resize');
            } else if (i === 2 || i === 3) {
                container.css('cursor', 'ew-resize');
            }
        };
    }

    function onMove(i) {
        return function() {
            var ps = line.savedPoints;
            if (i === 4) {
                ps[7] = ps[5] = this.points()[1] + this.y();
            } else if (i === 2) {
                ps[4] = ps[2] = this.points()[0] + this.x();
                if(line.shapeKind !== LINE_TRI && ps[4] >= ps[6]) {
                    line.shapeKind = LINE_TRI;
                    ps[7] = ps[5] = ps[11];
                    ps[6] = ps[10];
                    ps = ps.slice(0, 8);
                }
            } else if (i === 3) {
                if (line.shapeKind !== LINE_TRI) {
                    ps[8] = ps[6] = this.points()[0] + this.x();
                    if (ps[4] >= ps[6]) {
                        line.shapeKind = LINE_TRI;
                        ps[7] = ps[5] = ps[11];
                        ps[6] = ps[10];
                        ps = ps.slice(0, 8);
                    }
                } else {
                    ps[4] = ps[2] = this.points()[0] + this.x();
                }

            }
            setPoints(line, ps);
            layer.batchDraw();
        };
    }

    for (let i = 0; i < 5; i += 1) {
        var c = new Konva.Line({
            stroke: 'red',
            strokeWidth: GRID_SZ / 1.5,
            opacity: 0
        }).on('mousedown', function() {
            if (nowNode !== null) return;
            blurFocus();
            focusEle = line;
            focusEle.strokeWidth(2.2);

            line.moveToTop();
            for (let con of line.control) con.moveToTop();

            deleteBtn.removeClass('disabled');
            stage.draw();
        });
        line.control.push(c);

        if (i < 2) continue;

        c.draggable(true);
        c.on('dragstart', onStart(i));
        c.on('dragmove', onMove(i));
        c.on('dragend', function() {
            container.css('cursor', 'auto');

            var points = this.points();
            points[0] += this.x();
            points[2] += this.x();
            points[1] += this.y();
            points[3] += this.y();
            this.x(0);
            this.y(0);
            this.points(points);

            updateLineControl(line);
            layer.draw();
        });

        var boundFunc;
        if (i === 4)
            boundFunc = function(pos) {
                return {
                    x: this.getAbsolutePosition().x,
                    y: pos.y
                };
            };
        else if (i === 2)
            boundFunc = function(pos) {
                var len0 = line.control[0].points()[0] - line.control[0].points()[2] + PORT_R;
                var newX = len0 - getRelativeX(pos.x) < GRID_SZ ? getAbsoluteX(len0 - GRID_SZ) : pos.x;
                if (line.shapeKind === LINE_TRI) {
                    var len1 = line.control[1].points()[0] - line.control[1].points()[2] + PORT_R;
                    newX = len1 + getRelativeX(newX) < GRID_SZ ? getAbsoluteX(GRID_SZ - len1) : newX;
                }
                return {
                    y: this.getAbsolutePosition().y,
                    x: newX
                };
            };
        else if (i === 3)
            boundFunc = function(pos) {
                var len1 = line.control[1].points()[0] - line.control[1].points()[2] + PORT_R;
                var newX = len1 + getRelativeX(pos.x) < GRID_SZ ? getAbsoluteX(GRID_SZ - len1) : pos.x;
                return {
                    y: this.getAbsolutePosition().y,
                    x: newX
                };
            };
        c.dragBoundFunc(boundFunc);
    }
}

var tmpPoints;
function setPoints(line, ps) {
    line.savedPoints = ps;

    tmpPoints = ps.slice(0);
    tmpPoints[0] -= PORT_R;
    tmpPoints[tmpPoints.length - 2] += PORT_R;
    line.points(tmpPoints);
}
function createLine(input, output) {
    var xi = input.position().x + input.parent.position().x;
    var yi = input.position().y + input.parent.position().y;
    var xo = output.position().x + output.parent.position().x;
    var yo = output.position().y + output.parent.position().y;

    var line =  new Konva.Line({
        shadowColor: colors[nowColor],
        shadowOffset: {
            x: 1,
            y: 1
        },
        shadowOpacity: 0.5,
        shadowBlur: 5,
        stroke: colors[nowColor],
        strokeWidth: 1.3,
        lineJoin: 'bevel'
    });

    var points;
    if (input.parent._id === output.parent._id) {
        line.shapeKind = LINE_SELF;

        let x2 = xi-GRID_SZ;
        let y3 = yi - input.y() - GRID_SZ;
        let x5 = xo+GRID_SZ;
        points = [xi, yi, x2, yi, x2, y3, x5, y3, x5, yo, xo, yo];
    } else if (xi-xo < 2*GRID_SZ) { // xi - xo === grid_size 时仍是tri line
        line.shapeKind = LINE_QUIN;

        let x2 = xi-GRID_SZ;
        let y3 = (yi+yo) / 2;
        let x5 = xo+GRID_SZ;
        points = [xi, yi, x2, yi, x2, y3, x5, y3, x5, yo, xo, yo];
    } else {
        line.shapeKind = LINE_TRI;

        let mid = (xi + xo) / 2;
        points = [xi, yi, mid, yi, mid, yo, xo, yo];
    }

    setPoints(line, points);
    layer.add(line);
    layer.draw();

    line.input = input;
    line.output = output;

    initLineControl(line);
    updateLineControl(line);

    input.linked.push(line);
    output.linked.push(line);

    for (let controller of line.control) {
        layer.add(controller);
    }

    return line;
}

function deleteLine(line) {
    for (let c of line.control) c.destroy();
    var i;
    var lineSet;
    for (i = 0, lineSet = line.input.linked; i < lineSet.length; i += 1) {
        if (lineSet[i] === line) {
            lineSet.splice(i, 1);
            break;
        }
    }
    for (i = 0, lineSet = line.output.linked; i < lineSet.length; i += 1) {
        if (lineSet[i] === line) {
            lineSet.splice(i, 1);
            break;
        }
    }
    line.destroy();
}
/**
 * Created by claud on 2016/11/8.
 */

function redrawNode(n) {
    var xn = n.position().x + n.parent.position().x;
    var yn = n.position().y + n.parent.position().y;
    for (let l of n.linked) {
        redrawLine(l, n.kind, xn, yn);
    }
}

var amplitude = 20;
var period = 1000;
var anim = new Konva.Animation(function(frame) {
    nowNode.shadowBlur(amplitude*(1 - Math.cos(frame.time*2*Math.PI / period)));
}, layer);
function offNodeAnim() {
    anim.stop();
    anim = new Konva.Animation(function(frame) {
        nowNode.shadowBlur(amplitude*(1 - Math.cos(frame.time*2*Math.PI / period)));
    }, layer);
    nowNode.fill(blankColor);
    nowNode.shadowBlur(0);
}

var nodeCache = new Konva.Circle({
    radius: PORT_R,
    fill: blankColor,
    stroke: strokeColor,
    strokeWidth: 1,
    shadowBlur: 0
}).on('mouseover', function() {
    if (nowNode !== null && connectType(this.specie, nowNode.specie) === 'none') return;
    if (this.linked.length !== 0 && this.multi === false) return;

    this.strokeWidth(1.5).fill(nodeColors[this.specie]);
    layer.draw();
}).on('mouseout', function() {
    this.strokeWidth(1).fill(blankColor);
    layer.draw();
}).cache();
function connectType(specie0, specie1) {
    switch(specie0) {
    case 'in':
    case 'bus_in':
        switch(specie1) {
        case 'out':
        case 'bus_out':
            return 'in_out';
        case 'vcc_i':
            return 'in_vcc_i';
        case 'gnd_i':
            return 'in_gnd_i';
        default:
            return 'none';
        }
    case 'out':
    case 'bus_out':
        if (specie1 === 'in' || specie1 === 'bus_in') return 'out_in';
        else return 'none';
    case 'vcc':
        if (specie1 === 'vcc_i') return 'vcc_vcc_i';
        else return 'none';
    case 'gnd':
        if (specie1 === 'gnd_i') return 'gnd_gnd_i';
        else return 'none';
    case 'vcc_i':
        switch(specie1) {
        case 'in':
            return 'vcc_i_in';
        case 'vcc':
            return 'vcc_i_vcc';
        default:
            return 'none';
        }
    case 'gnd_i':
        switch(specie1) {
        case 'in':
            return 'gnd_i_in';
        case 'gnd':
            return 'gnd_i_gnd';
        default:
            return 'none';
        }
    default:
        return 'none';
    }
}
function createNode(posX, posY, kind, num, specieName) {
    var n =  nodeCache.clone({
        x: posX * GRID_SZ,
        y: posY * GRID_SZ
    });
    n.multi = kind === KIND_OUT;
    n.specie = specieName;
    switch(specieName) {
    case 'nc':
        n.off('mouseover mouseout');
        return n;
    case 'vcc':
    case 'vcc_i':
        n.shadowColor(vccColor);
        break;
    case 'gnd':
    case 'gnd_i':
        n.shadowColor(gndColor);
        break;
    case 'bus_in':
    case 'bus_out':
        n.shadowColor(nodeColor);
        break;
    default:
        n.shadowColor(nodeColor);
        n.specie = kind === KIND_IN ? 'in' : 'out';
    }
    n.kind =  kind;
    n.linked = [];
    n.num = num;

    n.on('click', function() {
        if (this.linked.length !== 0 && this.multi === false) return;
        if (nowNode === null) {
            nowNode = this;
            anim.start();
            this.fill(nodeColors[this.specie]);
            blurFocus();
            return;
        }
        var line;
        switch (connectType(nowNode.specie, this.specie)) {
        case 'in_out':
        case 'in_vcc_i':
        case 'vcc_vcc_i':
        case 'in_gnd_i':
        case 'gnd_gnd_i':
            line = createLine(nowNode, this);
            break;
        case 'out_in':
        case 'vcc_i_in':
        case 'vcc_i_vcc':
        case 'gnd_i_in':
        case 'gnd_i_gnd':
            line = createLine(this, nowNode);
            break;
        default:
            return;
        }
        offNodeAnim();
        nowNode = null;
        if (line !== null) line.control[0].fire('mousedown');
        stage.draw();
    });

    return n;
}
function deleteChip(chip) {
    for (let n in chip.inputs)
        while (chip.inputs[n].linked.length !== 0)
            deleteLine(chip.inputs[n].linked[0]);
    for (let n in chip.outputs)
        while (chip.outputs[n].linked.length !== 0)
            deleteLine(chip.outputs[n].linked[0]);
    chip.body.off('mouseover mouseout');
    chip.off('dragmove');
    for (var i = 0; i < components.length; i += 1) {
        if (components[i] === chip) {
            components.splice(i, 1);
            break;
        }
    }
    if (chip.name() === 'input') updateInputList('delete', chip);
    chip.destroy();
}

function createCable(x0, y0, x1, y1) {
    return new Konva.Line({
        points: [x0 * GRID_SZ, y0 * GRID_SZ, x1 * GRID_SZ, y1 * GRID_SZ],
        stroke: strokeColor,
        strokeWidth: 1,
        lineCap: 'round',
        lineJoin: 'round',
        listening: false
    });
}
function createRect(x, y, width, height) {
    return new Konva.Rect({
        x: x * GRID_SZ,
        y: y * GRID_SZ,
        width: GRID_SZ * width,
        height: height * GRID_SZ,
        fill: blankColor,
        stroke: strokeColor,
        strokeWidth: 1,
        shadowColor: strokeColor,
        shadowBlur: 0,
        cornerRadius: 3
    });
}
function createPoly(list) {
    for (let i = 0; i < list.length; i += 1) {
        list[i] *= GRID_SZ;
    }
    return new Konva.Line({
        points: list,
        fill: blankColor,
        stroke: strokeColor,
        strokeWidth: 1,
        shadowColor: strokeColor,
        shadowBlur: 0,
        closed : true
    });
}

var toRename = null;
var newName = $('#new-name');
var renameModal = $('#rename');
renameModal.on('shown.bs.modal', function () {
    newName.select();
}).on('hidden.bs.modal', function () {
    toRename = null;
});
function nameLegal(name) {
    if (name === '') {
        return '不能为空';
    }
    for (let ele of components) {
        if ((ele.name() === 'input' || ele.name() === 'output') && ele.tag === name) {
            if (toRename.tag === name) return true;
            return '该名字存在';
        }
    }
    return true;
}
$('#save-name').click(function() {
    var name = newName.val();
    var msg = nameLegal(name);
    if (msg !== true) {
        alert(msg);
        return;
    }
    toRename.tag = name;
    toRename.tagText.text(name);
    layer.draw();

    if (toRename.name() === 'input') changeName(toRename);

    renameModal.modal('hide');

});

var toAddContent = null;
var content = $('#sram-content');
var contentModal = $('#sram-content-modal');
contentModal.on('hidden.bs.modal', function () {
    toAddContent = null;
});
$('#save-content').click(function() {
    toAddContent.content = content.val();

    contentModal.modal('hide');
});
function createBody(name, height, width) {
    var body;

    function onAddContent() {
        if (nowNode !== null) return;

        toAddContent = this.parent;
        content.val(toAddContent.content || '');

        contentModal.modal();
    }

    function onRename() {
        if (nowNode !== null) return;

        toRename = this.parent;
        newName.val(toRename.tag);

        renameModal.modal();
    }

    switch(name) {
    case 'Vcc':
    case 'GND':
        body = createPoly([1, -0.5, defaultWidth, -0.5, defaultWidth + 0.4, 0, defaultWidth, 0.5, 1, 0.5]);
        break;
    case 'input':
        body = createPoly([1, -0.5, defaultWidth, -0.5, defaultWidth + 0.4, 0, defaultWidth, 0.5, 1, 0.5]);
        body.on('dblclick', onRename);
        break;
    case 'output':
        body = createPoly([1, -0.5, defaultWidth, -0.5, defaultWidth, 0.5, 1, 0.5, 0.6, 0]);
        body.on('dblclick', onRename);
        break;
    case 'SRAM': // for cpu specifically
        body = createRect(0.5, -0.5, width, height + 0.5);
        body.on('dblclick', onAddContent);
        break;
    default:
        body = createRect(0.5, -0.5, width, height + 0.5);
    }

    body.on('mousedown', function() {
        if (nowNode !== null) return;
        blurFocus();

        this.parent.moveToTop();
        focusEle = this;
        focusEle.strokeWidth(2.3);
        deleteBtn.removeClass('disabled');
        stage.draw();
    });

    if (name)
        return body;
}
function createTag(x, y, text) {
    return new Konva.Text({
        x: x * GRID_SZ,
        y: (y-0.3) * GRID_SZ,
        text: text,
        fontSize: 10,
        fontFamily: 'Consolas, Menlo, Calibri', // TODO: handle font absence
        fill: 'purple',
        listening: false
    });
}
var inId = 0;
var outId = 0;
function checkUnique(name) {
    for (let ele of components) {
        if ((ele.name() === 'input' || ele.name() === 'output') && ele.tag === name) {
            return false;
        }
    }
    return true;
}
function createName(modelName, width) {
    var name;
    switch(modelName) {
    case 'input':
        do {
            inId += 1;
        } while (!checkUnique('in' + inId));

        name = createTag(1.3, 0, 'in' + inId);
        break;
    case 'output':
        do {
            outId += 1;
        } while (!checkUnique('out' + outId));
        name = createTag(1.3, 0, 'out' + outId);
        break;
    case 'Vcc':
    case 'GND':
        name = createTag(1.6, 0, modelName);
        break;
    default:
        name = createTag(0, 0.1, modelName);
        name.offsetX(name.width()/2.0 - (width+1)/2*GRID_SZ);
    }
    return name;
}
function createText(x, y, name) {
    var t = new Konva.Text({
        x: x * GRID_SZ,
        y: (y-0.3) * GRID_SZ,
        text: name,
        fontSize: 10,
        fontFamily: 'Courier',
        listening: false,
        scaleX: 0.9
    });
    switch (name) {
    case 'Vcc':
    case 'GND':
    case 'NC':
        t.fill(gndColor);
        break;
    default:
        t.fill('green');
    }
    return t;
}
function createNum(x, y, num) {
    return  new Konva.Text({
        x: x * GRID_SZ,
        y: GRID_SZ * (y - 0.3) + 0.8,
        text: num || ' ', // 0 won't convert to text automatically
        fontSize: 10,
        fontFamily: 'Calibri',
        fill: 'lightgrey',
        listening: false,
        scaleX: 0.8,
        scaleY: 0.9
    });
}
function createChip(model, layer, x, y) {
    var group = new Konva.Group({
        x: x,
        y: y,
        draggable: true,
        dragDistance: 2
    });
    group.model = model;
    group.inputs = {};
    group.outputs = {};
    group.name(model.name);

    var chipWidth = model.width || defaultWidth;
    var body, name;
    body = createBody(model.name, model['height'], chipWidth);
    name = createName(model.name, chipWidth);
    group.tag = name.text();
    group.body = body;
    group.tagText = name;
    group.add(body, name);

    var cable;
    var text;
    var num;
    var i;
    var node;
    for (let inputNode of model.inputNodes) {
        i = inputNode.y;
        cable = createCable(0, i, 1, i);
        text = createText(0.7, i, inputNode.name);
        if (model.type === 'cpu') {
            num = createNum(2.1, i, 0);
        } else {
            num = createNum(2.1, i, inputNode.num);
        }
        node = createNode(0, i, KIND_IN, inputNode.num, inputNode.specieName);
        if (inputNode.specieName !== 'nc') group.inputs[inputNode.num]= node;
        group.add(cable, text, num, node);
        cable.moveToBottom();
    }
    for (let outputNode of model.outputNodes) {
        i = outputNode.y;
        cable = createCable(chipWidth, i, 1+chipWidth, i);

        text = createText(chipWidth+1-0.7, i, outputNode.name);
        text.offsetX(text.width());
        if (model.type === 'cpu') {
            num = createNum(chipWidth+1-2.1, i, 0);
        } else {
            num = createNum(chipWidth+1-2.1, i, outputNode.num);
            num.offsetX(num.width());
        }
        node = createNode(chipWidth+1, i, KIND_OUT, outputNode.num, outputNode.specieName);
        if (outputNode.specieName !== 'nc') group.outputs[outputNode.num] = node;
        group.add(cable, text, num, node);
        cable.moveToBottom();
    }

    // optimize performance for elements dragging
    group.on('dragstart', function() {
        container.css('cursor', 'move');
        this.body.fire('click');
        // this.moveTo(dragLayer);
        stage.draw();
    }).on('dragmove', function() {
        for (let input in this.inputs)
            redrawNode(this.inputs[input]);
        for (let output in this.outputs)
            redrawNode(this.outputs[output]);
    }).on('dragend', function() {
        container.css('cursor', 'auto');
        this.position({
            x: getNear(this.position()['x']),
            y: getNear(this.position()['y'])
        });
        this.fire('dragmove');

        for (let input in this.inputs)
            for (let l of this.inputs[input].linked)
                updateLineControl(l);
        for (let output in this.outputs)
            for (let l of this.outputs[output].linked)
                updateLineControl(l);

        stage.draw();

        if (this.name() === 'input') updateInputList('move', this);
    });

    layer.add(group);

    return group;
}

// 刚刚添加的芯片悬空还没落在电路板上
var chipInAir = null;
// bind chip-adding buttons
var chipDocModal = $('#chip-doc');
var docTitle = $('#doc-title');
var schematicImg = $('#doc-schematic');
function addChipFunc(chip) {
    return function(event) {
        var btn = $(this);
        if (btn.hasClass('has-doc')) {
            if (220 <= event.offsetX && event.offsetY <= 40) {
                var id = btn.attr('id');
                docTitle.text(id);
                schematicImg.attr('src', 'images/74chip-docs/' + id + '.png');
                chipDocModal.modal();
                btn.blur();
                return;
            }
        }
        btn.blur();
        if (btn.hasClass('active')) return;

        $('[name="chip"]').removeClass('active');
        btn.addClass('active');

        if (chipInAir !== null) chipInAir.destroy();
        chipInAir = createChip(chip, dragLayer, 1000, 1000);
        chipInAir.opacity(0.7);
        mask.setVisible(true);
        mask.moveTo(dragLayer);

        stage.on('mousemove', function() {
            var px = getRelativeX(stage.getPointerPosition().x) - chipInAir.getClientRect(false).width/2;
            var py = getRelativeY(stage.getPointerPosition().y) - chipInAir.getClientRect(false).height/2;

            chipInAir.position({
                x: px,
                y: py,
            });
            dragLayer.draw();
        });

        stage.on('click', function() {
            if (nowNode !== null) {
                offNodeAnim();
                nowNode = null;
            }

            chipInAir.moveTo(layer);
            chipInAir.position({
                x: getNear(chipInAir.position()['x']),
                y: getNear(chipInAir.position()['y'])
            });
            chipInAir.opacity(1);
            chipInAir.body.fire('mousedown');

            mask.moveTo(layer);
            mask.moveToBottom();
            mask.setVisible(false);

            this.off('mousemove');
            this.off('click');

            stage.draw();
            components.push(chipInAir);
            if (chipInAir.name() === 'input') {
                updateInputList('new', chipInAir);
                chipInAir.body.on('mouseover', function() {
                    highlightSignal(this.parent);
                }).on('mouseout', function() {
                    disHighlightSignal(this.parent);
                });
            }
            chipInAir = null;
            $('[name="chip"]').removeClass('active');

            if (chip.number !== -1) {
                decreChipNum(chip.name);
            }
        });
    };
}

// load background image
var imageObj = new Image();
var background = new Konva.Rect({
    x: 0,
    y: 0,
    width: width,
    height: height,
    // listening: false,
    fillPatternRepeat: 'repeat',
    fillPatternScaleX: 0.01 * GRID_SZ,
    fillPatternScaleY: 0.01 * GRID_SZ
}).on('click', function() {
    blurFocus();
    stage.draw();
});
imageObj.onload = function() {
    background.fillPatternImage(imageObj);
    background.perfectDrawEnabled(false);

    // add the shape to the layer
    layer.add(background);
    background.moveToBottom();
    layer.draw();
};
imageObj.src = '/images/dots.png';

// zoom in and out
var baseDelta = 0.03;
var mousePos, stagePos, delta;
// 最好使用HTML原生的slider
function zoom(e, speed) {
    if (e === 'slider') {
        mousePos = {x:width/2, y:height/2};
        stagePos = stage.position();
    } else {
        // console.log(e.originalEvent.wheelDelta);
        delta = -e.originalEvent.wheelDelta;
        // console.log(delta);
        if (delta == 0 || (stage.scaleX() === MAX_SCALE && delta > 0) || (stage.scaleX() === MIN_SCALE && delta < 0)) return;
        speed = (1 + (baseDelta * delta / 100));
        var nextScale = stage.scaleX() * speed;

        if (nextScale > MAX_SCALE && delta > 0) {
            nextScale = MAX_SCALE;
            speed = nextScale/stage.scaleX();
        }
        if (nextScale < MIN_SCALE && delta < 0) {
            nextScale = MIN_SCALE;
            speed = nextScale/stage.scaleX();
        }

        mousePos = stage.getPointerPosition();
        stagePos = stage.position();

        zoomSlider.slider('value', (nextScale - MIN_SCALE) * SLDR_GRAIN);
        lastSliderVal = zoomSlider.slider('value');
    }
    stage.position({
        x: (stagePos.x - mousePos.x)*speed + mousePos.x,
        y: (stagePos.y - mousePos.y)*speed + mousePos.y
    });
    stage.scaleX(stage.scaleX() * speed);
    stage.scaleY(stage.scaleX());
    // console.log(stage.scaleX());
    stage.draw(); // why layer draw doesn't work?
}

function checkAndExpand() {
    var bleeding = Math.round(Math.max(height, width) * MAX_SCALE / GRID_SZ) * GRID_SZ;
    // set backGroundRect
    var x0 = background.x() * stage.scaleX() + stage.position().x;
    var y0 = background.y() * stage.scaleY() + stage.position().y;
    var x1 = (background.x() + background.width()) * stage.scaleX() + stage.position().x;
    var y1 = (background.y() + background.height()) * stage.scaleY() + stage.position().y;

    if (x0 > - bleeding) {
        background.x(background.x() - bleeding);
    }
    if (y0 > - bleeding) {
        background.y(background.y() - bleeding);
    }
    if (x1 < width + bleeding) {
        background.width(background.width() + bleeding);
    }
    if (y1 < height + bleeding) {
        background.height(background.height() + bleeding);
    }
    stage.draw();
}
checkAndExpand();

// parse circuit
function parseCircuit() {
    var compDes;
    var des = {};
    for (let comp of components) {
        compDes = {};
        compDes.x = comp.x();
        compDes.y = comp.y();
        switch(comp.name()) {
        case 'input':
        case 'output':
            compDes.tag = comp.tag;
            break;
        case 'SRAM':
            compDes.content = comp.content || '';
            break;
        }
        compDes.name = comp.name();
        compDes.inputs = {};
        for (let n in comp.inputs) {
            let node = comp.inputs[n];
            let li = [];
            for (let line of node.linked) {
                let linkedNode = line.output;
                let connDes = {};
                connDes.num = linkedNode.num;
                connDes.parent = linkedNode.parent._id;
                connDes.points = line.savedPoints;
                connDes.color = line.stroke();
                connDes.shape = line.shapeKind;
                li.push(connDes);
            }
            compDes.inputs[n] = li;
        }
        des[comp._id] = compDes;
    }
    return des;
}

function drawCircuit() {
    components = [];
    // console.log(graph);
    var tempId = {};
    var ind = 0;
    for (let id in graph) {
        let comp = graph[id];
        let x = comp.x;
        let y = comp.y;
        let newChip;
        var newIn;
        switch(graph[id].name) {
        case 'input':
            newChip = createChip(inputChip, layer, x, y);
            newChip.name('input');
            newChip.tag = comp.tag;
            newChip.tagText.text(comp.tag);

            newIn = {ref: newChip};
            newIn.id = null;
            newIn.list = [-1, 0];

            editSignalList.push(newIn);
            break;
        case 'output':
            newChip = createChip(outputChip, layer, x, y);
            newChip.name('output');
            newChip.tag = comp.tag;
            newChip.tagText.text(comp.tag);
            break;
        case 'GND':
            newChip = createChip(gnd, layer, x, y);
            newChip.name('GND');
            break;
        case 'Vcc':
            newChip = createChip(vcc, layer, x, y);
            newChip.name('Vcc');
            break;
        case 'SRAM':
            newChip = createChip(c74s[comp.name], layer, x, y);
            newChip.content = comp.content;
            break;
        default:
            newChip = createChip(c74s[comp.name], layer, x, y);
            decreChipNum(comp.name);
        }
        components.push(newChip);
        tempId[id] = ind;

        ind = ind + 1;
    }

    for (let id in graph) {
        let comp = graph[id];
        for (let n in comp.inputs) {
            let inNode = components[tempId[id]].inputs[n];
            for (let l of comp.inputs[n]) {
                let outNode = components[tempId[l.parent]].outputs[l.num];
                let line = createLine(inNode, outNode);
                setPoints(line, l.points);
                line.stroke(l.color);
                line.shapeKind = l.shape;
                updateLineControl(line);
            }
        }
    }
    stage.draw();

    editSignalList.sort(sortFunc);
    createGraph();
}
var mask = new Konva.Rect(background.getClientRect());
mask.setVisible(false);
layer.add(mask);
$(document).keydown(function(e) {
    // console.log(e.keyCode);
    if (e.keyCode === 16) { // bind shift key
        console.log(JSON.stringify(parseCircuit(),undefined,4));
        container.css('cursor', 'move');
        checkAndExpand();

        mask.setAttrs(background.getClientRect());
        mask.setVisible(true);
        mask.moveToTop();
        stage.draw();

        stage.draggable(true);

        container.on('mousewheel', zoom);
    }
    if (e.target.localName !== 'body' && e.target.localName !== 'button') return;

    if (e.keyCode === 27) { // bind esc key
        if (chipInAir !== null) {
            $('[name="chip"]').removeClass('active');

            mask.moveTo(layer);
            mask.moveToBottom();
            mask.setVisible(false);

            stage.off('click');
            stage.off('mousemove');

            chipInAir.destroy();
            chipInAir = null;
            stage.draw();

            return;
        }
        if (nowNode !== null) {
            offNodeAnim();
            nowNode = null;
            stage.draw();
        }
    } else if (e.keyCode === 46) {
        if (deleteBtn.hasClass('disabled')) return;
        if (toRename !== null) return;
        deleteBtn.trigger('click');
    } else if (49 <= e.keyCode && e.keyCode <= 54) {
        palette.eq(e.keyCode-49).trigger('click');
    }
});
$(document).keyup(function(e) {
    if (e.keyCode === 16) {
        container.css('cursor', 'auto');
        checkAndExpand();

        mask.moveToBottom();
        mask.setVisible(false);
        stage.draw();

        stage.draggable(false);

        container.off('mousewheel', zoom);
    }
});

var c74BtnBox = $('#c74s button');
c74BtnBox.each(function (index, element){
    var chip = c74s[$(element).attr('id')];
    $(element).click(addChipFunc(chip));
});
$('#input').click(addChipFunc(inputChip));
$('#output').click(addChipFunc(outputChip));
$('#vcc').click(addChipFunc(vcc));
$('#gnd').click(addChipFunc(gnd));

// line color switching
var palette = $('#palette button');
palette.each(function (index, element) {
    $(element).click(function() {
        if (focusEle !== null && Konva.Layer.prototype.isPrototypeOf(focusEle.parent))
            focusEle.stroke(colors[index]);
        if (nowColor === index) return;
        nowColor = index;

        palette.filter('.active').removeClass('active');
        $(this).addClass('active');

        layer.draw();

    });
});

// delete elements
var deleteBtn = $('#delete');
deleteBtn.click(function() {
    if (Konva.Layer.prototype.isPrototypeOf(focusEle.parent)) {
        deleteLine(focusEle);
    } else {
        if (focusEle.parent.model.number !== -1) increChipNum(focusEle.parent.name());
        deleteChip(focusEle.parent);
    }
    $(this).addClass('disabled');
    stage.draw();
});

// zoom slider
var lastSliderVal = (1 - MIN_SCALE) * SLDR_GRAIN;
function sliderToggle(type) {
    if (type === 'in')          zoomSlider.slider('value', zoomSlider.slider('value') + 500);
    else if (type === 'out')    zoomSlider.slider('value', zoomSlider.slider('value') - 500);
    else if (type === '100')    zoomSlider.slider('value', (1 - MIN_SCALE) * SLDR_GRAIN);

    var sliderVal = zoomSlider.slider('value');
    if (sliderVal < lastSliderVal) checkAndExpand();
    var speed = (sliderVal + MIN_SCALE * SLDR_GRAIN) / (lastSliderVal+ MIN_SCALE * SLDR_GRAIN);
    lastSliderVal = sliderVal;
    zoom('slider', speed);
}
var zoomSlider = $('#zoom-slider');
zoomSlider.slider({
    orientation: 'horizontal',
    range: 'min',
    max: (MAX_SCALE - MIN_SCALE) * SLDR_GRAIN,
    value: (1 - MIN_SCALE) * SLDR_GRAIN,
    slide: sliderToggle
});

$('#zoom-in').click(function () {
    sliderToggle('in');
});
$('#zoom-out').click(function () {
    sliderToggle('out');
});
$('#zoom-center').click(function () {
    sliderToggle('100');
});

// on screen size change
// there's an issue with Konva canvas
var chipListHeight = Math.min(Math.max(height - 350, 60), 1000);
$('.chip-list').css('height', chipListHeight);
$( window ).resize(function() {
    if (window.innerWidth > width || window.innerHeight > height) checkAndExpand();

    width = window.innerWidth;
    height = window.innerHeight;

    chipListHeight = Math.min(Math.max(height - 350, 60), 1000);
    $('.chip-list').css('height', chipListHeight);
});

function updateInputList(kind, io) {
    var newIn;
    switch (kind) {
    case 'new':
        newIn = {ref: io};
        newIn.id = null;
        newIn.list = [-1, 0];

        editSignalList.push(newIn);
        editSignalList.sort(sortFunc);
        createGraph();
        break;
    case 'delete':
        for (let i = 0; i < editSignalList.length; i += 1) {
            if (editSignalList[i].ref === io) {
                editSignalList.splice(i, 1);
                createGraph();
                break;
            }
        }
        break;
    case 'move':
        var ind = -1;
        for (let i = 0; i < editSignalList.length; i += 1) {
            if (editSignalList[i].ref === io) {
                ind = i;
                break;
            }
        }
        if (ind === -1) return;
        editSignalList.sort(sortFunc);
        for (let i = 0; i < editSignalList.length; i += 1) {
            if (editSignalList[i].ref === io) {
                if (i !== ind) createGraph();
                break;
            }
        }
        break;
    }
}