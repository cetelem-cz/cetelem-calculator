/**
 * Obsluzna trida pro kalkulacku
 */
var Ctlm = {
	
	/**
	 * konfiguracni nastaveni
	 * 
	 * 	form 	- ID formulare kalkulatoru
	 * 	ajaxUrl - URL pro komunikaci se serverovou casti
	 */
	options: {
		form: '#ctlm-calculator',
		ajaxUrl: 'ajax.php',
	},
	
	/**
	 * formular kalkulacky, nastavi se bud 
	 * paremetrem init funkce nebo pres selector
	 * v options.form
	 */
	form: null,
	
	/**
	 * cache inputu pro rychlejsi selectovani
	 */
	inputs: null,
	
	/**
	 * flag zda je form naplneny v poradku a je mozne data pouzit,
	 * lze overit funkci Ctlm.isReady()
	 */
	ready: false,
	
	/**
	 * inicializace kalkulatoru
	 * bindnuti na submit event formulare
	 * 
	 * @param form jquery objekt formulare
	 */
	init: function(form) 
	{
		this.form = form || $(this.options.form);
		
		// cache inputu
		this.initInputs();
		
		// inicializace jednotlivych komponent formulare
		this.Baremy.init();
		this.Pojisteni.init();
		this.Splatky.init();
		this.Odklad.init();
		this.Platba.init();
		
		// vypocet kalkulace
		this.calculate();
		
	},
	
	/**
	 * ulozi do cache pouzivane inputy
	 */
	initInputs: function() 
	{
		this.inputs = {
			kodBaremu: this.form.find('select[name~="kodBaremu"]'),
			kodPojisteni: this.form.find('select[name~="kodPojisteni"]'),
			cenaZbozi: this.form.find('input[name~="cenaZbozi"]'),
			primaPlatba: this.form.find('input[name~="primaPlatba"]'),
			pocetSplatek: this.form.find('input[name~="pocetSplatek"]'),
			vyseSplatky: this.form.find('input[name~="vyseSplatky"]'),
			odklad: this.form.find('input[name~="odklad"]'),
		};
	},
	
	/**
	 * ajax vypocet kalkulatoru
	 */
	calculate: function() 
	{
		Ctlm.enable();
		
		var url = Ctlm.options.ajaxUrl;
		var data = Ctlm.form.serialize();

		// disablovani komponent
		Ctlm.disable();
		
		// ajax dotaz na server
		$.post(url, data + '&do=calculate', Ctlm.showCalculationResult).fail(Ctlm.showCalculationFail);
		
		return false;
	},
	
	/**
	 * vraceni vysledku kalkulace
	 * @param data
	 */
	showCalculationResult: function(data) 
	{
		
		// message pri info hlasce
		if (data.info != '') {
			$('.ctlm-message span').html(data.info);
			$('.ctlm-message').slideDown('slow');
			window.setTimeout(function() {
				$('.ctlm-message').slideUp('fast');
			}, 4000);
		}
		
		// enablovani vsech komponent
		Ctlm.enable();
		
		// reinicializace komponent podle zvolenych hodnot
		Ctlm.form.find('.ctlm-splatka-value').html(Ctlm.Helper.money(data.vyseSplatky));
		
		Ctlm.inputs.pocetSplatek.val(data.pocetSplatek);
		Ctlm.Splatky.setLimit();
		
		Ctlm.inputs.primaPlatba.val(data.primaPlatba);
		Ctlm.Platba.setLimit();
		
		Ctlm.inputs.odklad.val(data.odklad);
		Ctlm.Odklad.setLimit();
		
		// nastaveni hodnot do rekapitulace
		Ctlm.setResult(data, '.ctlm-result-');
		
		// nastaveni hodnot rekapitulace opce
		if (data.opce == null) {
			Ctlm.form.find('.ctlm-opce').hide();
		} else {
			Ctlm.setResult(data.opce, '.ctlm-opce-', data);
			Ctlm.form.find('.ctlm-opce').show();
		}
		
	},
	
	/**
	 * nastavi hodnoty vypoctu do rekapitulace
	 * @param data ve formatu objektu CtlmVysledek
	 * @param prefix prefix css selectoru (.ctlm-result- nebo .ctlm-opce-)
	 */
	setResult: function(data, prefix, parentData) {
		var money = ['vyseUveru', 'vyseSplatky', 'cenaUveru', 'vyseSplatkyBezPojisteni', 'celkovaCastka', 'doplatek'];
		for(key in money)
			Ctlm.form.find(prefix + money[key]).html(Ctlm.Helper.money(data[money[key]]));
		
		Ctlm.form.find(prefix + 'ursaz').html(Ctlm.Helper.percent(data['ursaz'], 2));
		Ctlm.form.find(prefix + 'RPSN').html(Ctlm.Helper.percent(data['RPSN'], 2));
		Ctlm.form.find(prefix + 'pocetSplatek').html(data['pocetSplatek']);
		
		var pojisteni = data.kodPojisteni;
		if (typeof parentData != 'undefined') {
			pojisteni = parentData.kodPojisteni;
		}
		var pojisteniPopis = Ctlm.Pojisteni.get(pojisteni);
		
		Ctlm.form.find(prefix + 'pojisteni').html(pojisteniPopis.popis);		
	},
	
	/**
	 * obsluha chyby pri volani kalkulace
	 * @param data
	 */
	showCalculationFail: function(data) 
	{
		Ctlm.enable();
		alert('Volani kalkulatoru selhalo.');
	},
	
	/**
	 * vypnuti vsech komponent pri ajax volani
	 */
	disable: function() 
	{
		Ctlm.Baremy.disable();
		Ctlm.Pojisteni.disable();
		Ctlm.Splatky.disable();
		Ctlm.Odklad.disable();
		Ctlm.Platba.disable();
		Ctlm.form.find('.ctlm-splatka').addClass('loading');
	},
	
	/**
	 * zapnuti komponent po ajax volani
	 */
	enable: function()
	{
		Ctlm.Baremy.enable();
		Ctlm.Pojisteni.enable();
		Ctlm.Splatky.enable();
		Ctlm.Odklad.enable();
		Ctlm.Platba.enable();
		Ctlm.form.find('.ctlm-splatka').removeClass('loading');
		Ctlm.unlock();
	},
	
	/**
	 * oznaci form jako nekompletni (napr. pri editaci pole) a uzamkne tlacitko potvrdit
	 */
	lock: function() {
		Ctlm.form.find('.ctlm-splatka').addClass('lock');
		Ctlm.ready = false;
	},
	
	/**
	 * odemkne tlacitko potvrdit
	 */
	unlock: function() {
		Ctlm.form.find('.ctlm-splatka').removeClass('lock');
		Ctlm.ready = true;
	},
	
	/**
	 * zda je form naplneny v poradku a je mozne data pouzit
	 */
	isReady: function() {
		return Ctlm.ready;
	}
	
};

