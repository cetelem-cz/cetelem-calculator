<?php 

require '../config/application.php';

/**
 * nastaveni ceny zbozi
 */
$cenaZbozi = 20000;

?>
<!DOCTYPE html>
<html>
<head>
	
	<meta charset="UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
	<title>Cetelem Kalkulačka / Rekapitulace</title>
	
	<link href="ctlm-resources/css/jq-ui-cetelem/jquery-ui-1.10.1.custom.min.css" media="all" rel="stylesheet" type="text/css">
	<link href="ctlm-resources/css/jquery.selectBoxIt.css" media="all" rel="stylesheet" type="text/css">
	<link href="ctlm-resources/css/cetelem-rekapitulace.css" media="all" rel="stylesheet" type="text/css">
	
	<script src="ctlm-resources/js/jquery-1.11.0.min.js"></script>
	<script src="ctlm-resources/js/jquery-ui-1.10.4.custom.min.js"></script>
	<script src="ctlm-resources/js/jquery.selectBoxIt.min.js"></script>
	<script src="ctlm-resources/js/cetelem-rekapitulace.js?1"></script>
	
	<script>
		/**
		 * nepovinna inicializace baremu (limitu) pro JS cast kalkulacky
		 * pokud se nenastavi, kalkulator se pro ne zepta pres ajax.
		 * Nastaveni zde usetri ajax request.
		 */
		 var baremy = <?php echo Ctlm::$ciselnik->getJsonBaremy(); ?>;
		 Ctlm.Baremy.set(baremy);

		 /**
		  * nepovinna inicializace pojisteni pro JS cast kalkulacky
		  * pokud se nenastavi, kalkulator se pro ne zepta pres ajax.
		  * Nastaveni zde usetri ajax request.
		  */
		 var pojisteni = <?php echo Ctlm::$ciselnik->getJsonPojisteni(); ?>;
		 Ctlm.Pojisteni.set(pojisteni);

	</script>
	
