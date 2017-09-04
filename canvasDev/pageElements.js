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