/**
 * selectbox pro vyber baremu
 */
Ctlm.Baremy = {
	/**
	 * seznam baremu a limitu
	 * bud se inicializuji pres Cetelem.setBaremy()
	 * nebo si je automaticky dotahne ajaxem
	 */
	baremy: null,
	
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		if (this.baremy == null)
			this.load();
		
		// pri zmene baremu
		Ctlm.inputs.kodBaremu.on('change', this.change);
		
		// inicializace selectBoxIt custom selectu
		Ctlm.inputs.kodBaremu.selectBoxIt({
			autoWidth: false
		});
	},
	
	/**
	 * nastavi baremy a limity
	 * @param baremy seznam baremu
	 */
	set: function(baremy) 
	{
		Ctlm.Baremy.baremy = baremy;
	},
	
	/**
	 * vrati aktualne vybrany barem
	 */
	get: function() 
	{
		var kodBaremu = Ctlm.inputs.kodBaremu.val();
		return this.baremy[kodBaremu];
	},
	
	/**
	 * vrati limity aktualne vybraneho baremu
	 */
	getLimit: function() 
	{
		return this.get().limit;
	},
	
	/**
	 * nacte baremy a limity pres ajax
	 */
	load: function() 
	{
		var url = Ctlm.options.ajaxUrl;
		$.post(url, {'do': 'getBaremy'}, Ctlm.Baremy.set);
	},
	
	/**
	 * pri zmene baremu
	 */
	change: function() 
	{
		Ctlm.inputs.pocetSplatek.val(24);
		Ctlm.Splatky.setLimit();
		
		Ctlm.inputs.odklad.val(0);
		Ctlm.Odklad.setLimit();
		
		Ctlm.inputs.primaPlatba.val(0);
		Ctlm.Platba.setLimit();
		
		Ctlm.calculate();
	},
	
	/**
	 * disablovani selectu pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.kodBaremu.data("selectBox-selectBoxIt").disable();
	},
	
	/**
	 * enablovani selectu po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.kodBaremu.data("selectBox-selectBoxIt").enable();
	}
	
};

/**
 * pojisteni
 */
