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