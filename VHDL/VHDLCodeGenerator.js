/**
 * Created by kinnplh on 10/16/16.
 */
var input = require("./chipEntities/input");
var output = require("./chipEntities/output");
var vcc = require("./chipEntities/vcc");
var gnd = require("./chipEntities/gnd");

var fs = require('fs');
var path =  require("path");

function connection(src, dest) {
    this.src = src;
    this.dest = dest;
}

var chipPath = new Map();
chipPath.set("74LS00", "./chipEntities/Chip74LS00");
chipPath.set("74LS86", "./chipEntities/Chip74LS86");
chipPath.set("74LS161", "./chipEntities/Chip74LS161");
chipPath.set("74LS04", "./chipEntities/Chip74LS04");
chipPath.set("74LS11", "./chipEntities/Chip74LS11");
chipPath.set("74LS90", "./chipEntities/Chip74LS90");
/**
 *
 * @param savePath
 * @param connectionInfo
 * @param topEntityName
 * @constructor
 */

function VHDLCodeGenerator(savePath, connectionInfo, topEntityName, portInfo,callback) {
    //get all signals for every pin
    //for every chip concerned, map the id to the entity generated


    console.log("into");
    portInfo.input = [];
    portInfo.output = [];
    var idToEntity = new Map();//input and output contained
    var idToInput = new Map();
    var idToOutput = new Map();//but input and output are special
    var idToVcc = new Map();
    var idToGnd = new Map();



    var nameToEntityExample = new Map();// to avoid duplication in component declare

    for(var chipId in connectionInfo)
    {

        var info = connectionInfo[chipId];// for every chip
        var chipName = info.name;
        if(chipName == "input"){
            var curChip = new input(chipId, "input" + chipId);
            curChip.pinMap.set("0", info.tag);
            idToEntity.set(chipId, curChip);
            idToInput.set(chipId, curChip);
            portInfo.input.push(info.tag);
        }
        else if(chipName == "output"){
            var curChip = new output(chipId, "output" + chipId);
            curChip.pinMap.set("0", info.tag);
            idToEntity.set(chipId, curChip);
            idToOutput.set(chipId, curChip);
            portInfo.output.push(info.tag);
        }
        else if(chipName == "Vcc"){
            var curChip = new vcc(chipId, "vcc" + chipId);
            curChip.pinMap.set("0", "vcc_" + chipId + "_0");
            idToEntity.set(chipId, curChip);
            idToVcc.set(chipId, curChip);
        }
        else if(chipName == "GND"){
            var curChip = new gnd(chipId, "gnd" + chipId);
            curChip.pinMap.set("0", "gnd_" + chipId + "_0");
            idToEntity.set(chipId, curChip);
            idToGnd.set(chipId, curChip);
        }
        else{
            if(!chipPath.has(chipName))
                throw new Error("No Such Chip: " + chipName);
            var chipEntity = require(chipPath.get(chipName));
            curChip = new chipEntity(chipId, "Chip" + chipName + chipId);
            for(var pinName in curChip.pinType){
                if(curChip.pinType[pinName] != 2 && curChip.pinType[pinName] != -2)
                    curChip.pinMap.set(pinName.slice(1), "Chip" + chipName + '_' + chipId + '_' + pinName);
                else if(curChip.pinType[pinName] == 2)//vcc and gnd should not be here
                    curChip.pinMap.set(pinName.slice(1), "vcc");
                else if(curChip.pinType[pinName] == -2)//but it helps judge
                    curChip.pinMap.set(pinName.slice(1), "gnd");
                else
                    curChip.pinMap.set(pinName.slice(1), "nc");
            }
            idToEntity.set(chipId, curChip);
            nameToEntityExample.set(chipName, curChip);
        }
    }


    // gather connection info
    // may only concern about the input
    var connectionArray = [];
    for(var chipId in connectionInfo)
    {
        var info = connectionInfo[chipId];
        var inputsMap = info.inputs;
        //console.log(info);
        for(var k in inputsMap)
         {//asyn
            var v = inputsMap[k];
            //k: port num of the current chip; it is the dest
            //v: array of the connection
            //each element is {num:a, parent: b}
            //b: the chipId a:the port in the parent chip
            for(var i = 0; i < v.length; ++ i){
                var parentInfo = v[i];
                // should judge if the des is the gcc/gnd port of the chip
                if(idToEntity.get(chipId).pinMap.get(k) != "vcc"
                    && idToEntity.get(chipId).pinMap.get(k) != "gnd"
                    && idToEntity.get(chipId).pinMap.get(k) != "nc" ) {
                    var theCnct = new connection(idToEntity.get(parentInfo.parent + "").pinMap.get(parentInfo.num + ""),
                        idToEntity.get(chipId).pinMap.get(k));
                    connectionArray.push(theCnct);
                }
                else {
                    //further can judge if it is the right cnt
                }
            }
        }
    }


    //start generate code

    //sub-component code
    var code = "";
    nameToEntityExample.forEach(function (v, k) {
        code += v.code;
    });


    code += "library ieee;\n\
use ieee.std_logic_1164.all;\n\
use ieee.std_logic_arith.all;\n\
use ieee.std_logic_unsigned.all;\n";
    //entity

    code += ("entity " + topEntityName + " is\n");
    code += "   port(\n";
    //declare the port: input & output
    idToInput.forEach(function (v, k) {
        //k: chipId, v: chipEntity
        var portName = v.pinMap.get("0");
        code += ("      " + portName + " : in std_logic;\n");
    });

    idToOutput.forEach(function (v, k) {
        var portName = v.pinMap.get("0");
        code += ( "     " + portName + " : out std_logic;\n");
    });

    code = code.slice(0, -2); //去掉最后的分号
    code += ");\n";
    code += ("end " + topEntityName + ";\n");

    //describe the architecture
    code += ("architecture bhv of " + topEntityName + " is\n");
    //declare all signals
    //every pin is represented by a signal
    //input and output already contained in idToEntity
    idToEntity.forEach(function (v, k) {
        //k: chip id
        //v: chipEntity
        //all chips of all entities should maps to a signal here
        if(v.notInSignal != undefined && v.notInSignal)
            return;
        v.pinMap.forEach(function (vv, kk) {
            //kk: num of port
            //vv: signal name
            if(vv != "vcc" && vv != "gnd")
                code += ("   signal " + vv + " : std_logic;\n");
        });
    });
    // declare all component according to the nameToEntityExample
    nameToEntityExample.forEach(function (v, k) {
        //k: name, v: entityExample
        code += v.getComponentString();
    });
    code += "begin\n";
    //vcc gnd assign
    idToVcc.forEach(function (v, k) {
       //k: chipId   v: chip entity
        code += ("  " + v.pinMap.get("0") + "<= '1';\n");
    });

    idToGnd.forEach(function (v, k) {
        code += ("  " + v.pinMap.get("0") + "<= '0';\n");
    });


    //signal assign
    for(var i = 0; i < connectionArray.length; ++ i){
        var curConnection = connectionArray[i];
        code += ("  " + curConnection.dest + " <= " + curConnection.src + ";\n");
    }
    //port map
    idToEntity.forEach(function (v, k) {
        //k: chipId, v: chip entity
        code += "   " + v.getPortMapString() + "\n";
    });

    code += "end bhv;\n";
    //console.log(code);

    //save the code to savePath
    //file name is <topEntityName>.vhd
    //topEntityName should be the name of the current project

    if(savePath !== "") {
        console.log(code);
        fs.writeFile(path.join(savePath, topEntityName + ".vhd"), code, callback);
    }
    else
        console.log(code);
    return portInfo;
}

module.exports = VHDLCodeGenerator;


/**
 * unit test
 */


//VHDLCodeGenerator("", cntInfo, "top");
