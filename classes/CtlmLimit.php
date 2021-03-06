<?php

/**
 * Data objekt limitu
 */
class CtlmLimit {

	/**
	 * minimalni vyse uveru
	 * @var int
	 */
	public $minuver;

	/**
	 * maximalni vyse uveru
	 * @var int
	 */
	public $maxuver;
	
	/**
	 * minimalni pocet splatek
	 * @var int
	 */
	public $minpocspl;
	
	/**
	 * maximalni pocet splatek
	 * @var int
	 */
	public $maxpocspl;
	
	/**
	 * minimalni odklad splatek
	 * @var int
	 */
	public $minodklad;
	
	/**
	 * maximalni odklad splatek
	 * @var int
	 */
	public $maxodklad;
	
	/**
	 * parametr jestli je odklad vyzadovany
	 * 1 - odklad je vyzadovan
	 * 0 - odklad muze byt nastaveni na 0 mesicu
	 * 
	 * @var int
	 */
	public $reqodklad;
	
	/**
	 * Data objekt limitu
	 * @param string $id id baremu v ciselniku
	 * @param int $minuver minimalni vyse uveru
	 * @param int $maxuver maximalni vyse uveru
	 * @param int $minpocspl minimalni pocet splatek
	 * @param int $maxpocspl maximalni pocet splatek
	 * @param int $minodklad minimalni odklad splatek
	 * @param int $maxodklad maximalni odklad splatek
	 */
	public function __construct($minuver, $maxuver, $minpocspl, $maxpocspl, $minodklad = null, $maxodklad = null, $reqodklad = null) 
	{
		$this->minuver = $minuver;
		$this->maxuver = $maxuver;
		$this->minpocspl = $minpocspl;
		$this->maxpocspl = $maxpocspl;
		$this->minodklad = $minodklad;
		$this->maxodklad = $maxodklad;
		$this->reqodklad = $reqodklad;
	}

}