library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_arith.all;
use ieee.std_logic_unsigned.all;
use work.constantsIF.all;

entity ID_EXE_Latch is
  port (
	clk, rst: in std_logic;
	write_reg_enable: in std_logic;
	write_reg_addr: in std_logic_vector(3 downto 0);
	inst: in std_logic_vector(4 downto 0);
	write_mem_enable: in std_logic;
	read_mem_enable: in std_logic;
	op1, op2: in std_logic_vector(15 downto 0);
	write_mem_data: in std_logic_vector(15 downto 0);
	all_pause_signal: in std_logic_vector(0 to 4);

	write_reg_enable_out: out std_logic;
	write_reg_addr_out: out std_logic_vector(3 downto 0);
	inst_out: out std_logic_vector(4 downto 0);
	write_mem_enable_out: out std_logic;
	read_mem_enable_out: out std_logic;
	op1_out, op2_out: out std_logic_vector(15 downto 0);
	write_mem_data_out: out std_logic_vector(15 downto 0)

  ) ;
end entity ; -- ID_EXE_Latch

architecture arch of ID_EXE_Latch is
begin

	process(clk, rst)
	begin
		if rst = ID_EXE_LatchReset then
			write_reg_enable_out <= not WriteEnable;
			write_reg_addr_out <= UnusedRegAddr;
			inst_out <= ALU_NOP;
			write_mem_enable_out <= not WriteEnable;
			read_mem_enable_out <= not ReadEnable;
			op1_out <= ZeroWord;
			op2_out <= ZeroWord;
			write_mem_data_out <= ZeroWord;
		elsif clk'event and clk = edgeDetect then
			if all_pause_signal(2) /= pauseSignal then
				write_reg_enable_out <= write_reg_enable;
				write_reg_addr_out <= write_reg_addr;
				inst_out <= inst;
				write_mem_enable_out <= write_mem_enable;
				read_mem_enable_out <= read_mem_enable;
				op1_out <= op1;
				op2_out <= op2;
				write_mem_data_out <= write_mem_data;
			elsif all_pause_signal(3) /= pauseSignal then
				write_reg_enable_out <= not WriteEnable;
				write_reg_addr_out <= UnusedRegAddr;
				inst_out <= ALU_NOP;
				write_mem_enable_out <= not WriteEnable;
				read_mem_enable_out <= not ReadEnable;
				op1_out <= ZeroWord;
				op2_out <= ZeroWord;
				write_mem_data_out <= ZeroWord;
			-- otherwise hold
			end if ;
		end if ;
	end process ;


end architecture ; -- arch