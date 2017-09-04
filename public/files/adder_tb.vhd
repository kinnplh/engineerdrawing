----------------------------------------------------------------------
-- Test Bench for 2-bit Adder (ESD figure 2.5)
-- by Weijun Zhang, 04/2001
--
-- five cases are tested in this example
----------------------------------------------------------------------

library ieee;
use ieee.std_logic_1164.all;
use ieee.std_logic_unsigned.all;
use ieee.std_logic_arith.all;

entity ADDER_TB is				-- entity declaration
end ADDER_TB;

architecture TB of ADDER_TB is

    component ADDER is
    port(	A:	in std_logic_vector(1 downto 0);
		B:	in std_logic_vector(1 downto 0);	 
		carry:	out std_logic;				  
		sum:	out std_logic_vector(1 downto 0)
    );
    end component;

    signal A, B:	std_logic_vector(1 downto 0);
    signal carry:	std_logic;
    signal sum:		std_logic_vector(1 downto 0);


    begin

        U_ADDER: ADDER port map (A, B, carry, sum);
	
    process			
	
	variable err_cnt: integer :=0;
    
    begin												  
		
	-- case 1
	A <= "00";							
	B <= "00";
	wait for 10 ns;
	assert (sum="00") report "Sum Error!" severity error;
	assert (carry='0') report "Carry Error!" severity error;
	if (sum/="00" or carry/='0') then
	    err_cnt:=err_cnt+1;
	end if;
		
 	-- case 2 		
	A <= "11";
	B <= "11";
	wait for 10 ns;												  
	assert (sum="10") report "Sum Error!" severity error;	 
	assert (carry='1') report "Carry Error!" severity error;
	if (sum/="10" or carry/='1') then
	    err_cnt:=err_cnt+1;
	end if;
		
	-- case 3
	A <= "01";
	B <= "10";
	wait for 10 ns;												  
	assert (sum="11") report "Sum Error!" severity error;	 
	assert (carry='0') report "Carry Error!" severity error;
	if (sum/="11" or carry/='0') then
	    err_cnt:=err_cnt+1;
	end if;
		
	-- case 4
	A <= "10";
	B <= "01";
	wait for 10 ns;												  
	assert (sum="11") report "Sum Error!" severity error;	 
	assert (carry='0') report "Carry Error!" severity error;
	if (sum/="11" or carry/='0') then
	    err_cnt:=err_cnt+1;
	end if;
		
	-- case 5
	A <= "01";
	B <= "01";
	wait for 10 ns;
	assert (sum="10") report "Sum Error!" severity error;
	assert (carry='0') report "Carry Error!" severity error;
	if (sum/="10" or carry/='0') then
	    err_cnt:=err_cnt+1;
	end if;
		
	-- summary of testbench
	if (err_cnt=0) then
	    assert false
	    report "Testbench of Adder completed successfully!"
	    severity note;
	else
	    assert true
	    report "Something wrong, try again"
	    severity error;
	end if;
			
	wait;
		
    end process;

end TB;
--------------------------------------------------------------------
configuration CFG_TB of ADDER_TB is
	for TB
	end for;
end CFG_TB;
--------------------------------------------------------------------