Ctlm.Pojisteni = {
	/**
	 * seznam pojisteni
	 * bud se inicializuji pres Cetelem.Pojisteni.set()
	 * nebo si je automaticky dotahne ajaxem
	 */
	pojisteni: null,
	
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		if (this.pojisteni == null) {
			this.load();
		}
			
		// pri zmene baremu
		Ctlm.inputs.kodPojisteni.on('change', this.change);
	
		// inicializace selectBoxIt custom selectu
		Ctlm.inputs.kodPojisteni.selectBoxIt({
			autoWidth: false
		});
	},
	
	/**
	 * pri zmene pojisteni
	 */
	change: function() 
	{
		Ctlm.calculate();
	},
	
	/**
	 * nastavi seznam pojisteni
	 * @param pojisteni seznam pojisteni
	 */
	set: function(pojisteni) 
	{
		Ctlm.Pojisteni.pojisteni = pojisteni;
	},
	
	/**
	 * vrati aktualne vybrany pojisteni
	 */
	get: function(kodPojisteni) 
	{
		return this.pojisteni[kodPojisteni];
	},
	
	/**
	 * nacte pojisteni pres ajax
	 */
	load: function() 
	{
		var url = Ctlm.options.ajaxUrl;
		$.post(url, {'do': 'getPojisteni'}, Ctlm.Pojisteni.set);
	},
	
		/**
	 * disablovani selectu pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.kodPojisteni.data("selectBox-selectBoxIt").disable();
	},
	
	/**
	 * enablovani selectu po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.kodPojisteni.data("selectBox-selectBoxIt").enable();
	}
	
};

/**
 * obsluhy inputu splatek a slideru splatek
 */
