# Vzorová implementace splátkové kalkulačky [CETELEM](http://www.cetelem.cz)

je určena primárně pro programátory internetových e-shopů a jiných online nákupních a e-business aplikací.

## Požadavky

### Server
Webový server, PHP s SimpleXML a JSON, otevřená komunikace na Cetelem webové služby pomocí `file_get_content` (alternativně lze použít CURL).

### Podpora prohlížečů
Internet Eplorer 9+, Chrome, Firefox, Safari

## Použité komponenty
* [**LESS**](http://lesscss.org) – pro snadnější správu CSS souborů byl použit LESS. CSS soubory byly následně vygenerovány bez komprese, takže jsou nadále čitelné.* [**SelectBoxIt**](http://gregfranko.com/jquery.selectBoxIt.js/) – na stylování SELECT tagů. * [**jQuery**](http://jquery.com) – veškerá dynamická funkcionalita na straně klienta byla implementovaná s pomocí jQuery.* [**jQueryUI**](https://jqueryui.com) – pro větší uživatelské pohodlí byly nekteré standartní INPUT pole nahrazena dynamickými, např. Slider, Spinner.



## Changelog

`1.0` - 11. Červen 2014