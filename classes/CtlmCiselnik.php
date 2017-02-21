<?php

require CTLM_CLASSES.'/CtlmBarem.php';
require CTLM_CLASSES.'/CtlmLimit.php';
require CTLM_CLASSES.'/CtlmPojisteni.php';
require CTLM_CLASSES.'/CtlmPrijemTyp.php';

Ctlm::$ciselnik = CtlmCiselnik::getInstance();

/**
 * Obsluzna trida pro ciselniky cetelem
 * 
 *	$baremy = Ctlm::$ciselnik->getBaremy();<br />
 *	var_dump($baremy);<br />
 *	
 *	$pojisteni = Ctlm::$ciselnik->getPojisteniList();<br />
 *	var_dump($pojisteni);<br />
 *
 */
class CtlmCiselnik {
	
	/**
	 * instance ciselniku
	 * @var CtlmCiselnik
	 */
	protected static $instance = null;
	
	/**
	 * ulozene baremy
	 * @var CtlmBarem[]
	 */
	private $baremy = array();
	
	/**
	 * ulozene pojisteni
	 * @var CtlmPojisteni[]
	 */
	private $pojisteni = array();
	
	/**
	 * ulozene druhy prijmu
	 * @var CtlmDruhPrijem[]
	 */
	private $prijem_druh = array();
	
	/**
	 * vraci instanci ciselniku
	 * @return CtlmCiselnik
	 */
	public static function getInstance() 
	{
		if (self::$instance == null) {
			self::$instance = new self();
		}
		return self::$instance;
	}
	
	private function __constructor() 
	{
	}
	
	/**
	 * vraci info o baremu, limitech, odkladu splatek a prime platbe
	 * @return CtlmBarem[]
	 */
	public function getInfo()
	{
		if (!empty($this->baremy)) {
			return $this->baremy;
		}
		
		$this->baremy = array();
		$data = file_get_contents(CTLM_URL_INFO);
		$xml = simplexml_load_string($data);
		
		foreach ($xml as $barem) {
			$id = (string) $barem->attributes()->id;

			// limity
			$minuver = (int) $barem->uver->attributes()->min;
			$maxuver = (int) $barem->uver->attributes()->max;
			switch ((string) $barem->splatky->attributes()->type) {
				case 'fixed':
					$minpocspl = $maxpocspl = (int) $barem->splatky->attributes()->value;
					break;
				default:	
				case 'range':
					$minpocspl = (int) $barem->splatky->attributes()->min;
					$maxpocspl = (int) $barem->splatky->attributes()->max;
					break;
			}
			
			// odklad
			$reqodklad = (int) $barem->odklad->attributes()->required;
			switch ((string) $barem->odklad->attributes()->type) {
				case 'fixed':
					$minodklad = $maxodklad = (int) $barem->odklad->attributes()->value;
					break;
				case 'range':
					$minodklad = (int) $barem->odklad->attributes()->min;
					$maxodklad = (int) $barem->odklad->attributes()->max;
					break;
				default:
				case 'none':
					$minodklad = $maxodklad = null;
			}
			
			// prima platba
			$platba = (string) $barem->platba->attributes()->type;
			$platbaValue = (int) $barem->platba->attributes()->value;
			
			$this->baremy[$id] = new CtlmBarem(
				$id,
				trim((string) $barem->titul),
				new CtlmLimit($minuver, $maxuver, $minpocspl, $maxpocspl, $minodklad, $maxodklad, $reqodklad),
				$platba,
				$platbaValue
			);
			
		}
		return $this->baremy;
	}
	
	
	/**
	 * vrati pole definic baremu
	 * @return CtlmBarem[]
	 */
	public function getBaremy() 
	{
		if (!empty($this->baremy)) {
			return $this->baremy;
		}
		
		return $this->getInfo();
	}
	
	/**
	 * vrati definici baremu
	 *
	 * @param string $id
	 * @return CtlmBarem
	 */
	public function getBarem($id)
	{
		$baremy = $this->getBaremy();
		if (!empty($baremy[$id])) {
			return $baremy[$id];
		}
	
		return false;
	}	
	
	/**
	 * vrati pole definic pojisteni
	 * @return CtlmPojisteni[]
	 */
	public function getPojisteniList() 
	{
		if (!empty($this->pojisteni)) {
			return $this->pojisteni;
		}
		
		$this->pojisteni = array();
		$data = file_get_contents(CTLM_URL_POJISTENI);
		$xml = simplexml_load_string($data);
		
		foreach ($xml as $pojisteni) {
			$id = (string) $pojisteni->attributes()->id;
			$this->pojisteni[$id] = new CtlmPojisteni(
					$id,
					trim((string) $pojisteni->titul),
					trim((string) $pojisteni->popis),
					trim((string) $pojisteni->napoveda)
			);
		}
		
		return $this->pojisteni;
	}

	/**
	 * vrati definici pojisteni
	 *
	 * @param string $id
	 * @return CtlmPojisteni
	 */
	public function getPojisteni($id)
	{
		$pojisteni = $this->getPojisteniList();
		if (!empty($pojisteni[$id])) {
			return $pojisteni[$id];
		}
	
		return false;
	}
	
	/**
	 * vrati pole definic typu prijmu
	 * @return CtlmPrijemTyp[]
	 */
	public function getPrijemTypList()
	{
		if (!empty($this->prijem_typ)) {
			return $this->prijem_typ;
		}
	
		$this->prijem_typ = array();
		$data = file_get_contents(CTLM_URL_PRIJEM_TYP);
		$xml = simplexml_load_string($data);
	
		foreach ($xml as $prijem_typ) {
			$id = (string) $prijem_typ->attributes()->id;
			$this->prijem_typ[$id] = new CtlmPrijemTyp(
				$id,
				trim((string) $prijem_typ->titul),
				trim((string) $prijem_typ->nasobek),
				trim((string) $prijem_typ->minimum)
			);
		}
	
		return $this->prijem_typ;
	}
	
	/**
	 * vrati definici typu prijmu
	 *
	 * @param string $id
	 * @return CtlmPrijemTyp
	 */
	public function getPrijemTyp($id)
	{
		$prijem_typ = $this->getPrijemTypList();
		if (!empty($prijem_typ[$id])) {
			return $prijem_typ[$id];
		}
	
		return false;
	}	
	
	/**
	 * vrati baremy (a limity) ve formatu json
	 * @return string
	 */
	public function getJsonBaremy() 
	{
		return json_encode($this->getBaremy());
	}
	
	/**
	 * vrati pojisteni ve formatu json
	 * @return string
	 */
	public function getJsonPojisteni() 
	{
		return json_encode($this->getPojisteniList());
	}

	
	public function getJsonPrijemTyp()
	{
		return json_encode($this->getPrijemTypList());
	}
}
