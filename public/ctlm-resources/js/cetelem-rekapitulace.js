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
	 * inicializace kalkulatoru
	 * bindnuti na submit event formulare
	 * 
	 * @param form jquery objekt formulare
	 */
	init: function(form) 
	{
		this.form = form || $(this.options.form);
		
		$('.ctlm-opce').hide();
		
		// cache inputu
		this.initInputs();
		
		// inicializace jednotlivych komponent formulare
		this.Baremy.init();
		this.Pojisteni.init();
		this.Splatky.init();
		this.Odklad.init();
		this.Platba.init();
		
		Ctlm.Rows.init();
		
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
			odklad: this.form.find('select[name~="odklad"]'),
		};
	},
	
	/**
	 * ajax vypocet kalkulatoru
	 */
	calculate: function() 
	{
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
		Ctlm.form.find('.ctlm-splatka-value').html(Ctlm.Helper.money(data.vyseSplatkyBezPojisteni));
		
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
			Ctlm.setResult(data.opce, '.ctlm-opce-');
			Ctlm.form.find('.ctlm-opce').show();
		}
		
	},
	
	/**
	 * nastavi hodnoty vypoctu do rekapitulace
	 * @param data ve formatu objektu CtlmVysledek
	 * @param prefix prefix css selectoru (.ctlm-result- nebo .ctlm-opce-)
	 */
	setResult: function(data, prefix) {
		var money = ['vyseUveru', 'vyseSplatky', 'cenaUveru', 'vyseSplatkyBezPojisteni', 'celkovaCastka', 'doplatek'];
		for(key in money)
			Ctlm.form.find(prefix + money[key]).html(Ctlm.Helper.money(data[money[key]]));
		
		Ctlm.form.find(prefix + 'ursaz').html(Ctlm.Helper.percent(data['ursaz'], 2));
		Ctlm.form.find(prefix + 'RPSN').html(Ctlm.Helper.percent(data['RPSN'], 2));
		Ctlm.form.find(prefix + 'pocetSplatek').html(data['pocetSplatek']);
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
		Ctlm.Splatky.disable();
		Ctlm.Odklad.disable();
		Ctlm.Platba.disable();
		Ctlm.Pojisteni.disable();
		Ctlm.Rows.disable();
		Ctlm.form.find('.ctlm-button').addClass('ctlm-loading');
	},
	
	/**
	 * zapnuti komponent po ajax volani
	 */
	enable: function()
	{
		Ctlm.Baremy.enable();
		Ctlm.Splatky.enable();
		Ctlm.Odklad.enable();
		Ctlm.Platba.enable();
		Ctlm.Pojisteni.enable();
		Ctlm.Rows.enable();
		Ctlm.form.find('.ctlm-button').removeClass('ctlm-loading');
	}
	
};

/**
 * komponenta editace radku
 */
Ctlm.Rows = {
	
	init: function() 
	{
		$('.ctlm-row-edit').hide();
		$('button.next').on('click', this.next);
	},
	
	/**
	 * pri kliknuti na tlacitko upravit
	 */
	next: function()
	{
		var section = $(this).data('edit');
		Ctlm.Rows.disable();
		$('.ctlm-row.' + section + ' .ctlm-row-edit button.prev').removeAttr('disabled');
		$('.ctlm-row.' + section + ' .ctlm-row-static').hide();
		$('.ctlm-row.' + section + ' .ctlm-row-edit').show();
		Ctlm.form.find('.ctlm-button').addClass('ctlm-disabled');
	},
	
	/**
	 * pri kliknuti na tlacito pouzit
	 */
	prev: function(button)
	{
		var section = $(button).data('edit');
		Ctlm.Rows.enable();
		$('.ctlm-row.' + section + ' .ctlm-row-static').show();
		$('.ctlm-row.' + section + ' .ctlm-row-edit').hide();
		Ctlm.form.find('.ctlm-button').removeClass('ctlm-disabled');
	},
	
	/**
	 * vypnout tlacitka
	 */
	disable: function()
	{
		$('button.next, button.prev').attr('disabled', 'disabled');
	},
	
	/**
	 * zapnout tlacitka
	 */
	enable: function()
	{
		$('button.next, button.prev').removeAttr('disabled');
	}
		
};

/**
 * selectbox pro vyber baremu
 */
