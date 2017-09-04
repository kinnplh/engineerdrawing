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