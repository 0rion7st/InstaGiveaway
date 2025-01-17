﻿(function()
{
    document.localize = {}

    var ru = {
        "feed": "Лента",
        "popular": "Популярное",
        "popular_1": "Популярном",
        "language": "Язык",
        "createWannaWin": "Создать Wanna Win",
        "myWW": "Мои WW",
        "shareOnInstagram": "ПОДЕЛИТЬСЯ В INSTAGRAM",
        "done": "СДЕЛАНО",
        "joinedWW": "Где участвую",
        "createdWW": "Создано Wanna Wins",
        "joinedWannaWins": "Участие в Wanna Wins",
        "totalReposts": "Всего репостов",
        "wannaWinsWon" : "Выиграно Wanna Wins",
        "helpCenter": "Справочный центр",
        "logout": "Выйти",
        "haventCreatedWW": "Вы не создали ни одного Wanna Win",
        "recentlyJoined": "Новые участники",
        "myProfile": "Мой профиль",
        "haventJoinedWW":"Вы не участвуете ни в одном Wanna Win.",
        "createOneWW":"Хотите создать сами?",
        "wannaWinFinished": "Wanna Win окончен",
        "participants": "УЧАСТНИКИ",
        "report": "Пожаловаться",
        "winnerCap": "ПОБЕДИТЕЛЬ",
        "finishedCap": "ОКОНЧЕН",
        "openInstagramCap": "ОТКРЫТЬ INSTAGRAM",
        "selectWWSquareImage": "Выберите квадратную картинку для WW",
        "cancel": "Отменить",
        "chooseSticker": "Выберите наклейку",
        "russian": "Русский",
        "english": "Английский",
        "comments":"Добавьте комментарий",
        "shareAndComeBack": "Поделись и приходи обратно!",
        "hashtagOfThisWannaWin": "Хэштег этого Wanna Win:",
        "doNotDeleteIt": "Не стирай его!",
        "sharePostOnInstagramFirst": "Сначала поделись записью в Instagram.",
        "createWWCap": "СОЗДАТЬ WW",
        "next": "ДАЛЕЕ",
        "3Days": "3 дня",
        "7Days": "7 дней",
        "14Days": "14 дней",
        "30Days": "30 дней",
        "finished": "Окончен",
        "labelFinished": "Окончен",
        "labelMyWW": "Мой Розыгрыш",
        "labelNew": "Новый!",
        "labelNoWinner": "Нет победителя",
        "labelJoined": "Участвую",
        "detailsCap": "ДЕТАЛИ",
        "whatIs": "Что такое",
        "aPowerfulTools": "Это удобный инструмент для создания и участия в ",
        "instagramGiveaways": "розыгрышах (Giveaway) в Instagram",
        "itLikesAndReposts": "В один клик вы подписываетесь на автора розыгрыша и делаете репост себе в Instagram. ",
        "itHasNeverBeenSimple": "Это никогда не было так просто!",
        "automaticallyChooses": "Абсолютно честная система выбора  ",
        "random": "случайного",
        "winnerFrom": "победителя, так как он выбирается автоматически. ",
        "itHasNeverFair": "Это никогда не было так честно!",
        "howTo": "Как ",
        "participate": "принять участие ",
        "inAnExistingWW": "в розыгрыше?",
        "clixkOnWW": "Нажмите на Wanna Win в ленте или найдите его по #хэштег, а затем нажмите кнопку ",
        "button": ".",
        "itWillForward": "У вас откроется Instagram с готовым репостом, останется только нажать \"Ок\".",
        "caomeBack": "Вернувшись в WannaWin вы увидите, что уже участвуете.",
        "create": "создать ",
        "aNewWW": "новый розыгрыш?",
        "clickOnCreateWW": "Нажмите на кнопку \"Создать Wanna Win\" в профиле. Загрузите фото и выберите наклейку.",
        "thenYouWillBe": "У вас откроется Instagram с готовым репостом, останется только нажать \"Ок\". Никогда не удаляйте автоматический #хэштег.",
        "onlyPeopleWhoRepost": "Только люди, которые сделали репост и подписались на вас будут участвовать в розыгрыше.",
        "seekingForHelp": "Нужна помощь?",
        "contactOurTeam": "Свяжитесь с нашей командой!",
        "contact": "Связаться",
        "serverSearchingForWinner": "Сервер выбирается победителя, пожалуйста обновите.",
        "pullToRefresh": "Потяните, чтобы обновить",
        "shared": "Поделились",
        "errorPopUpTitle": "Ошибка",
        "noButton": "Нет",
        "yesButton": "Да",
        "chooseExistinPhoto": "Выберите фото",
        "noWinner0Participants": "Победитель не выбран из-за отсутствия участников",
        "contactAuthorCap": "НАПИСАТЬ АВТОРУ",
        "contactWinnerCap": "НАПИСАТЬ ПОБЕДИТЕЛЮ",
        "contactWinnerToDeliver": "Пожалуйста свяжитесь с победителем и договоритесь о передаче выигрыша!",
        "youWonContactTheAuthor": "Вы выиграли!!! Свяжитесь с автором!",
        "noWWIn": "Нет розыгрышей в ",
        "joinedCap": "УЧАСТВУЮ",
        "wannaWinButton": "Участвовать!",
        "wwAlreadyExists": "Такой Wanna Win уже существует",
        "joinCap": "УЧАСТИЕ",
        "login": "Регистрация",
        "swipeCap": "ПРОВЕДИТЕ",
        "loginWithInstagramCap": "ВОЙТИ С INSTAGRAM",
        "joinTrendyWW": "Участвуй и выигрывай",
        "bestPlaceFindFreebies": "Все розыгрыши в одном месте",
        "shareWithOthers": "Делись лучшим с друзьями",
        "nativeWatFindNewFollowers": "Лучший способ находить новых подписчиков",
        "ends": "Закончится",
        "enterCountryName": "Введите корректное название страны",
        "geotypeCountryComment": "Страна розыгрыша: ",
        "geotypePlaceComment": "Место розыгрыша: ",
        "wantToParticipate": "Хотите участвовать?",
        "countryLimitation": "Ограничение по стране",
        "placeLimitation": "Ограничение по месту",
        "worldwide": "Весь мир",
        "country": "Страна",
        "place": "Город",
        "fillComment": "Сначала добавьте комментарий",
        "fillPlaceOrCountry": "Неправильно заполнена страна или город",
        "selectWannaWinDuration":"1. Продолжительность",
        "caption":"2. Подпись",
        "wwLocation": "3. Место проведения розыгрыша",
        "repostOf": "Репост от @"
    }

    var eng = {
        "feed": "Feed",
        "popular": "Popular",
        "popular_1": "Popular",
        "language": "Language",
        "createWannaWin": "Create WannaWin",
        "myWW": "My WW",
        "shareOnInstagram": "SHARE ON INSTAGRAM",
        "done": "DONE",
        "joinedWW": "Joined WW",
        "createdWW": "Created Wanna Wins",
        "joinedWannaWins": "Joined Wanna Wins",
        "totalReposts": "Total reposts",
        "wannaWinsWon" : "Wanna Wins Won",
        "helpCenter": "Help Center",
        "logout": "Logout",
        "haventCreatedWW": "You haven't created any Wanna Wins",
        "recentlyJoined": "Recently joined",
        "myProfile": "My profile",
        "haventJoinedWW":"You haven't joined any Wanna Wins.",
        "createOneWW":"How about creating your own?",
        "wannaWinFinished": "WannaWin was finished",
        "participants": "PARTICIPANTS",
        "report": "Report",
        "winnerCap": "WINNER",
        "finishedCap": "FINISHED",
        "openInstagramCap": "OPEN INSTAGRAM",
        "selectWWSquareImage": "Select WW square image",
        "cancel": "Cancel",
        "chooseSticker": "Choose sticker",
        "russian": "Russian",
        "english": "English",
        "comments": "Add a comment",
        "shareAndComeBack": "Share and come back!",
        "hashtagOfThisWannaWin": "Hashtag of this WannaWin:",
        "doNotDeleteIt": "Do not delete it!",
        "sharePostOnInstagramFirst": "Share post on Instagram first.",
        "createWWCap": "CREATE WW",
        "next": "NEXT",
        "3Days": "3 days",
        "7Days": "7 days",
        "14Days": "14 days",
        "30Days": "30 days",
        "finished": "Finished",
        "labelFinished": "Finished",
        "labelMyWW": "My WannaWin",
        "labelNew": "New!",
        "labelNoWinner": "No winner",
        "labelJoined": "Joined",
        "detailsCap": "DETAILS",
        "whatIs": "What is",
        "aPowerfulTools": "A powerful tool to create and participate in ",
        "instagramGiveaways": "Instagram Giveaways",
        "itLikesAndReposts": "It likes and reposts Giveaway, and follows author in one click. ",
        "itHasNeverBeenSimple": "It has never been this simple!",
        "automaticallyChooses": "Automatically chooses ",
        "random": "random",
        "winnerFrom": "winner from participants. ",
        "itHasNeverFair": "It has never been this fair!",
        "howTo": "How to ",
        "participate": "participate ",
        "inAnExistingWW": "in an existing WannaWin?",
        "clixkOnWW": "Click on WannaWin in the feed or find it by #hashtag and then click ",
        "button": " button.",
        "itWillForward": "It will forward you to the Instagram app for reposting the WannaWin.",
        "caomeBack": "Come back to the WannaWin app, one more click and you are in.",
        "create": "create ",
        "aNewWW": "a new WannaWin?",
        "clickOnCreateWW": "Click on \"Create WannaWin\" button in profile. Upload a photo, and choose a sticker.",
        "thenYouWillBe": "Then you will be forwarded to the Instagram app to finalize your post. Never remove automatic hashtag.",
        "onlyPeopleWhoRepost":"Only people who made a repost and started following you will participate in the lottery. We check that all.",
        "seekingForHelp": "Seeking for help?",
        "contactOurTeam": "Contact our team!",
        "contact": "Contact",
        "serverSearchingForWinner": "Server searching for winner, please refresh.",
        "pullToRefresh": "Pull to refresh",
        "shared": "Shared",
        "errorPopUpTitle": "Error",
        "noButton": "No",
        "yesButton": "Yes",
        "chooseExistinPhoto": "Choose existing photo",
        "noWinner0Participants": "No winner due to 0 participants",
        "contactAuthorCap": "CONTACT AUTHOR",
        "contactWinnerCap": "CONTACT WINNER",
        "contactWinnerToDeliver": "Please contact winner to deliver him WannaWin!",
        "youWonContactTheAuthor": "You won!!! Contact the author!",
        "noWWIn": "No Wanna Wins in ",
        "joinedCap": "JOINED",
        "wwAlreadyExists": "WannaWin already exists",
        "joinCap": "JOIN",
        "wannaWinButton": "Join WannaWin!",
        "login": "Login",
        "swipeCap": "SWIPE",
        "loginWithInstagramCap": "LOGIN WITH INSTAGRAM",
        "joinTrendyWW": "Join trendy Wanna Wins",
        "bestPlaceFindFreebies": "Best place to find freebies",
        "shareWithOthers": "Share things with others",
        "nativeWatFindNewFollowers": "Native way to find new followers",
        "ends": "Ends",
        "enterCountryName": "Please enter correct country name",
        "geotypeCountryComment": "WannaWin country: ",
        "geotypePlaceComment": "WannaWin city: ",
        "wantToParticipate": "Do you want to participate?",
        "countryLimitation": "Country limitation",
        "placeLimitation": "Place limitation",
        "worldwide": "Worldwide",
        "country": "Country",
        "place": "City",
        "fillComment": "Add a comment first",
        "fillPlaceOrCountry": "Country ot city isn't filled correctly",
        "selectWannaWinDuration": "1. Duration",
        "caption": "2. Caption",
        "wwLocation": "3. WannaWin location",
        "repostOf": "Repost of @"
    }

    document.selectLanguage = function(lang)
    {
        var langSplitted = lang.split("-");
        lang = langSplitted[0]

        localStorage.setItem('lang',lang)
        switch(lang)
        {
            case "ru":
                document.localize.strings = ru
                // init the moment library
                lang = moment.locale('ru')
            break;

            default:
                document.localize.strings = eng
                // init the moment library
                lang = moment.locale('en')
            break;
        }
    }
    document.getLanguage = function()
    {
        return localStorage.getItem('lang')
    }
})()
document.selectLanguage(localStorage.getItem('lang') || 'eng')