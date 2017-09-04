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
