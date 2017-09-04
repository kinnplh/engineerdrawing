/**
 * Created by kinnplh on 11/9/16.
 */
function Chip74LS04(id, name) {
    this.id = id;
    this.pinType = {
        p1: 1,
        p2: 0,
        p3: 1,
        p4: 0,
        p5: 1,
        p6: 0,
        p7: -2,
        p9: 1,
        p8: 0,
        p11: 1,
        p10: 0,
        p13: 1,
        p12: 0,
        p14: 2
    };
    this.pinMap = new Map();
    this.name = name;
    this.getPortMapString = function () {
        var mapRes = "";
        mapRes += (this.pinMap.get("1") + ", ");
        mapRes += (this.pinMap.get("3") + ", ");
        mapRes += (this.pinMap.get("5") + ", ");
        mapRes += (this.pinMap.get("9") + ", ");
        mapRes += (this.pinMap.get("11") + ", ");
        mapRes += (this.pinMap.get("13") + ", ");
        mapRes += (this.pinMap.get("2") + ", ");
        mapRes += (this.pinMap.get("4") + ", ");
        mapRes += (this.pinMap.get("6") + ", ");
        mapRes += (this.pinMap.get("8") + ", ");
        mapRes += (this.pinMap.get("10") + ", ");
        mapRes += (this.pinMap.get("12"));
        return this.name + ":Chip74LS04 port map(" + mapRes + ");\n";
    }
}
Chip74LS04.prototype.code = "library ieee;\n\
use ieee.std_logic_1164.all;\n\
use ieee.std_logic_arith.all;\n\
use ieee.std_logic_unsigned.all;\n\
\n\
entity Chip74LS04 is\n\
port (\n\
    p1, p3, p5, p9, p11, p13: in std_logic;\n\
p2, p4, p6, p8, p10, p12: out std_logic\n\
) ;\n\
end entity ; -- Chip74LS04\n\
\n\
architecture arch of Chip74LS04 is\n\
begin\n\
p2 <= not p1;\n\
p4 <= not p3;\n\
p6 <= not p5;\n\
p8 <= not p9;\n\
p10 <= not p11;\n\
p12 <= not p13;\n\
end architecture ; -- arch\n";

Chip74LS04.prototype.getComponentString = function () {
    return "\ncomponent Chip74LS04\n\
    port(p1, p3, p5, p9, p11, p13: in std_logic;\n\
        p2, p4, p6, p8, p10, p12: out std_logic);\n\
    end component;\n";
};
module.exports = Chip74LS04;