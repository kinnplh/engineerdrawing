/**
 * Created by kinnplh on 10/16/16.
 */

function output(id, name) {
    this.notInSignal = true;
    this.id = id;
    this.name = name;
    this.pinType = {p0: 1};
    this.pinMap = new Map();
    this.getPortMapString = function () {
        return "";
    };
}
output.prototype.getComponentString = function () {
    return "";
};
output.prototype.code = "";
module.exports = output;