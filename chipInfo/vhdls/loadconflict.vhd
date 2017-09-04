library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity loadconflict is
 	port (
 		lastInst: in std_logic_vector(4 downto 0);
		lastAddress: in std_logic_vector(3 downto 0);

		reg1_addr, reg2_addr: in std_logic_vector(3 downto 0);

		reg1_read_enable, reg2_read_enable: in std_logic;

 		pause: out std_logic
	);
end entity ;


architecture arch of loadconflict is
begin
	process(lastInst, lastAddress, reg1_addr, reg2_addr, reg1_read_enable, reg2_read_enable)
	begin
		if (reg1_read_enable = ENABLE) and (lastInst = THU_ID_LOAD) 
			and (lastAddress = reg1_addr) then
			pause <= SUSPEND;
		elsif (reg2_read_enable = ENABLE) and (lastInst = THU_ID_LOAD)
			and (lastAddress = reg2_addr) then
			pause <= SUSPEND;
		else
			pause <= WAKE;
		end if;

	end process;	
end architecture ; -- arch