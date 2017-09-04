library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;

entity Chip74LS86 is
  port (
	p1, p2, p4, p5, p9, p10, p12, p13: in std_logic;
	p3, p6, p8, p11: out std_logic
  ) ;
end entity ; -- Chip74LS86

architecture arch of Chip74LS86 is
begin
	p3 <= p1 xor p2;
	p6 <= p4 xor p5;
	p8 <= p9 xor p10;
	p11 <= p12 xor p13;
end architecture ; -- arch