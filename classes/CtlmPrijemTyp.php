<?php

/**
 * Data objekt typu prijmu
 */
class CtlmPrijemTyp {

	/**
	 * id typu prijmu v ciselniku
	 * @var string
	 */
	public $id;

	/**
	 * nazev typu prijmu
	 * @var string
	 */
	public $titul;
	
	/**
	 * nasobek
	 * @var string
	 */
	public $nasobek;
	
	
	/**
	 * minimum
	 * @var string
	 */
	public $minimum;

	/**
	 * Data objekt pojisteni
	 * @param string $id id typu prijmu v ciselniku
	 * @param string $titul nazev typu prijmu
	 * @param string $nasobek nasobek
	 * @param string $minimum minimum
	 */
	public function __construct($id, $titul, $nasobek, $minimum)
	{
		$this->id = $id;
		$this->titul = $titul;
		$this->nasobek = $nasobek;
		$this->minimum = $minimum;
	}

}