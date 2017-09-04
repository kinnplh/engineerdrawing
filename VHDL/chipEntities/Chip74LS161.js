/**
 * Created by kinnplh on 11/9/16.
 */

function Chip74LS161(id, name) {
    this.id = id;
    this.pinType = {
        p1: 1,
        p2: 1,
        p3: 1,
        p4: 1,
        p5: 1,
        p6: 1,
        p7: 1,
        p8: -2,
        p9: 1,
        p10: 1,
        p11: 0,
        p12: 0,
        p13: 0,
        p14: 0,
        p15: 1,
        p16: 2
    };
    this.pinMap = new Map();
    this.name = name;
    this.getPortMapString = function () {
        var mapRes = "";
        mapRes += (this.pinMap.get("1") + ", ");
        mapRes += (this.pinMap.get("2") + ", ");
        mapRes += (this.pinMap.get("3") + ", ");
        mapRes += (this.pinMap.get("4") + ", ");
        mapRes += (this.pinMap.get("5") + ", ");
        mapRes += (this.pinMap.get("6") + ", ");
        mapRes += (this.pinMap.get("7") + ", ");
        mapRes += (this.pinMap.get("9") + ", ");
        mapRes += (this.pinMap.get("10") + ", ");
        mapRes += (this.pinMap.get("15") + ", ");
        mapRes += (this.pinMap.get("11") + ", ");
        mapRes += (this.pinMap.get("12") + ", ");
        mapRes += (this.pinMap.get("13") + ", ");
        mapRes += (this.pinMap.get("14"));
        return this.name + ":Chip74LS161 port map(" + mapRes + ");\n";
    };
}
Chip74LS161.prototype.getComponentString = function () {
  return "\ncomponent Chip74LS161\n\
        port(p1, p2, p3, p4, p5, p6, p7, p9, p10, p15: in std_logic;\n\
        p11, p12, p13, p14: out std_logic);\n\
        end component;\n";
};
Chip74LS161.prototype.code =
    "library ieee;\n\
use ieee.std_logic_1164.all;\n\
use ieee.std_logic_arith.all;\n\
use ieee.std_logic_unsigned.all;\n\
\n\
entity Chip74LS161 is\n\
port (\n\
    p1, p2, p3, p4, p5, p6, p7, p9, p10, p15: in std_logic;\n\
p11, p12, p13, p14: out std_logic\n\
) ;\n\
end entity ; -- Chip74LS161\n\
\n\
architecture arch of Chip74LS161 is\n\
begin\n\
\n\
main : process(p2, p1, p9, p7, p10)\n\
variable counter: std_logic_vector(3 downto 0) := \"0000\";\n\
begin\n\
if p1 = '0' then\n\
counter := \"0000\";\n\
p11 <= counter(3);\n\
p12 <= counter(2);\n\
p13 <= counter(1);\n\
p14 <= counter(0);\n\
end if ;\n\
\n\
if (p1 = '1' and p9 = '1' and (p7 and p10) = '0') then\n\
p11 <= counter(3);\n\
p12 <= counter(2);\n\
p13 <= counter(1);\n\
p14 <= counter(0);\n\
end if ;\n\
\n\
if (p2'event and p2 = '1') then\n\
if (p1 = '1' and p9 = '0') then\n\
counter := (p6 & p5 & p4 & p3);\n\
p11 <= counter(3);\n\
p12 <= counter(2);\n\
p13 <= counter(1);\n\
p14 <= counter(0);\n\
end if;\n\
\n\
if (p1 = '1' and p9 = '1' and p7 = '1' and p10 = '1') then\n\
counter := counter + \"0001\";\n\
p11 <= counter(3);\n\
p12 <= counter(2);\n\
p13 <= counter(1);\n\
p14 <= counter(0);\n\
end if ;\n\
end if ;\n\
end process ; -- main\n\
end architecture ; -- arch\n";

module.exports = Chip74LS161;