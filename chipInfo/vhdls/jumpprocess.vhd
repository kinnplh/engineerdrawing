library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity jumpprocess is	
 	port (
 		pc, immd, real_reg1_data: in std_logic_vector(15 downto 0);
		EXEInst: in std_logic_vector(4 downto 0);

		branch_enable: out std_logic; 
 		branch_target: out std_logic_vector(15 downto 0)
	);
end entity ;


architecture arch of jumpprocess is
begin
	process(pc, immd, real_reg1_data, EXEInst)
	begin
		case (EXEInst) is
			when THU_ID_BRANCH =>
				branch_enable <= ENABLE;
				branch_target <= pc + immd;
			when THU_ID_JR => 
				branch_enable <= ENABLE;
				branch_target <= real_reg1_data;
			when THU_ID_BRANCHE =>
				if (real_reg1_data = ZeroWord) then
					branch_enable <= ENABLE;
					branch_target <= pc + immd;
				else
					branch_enable <= not ENABLE;
					branch_target <= "0000000000000000";					
				end if;
			when THU_ID_BRANCHN =>
				if (real_reg1_data /= ZeroWord) then
					branch_enable <= ENABLE;
					branch_target <= pc + immd;
				else
					branch_enable <= not ENABLE;
					branch_target <= "0000000000000000";
				end if;
			when others =>
				branch_enable <= not ENABLE;
				branch_target <= "0000000000000000";
		end case;
	end process;	
end architecture ; -- arch