<?php

Ctlm::$helper = CtlmHelper::getInstance();

/**
 * Helper funkce
 */
class CtlmHelper {
	
	/**
	 * instance helperu
	 * @var CtlmHelper
	 */
	protected static $instance = null;
	
	/**
	 * vrati instanci helperu
	 * @return CtlmHelper
	 */
	public static function getInstance()
	{
		if (self::$instance == null)
			self::$instance = new self();
		return self::$instance;
	}
	
	private function __construct() {
		
	}
	
	public function cp1250($text) {
		return $text;
// 		return iconv('UTF-8', 'cp1250', $text);
	}
	
	/**
	 * vrati cislo naformatovane jako penize v kc
	 * @param number $number
	 * @return string
	 */
	public function money($number) {
		return number_format($number, 0, '.', ' ') . ' Kč';
	}
	
	
	
}