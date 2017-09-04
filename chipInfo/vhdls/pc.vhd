library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity pc is
  port (
	clk, rst: in std_logic;
	pause: in std_logic_vector(0 to 4);
	new_pc: in std_logic_vector(15 downto 0);
	pc_output: out std_logic_vector(15 downto 0)
  ) ;
end entity ; -- pc

architecture arch of pc is
begin

	process(clk, rst)
	begin
		if rst = pcReset then
			pc_output <= originAddr;
		elsif (pause(0) /= pcPause and clk'event and clk = edgeDetect) then
			pc_output <= new_pc;
		end if ;
	end process ;

end architecture ; -- arch