Ctlm.Splatky = {
	
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		// obsluha zmeny inputu
		Ctlm.inputs.pocetSplatek.on('change blur', this.onChange).on('keyup', this.keyboardInput);
		
		// inicializace slideru
		Ctlm.form.find('.ctlm-splatky-slider').slider({
	    	value: Ctlm.inputs.pocetSplatek.val(),
    		step: 1,
    		slide: function(event, ui) {
    			Ctlm.inputs.pocetSplatek.val(ui.value);
    		},
    		stop: function(event, ui) {
    			Ctlm.Splatky.onChange();
    		}
	    });
		
		//nastavi limity splatek
		this.setLimit();
	},
	
	/**
	 * obsluha pro kontrolu vstupu (pouze cisla)
	 * - na ENTER se kalkulace prepocita
	 */
	keyboardInput: function(e) {
		// osetrit pouze cisla
		if (Ctlm.Helper.numbersOnly($(this).val()) !== true) {
			$(this).val(Ctlm.Helper.numbersOnly($(this).val()));
		}
		
		Ctlm.lock();
		
		if (e.keyCode == 13)
			Ctlm.Splatky.onChange();
	},
	
	/**
	 * nastavuje limity poctu splatek
	 * @param kodBaremu kodBaremu
	 */
	setLimit: function() 
	{
		var min = Ctlm.Baremy.getLimit().minpocspl;
		var max = Ctlm.Baremy.getLimit().maxpocspl;
		
		// pokud min a max jsou stejne, zamknout komponentu
		if (min == max) {
			Ctlm.Splatky.lock();
		} else {
			Ctlm.Splatky.unlock();
		}
		
		// nastavit limitni hodnoutoy pro napovedu
		Ctlm.form.find('.ctlm-splatky-min').html(min);
		Ctlm.form.find('.ctlm-splatky-max').html(max);
		
		// nastavit limitni hodnoty pro slider
		var slider = Ctlm.form.find('.ctlm-splatky-slider');
		slider.slider('option', 'min', min);
		slider.slider('option', 'max', max);
		
		// kontrola jestli aktualni hodnota je v rozmezi limitu
		var value = Ctlm.inputs.pocetSplatek.val();
		if (value < min) {
			value = min;
			slider.slider('option', 'value', min);
			Ctlm.inputs.pocetSplatek.val(min);
		}
		if (value > max) {
			value = max;
			slider.slider('option', 'value', max);
			Ctlm.inputs.pocetSplatek.val(max);
		}
		slider.slider('option', 'value', value);
		
	},
	
	/**
	 * pri zmene inputu splatek refreshne slider
	 */
	onChange: function() 
	{
		Ctlm.Splatky.setLimit();
		Ctlm.calculate();
	},
	
	/**
	 * disablovani slideru a inputu pri ajaxu
	 */
	disable: function() 
	{
		var slider = Ctlm.form.find('.ctlm-splatky-slider');
		slider.slider('disable');
		Ctlm.inputs.pocetSplatek.attr('disabled', 'disabled');
	},
	
	/**
	 * enablovani slideru po ajaxu
	 */
	enable: function()
	{
		var slider = Ctlm.form.find('.ctlm-splatky-slider');
		slider.slider('enable');
		Ctlm.inputs.pocetSplatek.removeAttr('disabled');
	},
	
	/**
	 * zamknuti slideru pri variante pocet splatek min = max
	 */
	lock: function() {
		var slider = Ctlm.form.find('.ctlm-splatky-slider');
		slider.slider('disable');
		Ctlm.inputs.pocetSplatek.attr('readonly', 'readonly');
	},
	
	/**
	 * odemknuti slideru
	 */
	unlock: function() {
		var slider = Ctlm.form.find('.ctlm-splatky-slider');
		slider.slider('enable');
		Ctlm.inputs.pocetSplatek.removeAttr('readonly');
	}
	
};

/**
 * obsluhy inputu odkladu a slideru odkladu splatek
 */
