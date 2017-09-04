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