Ctlm.Baremy = {
	/**
	 * seznam baremu a limitu
	 * bud se inicializuji pres Cetelem.Baremy.set()
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
		$('.ctlm-barem button.prev').on('click', this.change);
		
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
		
		Ctlm.Rows.prev($(this).closest('.ctlm-row').find('button.prev'));
		$('.ctlm-barem .ctlm-value').html(Ctlm.Baremy.get().name);
		
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
 * selectbox pro vyber pojisteni
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
		if (this.pojisteni == null)
			this.load();
		
		// pri zmene pojisteni
		$('.ctlm-pojisteni button.prev').on('click', this.change);
		
		// inicializace selectBoxIt custom selectu
		Ctlm.inputs.kodPojisteni.selectBoxIt({
			autoWidth: false
		}).on('moveDown moveUp open', function(e) {
			var select = e.target;
			var selectIt = $(select).data("selectBox-selectBoxIt");
			var value = select.options[selectIt.currentFocus].value;
			Ctlm.Pojisteni.showHelp(value);
		}).on('close', function(e) {
			var holder = Ctlm.inputs.kodPojisteni.closest('.ctlm-value-wrapper');
			holder.find('.help').remove();
		});
		
		// zobrazeni napovedy k pojisteni (v selectu)
		$(document).on('mouseover', '.ctlm-pojisteni li.selectboxit-option', function(e) {
			var element = e.target;
			var value = $(element).parent().attr('data-val');
			Ctlm.Pojisteni.showHelp(value);
		});
		
		// zobrazeni/skryti napovedy zvoleneho pojisteni
		$('.ctlm-pojisteni .ctlm-row-static .ctlm-value-wrapper').on('mouseenter', function(e) {
			var value = Ctlm.inputs.kodPojisteni.val();
			Ctlm.Pojisteni.showHelp(value, $(this));
		}).on('mouseleave', function(e) {
			Ctlm.Pojisteni.hideHelp($(this));
		});
		
		// pokud je mene nez 2 pojisteni, neni potreba tlacitko upravit
		var count = $.map(this.pojisteni, function(n, i) { return i; }).length;
		if (count <= 1) {
			this.lock();
		}
	},
	
	/**
	 * zobrazi bublinu s napovedou
	 */
	showHelp: function(pojisteni, holder) {
		holder = holder || Ctlm.inputs.kodPojisteni.closest('.ctlm-value-wrapper');
		holder.find('.help').remove();
		var help = $('<div />').addClass('help').hide().html(Ctlm.Pojisteni.pojisteni[pojisteni].napoveda);
		holder.append(help);
		help.fadeIn('fast');
	},
	
	/**
	 * skryje bublinu s napovedou
	 */
	hideHelp: function(holder) {
		holder = holder || Ctlm.inputs.kodPojisteni.closest('.ctlm-value-wrapper');
		holder.find('.help').remove();
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
	get: function() 
	{
		var kodPojisteni = Ctlm.inputs.kodPojisteni.val();
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
	 * pri zmene pojisteni
	 */
	change: function() 
	{
		Ctlm.Rows.prev(this);
		$('.ctlm-pojisteni .ctlm-value').html(Ctlm.Pojisteni.get().name);
		
		Ctlm.calculate();
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
	},
	
	/**
	 * zamknuti slideru pri variante pocet splatek min = max
	 */
	lock: function() {
		$('.ctlm-pojisteni button.next').hide();
	},
	
	/**
	 * odemknuti slideru
	 */
	unlock: function() {
		$('.ctlm-pojisteni button.next').show();
	},
	
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
		$('.ctlm-splatky button.prev').on('click', this.change);
		
		//nastavi limity splatek
		this.setLimit();
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
		// kontrola jestli aktualni hodnota je v rozmezi limitu
		var value = Ctlm.inputs.pocetSplatek.val();
		if (value < min) {
			value = min;
			Ctlm.inputs.pocetSplatek.val(min);
		}
		if (value > max) {
			value = max;
			Ctlm.inputs.pocetSplatek.val(max);
		}
		
	},
	
	/**
	 * pri zmene inputu splatek refreshne slider
	 */
	change: function() 
	{
		Ctlm.Rows.prev(this);
		Ctlm.Splatky.setLimit();
		Ctlm.calculate();
	},
	
	/**
	 * disablovani slideru a inputu pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.pocetSplatek.attr('disabled', 'disabled');
	},
	
	/**
	 * enablovani slideru po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.pocetSplatek.removeAttr('disabled');
	},
	
	/**
	 * zamknuti slideru pri variante pocet splatek min = max
	 */
	lock: function() {
		$('.ctlm-splatky button.next').hide();
	},
	
	/**
	 * odemknuti slideru
	 */
	unlock: function() {
		$('.ctlm-splatky button.next').show();
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
		$('.ctlm-odklad button.prev').on('click', this.onChange);
		
		// inicializace selectBoxIt custom selectu
		Ctlm.inputs.odklad.selectBoxIt({
			autoWidth: false
		});
		
		//nastavi limity splatek
		this.setLimit();
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
		
		// aktualni hodnota
		var value = Ctlm.inputs.odklad.val();
		
		// naplni do selectboxu mozne hodnoty
		var selectBox = Ctlm.inputs.odklad.selectBoxIt().data("selectBox-selectBoxIt");
		selectBox.remove();
		$(values).each(function(key, value) {
			switch (value) {
				case 0:
					selectBox.add({value: value, text: 'bez odkladu'});
					break;
				case 1:
					selectBox.add({value: value, text: value + ' měsíc'});
					break;
				case 2:
				case 3:
				case 4:
					selectBox.add({value: value, text: value + ' měsíce'});
					break;
				default:
					selectBox.add({value: value, text: value + ' měsíců'});
					break;
			}
		});
		
		if ($.inArray(parseInt(value), values) == -1) {
			value = values[0];
		}
		selectBox.selectOption(value.toString());
		
		// nastavi text komponenty
		switch (parseInt(value)) {
			case 0:
				$('.ctlm-odklad .ctlm-value').html('bez odkladu');
				break;
			case 1:
				$('.ctlm-odklad .ctlm-value').html(value + ' měsíc');
				break;
			case 2:
			case 3:
			case 4:
				$('.ctlm-odklad .ctlm-value').html(value + ' měsíce');
				break;
			default:
				$('.ctlm-odklad .ctlm-value').html(value + ' měsíců');
				break;
		}
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
		Ctlm.Rows.prev(this);
		Ctlm.Odklad.setLimit();
		Ctlm.calculate();
	},
	
	/**
	 * disablovani slideru a inputu pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.odklad.attr('disabled', 'disabled');
	},
	
	/**
	 * enablovani slideru po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.odklad.removeAttr('disabled');
	},
	
	/**
	 * zamknuti slideru pri variante pocet splatek min = max
	 */
	lock: function() {
		$('.ctlm-odklad button.next').hide();
	},
	
	/**
	 * odemknuti slideru
	 */
	unlock: function() {
		$('.ctlm-odklad button.next').show();
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
	
	/**
	 * inicializace komponenty
	 */
	init: function() 
	{
		// obsluha zmeny inputu
		$('.ctlm-platba button.prev').on('click', this.onChange);
		
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
		
		var value = Ctlm.inputs.primaPlatba.val();
		if (value < min) {
			Ctlm.inputs.primaPlatba.val(min);
		}
		if (value > max) {
			Ctlm.inputs.primaPlatba.val(max);
		}
		$('.ctlm-result-primaPlatba').html(Ctlm.Helper.money(value));
	},
	
	/**
	 * pri zmene inputu nebo pouziti tlacitek + -
	 */
	onChange: function()
	{
		Ctlm.Rows.prev(this);
		Ctlm.Platba.setLimit();
		Ctlm.calculate();
	},
	
	/**
	 * disablovani spinneru pri ajaxu
	 */
	disable: function() 
	{
		Ctlm.inputs.primaPlatba.attr('readonly', 'readonly');
	},
	
	/**
	 * enablovani spinneru po ajaxu
	 */
	enable: function()
	{
		Ctlm.inputs.primaPlatba.removeAttr('readonly');
	},
	
	/**
	 * zamknuti spinneru
	 */
	lock: function() 
	{
		$('.ctlm-platba button.next').hide();
		
	},
	
	/**
	 * odemknuti spinneru
	 */
	unlock: function()
	{
		$('.ctlm-platba button.next').show();
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
	}
};

/**
 * inicializace cetelem kalkulacky
 */
$(function() {
	Ctlm.init();
});