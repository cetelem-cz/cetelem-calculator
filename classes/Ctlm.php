<?php

/**
 * Staticka fasada pro sluzby Cetelem.
 * Umoznije rychly staticky pristup k singltonum sluzem cetelem
 */
class Ctlm {
	
	/**
	 * ciselnik cetelem
	 * @var CtlmCiselnik
	 */
	public static $ciselnik = null;
	
	/**
	 * kalkulator cetelem
	 * @var CtlmKalkulator
	 */
	public static $kalkulator = null;
	
	/**
	 * helper funkce
	 * @var CtlmHelper
	 */
	public static $helper = null;
	
	
}