Ctlm.Odklad = {
		
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		// obsluha zmeny inputu
		Ctlm.inputs.odklad.on('change blur', this.onChange).on('keyup', this.keyboardInput);
		
		// inicializace slideru
		Ctlm.form.find('.ctlm-odklad-slider').slider({
			value: Ctlm.inputs.odklad.val(),
			step: 1,
			slide: function(event, ui) {
				Ctlm.Odklad.changeValue(ui.value);
			},
			stop: function(event, ui) {
				Ctlm.Odklad.onChange();
			}
		});
		
		//nastavi limity splatek
		this.setLimit();
	},
	
	/**
	 * obsluha pro kontrolu vstupu (pouze cisla)
	 * - na ENTER se kalkulace prepocita
	 */
	keyboardInput: function(e) {
		// osetrit pouze cisla
		if (Ctlm.Helper.numbersOnly($(this).val()) !== true) {
			$(this).val(Ctlm.Helper.numbersOnly($(this).val()));
		}
		
		Ctlm.lock();
		
		if (e.keyCode == 13)
			Ctlm.Odklad.onChange();
	},
	
	/**
	 * nastavuje limity poctu splatek
	 * @param kodBaremu kodBaremu
	 */
	setLimit: function() 
	{
		// definice odkladu v limitech baremu
		var minodklad = Ctlm.Baremy.getLimit().minodklad;
		var maxodklad = Ctlm.Baremy.getLimit().maxodklad;
		
		// pokud min a max jsou stejne, zamknout komponentu
		if (minodklad == maxodklad) {
			Ctlm.Odklad.lock();
			// pokud je null komponentu uplne schovat
			if (minodklad == null) {
				Ctlm.Odklad.hide();
			} else {
				Ctlm.Odklad.show();
			}
		} else {
			Ctlm.Odklad.unlock();
			Ctlm.Odklad.show();
		}

		// mozne hodnoty odkladu
		var values = Ctlm.Odklad.getValues();
		
		// mezni hodnoty
		var min = values[0];
		var max = values.length-1;
		var realMax = values[values.length-1];
		
		// nastavit limitni hodnoutoy pro napovedu
		Ctlm.form.find('.ctlm-odklad-min').html(min);
		Ctlm.form.find('.ctlm-odklad-max').html(realMax);
		
		// nastavit limitni hodnoty pro slider
		var slider = Ctlm.form.find('.ctlm-odklad-slider');
		slider.slider('option', 'min', min);
		slider.slider('option', 'max', max);
		
		// kontrola jestli aktualni hodnota je v rozmezi limitu
		var value = Ctlm.inputs.odklad.val();
		
		var fakeValue = $.inArray(parseInt(value), values);
		
		if (fakeValue == -1) {
			if (value > realMax) {
				fakeValue = max;
				value = realMax;
			} 
			else if (value < min) {
				fakeValue = 0;
				value = values[0];
			}
			else {
				fakeValue = (values[0] == 0) ? 1 : 0;
				value = (values[0] == 0) ? values[1] : values[0];
			}
			Ctlm.inputs.odklad.val(value);
		}
		
		if (value < min) {
			value = min;
			if (fakeValue == -1)
				fakeValue = 0;
			slider.slider('option', 'value', min);
			Ctlm.inputs.odklad.val(min);
		}
		
		if (value > realMax) {
			value = realMax;
			if (fakeValue == -1)
				fakeValue = values.length-1;
			slider.slider('option', 'value', realMax);
			Ctlm.inputs.odklad.val(realMax);
		}
		
		slider.slider('option', 'value', fakeValue);
	},
	
	/**
	 * vrati mozne hodnoty odkladu
	 */
	getValues: function() {
		var min = Ctlm.Baremy.getLimit().minodklad;
		var max = Ctlm.Baremy.getLimit().maxodklad;
		var required = Ctlm.Baremy.getLimit().reqodklad;
		
		var values = [];
		if (required == 0) {
			values.push(0);
		}
		for (var i=min; i<=max; i++)
			values.push(i);
		
		return values;
	},
	
	/**
	 * callback pri zmene odkladu
	 */
	changeValue: function(value)
	{
		Ctlm.inputs.odklad.val(Ctlm.Odklad.getValues()[value]);
	},
	
	/**
	 * pri zmene inputu splatek refreshne slider
	 */
	onChange: function() 
	{
		Ctlm.Odklad.setLimit();
		Ctlm.calculate();
	},
	
	/**
	 * disablovani slideru a inputu pri ajaxu
	 */
	disable: function() 
	{
		var slider = Ctlm.form.find('.ctlm-odklad-slider');
		slider.slider('disable');
		Ctlm.inputs.odklad.attr('disabled', 'disabled');
	},
	
	/**
	 * enablovani slideru po ajaxu
	 */
	enable: function()
	{
		var slider = Ctlm.form.find('.ctlm-odklad-slider');
		slider.slider('enable');
		Ctlm.inputs.odklad.removeAttr('disabled');
	},
	
	/**
	 * zamknuti slideru pri variante pocet splatek min = max
	 */
	lock: function() {
		var slider = Ctlm.form.find('.ctlm-odklad-slider');
		slider.slider('disable');
		Ctlm.inputs.odklad.attr('readonly', 'readonly');
	},
	
	/**
	 * odemknuti slideru
	 */
	unlock: function() {
		var slider = Ctlm.form.find('.ctlm-odklad-slider');
		slider.slider('enable');
		Ctlm.inputs.odklad.removeAttr('readonly');
	},
	
	/**
	 * pokud odklad nelze nastavit, schova pole a slider
	 */
	hide: function() {
		$('.ctlm-odklad-wrapper').hide();
	},
	
	/**
	 * zobrazi schovane pole a slider pro odklad
	 */
	show: function() {
		$('.ctlm-odklad-wrapper').show();
	}
};

