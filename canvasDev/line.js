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