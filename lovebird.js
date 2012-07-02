// Lovebird game
// Reuben Thomas 8th May-2nd July 2012

$(function() {
    var svgOnLoad = function () {
        var solution = [['A', 'V', 'E', 'S'],
                        ['A', 'C', 'M', 'E'],
                        ['V', 'A', 'P', 'A'],
                        ['V', 'I', 'V', 'O']];
        var svg = $('#canvas').svg('get');
        var piece = {elem: $('#piece', svg.root()),
                     width: function () { return piece.elem.attr('width'); },
                     height: function () { return piece.elem.attr('height'); }
                    };
        var board = {elem: $('#board', svg.root()),
                     border: function () { return parseFloat(this.elem.css('stroke-width')); },
                     width: function () { return parseFloat(this.elem.attr('width')) - this.border(); },
                     height: function () { return parseFloat(this.elem.attr('height')) - this.border(); },
                     across: function () { return Math.floor(this.width() / piece.width()); },
                     down: function () { return Math.floor(this.height() / piece.height()); },
                     spaceWidth: function () { return this.width() / this.across(); },
                     spaceHeight: function () { return this.height() / this.down(); },
                     coordToSquare: function (p) {
                         var placementTolerance = 8;
                         var sw = this.spaceWidth(), sh = this.spaceHeight();
                         var q = {x: ((p.x + sw / 2) % sw) - sw / 2, y: ((p.y + sh / 2) % sh) - sh / 2};
                         if (q.x * q.x + q.y * q.y < placementTolerance * placementTolerance) {
                             var r = {x: Math.round(p.x / sw), y: Math.round(p.y / sh)};
                             if (r.x >= 0 && r.x < this.across() && r.y >= 0 && r.y < this.down()) {
                                 return r;
                             }
                         }
                     }
                    };
        var changeSquare = function (e, oldPos, newPos) {
            var os = board.coordToSquare(oldPos);
            var ns = board.coordToSquare(newPos);
            if (os && ns && (os.x != ns.x || os.y != ns.y)) {
                var letter = $('text', e).text();
                if (letter == solution[ns.y][ns.x]) {
                    console.log("done!");
                }
            }
        };
        var pixelsToSVGCoords = function (svg, e, ui) {
            var CTM = e.getCTM();
            var p = svg.root().createSVGPoint();
            p.x = ui.position.left + CTM.e;
            p.y = ui.position.top + CTM.f;
            if ($.browser.webkit) { // Webkit gets SVG-relative coords, not offset from element
                p.x -= ui.originalPosition.left;
                p.y -= ui.originalPosition.top;
            }
            p = p.matrixTransform(CTM.inverse());
            // Apply translation after transformation, as origPos is in transformed coords
            var origPos = $.data(e, 'originalPosition');
            p.x += origPos.x;
            p.y += origPos.y;
            return p;
        };
        $('#pieces > *', svg.root()).draggable();
        $('#pieces', svg.root())
            .on({
                dragstart: function (event, ui) {
                    $(this.parentElement).append(this); // Bring element to front
                    var tlist = this.transform.baseVal;
                    if (tlist.numberOfItems == 0) {
                        tlist.appendItem(svg.root().createSVGTransform());
                    }
                    var tm = tlist.getItem(0).matrix;
                    $.data(this, 'originalPosition', {x: tm.e, y: tm.f}); // Transformed coords
                },
                drag: function (event, ui) {
                    // Update transform manually, since top/left style props don't work on SVG
                    var tlist = this.transform.baseVal;
                    var p = pixelsToSVGCoords(svg, this, ui);
                    tlist.getItem(0).setTranslate(p.x, p.y);
                },
                dragstop: function (event, ui) {
                    var origPos = $.data(this, 'originalPosition');
                    var p = pixelsToSVGCoords(svg, this, ui);
                    changeSquare(this, {x: origPos.x, y: origPos.y}, {x: p.x, y: p.y});
                }
            }, 'g');
    }
    $('#canvas').svg({loadURL: "lovebird.svg", onLoad: svgOnLoad});
});