</head>
<body>

	<div class="ctlm-calc clearfix">
		
		<div class="title">Žádost o úvěr Cetelem</div>
		
		<img src="ctlm-resources/img/credito2.jpg" alt="Cetelem Credito" class="credito" />
		
		<div class="ctlm-form">

			<form action="" method="post" id="ctlm-calculator">
				<fieldset>
					
					<div class="ctlm-message" style="display:none"><i class="ico-info-big">i</i><span></span></div>
					
					<div class="ctlm-row ctlm-barem">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Typ úvěru:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value">
									<?php 
										$baremy = Ctlm::$ciselnik->getBaremy(); 
										$barem = reset($baremy);
										echo $barem->name;
									?>
								</span>
							</span>
							<button class="next" type="button" data-edit="ctlm-barem"><i class="ico-next"></i> Upravit</button>
						</div>
						
						<div class="ctlm-row-edit clearfix">
							<label for="kodBaremu">Typ úvěru:</label>
							<span class="ctlm-value-wrapper">
								<select name="kodBaremu" id="kodBaremu">
									<?php 
										foreach (Ctlm::$ciselnik->getBaremy() as $barem) { 
											/* @var $barem CtlmBarem */
											echo "<option value=\"{$barem->id}\">{$barem->name}</option>";
										} 
									?>
								</select>
							</span>
							<button class="prev" type="button" data-edit="ctlm-barem">Použít <i class="ico-prev"></i></button>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-highlight">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Cena zboží:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value">
									<?php 
										echo Ctlm::$helper->money($cenaZbozi);
									?>
								</span>
								<input id="cenaZbozi" name="cenaZbozi" value="<?php echo $cenaZbozi; ?>" type="hidden" />
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-platba">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Přímá platba:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-primaPlatba"></span>
							</span>
							<button class="next" type="button" data-edit="ctlm-platba"><i class="ico-next"></i> Upravit</button>
						</div>
						
						<div class="ctlm-row-edit clearfix">
							<label for="primaPlatba">Přímá platba:</label>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-info-message">
									<strong>Přímá platba</strong><br /><span class="ctlm-platba-min"></span> - <span class="ctlm-platba-max"></span>.
								</span>
								<input id="primaPlatba" name="primaPlatba" value="0" />
							</span>
							<button class="prev" type="button" data-edit="ctlm-platba">Použít <i class="ico-prev"></i></button>
						</div>
					</div>
					
					<div class="ctlm-row">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Celková výše úvěru:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-vyseUveru"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-pojisteni">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Pojištění:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value">
									<?php 
										$pojisteniList = Ctlm::$ciselnik->getPojisteniList(); 
										$pojisteni = reset($pojisteniList);
										echo $pojisteni->name;
									?>
								</span>
							</span>
							<button class="next" type="button" data-edit="ctlm-pojisteni"><i class="ico-next"></i> Upravit</button>
						</div>
						
						<div class="ctlm-row-edit clearfix">
							<label for="kodPojisteni">Pojištění:</label>
							<span class="ctlm-value-wrapper">
								<select name="kodPojisteni" id="kodPojisteni">
									<?php 
										foreach (Ctlm::$ciselnik->getPojisteniList() as $pojisteni) { 
											/* @var $pojisteni CtlmPojisteni */
											echo "<option value=\"{$pojisteni->id}\">{$pojisteni->name}</option>";
										} 
									?>
								</select>
							</span>
							<button class="prev" type="button" data-edit="ctlm-pojisteni">Použít <i class="ico-prev"></i></button>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-section ctlm-opce">Standardní varianta splácení:</div>
					
					<div class="ctlm-row ctlm-splatky">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Počet měsíčních splátek:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-pocetSplatek"></span>
							</span>
							<button class="next" type="button" data-edit="ctlm-splatky"><i class="ico-next"></i> Upravit</button>
						</div>
						
						<div class="ctlm-row-edit clearfix">
							<label for="pocetSplatek">Počet měsíčních splátek:</label>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-info-message">
									<strong>Počet splátek</strong><br /> <span class="ctlm-splatky-min"></span> - <span class="ctlm-splatky-max"></span> měsíců.
								</span>
								<input id="pocetSplatek" name="pocetSplatek" value="24" />
							</span>
							<button class="prev" type="button" data-edit="ctlm-splatky">Použít <i class="ico-prev"></i></button>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-odklad ctlm-odklad-wrapper">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Odklad 1. splátky:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-odklad"></span>
							</span>
							<button class="next" type="button" data-edit="ctlm-odklad"><i class="ico-next"></i> Upravit</button>
						</div>
						
						<div class="ctlm-row-edit clearfix">
							<label for="odklad">Odklad 1. splátky:</label>
							<span class="ctlm-value-wrapper">
								<select id="odklad" name="odklad">
									<option value="0">0</option>
								</select>
							</span>
							<button class="prev" type="button" data-edit="ctlm-odklad">Použít <i class="ico-prev"></i></button>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-highlight">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Celková výše měsíční splátky:<br /><small>(včetně pojištění, má-li být sjednáno)</small></span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-vyseSplatky"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Cena úvěru:<br /><small>(včetně pojištění, má-li být sjednáno)</small></span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-cenaUveru"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Roční úroková sazba:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-ursaz"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">RPSN:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-RPSN"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Výše měsíční splátky úvěru:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-vyseSplatkyBezPojisteni"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Za úvěr celkem zaplatíte:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-result-celkovaCastka"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-section ctlm-opce">Zrychlená varianta splácení:</div>
					
					<div class="ctlm-row ctlm-opce">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Počet měsíčních splátek:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value"><span class="ctlm-opce-pocetSplatek"></span> + doplatek</span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-opce ctlm-highlight">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Celková výše měsíční splátky:<br /><small>(včetně pojištění, má-li být sjednáno)</small></span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-opce-vyseSplatky"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-opce">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Doplatek:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-opce-doplatek"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-opce">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Cena úvěru:<br /><small>(včetně pojištění, má-li být sjednáno)</small></span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-opce-cenaUveru"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-opce">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Roční úroková sazba:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-opce-ursaz"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-opce">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">RPSN:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-opce-RPSN"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-opce">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Výše měsíční splátky úvěru:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-opce-vyseSplatkyBezPojisteni"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row ctlm-opce">
						<div class="ctlm-row-static clearfix">
							<span class="ctlm-label">Za úvěr celkem zaplatíte:</span>
							<span class="ctlm-value-wrapper">
								<span class="ctlm-value ctlm-opce-celkovaCastka"></span>
							</span>
						</div>
					</div>
					
					<div class="ctlm-row">
						
						<a href="#" class="ctlm-button">Pokračovat</a>
						
					</div>					
					
				</fieldset>
			</form>
			
		</div>
	</div>
	
	
</body>
</html>