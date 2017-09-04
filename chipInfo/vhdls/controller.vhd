library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity controller is
 	port (
 		pc, inst: in std_logic_vector(15 downto 0);

 		write_reg_enable, write_mem_enable, write_mem_data_from_reg1: out std_logic; 
 		read_mem_enable, reg1_read_enable, reg2_read_enable: out std_logic;
 		op1_from_reg, op2_from_reg: out std_logic;

 		reg1_addr, reg2_addr, write_reg_addr: out std_logic_vector(3 downto 0);

 		EXEInst: out std_logic_vector(4 downto 0);

 		immd: out std_logic_vector(15 downto 0)
	);
end entity ;


architecture arch of controller is
begin
	process(pc, inst)
	variable inst_temp: std_logic_vector(4 downto 0);
	variable reg1_addr_v, reg2_addr_v, reg3_addr_v: std_logic_vector(3 downto 0);
	begin
		inst_temp := inst(15 downto 11);
		reg1_addr_v := '0' & inst(10 downto 8);
		reg2_addr_v := '0' & inst(7 downto 5);
		reg3_addr_v := '0' & inst(4 downto 2);
		case (inst_temp) is
			when OP_ADDIU =>
				write_reg_enable <= ENABLE;
				write_mem_enable <= DISABLE;
				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE; 
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
		 		op1_from_reg <= ENABLE; 
		 		op2_from_reg <= DISABLE;
 				reg1_addr <= reg1_addr_v;
 				reg2_addr <= UnusedRegAddr; 
 				write_reg_addr <= reg1_addr_v;
 				EXEInst <= THU_ID_ADD;
 				immd <= inst(7) & inst(7) & inst(7) & inst(7)
 						 & inst(7) & inst(7) & inst(7) & inst(7)
 						  & inst(7 downto 0);
 			when OP_ADDIU3 =>
 				write_reg_enable <= ENABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= ENABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= reg1_addr_v;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= reg2_addr_v;
 				EXEInst <= THU_ID_ADD;
 				immd(15 downto 4) <= (others => inst(3));
 				immd(3 downto 0) <= inst(3 downto 0);
 			when OP_B =>
  				write_reg_enable <= DISABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= DISABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= DISABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= UnusedRegAddr;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= UnusedRegAddr;
 				EXEInst <= THU_ID_BRANCH;
 				immd(15 downto 11) <= (others => inst(10));
 				immd(10 downto 0) <= inst(10 downto 0);				
 			when OP_BEQZ => 
   				write_reg_enable <= DISABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= DISABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= reg1_addr_v;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= UnusedRegAddr;
 				EXEInst <= THU_ID_BRANCHE;
 				immd(15 downto 8) <= (others => inst(7));
 				immd(7 downto 0) <= inst(7 downto 0);		
 			when OP_BNEZ =>
 				write_reg_enable <= DISABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= DISABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= reg1_addr_v;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= UnusedRegAddr;
 				EXEInst <= THU_ID_BRANCHN;
 				immd(15 downto 8) <= (others => inst(7));
 				immd(7 downto 0) <= inst(7 downto 0);		
 			when OP_LI =>
 				write_reg_enable <= ENABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= DISABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= DISABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= UnusedRegAddr;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= reg1_addr_v;
 				EXEInst <= THU_ID_ASSIGN;
 				immd(15 downto 8) <= (others => '0');
 				immd(7 downto 0) <= inst(7 downto 0);
 			when OP_LW =>
 				write_reg_enable <= ENABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= ENABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= ENABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= reg1_addr_v;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= reg2_addr_v;
 				EXEInst <= THU_ID_LOAD;
 				immd(15 downto 5) <= (others => inst(4));
 				immd(4 downto 0) <= inst(4 downto 0); 			
 			when OP_LW_SP =>
 				write_reg_enable <= ENABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= ENABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= ENABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= REGISTER8_SP;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= reg1_addr_v;
 				EXEInst <= THU_ID_LOAD;
 				immd(15 downto 8) <= (others => inst(7));
 				immd(7 downto 0) <= inst(7 downto 0); 			
 			when OP_IH =>
 				case( inst(7 downto 0) ) is				
 					when IH_MFIH =>
		 				write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= DISABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= DISABLE;
		 				reg1_addr <= REGISTER10_IH;
		 				reg2_addr <= UnusedRegAddr;
		 				write_reg_addr <= reg1_addr_v;
		 				EXEInst <= THU_ID_ASSIGN;
		 				immd(15 downto 0) <= ZERO16;

 					when IH_MTIH =>
		 				write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= DISABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= DISABLE;
		 				reg1_addr <= reg1_addr_v;
		 				reg2_addr <= UnusedRegAddr;
		 				write_reg_addr <= REGISTER10_IH;
		 				EXEInst <= THU_ID_ASSIGN;
		 				immd(15 downto 0) <= ZERO16;
 					when others =>				
 				end case ;
 			when OP_NOP =>
 				write_reg_enable <= DISABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= DISABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= DISABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= UnusedRegAddr;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= UnusedRegAddr;
 				EXEInst <= THU_ID_NOP;
 				immd(15 downto 0) <= ZERO16;
 			when OP_SHIFT =>
 				case( inst(1 downto 0) ) is
 					when SHIFT_SLL =>
		 				write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= DISABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= DISABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= UnusedRegAddr;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg1_addr_v;
		 				EXEInst <= THU_ID_SLL;
		 				if (inst(4 downto 2) = "000") then
			 				immd(15 downto 4) <= (others => '0');
			 				immd(3 downto 0) <= "1000";
			 			else
			 				immd(15 downto 3) <= (others => '0');
			 				immd(2 downto 0) <= inst(4 downto 2);
			 			end if;	
 					when SHIFT_SRA =>
		 				write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= DISABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= DISABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= UnusedRegAddr;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg1_addr_v;
		 				EXEInst <= THU_ID_SRA;
		 				if (inst(4 downto 2) = "000") then
			 				immd(15 downto 4) <= (others => '0');
			 				immd(3 downto 0) <= "1000";
			 			else
			 				immd(15 downto 3) <= (others => '0');
			 				immd(2 downto 0) <= inst(4 downto 2);
			 			end if;	
 					when SHIFT_SRL =>
		 				write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= DISABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= DISABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= UnusedRegAddr;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg1_addr_v;
		 				EXEInst <= THU_ID_SRL;
		 				if (inst(4 downto 2) = "000") then
			 				immd(15 downto 4) <= (others => '0');
			 				immd(3 downto 0) <= "1000";
			 			else
			 				immd(15 downto 3) <= (others => '0');
			 				immd(2 downto 0) <= inst(4 downto 2);
			 			end if;		 				
 					when others =>
 				
 				end case ;
 				 	
 			when OP_SW =>
 				write_reg_enable <= DISABLE;
 				write_mem_enable <= ENABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= ENABLE;
 				op1_from_reg <= ENABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= reg1_addr_v;
 				reg2_addr <= reg2_addr_v;
 				write_reg_addr <= UnusedRegAddr;
 				EXEInst <= THU_ID_ADD;
 				immd(15 downto 5) <= (others => inst(4));
 				immd(4 downto 0) <= inst(4 downto 0); 	
 			when OP_SW_SP =>
 				write_reg_enable <= DISABLE;
 				write_mem_enable <= ENABLE;
 				write_mem_data_from_reg1 <= ENABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= ENABLE;
 				op1_from_reg <= ENABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= REGISTER8_SP;
 				reg2_addr <= reg1_addr_v;
 				write_reg_addr <= UnusedRegAddr;
 				EXEInst <= THU_ID_ADD;
 				immd(15 downto 8) <= (others => inst(7));
 				immd(7 downto 0) <= inst(7 downto 0); 	
 			when OP_ADDSP3 =>
 				write_reg_enable <= ENABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= ENABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= REGISTER8_SP;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= reg1_addr_v;
 				EXEInst <= THU_ID_ADD;
 				immd(15 downto 8) <= (others => inst(7));
 				immd(7 downto 0) <= inst(7 downto 0);
 			when OP_SLTI =>
 				write_reg_enable <= ENABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= ENABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= reg1_addr_v;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= REGISTER9_T;
 				EXEInst <= THU_ID_CMP;
 				immd(15 downto 8) <= (others => inst(7));
 				immd(7 downto 0) <= inst(7 downto 0); 	
 			when OP_SLTUI =>
 				write_reg_enable <= ENABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= ENABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= ENABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= reg1_addr_v;
 				reg2_addr <= UnusedRegAddr;
 				write_reg_addr <= REGISTER9_T;
 				EXEInst <= THU_ID_CMP;
 				immd(15 downto 8) <= (others => '0');
 				immd(7 downto 0) <= inst(7 downto 0); 	
 			when OP_SPECIAL =>
 				case (inst(10 downto 8)) is
 					when SPECIAL_ADDSP =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= DISABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= DISABLE;
		 				reg1_addr <= REGISTER8_SP;
		 				reg2_addr <= UnusedRegAddr;
		 				write_reg_addr <= REGISTER8_SP;
		 				EXEInst <= THU_ID_ADD;
		 				immd(15 downto 8) <= (others => inst(7));
		 				immd(7 downto 0) <= inst(7 downto 0); 		
 					when SPECIAL_BTEQZ =>
 						write_reg_enable <= DISABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= DISABLE;
		 				op1_from_reg <= DISABLE;
		 				op2_from_reg <= DISABLE;
		 				reg1_addr <= REGISTER9_T;
		 				reg2_addr <= UnusedRegAddr;
		 				write_reg_addr <= UnusedRegAddr;
		 				EXEInst <= THU_ID_BRANCHE;
		 				immd(15 downto 8) <= (others => inst(7));
		 				immd(7 downto 0) <= inst(7 downto 0);		
 					when SPECIAL_MTSP =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= DISABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= DISABLE;
		 				reg1_addr <= reg1_addr_v;
		 				reg2_addr <= UnusedRegAddr;
		 				write_reg_addr <= REGISTER8_SP;
		 				EXEInst <= THU_ID_ASSIGN;
		 				immd(15 downto 0) <= ZERO16;
 					when SPECIAL_BTNEZ =>
 						write_reg_enable <= DISABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= DISABLE;
		 				op1_from_reg <= DISABLE;
		 				op2_from_reg <= DISABLE;
		 				reg1_addr <= REGISTER9_T;
		 				reg2_addr <= UnusedRegAddr;
		 				write_reg_addr <= UnusedRegAddr;
		 				EXEInst <= THU_ID_BRANCHN;
		 				immd(15 downto 8) <= (others => inst(7));
		 				immd(7 downto 0) <= inst(7 downto 0); 		
 					when SPECIAL_SW_RS =>
 						write_reg_enable <= DISABLE;
		 				write_mem_enable <= ENABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= DISABLE;
		 				reg1_addr <= REGISTER8_SP;
		 				reg2_addr <= REGISTER11_RA;
		 				write_reg_addr <= UnusedRegAddr;
		 				EXEInst <= THU_ID_ADD;
		 				immd(15 downto 8) <= (others => inst(7));
		 				immd(7 downto 0) <= inst(7 downto 0); 					
 					when others =>
 				
 				end case ;
 			when OP_ADD_SUB_U =>
				case (inst(1 downto 0)) is
					when (ADD_SUB_U_ADDU) =>
						write_reg_enable <= ENABLE;
						write_mem_enable <= DISABLE;
						write_mem_data_from_reg1 <= DISABLE;
						read_mem_enable <= DISABLE;
						reg1_read_enable <= ENABLE;
						reg2_read_enable <= ENABLE;
						op1_from_reg <= ENABLE;
						op2_from_reg <= ENABLE;
						reg1_addr <= reg1_addr_v;
						reg2_addr <= reg2_addr_v;
						write_reg_addr <= reg3_addr_v;
						EXEInst <= THU_ID_ADD;
						immd(15 downto 0) <= ZERO16;
					when (ADD_SUB_U_SUBU) =>
						write_reg_enable <= ENABLE;
						write_mem_enable <= DISABLE;
						write_mem_data_from_reg1 <= DISABLE;
						read_mem_enable <= DISABLE;
						reg1_read_enable <= ENABLE;
						reg2_read_enable <= ENABLE;
						op1_from_reg <= ENABLE;
						op2_from_reg <= ENABLE;
						reg1_addr <= reg1_addr_v;
						reg2_addr <= reg2_addr_v;
						write_reg_addr <= reg3_addr_v;
						EXEInst <= THU_ID_SUB;
						immd(15 downto 0) <= ZERO16;
					when others =>
				end case;
 			when OP_LOGIC =>
 				case( inst(4 downto 0) ) is				
 					when LOGIC_AND =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= reg1_addr_v;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg1_addr_v;
		 				EXEInst <= THU_ID_AND;
		 				immd(15 downto 0) <= ZERO16;
 					when LOGIC_CMP =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= reg1_addr_v;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= REGISTER9_T;
		 				EXEInst <= THU_ID_EQUAL;
		 				immd(15 downto 0) <= ZERO16;
		 			when LOGIC_PC =>
		 				case( inst(7 downto 5) ) is		 				
		 					when PC_JR =>
		 						write_reg_enable <= DISABLE;
				 				write_mem_enable <= DISABLE;
				 				write_mem_data_from_reg1 <= DISABLE;
				 				read_mem_enable <= DISABLE;
				 				reg1_read_enable <= ENABLE;
				 				reg2_read_enable <= DISABLE;
				 				op1_from_reg <= DISABLE;
				 				op2_from_reg <= DISABLE;
				 				reg1_addr <= reg1_addr_v;
				 				reg2_addr <= UnusedRegAddr;
				 				write_reg_addr <= UnusedRegAddr;
				 				EXEInst <= THU_ID_JR;
				 				immd(15 downto 0) <= ZERO16;
		 					when PC_MFPC =>
		 						write_reg_enable <= ENABLE;
				 				write_mem_enable <= DISABLE;
				 				write_mem_data_from_reg1 <= DISABLE;
				 				read_mem_enable <= DISABLE;
				 				reg1_read_enable <= DISABLE;
				 				reg2_read_enable <= DISABLE;
				 				op1_from_reg <= DISABLE;
				 				op2_from_reg <= DISABLE;
				 				reg1_addr <= UnusedRegAddr;
				 				reg2_addr <= UnusedRegAddr;
				 				write_reg_addr <= reg1_addr_v;
				 				EXEInst <= THU_ID_ASSIGN;
				 				immd(15 downto 0) <= pc;
		 					when others =>		 				
		 				end case ;
 							
		 			when LOGIC_OR =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= reg1_addr_v;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg1_addr_v;
		 				EXEInst <= THU_ID_OR;
		 				immd(15 downto 0) <= ZERO16;
		 			when LOGIC_SRAV =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= reg1_addr_v;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg2_addr_v;
		 				EXEInst <= THU_ID_SRA;
		 				immd(15 downto 0) <= ZERO16;
		 			when LOGIC_NOT =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= DISABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= DISABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= UnusedRegAddr;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg1_addr_v;
		 				EXEInst <= THU_ID_NOT;
		 				immd(15 downto 0) <= ZERO16;
		 			when LOGIC_SLLV =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= reg1_addr_v;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg2_addr_v;
		 				EXEInst <= THU_ID_SLL;
		 				immd(15 downto 0) <= ZERO16;
		 			when LOGIC_SRLV =>
 						write_reg_enable <= ENABLE;
		 				write_mem_enable <= DISABLE;
		 				write_mem_data_from_reg1 <= DISABLE;
		 				read_mem_enable <= DISABLE;
		 				reg1_read_enable <= ENABLE;
		 				reg2_read_enable <= ENABLE;
		 				op1_from_reg <= ENABLE;
		 				op2_from_reg <= ENABLE;
		 				reg1_addr <= reg1_addr_v;
		 				reg2_addr <= reg2_addr_v;
		 				write_reg_addr <= reg2_addr_v;
		 				EXEInst <= THU_ID_SRL;
		 				immd <= ZERO16;
 					when others =>
 				end case ; 				
 			when others =>
  				write_reg_enable <= DISABLE;
 				write_mem_enable <= DISABLE;
 				write_mem_data_from_reg1 <= DISABLE;
 				read_mem_enable <= DISABLE;
 				reg1_read_enable <= DISABLE;
 				reg2_read_enable <= DISABLE;
 				op1_from_reg <= DISABLE;
 				op2_from_reg <= DISABLE;
 				reg1_addr <= ZERO4;
 				reg2_addr <= ZERO4;
 				write_reg_addr <= ZERO4;
 				EXEInst <= ALU_NOP;
 				immd <= ZeroWord;			


		end case;
	end process;	
end architecture ; -- arch
