# Kalkulačka cetelem

## Vzor JSON specifikace baremů

	{
	   kod baremu :{
		  "id": kod baremu,
		  "name": nazev baremu,
		  "limit":{
			 "minuver": minimalni vyse uveru,
			 "maxuver": maximalni vyse uveru,
			 "minpocspl": minimalni pocet splatek,
			 "maxpocspl": maximalni pocet splatek,
			 "minodklad": minimalni delka odkladu splatek,
			 "maxodklad": maximalni delka odkladu splatek,
			 "reqodklad": flag zda je odklad vyzadovany
		  },
		  "platba": typ prime platby,
		  "platbaValue": hodnota prime platby
	   }

### Přílad JSON dat
	   
	   
	 {
	   "104":{
		  "id":"104",
		  "name":"10% + 10 x 10%",
		  "limit":{
			 "minuver":2500,
			 "maxuver":400000,
			 "minpocspl":10,
			 "maxpocspl":10,
			 "minodklad":null,
			 "maxodklad":null,
			 "reqodklad":0
		  },
		  "platba":"percent",
		  "platbaValue":10
	   },
	   "322":{
		  ...
	   }
	}
	
	
## Vzor JSON specifikace pojištění

	{
	   kod pojisteni:{
		  "id": kod pojisteni,
		  "name": nazev pojisteni,
		  "popis": kratky popis pojisteni,
		  "napoveda": napoveda pojisteni
	   }
	}
	
### Příklad JSON dat

	{
	   "A3":{
		  "id":"A3",
		  "name":"SOUBOR STANDARD",
		  "popis":"3,34 % z m\u011bs\u00ed\u010dn\u00ed spl\u00e1tky \u00fav\u011bru",
		  "napoveda":"SOUBOR STANDARD v sob\u011b zahrnuje poji\u0161t\u011bn\u00ed pro p\u0159\u00edpad pracovn\u00ed neschopnosti, invalidity III. stupn\u011b a \u00famrt\u00ed. \u00dahrada za poji\u0161t\u011bn\u00ed je 3,34 % z m\u011bs\u00ed\u010dn\u00ed spl\u00e1tky \u00fav\u011bru."
	   },
	   "B1":{
		  ...
	   }
	}
	
## Vzor JSON specifikace kalkulace

	{
	   "status": status kalkulace,
	   "info": informativni hlasky,
	   "kodBaremu": kod baremu,
	   "kodPojisteni": kod pojisteni,
	   "cenaZbozi": cena zbozi,
	   "primaPlatba": vyse prime platby,
	   "vyseUveru": vyse uveru,
	   "pocetSplatek": pocet splatek,
	   "odklad": odklad mesicich splatek (mesicu),
	   "zdarma":null,
	   "vyseSplatky": vyse mesicni splatky,
	   "vyseSplatkyBezPojisteni": vyse mesicni splatky,
	   "cenaUveru": cena uveru,
	   "RPSN": RPSN,
	   "ursaz": urokova sazba,
	   "celkovaCastka": celkova cena uveru,
	   "opce":null,
	   "doplatek":null
	}
	
### Příklad JSON dat
	
	{
	   "status":"ok",
	   "info":"",
	   "kodBaremu":102,
	   "kodPojisteni":"A3",
	   "cenaZbozi":20000,
	   "primaPlatba":0,
	   "vyseUveru":20000,
	   "pocetSplatek":24,
	   "odklad":0,
	   "zdarma":null,
	   "vyseSplatky":1182,
	   "vyseSplatkyBezPojisteni":1144,
	   "cenaUveru":8368,
	   "RPSN":37.79,
	   "ursaz":32.49,
	   "celkovaCastka":27456,
	   "opce":null,
	   "doplatek":null
	}