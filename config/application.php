<?php 

/**
 * Uzivatelska konfigurace
 */

/**
 * definice cisla prodejce
 * @var string
 */
define ('CTLM_VDR_ID', '#######');

/**
 * pojisteni zvolene klientem
 * pokud neni definovane, zvoli se prvni z ciselniku
 * podle toho jake ma prodejce povolene
 */
// define ('CTLM_POJISTENI', 'A3');

/**
 * definice prostredi
 * 
 * uat 			= testovaci prostredi pro prodejce
 * production 	= produkcni prostredi
 * dummy 		= offline prostredi (kalkulace nepocita)
 * 
 * @var string uat|production|dummy
 */
define ('CTLM_ENVIRONMENT', 'uat');

/**
 * defaultni url, cesty a inicializace cetelem
 */
require 'cetelem.php';
