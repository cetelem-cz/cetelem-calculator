<?php

/**
 * ajax call musi vracet response typu application/json
 * jinak to jquery nezpracuje jako objekt, ale jako text!
 */
header ('Content-Type: application/json; charset=utf-8');

require '../config/application.php';


switch ($_POST['do']) {

	/**
	 * vypocet kalkulace uveru
	 * v $_POST se prepokladaji naplnena data
	 */
	case 'calculate':
		
// 		echo '{"status":"ok","info":"","kodBaremu":102,"kodPojisteni":"A3","cenaZbozi":20000,"primaPlatba":0,"vyseUveru":20000,"pocetSplatek":25,"odklad":0,"zdarma":null,"vyseSplatky":1148,"vyseSplatkyBezPojisteni":1111,"cenaUveru":8700,"RPSN":37.74,"ursaz":32.45,"celkovaCastka":27775,"opce":null}';
// 		die();
		
		$vypocet = new CtlmVypocet();
		$vypocet->fill($_POST);
		
		/* pokud vypocet neobsahuje pojisteni, dosadi se bud
		 * konstanta CTLM_POJISTENI nebo se nacte prvni z ciselniku
		 */
		if (empty($vypocet->kodPojisteni)) {
			
			if (defined('CTLM_POJISTENI'))
				$vypocet->kodPojisteni = CTLM_POJISTENI;
			else {
				$pojisteni = Ctlm::$ciselnik->getPojisteniList();
				/* @var $poj CtlmPojisteni */
				$prvniPojisteni = array_splice($pojisteni, 0, 1);
				$poj = array_pop($prvniPojisteni);
				$vypocet->kodPojisteni = $poj->id;
			}
		}
		
		$vysledek = Ctlm::$kalkulator->calculate($vypocet);
		
		echo $vysledek->getJsonData();
		
		break;
		
	/**
	 * vrati seznam baremu (a limitu) ve formatu json
	 * pro inicializaci kalkulatoru
	 */
	case 'getBaremy':
		
		echo Ctlm::$ciselnik->getJsonBaremy();
		
		break;
	
	/**
	 * vrati seznam pojisteni ve formatu json
	 * pro inicializaci kalkulatoru
	 */
	case 'getPojisteni':
		
		echo Ctlm::$ciselnik->getJsonPojisteni();
		
		break;
	
	default: 
		break;
}