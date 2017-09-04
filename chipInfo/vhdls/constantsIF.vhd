library IEEE;
use IEEE.STD_LOGIC_1164.all;
use ieee.numeric_std.all; -- needed?

package constantsIF is
	constant edgeDetect: std_logic := '1';
	constant pcReset: std_logic := '0';
	constant pcPause: std_logic := '1';
	constant originAddr: std_logic_vector(15 downto 0) := "0000000000000000";

	constant pcOffset: std_logic_vector(15 downto 0) := "0000000000000001";

	constant IMReadEnable: std_logic := '1';
	constant IMWriteEnable: std_logic := '1';

	constant NOPInstruct: std_logic_vector(15 downto 0) := "0000100000000000";
	constant IllegalInstruct: std_logic_vector(15 downto 0) :="1111111111111111";
	constant IF_ID_LatchReset: std_logic := '0';
	constant ID_EXE_LatchReset: std_logic := '0';
	constant RstEnable: std_logic := '0';
	constant pauseSignal: std_logic := '1';

	constant ZeroWord: std_logic_vector(15 downto 0) := "0000000000000000";
	constant OneWord: std_logic_vector(15 downto 0) := "0000000000000001";

	constant ALUResult: std_logic_vector(2 downto 0) := "000";
	constant DMRead: std_logic_vector(2 downto 0) := "001";
	constant DMWrite: std_logic_vector(2 downto 0) := "010";
	constant IMRead: std_logic_vector(2 downto 0) := "011";
	constant IMWrite: std_logic_vector(2 downto 0) := "100";
	constant SerialStateRead: std_logic_vector(2 downto 0) := "101";
	constant SerialDataRead: std_logic_vector(2 downto 0) := "110";
	constant SerialDataWrite: std_logic_vector(2 downto 0) := "111";
	
	constant ReadEnable: std_logic := '1';
	constant WriteEnable: std_logic := '1';
	constant ReadDisable: std_logic := '0';
	constant WriteDisable: std_logic := '0';



	constant UnusedRegAddr: std_logic_vector(3 downto 0) := "1111";
	constant ALU_NOP: std_logic_vector(4 downto 0) := "00101";

	constant ALU_ADD: std_logic_vector(4 downto 0) := "00000";
	constant ALU_SUB: std_logic_vector(4 downto 0) := "01001";
	constant ALU_ASSIGN: std_logic_vector(4 downto 0) := "00100";
	constant ALU_OR: std_logic_vector(4 downto 0) := "00110";
	constant ALU_AND: std_logic_vector(4 downto 0) := "01100"; 
	constant ALU_SLL: std_logic_vector(4 downto 0) := "00111";
	constant ALU_SRA: std_logic_vector(4 downto 0) := "01000";
	constant ALU_SRL: std_logic_vector(4 downto 0) := "01010";
	constant ALU_NOT: std_logic_vector(4 downto 0) := "01011";
	constant ALU_LOAD: std_logic_vector(4 downto 0) := "01101";
	constant ALU_CMP: std_logic_vector(4 downto 0) := "01111";
	constant ALU_EQUAL: std_logic_vector(4 downto 0) := "10000";
	--constant ALU_NOP: std_logic_vector(4 downto 0) := "1111";

	type RegArray is array(15 downto 0) of std_logic_vector(15 downto 0);



	constant LHS: std_logic := '0';
    constant RHS: std_logic := '1';

	--	pause
	constant SUSPEND: std_logic := '1';
	constant WAKE: std_logic := '0';

	--	controller
	constant ENABLE: std_logic := '1';
	constant DISABLE: std_logic := '0';
	constant ZERO3: std_logic_vector(2 downto 0) := "000";
	constant ZERO4: std_logic_vector(3 downto 0) := "0000";
	constant ZERO16: std_logic_vector(15 downto 0) := "0000000000000000";

	--	²Ù×÷ÂëÒëÂë
	constant THU_ID_ADD: std_logic_vector(4 downto 0) := "00000";
	constant THU_ID_BRANCH: std_logic_vector(4 downto 0) := "00001";
	constant THU_ID_BRANCHE: std_logic_vector(4 downto 0) := "00010";
	constant THU_ID_BRANCHN: std_logic_vector(4 downto 0) := "00011";
	constant THU_ID_ASSIGN: std_logic_vector(4 downto 0) := "00100";
	constant THU_ID_NOP: std_logic_vector(4 downto 0) := "00101";
	constant THU_ID_OR: std_logic_vector(4 downto 0) := "00110";
	constant THU_ID_SLL: std_logic_vector(4 downto 0) := "00111";
	constant THU_ID_SRA: std_logic_vector(4 downto 0) := "01000";
	constant THU_ID_SUB: std_logic_vector(4 downto 0) := "01001";
	constant THU_ID_SRL: std_logic_vector(4 downto 0) := "01010";
	constant THU_ID_NOT: std_logic_vector(4 downto 0) := "01011";
	constant THU_ID_AND: std_logic_vector(4 downto 0) := "01100";
	constant THU_ID_LOAD: std_logic_vector(4 downto 0) := "01101";
	constant THU_ID_JR: std_logic_vector(4 downto 0) := "01110";
	constant THU_ID_CMP: std_logic_vector(4 downto 0) := "01111";
	constant THU_ID_EQUAL: std_logic_vector(4 downto 0) := "10000";

	--	ÌØÊâ¼Ä´æÆ÷
	constant REGISTER8_SP: std_logic_vector(3 downto 0) := "1000";
	constant REGISTER9_T: std_logic_vector(3 downto 0) := "1001";
	constant REGISTER10_IH: std_logic_vector(3 downto 0) := "1010";
	constant REGISTER11_RA: std_logic_vector(3 downto 0) := "1011";


	--	funct
	constant OP_ADDIU: std_logic_vector(4 downto 0) := "01001";
	constant OP_ADDIU3: std_logic_vector(4 downto 0) := "01000";
	constant OP_SPECIAL: std_logic_vector(4 downto 0) := "01100";
	constant OP_ADD_SUB_U: std_logic_vector(4 downto 0) := "11100";
	constant OP_LOGIC: std_logic_vector(4 downto 0) := "11101";
	constant OP_B: std_logic_vector(4 downto 0) := "00010";
	constant OP_BEQZ: std_logic_vector(4 downto 0) := "00100";
	constant OP_BNEZ: std_logic_vector(4 downto 0) := "00101";
	constant OP_LI: std_logic_vector(4 downto 0) := "01101";
	constant OP_LW: std_logic_vector(4 downto 0) := "10011";
	constant OP_LW_SP: std_logic_vector(4 downto 0) := "10010";
	constant OP_IH: std_logic_vector(4 downto 0) := "11110";
	constant OP_NOP: std_logic_vector(4 downto 0) := "00001";
	constant OP_SHIFT: std_logic_vector(4 downto 0) := "00110";
	constant OP_SW: std_logic_vector(4 downto 0) := "11011";
	constant OP_SW_SP: std_logic_vector(4 downto 0) := "11010";
	constant OP_ADDSP3: std_logic_vector(4 downto 0) := "00000";
	constant OP_SLTI: std_logic_vector(4 downto 0) := "01010";
	constant OP_SLTUI: std_logic_vector(4 downto 0) := "01011";

	--function code

	-- 01100 OP_SPECIAL inst(10 downto 8)
	constant SPECIAL_ADDSP: std_logic_vector(2 downto 0) := "011";
	constant SPECIAL_BTEQZ: std_logic_vector(2 downto 0) := "000";
	constant SPECIAL_MTSP: std_logic_vector(2 downto 0) := "100";
	constant SPECIAL_BTNEZ: std_logic_vector(2 downto 0) := "001";
	constant SPECIAL_SW_RS: std_logic_vector(2 downto 0) := "010";

	-- 11100 OP_ADD_SUB_U inst(1 downto 0)
	constant ADD_SUB_U_ADDU: std_logic_vector(1 downto 0) := "01";
	constant ADD_SUB_U_SUBU: std_logic_vector(1 downto 0) := "11";

	-- 11101 OP_LOGIC inst(4 downto 0) 
	constant LOGIC_AND: std_logic_vector(4 downto 0) := "01100";
	constant LOGIC_CMP: std_logic_vector(4 downto 0) := "01010";
	constant LOGIC_PC: std_logic_vector(4 downto 0) := "00000";
		--sub function code for pc inst(7 downto 5)
		constant PC_JR: std_logic_vector(2 downto 0) := "000";
		constant PC_MFPC: std_logic_vector(2 downto 0) := "010";
		-- end sub --
	constant LOGIC_OR: std_logic_vector(4 downto 0) := "01101";
	constant LOGIC_SRAV: std_logic_vector(4 downto 0) := "00111";
	constant LOGIC_NOT: std_logic_vector(4 downto 0) := "01111";
	constant LOGIC_SLLV: std_logic_vector(4 downto 0) := "00100";
	constant LOGIC_SRLV: std_logic_vector(4 downto 0) := "00110";

	-- 11110 OP_IH inst(7 downto 0)
	constant IH_MFIH: std_logic_vector(7 downto 0) := "00000000";
	constant IH_MTIH: std_logic_vector(7 downto 0) := "00000001";

	-- 00110 OP_SHIFT inst(1 downto 0)
	constant SHIFT_SLL: std_logic_vector(1 downto 0) := "00";
	constant SHIFT_SRA: std_logic_vector(1 downto 0) := "11";
	constant SHIFT_SRL: std_logic_vector(1 downto 0) := "10";

end package ; -- constantsIF 
