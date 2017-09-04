/**
 * Created by kinnplh on 11/2/16.
 */
function gnd(id, name) {
    this.id = id;
    this.name = name;
    this.pinType = {p0: 0};
    this.pinMap = new Map();
    this.getPortMapString = function () {
        return "";
    }
}
gnd.prototype.code = "";
gnd.prototype.getComponentString = function () {
    return "";
};
module.exports = gnd;