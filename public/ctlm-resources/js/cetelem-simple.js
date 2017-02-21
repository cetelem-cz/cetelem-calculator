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
		this.PrijemTyp.init();
		this.Prijmy.init();
		this.Vydaje.init();
		
		// vypocet kalkulace
		this.calculate();
		
	},
	
	/**
	 * ulozi do cache pouzivane inputy
	 */
	initInputs: function() 
	{
		this.inputs = {
			kodPrijemTyp: this.form.find('select[name~="kodPrijemTyp"]'),
			prijmy: this.form.find('input[name~="prijmy"]'),
			vydaje: this.form.find('input[name~="vydaje"]'),
			vyseSplatky: this.form.find('input[name~="vyseSplatky"]'),
		};
	},
	
	/**
	 * ajax vypocet kalkulatoru
	 */
	calculate: function() 
	{
		// disablovani komponent
		Ctlm.disable();
		
		var prijmy = Ctlm.inputs.prijmy.val();
		var vydaje = Ctlm.inputs.vydaje.val();
		var prijem_typ = Ctlm.PrijemTyp.get();
		var limit = 0;
		
		if ((prijmy - vydaje) > 5000) {
			limit = prijmy * prijem_typ.nasobek;
			
			if (limit > prijem_typ.minimum) {
				limit = prijem_typ.minimum;
			}
			
			limit = Math.round (limit / 1000) * 1000;
						
			Ctlm.form.find('.ctlm-splatka-value').html(limit + " Kč");
		} else {
			Ctlm.form.find('.ctlm-splatka-value').html(0 + " Kč");
		}
		
		Ctlm.enable();

		return false;
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
		Ctlm.Prijmy.disable();
		Ctlm.Vydaje.disable();
		Ctlm.form.find('.ctlm-splatka').addClass('loading');
	},
	
	/**
	 * zapnuti komponent po ajax volani
	 */
	enable: function()
	{
		Ctlm.Prijmy.enable();
		Ctlm.Vydaje.enable();
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
Ctlm.PrijemTyp = {
	/**
	 * seznam baremu a limitu
	 * bud se inicializuji pres Cetelem.setBaremy()
	 * nebo si je automaticky dotahne ajaxem
	 */
	prijem_typ_list: null,
	
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		if (this.prijem_typ_list == null)
			this.load();
		
		// pri zmene baremu
		Ctlm.inputs.kodPrijemTyp.on('change', this.change);
		
		// inicializace selectBoxIt custom selectu
		Ctlm.inputs.kodPrijemTyp.selectBoxIt({
			autoWidth: false
		});
	},
	
	/**
	 * nastavi baremy a limity
	 * @param baremy seznam baremu
	 */
	set: function(prijem_typ_list) 
	{
		this.prijem_typ_list = prijem_typ_list;
	},
	
	/**
	 * vrati aktualne vybrany barem
	 */
	get: function() 
	{
		var prijem_typ_id = Ctlm.inputs.kodPrijemTyp.val();
		return this.prijem_typ_list[prijem_typ_id];
	},
	
	/**
	 * nacte baremy a limity pres ajax
	 */
	load: function() 
	{
		var url = Ctlm.options.ajaxUrl;
		$.post(url, {'do': 'getPrijemTypList'}, this.set);
	},
	
	/**
	 * pri zmene baremu
	 */
	change: function() 
	{
		Ctlm.calculate();
	},
	
	/**
	 * disablovani selectu pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.kodPrijemTyp.data("selectBox-selectBoxIt").disable();
	},
	
	/**
	 * enablovani selectu po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.kodPrijemTyp.data("selectBox-selectBoxIt").enable();
	}
	
};

/**
 * komponenta pro primou platbu
 */
Ctlm.Prijmy = {
	
	step: 1000,
	
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		// obsluha zmeny inputu
		Ctlm.inputs.prijmy.on('change blur', this.onChange);
		
		// inicializace spinneru
		Ctlm.inputs.prijmy.spinner({
			
			spin: function(event, ui) {
				var spinner = Ctlm.inputs.prijmy;
				
				var value = ui.value;
				// osetreni predchozi hodnoty
				if ((value % Ctlm.Prijmy.step) != 0) {
					if (value > Ctlm.inputs.prijmy.val()) {
						// tlacitko +
						value = Math.ceil(value/Ctlm.Prijmy.step)*Ctlm.Prijmy.step;
					} else {
						// tlacitko -
						value = Math.floor(value/Ctlm.Prijmy.step)*Ctlm.Prijmy.step;
					}
					spinner.spinner( "value", value);
					spinner.spinner( "option", "step", Ctlm.Prijmy.step);
					return false;
				}
				spinner.spinner( "option", "step", Ctlm.Prijmy.step);
			},
			stop: function(event, ui) {
				var spinner = Ctlm.inputs.prijmy;
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
						var value = Ctlm.inputs.prijmy.val();
						if (Ctlm.Helper.numbersOnly(value) === true) {
							Ctlm.Prijmy.onChange();
						} else {
							value = Ctlm.Helper.numbersOnly(value);
							Ctlm.inputs.prijmy.val(value);
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
		
		var min = 0;
		var max = 50000;
		
		Ctlm.form.find('.ctlm-platba-min').html(Ctlm.Helper.money(min));
		Ctlm.form.find('.ctlm-platba-max').html(Ctlm.Helper.money(max));
		
		var spinner = Ctlm.inputs.prijmy;
		spinner.spinner('option', 'min', min);
		spinner.spinner('option', 'max', max);
		
		var value = Ctlm.inputs.prijmy.val();
		if (Ctlm.Helper.numbersOnly(value) !== true) {
			value = Ctlm.Helper.numbersOnly(value);
			Ctlm.inputs.prijmy.val(value);
		}
		
		if (value < min) {
			Ctlm.inputs.prijmy.val(min);
		}
		if (value > max) {
			Ctlm.inputs.prijmy.val(max);
		}
	},
	
	/**
	 * pri zmene inputu nebo pouziti tlacitek + -
	 */
	onChange: function()
	{
		Ctlm.Prijmy.setLimit();
		Ctlm.calculate();
	},
	
	/**
	 * disablovani spinneru pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.prijmy.spinner('disable');
	},
	
	/**
	 * enablovani spinneru po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.prijmy.spinner('enable');
	},
	
	/**
	 * zamknuti spinneru
	 */
	lock: function() 
	{
		Ctlm.inputs.prijmy.spinner('disable');
		Ctlm.inputs.prijmy.attr('readonly', 'readonly');
		Ctlm.inputs.prijmy.removeAttr('disabled');
		
	},
	
	/**
	 * odemknuti spinneru
	 */
	unlock: function()
	{
		Ctlm.inputs.prijmy.spinner('enable');
		Ctlm.inputs.prijmy.removeAttr('readonly');
	},
};

/**
 * komponenta pro primou platbu
 */
Ctlm.Vydaje = {
	
	step: 1000,
	
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		// obsluha zmeny inputu
		Ctlm.inputs.vydaje.on('change blur', this.onChange);
		
		// inicializace spinneru
		Ctlm.inputs.vydaje.spinner({
			
			spin: function(event, ui) {
				var spinner = Ctlm.inputs.vydaje;
				
				var value = ui.value;
				// osetreni predchozi hodnoty
				if ((value % Ctlm.Vydaje.step) != 0) {
					if (value > Ctlm.inputs.vydaje.val()) {
						// tlacitko +
						value = Math.ceil(value/Ctlm.Vydaje.step)*Ctlm.Vydaje.step;
					} else {
						// tlacitko -
						value = Math.floor(value/Ctlm.Vydaje.step)*Ctlm.Vydaje.step;
					}
					spinner.spinner( "value", value);
					spinner.spinner( "option", "step", Ctlm.Vydaje.step);
					return false;
				}
				spinner.spinner( "option", "step", Ctlm.Vydaje.step);
			},
			stop: function(event, ui) {
				var spinner = Ctlm.inputs.vydaje;
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
						var value = Ctlm.inputs.vydaje.val();
						if (Ctlm.Helper.numbersOnly(value) === true) {
							Ctlm.Vydaje.onChange();
						} else {
							value = Ctlm.Helper.numbersOnly(value);
							Ctlm.inputs.vydaje.val(value);
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
		
		var min = 0;
		var max = 50000;
		
		Ctlm.form.find('.ctlm-platba-min').html(Ctlm.Helper.money(min));
		Ctlm.form.find('.ctlm-platba-max').html(Ctlm.Helper.money(max));
		
		var spinner = Ctlm.inputs.vydaje;
		spinner.spinner('option', 'min', min);
		spinner.spinner('option', 'max', max);
		
		var value = Ctlm.inputs.vydaje.val();
		if (Ctlm.Helper.numbersOnly(value) !== true) {
			value = Ctlm.Helper.numbersOnly(value);
			Ctlm.inputs.vydaje.val(value);
		}
		
		if (value < min) {
			Ctlm.inputs.vydaje.val(min);
		}
		if (value > max) {
			Ctlm.inputs.vydaje.val(max);
		}
	},
	
	/**
	 * pri zmene inputu nebo pouziti tlacitek + -
	 */
	onChange: function()
	{
		Ctlm.Vydaje.setLimit();
		Ctlm.calculate();
	},
	
	/**
	 * disablovani spinneru pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.vydaje.spinner('disable');
	},
	
	/**
	 * enablovani spinneru po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.vydaje.spinner('enable');
	},
	
	/**
	 * zamknuti spinneru
	 */
	lock: function() 
	{
		Ctlm.inputs.vydaje.spinner('disable');
		Ctlm.inputs.vydaje.attr('readonly', 'readonly');
		Ctlm.inputs.vydaje.removeAttr('disabled');
		
	},
	
	/**
	 * odemknuti spinneru
	 */
	unlock: function()
	{
		Ctlm.inputs.vydaje.spinner('enable');
		Ctlm.inputs.vydaje.removeAttr('readonly');
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