/**
 * komponenta pro primou platbu
 */
Ctlm.Platba = {
	
	value: 0,
	step: 1000,
	
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		// obsluha zmeny inputu
		Ctlm.inputs.primaPlatba.on('change blur', this.onChange);
		
		// inicializace spinneru
		Ctlm.inputs.primaPlatba.spinner({
			min: 0,
			max: 1000,
			step: 1000,
			spin: function(event, ui) {
				var spinner = Ctlm.inputs.primaPlatba;
				
				var value = ui.value;
				// osetreni predchozi hodnoty
				if ((value % Ctlm.Platba.step) != 0) {
					if (value > Ctlm.inputs.primaPlatba.val()) {
						// tlacitko +
						value = Math.ceil(value/Ctlm.Platba.step)*Ctlm.Platba.step;
					} else {
						// tlacitko -
						value = Math.floor(value/Ctlm.Platba.step)*Ctlm.Platba.step;
					}
					spinner.spinner( "value", value);
					spinner.spinner( "option", "step", Ctlm.Platba.step);
					return false;
				}
				spinner.spinner( "option", "step", Ctlm.Platba.step);
			},
			stop: function(event, ui) {
				var spinner = Ctlm.inputs.primaPlatba;
				if (!event.originalEvent)
					return false;
				
				switch(event.originalEvent.type) {
					case 'keydown':
					case 'keyup':
					case 'keypress':
						// numpad 0-9 	= 96-105
						// keyboard 0-9 = 48-57
						// backspace 	= 8
						if ((event.keyCode >= 96 && event.keyCode <= 105) || (event.keyCode >= 48 && event.keyCode <= 57) || event.keyCode == 8) {
							spinner.spinner( "option", "step", 1);
							Ctlm.lock();
							break;
						}
					default:
						var value = Ctlm.inputs.primaPlatba.val();
						if (Ctlm.Helper.numbersOnly(value) === true) {
							Ctlm.Platba.onChange();
						} else {
							value = Ctlm.Helper.numbersOnly(value);
							Ctlm.inputs.primaPlatba.val(value);
						}
						break;
				}
			},
			icons: { 
				down: "ui-icon-minus", 
				up: "ui-icon-plus" 
			}
		});
		
		// nastaveni limitu
		this.setLimit();
	},
	
	/**
	 * nastaveni limitu spineru (podle limitu baremu)
	 */
	setLimit: function() 
	{
		
		var type = Ctlm.Baremy.get().platba;
		var platbaValue = Ctlm.Baremy.get().platbaValue;
		var cenaZbozi = Ctlm.inputs.cenaZbozi.val();
		var uverMin = Ctlm.Baremy.getLimit().minuver;
		
		var min = 0;
		var max = 0;
		
		switch (type) {
			default:
			case 'free':
				min = 0;
				max = cenaZbozi - uverMin;
				Ctlm.Platba.unlock();
				break;
				
			case 'fixed':
				min = max =  platbaValue;
				Ctlm.Platba.lock();
				break;
				
			case 'percent':
				min = max = Math.round((cenaZbozi / 100) * platbaValue);
				Ctlm.Platba.lock();
				break;
		}
		
		Ctlm.form.find('.ctlm-platba-min').html(Ctlm.Helper.money(min));
		Ctlm.form.find('.ctlm-platba-max').html(Ctlm.Helper.money(max));
		
		var spinner = Ctlm.inputs.primaPlatba;
		spinner.spinner('option', 'min', min);
		spinner.spinner('option', 'max', max);
		
		var value = Ctlm.inputs.primaPlatba.val();
		if (Ctlm.Helper.numbersOnly(value) !== true) {
			value = Ctlm.Helper.numbersOnly(value);
			Ctlm.inputs.primaPlatba.val(value);
		}
		
		if (value < min) {
			Ctlm.inputs.primaPlatba.val(min);
		}
		if (value > max) {
			Ctlm.inputs.primaPlatba.val(max);
		}
	},
	
	/**
	 * pri zmene inputu nebo pouziti tlacitek + -
	 */
	onChange: function()
	{
		Ctlm.Platba.setLimit();
		Ctlm.calculate();
	},
	
	/**
	 * disablovani spinneru pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.primaPlatba.spinner('disable');
	},
	
	/**
	 * enablovani spinneru po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.primaPlatba.spinner('enable');
	},
	
	/**
	 * zamknuti spinneru
	 */
	lock: function() 
	{
		Ctlm.inputs.primaPlatba.spinner('disable');
		Ctlm.inputs.primaPlatba.attr('readonly', 'readonly');
		Ctlm.inputs.primaPlatba.removeAttr('disabled');
		
	},
	
	/**
	 * odemknuti spinneru
	 */
	unlock: function()
	{
		Ctlm.inputs.primaPlatba.spinner('enable');
		Ctlm.inputs.primaPlatba.removeAttr('readonly');
	},
	
	
	
		
};

