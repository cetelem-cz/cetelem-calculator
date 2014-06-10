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
	<title>Cetelem Kalkulačka</title>
	
	<link href="ctlm-resources/css/jq-ui-cetelem/jquery-ui-1.10.1.custom.min.css" media="all" rel="stylesheet" type="text/css">
	<link href="ctlm-resources/css/jquery.selectBoxIt.css" media="all" rel="stylesheet" type="text/css">
	<link href="ctlm-resources/css/cetelem.css" media="all" rel="stylesheet" type="text/css">
	
	<script src="ctlm-resources/js/jquery-1.11.0.min.js"></script>
	<script src="ctlm-resources/js/jquery-ui-1.10.4.custom.min.js"></script>
	<script src="ctlm-resources/js/jquery.selectBoxIt.min.js"></script>
	<script src="ctlm-resources/js/cetelem.js?3"></script>
	
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
		
		<div class="ctlm-info">
			
			<img src="ctlm-resources/img/logo.png" alt="Cetelem" class="logo" />

			<div class="title">Nákup na splátky od Cetelem jednoduše ve 3 krocích</div>
			<ul>
				<li>Vyberte si zboží již od 3 000 Kč</li>
				<li>Nastavte si splátky podle svých potřeb</li>
				<li>Vyřiďte žádost online za pár minut </li>
			</ul>
			
			<img src="ctlm-resources/img/credito.png" alt="Cetelem Credito" class="credito" />

		</div>
		
		<div class="ctlm-form">

			<form action="" method="post" id="ctlm-calculator">
				
				<div class="ctlm-barem-wrapper">
					<label for="kodBaremu"><img src="ctlm-resources/img/logo.png" alt="Cetelem" class="logo" /> Typ úvěru</label>
					<select name="kodBaremu" tabindex="1">
						<?php 
							foreach (Ctlm::$ciselnik->getBaremy() as $barem) { 
								/* @var $barem CtlmBarem */
								echo "<option value=\"{$barem->id}\">{$barem->name}</option>";
							} 
						?>
					</select>
				</div>
				
				<fieldset>
					
					<div class="clearfix">
						<label for="cenaZbozi"><i class="ico-cena"></i> Cena zboží</label>
						<div class="ctlm-input">
							<input id="cenaZbozi" name="cenaZbozi" value="<?php echo $cenaZbozi; ?>" type="hidden" />
							<span class="ctlm-cena-value"><?php echo Ctlm::$helper->money($cenaZbozi) ?></span>
						</div>
					</div>

					<hr />
					
					<div class="clearfix">
						<label for="primaPlatba"><i>1</i> Přímá platba</label>
						<div class="ctlm-input ctlm-platba">
							<input id="primaPlatba" name="primaPlatba" value="0" tabindex="2" />
							<span class="ctlm-platba-min"></span>
							<span class="ctlm-platba-max"></span>
						</div>
					</div>
					
					<div class="clearfix">
						<label for="pocetSplatek"><i>2</i> Délka splácení</label>
						<div class="ctlm-input ctlm-splatky">
							<div class="ctlm-splatky-slider">
							</div>
							<span class="ctlm-splatky-min"></span>
							<span class="ctlm-splatky-max"></span>
							
							<div class="ctlm-splatky-input">
								<input id="pocetSplatek" name="pocetSplatek" value="24" tabindex="3" />
								<span class="ctlm-splatky-label">měsíců</span>
							</div>
						</div>
					</div>
					
					<div class="ctlm-odklad-wrapper clearfix">
						<label for="odklad">Odklad 1. splátky</label>
						<div class="ctlm-input ctlm-odklad">
							<div class="ctlm-odklad-slider">
							</div>
							<span class="ctlm-odklad-min"></span>
							<span class="ctlm-odklad-max"></span>
							
							<div class="ctlm-odklad-input">
								<input id="odklad" name="odklad" value="0" tabindex="4" />
								<span class="ctlm-odklad-label">měsíců</span>
							</div>
						</div>
					</div>
					
					<hr />
					
					<div class="clearfix">
						<label for="vyseSplatky"><i>3</i> Celková splátka</label>
						<div class="ctlm-input ctlm-splatka">
							<span class="ctlm-splatka-value"></span>
							<a href="#" class="ctlm-button">Potvrdit</a>
						</div>
					</div>
					
					<hr />
					
					<div class="ctlm-uver">
						Detailní parametry úvěru <i class="ico-info">i</i>
						
						<div class="ctlm-uver-detail">
							<h3 class="ctlm-opce">Standardní varianta splácení:</h3>
							<dl class="ctlm-left">
								<dt>Celková výše úvěru:</dt>
								<dd class="ctlm-result-vyseUveru">&nbsp;</dd>
								
								<dt>Počet měsíčních splátek:</dt>
								<dd class="ctlm-result-pocetSplatek">&nbsp;</dd>
								
								<dt>Celková výše měsíční splátky: <small>(včetně pojištění, má-li být sjednáno)</small></dt>
								<dd class="ctlm-result-vyseSplatky">&nbsp;</dd>
								
								<dt>Cena úvěru: <small>(včetně pojištění, má-li být sjednáno)</small></dt>
								<dd class="ctlm-result-cenaUveru">&nbsp;</dd>
							</dl>
							<dl class="ctlm-right">
								<dt>Roční úroková sazba:</dt>
								<dd class="ctlm-result-ursaz">&nbsp;</dd>
								
								<dt>RPSN:</dt>
								<dd class="ctlm-result-RPSN">&nbsp;</dd>
								
								<dt class="short">Pojištění:</dt>
								<dd class="short ctlm-result-pojisteni">&nbsp;</dd>
								
								<dt>Výše měsíční splátky úvěru:</dt>
								<dd class="ctlm-result-vyseSplatkyBezPojisteni">&nbsp;</dd>
								
								<dt>Za úvěr celkem zaplatíte:</dt>
								<dd class="ctlm-result-celkovaCastka">&nbsp;</dd>
							</dl>
							
							<h3 class="ctlm-opce">Zrychlená varianta splácení:</h3>
							<dl class="ctlm-left ctlm-opce">
								<dt>Celková výše úvěru:</dt>
								<dd class="ctlm-opce-vyseUveru">&nbsp;</dd>
								
								<dt>Počet měsíčních splátek:</dt>
								<dd><span class="ctlm-opce-pocetSplatek">&nbsp;</span>+doplatek</dd>
								
								<dt>Celková výše měsíční splátky: <small>(včetně pojištění, má-li být sjednáno)</small></dt>
								<dd class="ctlm-opce-vyseSplatky">&nbsp;</dd>
								
								<dt>Doplatek:</dt>
								<dd class="ctlm-opce-doplatek">&nbsp;</dd>
								
								<dt>Cena úvěru: <small>(včetně pojištění, má-li být sjednáno)</small></dt>
								<dd class="ctlm-opce-cenaUveru">&nbsp;</dd>
							</dl>
							<dl class="ctlm-right ctlm-opce">
								
								<dt>Roční úroková sazba:</dt>
								<dd class="ctlm-opce-ursaz">&nbsp;</dd>
								
								<dt>RPSN:</dt>
								<dd class="ctlm-opce-RPSN">&nbsp;</dd>
								
								<dt class="short">Pojištění:</dt>
								<dd class="short ctlm-opce-pojisteni">&nbsp;</dd>
								
								<dt>Výše měsíční splátky úvěru:</dt>
								<dd class="ctlm-opce-vyseSplatkyBezPojisteni">&nbsp;</dd>
								
								<dt>Za úvěr celkem zaplatíte:</dt>
								<dd class="ctlm-opce-celkovaCastka">&nbsp;</dd>
							</dl>
								
								

						</div>
					</div>
					
					<div class="ctlm-message" style="display:none"><i class="ico-info-big">i</i><span></span></div>

				</fieldset>
			</form>
			
		</div>
	</div>
	
	
</body>
</html>