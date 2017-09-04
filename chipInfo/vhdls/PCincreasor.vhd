library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity PCincreasor is
  port (
	data_in: in std_logic_vector(15 downto 0);
	data_out: out std_logic_vector(15 downto 0)
  ) ;
end entity ; -- increasor

architecture arch of PCincreasor is
begin
	process(data_in)
	begin
		data_out <= data_in + pcOffset;
	end process ;
end architecture ; -- arch