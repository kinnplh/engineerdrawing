library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;

entity Chip74LS11 is
  port (
	p1, p2, p3, p4, p5, p9, p10, p11, p13: in std_logic;
	p6, p8, p12: out std_logic
  ) ;
end entity ; -- Chip74LS11

architecture arch of Chip74LS11 is
begin
	p12 <= (p1 and p2 and p13);
	p6 <= (p3 and p4 and p5);
	p8 <= (p9 and p10 and p11);
end architecture ; -- arch