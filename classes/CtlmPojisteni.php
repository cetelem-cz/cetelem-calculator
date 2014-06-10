<?php

/**
 * Data objekt pojisteni
 */
class CtlmPojisteni {

	/**
	 * id pojisteni v ciselniku
	 * @var string
	 */
	public $id;

	/**
	 * nazev pojisteni
	 * @var string
	 */
	public $name;
	
	/**
	 * kratky popis pojisteni
	 * @var string
	 */
	public $popis;
	
	
	/**
	 * napoveda k pojisteni (muze obsahovat html <small>, <br /> a <strong> tagy)
	 * @var string
	 */
	public $napoveda;

	/**
	 * Data objekt pojisteni
	 * @param string $id id pojisteni v ciselniku
	 * @param string $name nazev pojisteni
	 */
	public function __construct($id, $name, $popis, $napoveda)
	{
		$this->id = $id;
		$this->name = $name;
		$this->popis = $popis;
		$this->napoveda = $napoveda;
	}

}