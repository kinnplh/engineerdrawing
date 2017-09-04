library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity IF_ID_Latch is
  port (
	clk, rst: in std_logic;
	pc_in, inst_in: in std_logic_vector(15 downto 0);
	all_pause_signal: in std_logic_vector(0 to 4);
	pc_out, inst_out: out std_logic_vector(15 downto 0)
  );
end entity ; -- IF_ID_Latch

architecture arch of IF_ID_Latch is
begin
	process(clk, rst)
	variable pc : std_logic_vector(15 downto 0);
	variable inst: std_logic_vector(15 downto 0);
	variable pc_temp : std_logic_vector(15 downto 0);
	variable inst_temp: std_logic_vector(15 downto 0);
	begin
		if rst = IF_ID_LatchReset then
			pc_out <= originAddr;
			inst_out <= NOPInstruct;
			pc := ZeroWord;
			inst := IllegalInstruct;
		elsif clk'event and clk = edgeDetect then
			if all_pause_signal(1) /= pauseSignal then
				if inst = IllegalInstruct then
					pc_out <= pc_in;
					inst_out <= inst_in;
				else
					pc_temp := pc;
					inst_temp := inst;
					pc_out <= pc_temp;
					inst_out <= inst_temp;
					pc := ZeroWord;
					inst := IllegalInstruct;
				end if;
			elsif all_pause_signal(2) /= pauseSignal then
				pc_out <= originAddr;
				inst_out <= NOPInstruct;
			else
				pc := pc_in;
				inst := inst_in;
			end if ;
		end if ;
	end process ;
end architecture ; -- arch