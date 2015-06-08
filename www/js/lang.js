﻿﻿/**
 * Created by ProdUser on 6/8/2015.
 */
(function()
{
    document.localize = {}
    var ru = {
        "feed": "Новости",
        "popular": "Поплярные",
"language":"Язык"
    }
    var eng = {
        "feed": "Feed",
        "popular": "Popular",
"language": "Language"
    }

    document.selectLanguage = function(lang)
    {
        localStorage.setItem('lang',lang)
        switch(lang)
        {
            case "ru": document.localize.strings = ru; break;
            default: document.localize.strings = eng; break;
        }
    }
    document.getLanguage = function()
    {
        return localStorage.getItem('lang')
    }
})()
document.selectLanguage(localStorage.getItem('lang') || 'eng')

