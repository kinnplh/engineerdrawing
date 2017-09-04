library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity pauseCTRL is
  port (
	IM_access_pause: in std_logic_vector(2 downto 0);
	load_conflict_pause: in std_logic;
	all_pause_signal: out std_logic_vector(0 to 4)
  ) ;
end entity ; -- pauseCTRL

architecture arch of pauseCTRL is
begin
	process(IM_access_pause, load_conflict_pause)
	begin
		if IM_access_pause = IMRead or IM_access_pause = IMWrite or load_conflict_pause = pauseSignal then
			all_pause_signal <= "11100";
		else
			all_pause_signal <= "00000";
		end if;
	end process ; -- 
end architecture ; -- arch