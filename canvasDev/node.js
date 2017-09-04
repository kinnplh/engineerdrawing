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