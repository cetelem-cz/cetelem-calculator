<?php 

require '../config/application.php';

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
	<script src="ctlm-resources/js/cetelem-simple.js?3"></script>
	
	<script>
		 var prijem_typ = <?php echo Ctlm::$ciselnik->getJsonPrijemTyp(); ?>;
		 Ctlm.PrijemTyp.set(prijem_typ);
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
				
				<fieldset>
					
				
					<div class="clearfix">
						<label for="kodPrijemTyp"><i>1</i> Druh příjmu</label>
						<select name="kodPrijemTyp" tabindex="1">
							<?php 
								foreach (Ctlm::$ciselnik->getPrijemTypList() as $prijem_typ) { 
									echo "<option value=\"{$prijem_typ->id}\">{$prijem_typ->titul}</option>";
								} 
							?>
						</select>
					</div>
					
					<br />
					
					<div class="clearfix">
						<label for="prijmy"><i>2</i> Příjmy</label>
						<div class="ctlm-input ctlm-platba">
							<input id="prijmy" name="prijmy" value="0" tabindex="2" />
							<span class="ctlm-platba-min"></span>
							<span class="ctlm-platba-max"></span>
						</div>
					</div>
					
					<div class="clearfix">
						<label for="vydaje"><i>3</i> Výdaje</label>
						<div class="ctlm-input ctlm-platba">
							<input id="vydaje" name="vydaje" value="0" tabindex="2" />
							<span class="ctlm-platba-min"></span>
							<span class="ctlm-platba-max"></span>
						</div>
					</div>
					
					<hr />
					
					<div class="clearfix">
						<label for="vyseSplatky"><i style="margin-top: 10px;">4</i><div style="margin-left: 34px;">Doporučená výše úvěrového limitu</div></label>
						<div class="ctlm-input ctlm-splatka" style="margin-top: 10px;">
							<span class="ctlm-splatka-value" style="width: 100%; text-align: center;"></span>
						</div>
					</div>
					
					<br />
					
					<div class="clearfix">
						<div class="ctlm-info-law">Uvedená částka nákupu na splátky, k jehož financování může být poskytnut úvěr,  je jen orientační a od výsledné výše poskytnutého úvěru se může lišit. Nejedná se o nabídku na uzavření smlouvy a poskytnutím uvedené informace nevzniká právní nárok na poskytnutí úvěru.</div>
					</div>

				</fieldset>
			</form>
			
		</div>
	</div>
	
	
</body>
</html>