/**
 * helper funkce
 */
Ctlm.Helper = {
	
	/**
	 * ekvivalent php fce number_format
	 * @param number cislo
	 * @param decimals pocet desetinnych mist
	 * @param dec_point oddelovac pro desetinnou carku
	 * @param thousands_sep oddelovac pro tisice
	 */
	number_format: function(number, decimals, dec_point, thousands_sep) 
	{
		number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
		var n = !isFinite(+number) ? 0 : +number, prec = !isFinite(+decimals) ? 0
				: Math.abs(decimals), sep = (typeof thousands_sep === 'undefined') ? ','
				: thousands_sep, dec = (typeof dec_point === 'undefined') ? '.'
				: dec_point, s = '', toFixedFix = function(n, prec) {
			var k = Math.pow(10, prec);
			return '' + (Math.round(n * k) / k).toFixed(prec);
		};
		// Fix for IE parseFloat(0.55).toFixed(0) = 0;
		s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
		if (s[0].length > 3) {
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}
		if ((s[1] || '').length < prec) {
			s[1] = s[1] || '';
			s[1] += new Array(prec - s[1].length + 1).join('0');
		}
		return s.join(dec);
	},	
	
	/**
	 * vrati cislo naformatovane jako penize v Kc
	 * @param number cislo
	 * @param decimals pocet desetinnych mist
	 */
	money: function(number, decimals) 
	{
		decimals = decimals || 0;
		return this.number_format(number, decimals, ',', '&nbsp;') + '&nbsp;Kč';
	},
	
	/**
	 * vrati cislo naformatovane jako procenta
	 * @param number cislo
	 * @param decimals pocet desetinnych mist
	 */
	percent: function(number, decimals) 
	{
		decimals = decimals || 0;
		return this.number_format(number, decimals, ',', '&nbsp;') + '&nbsp;%';
	},
	
	/**
	 * zjisti zda jsou ve value jen cisla, 
	 * pokud ano vraci true, 
	 * pokud ne vraci opravenou hodnotu
	 * 
	 * @param value string|number
	 * @return boolen|number
	 */
	numbersOnly: function(value)
	{
		var newValue = value.replace(/[^0-9]/g, '');
		if (value != newValue) {
			newValue = parseInt(newValue);
		
			if (isNaN(newValue))
				return 0;
			
			return newValue;
		}
		
		return true;
	}
};

/**
 * inicializace cetelem kalkulacky
 */
$(function() {
	Ctlm.init();
});