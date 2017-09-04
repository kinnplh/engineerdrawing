'use strict';

var fs = require('fs'),
    path = require('path');

function getCpuComps(dir) {
    //var dir = path.join(path.dirname(fs.realpathSync(__filename)), 'vhdls');
    console.log("dir:" + dir);
    var fli = fs.readdirSync(dir);

    var cpu_comps = {};
    var re = /is\s*port\s*\(\s*([\d\D]*)\)\s*;\s*end\s*entity/;
    var count = 0;
    for (let fname of fli) {
        console.log(count);
        console.log(fli.length);
        console.log(fli);
        count += 1;

        const cname = fname.split('.')[0];
        var data = fs.readFileSync(path.join(dir, fname));
        var text = data.toString().toLowerCase();
        try {
            var ios = text.match(re)[1].trim();
        } catch(Exception) {
             console.log(cname);
            //return;
        }

        var io_li = ios.split(/[;]*\n\s*/);
        // console.log(io_li);

        var comp = {
            name: cname,
            type: 'cpu',
            number: -1,
            description: cname,
            inputNodes: [],
            outputNodes: [],
            internalNameList: []
        };

        var inputY = 0, outputY = 0;
        var num = 0;

        for (let line of io_li) {
            var raw = line.split(/\s+?|\s*[,:\(\)]+?\s*/);
            var words = [];
            for (let word of raw) {
                if (word.startsWith('--')) break;
                if (word !== '') words.push(word);
            }
            var indIn = words.indexOf('in');
            var indOut = words.indexOf('out');
            var indInOut = words.indexOf('inout');
            if (indInOut !== -1) {
                indIn = indInOut;
                indOut = indInOut;
            }
            var indVec = words.indexOf('downto');
            if (indVec === -1) indVec = words.indexOf('to');

            if (indIn !== -1) {
                for (let i = 0; i < indIn; i++) {
                    inputY += 1;
                    num += 1;
                    let node = {
                        y: inputY,
                        num: num,
                    };
                    if (indVec !== -1) {
                        node.specieName = 'bus_in';
                        node.name = words[i] + '(' + words[indVec - 1] + ':' + words[indVec + 1] + ')';
                    } else {
                        node.name = words[i];
                    }
                    comp.inputNodes.push(node);
                    comp.internalNameList.push(words[i]);
                }
            }
            if (indOut !== -1) {
                for (let i = 0; i < indOut; i++) {
                    outputY += 1;
                    num += 1; //TODO in out
                    let node = {
                        y: outputY,
                        num: num
                    };
                    if (indVec !== -1) {
                        node.specieName = 'bus_out';
                        node.name = words[i] + '(' + words[indVec - 1] + ':' + words[indVec + 1] + ')';
                    } else {
                        node.name = words[i];
                    }
                    comp.outputNodes.push(node);
                    if (indIn === -1) comp.internalNameList.push(words[i]);
                }
            }

            comp.height = Math.max(inputY, outputY) + 1;
            var maxLen = 0;
            for (let i = 0; i < Math.min(inputY, outputY); i++) {
                let len = comp.inputNodes[i].name.length + comp.outputNodes[i].name.length + 1;
                maxLen = len > maxLen ? len : maxLen;
            }
            comp.width = Math.max(5, Math.ceil(maxLen/2.2));
            cpu_comps[cname] = comp;
        }
    }
    console.log("!!!!!!!!!");
    return cpu_comps;
}


module.exports = getCpuComps;