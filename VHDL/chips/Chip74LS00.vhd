library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;

entity Chip74LS00 is
  port (
	p1, p2, p4, p5, p9, p10, p12, p13: in std_logic;
	p3, p6, p8, p11: out std_logic
  ) ;
end entity ; -- Chip74LS00

architecture arch of Chip74LS00 is
begin
	p3 <= not (p1 and p2);
	p6 <= not (p4 and p5);
	p8 <= not (p9 and p10);
	p11 <= not (p12 and p13);
end architecture ; -- arch