// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('giveaways', ['ionic', 'giveaways.controllers', 'giveaways.services','ngCordova', 'ngCordovaOauth', 'ngCordova.plugins.instagram'], function ($compileProvider) {

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|instagram):/);

})

    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })


    .directive('giveaway', ['$rootScope','$stateParams', function($rootScope,$stateParams) {
        return {
            restrict: 'E',
            templateUrl: 'giveaway-card',
            replace: true,
            scope: {
                profileImage:'@',
                mediaId:'@',
                timeLeft:'@',
                username:'@',
                giveawayHashtag:'@',
                mediaImageLink:'=',
                path:'@',
                layout:'@',
                userId:'@',
                userLink:'@',
                giveaway:'=',
                description: '@'
            },
            link: function($scope,elm,attrs) {
                $scope.c = {}
                $scope.c.localize =  document.localize

                $scope.$watch("mediaImageLink",function()
                {
                    if($scope.giveawayHashtag !="")
                    {
                        $scope.expire = Math.floor(parseInt(parseInt($scope.giveawayHashtag.slice(2),36).toString().slice(0,-3)) / 1000);
                        if($scope.expire < (Date.now() / 1000)) {
                            $scope.expire="-1"
                        }
                    }
                    if($scope.mediaImageLink!="")
                    {
                        var img = new Image()
                        img.onload=function()
                        {
                            $scope.loadedImg=$scope.mediaImageLink
                            $scope.$apply()

                        }
                        img.src=$scope.mediaImageLink
                    }
                    else
                    {
                        console.log("no image")
                    }
                },true)
                $scope.$on('$destroy', function() {



                });
            }
        }
    }])
    .directive('time', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            scope:
            {
                time:'='
            },
            link: function($scope,el,attrs) {
                var timerCounting
                function renderTime() {
                    if (($scope.time - (new Date()).getTime() / 1000) < 0 || ($scope.time - (new Date()).getTime() / 1000) > 60 * 60 * 24)
                    {
                        el[0].innerHTML = moment.unix($scope.time).fromNow()
                    }
                    else
                    {
                        var secs = $scope.time-Math.floor((new Date()).getTime()/1000)
                        var hr  = Math.floor(secs / 3600);
                        var min = Math.floor((secs - (hr * 3600))/60);
                        var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

                        if (hr < 10)   { hr    = "0" + hr; }
                        if (min < 10) { min = "0" + min; }
                        if (sec < 10)  { sec  = "0" + sec; }
                        if (!(hr*1))            { hr   = "00"; }

                        el[0].innerHTML = "in " + hr + ':' + min + ':' + sec
                    }

                }

                $scope.$watch("time",function()
                {
                    renderTime()
                })

                if(attrs.counting!=undefined)
                {
                    timerCounting = setInterval(function()
                    {
                        renderTime()
                    },1000)
                }

                $scope.$on('$destroy', function() {
                    console.log("destroy timer")
                    clearInterval(timerCounting)
                });
            }
        }
    }])
    .directive('instagram', ['$rootScope', function($rootScope) {
        return {
            restrict: 'A',
            scope:
            {
                instagram:'@'
            },
            link: function($scope,element,attrs) {

                var tapping;
                tapping = false;
                element.bind('touchstart', function(e) {
                    element.addClass('active');
                    tapping = true;
                });
                element.bind('touchmove', function(e) {
                    element.removeClass('active');
                    tapping = false;
                });
                element.bind('touchend', function(e) {
                    element.removeClass('active');
                    if (tapping) {
                        navigator.startApp.start("instagram://"+$scope.instagram, function(message) {  /* success */
                                console.log(message); // => OK
                            },
                            function(error) { /* error */
                                console.log(error);
                            });
                    }
                });
            }
        }
    }])

    .directive('googleAutocompleteCities', ['$rootScope', function($rootScope) {
        return {
            restrict: 'E',
            replace: 'false',
            templateUrl: 'templates/google_autocomplete_place.html',
            link: function($scope, elm, attrs) {
                var input = elm.children()[1];
                var options = {
                    types: ['(cities)']
                };
                var autocomplete = new google.maps.places.Autocomplete(input, options);
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    var place = autocomplete.getPlace();
                    //// clear address field
                    //document.getElementById('searchBar').value = '';

                    // TODO_DIMA: make this popup
                    if (!place.geometry) {
                        alert("Wrong address");
                        document.getElementById('searchBarPlace').value = '';
                        return;
                    }

                    $scope.c.submit.geotypePlaceName = place.name
                });
            }
        }
    }])

    .directive('googleAutocompleteCountries', ['$rootScope', function($rootScope) {
        return {
            restrict: 'E',
            replace: 'false',
            templateUrl: 'templates/google_autocomplete_country.html',
            link: function($scope, elm, attrs) {
                var input = elm.children()[1];
                var options = {
                    types: ['(regions)']
                };
                var autocomplete = new google.maps.places.Autocomplete(input, options);
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    var place = autocomplete.getPlace();
                    var isCountry = false;

                    // TODO_DIMA: make this popup
                    if (!place.geometry) {
                        alert("Wrong address");
                        document.getElementById('searchBarCountry').value = '';
                        return;
                    }

                    for(var i = 0; i < place.types.length; i += 1) {
                        if (place.types[i] === 'country') {
                            isCountry = true;
                        }
                    }

                    // TODO_DIMA: make this popup
                    if (!isCountry) {
                        alert($scope.c.localize.strings['enterCountryName']);
                        document.getElementById('searchBarCountry').value = '';
                        return;
                    }

                    $scope.c.submit.geotypeCountryNameLocalized = place.address_components[0].long_name;
                    $scope.c.submit.geotypeCountryName = place.address_components[0].short_name;
                });
            }
        }
    }])

    .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html"

            })

            // Each tab has its own nav history stack:

            .state('tab.feed', {
                url: '/feed',
                views: {
                    'tab-feed': {
                        templateUrl: 'templates/tab-feed.html',
                        controller: 'FeedCtrl'
                    }
                }
            })
            .state('tab.joined', {
                url: '/joined',
                views: {
                    'tab-joined': {
                        templateUrl: 'templates/tab-joined.html',
                        controller: 'JoinedCtrl'
                    }
                }
            })
            .state('tab.giveaways', {
                url: '/giveaways',
                views: {
                    'tab-giveaways': {
                        templateUrl: 'templates/tab-giveaways.html',
                        controller: 'MyGiveawaysCtrl'
                    }
                }
            })
            .state('tab.profile', {
                url: '/profile',
                views: {
                    'tab-profile': {
                        templateUrl: 'templates/user-profile.html',
                        controller: 'MyProfileCtrl'
                    }
                }
            })
            .state('tab.popular', {
                url: '/popular',
                views: {
                    'tab-popular': {
                        templateUrl: 'templates/collection.html',
                        controller: 'CollectionCtrl'

                    }
                },
                resolve: {

                    collection: function (server) {
                        return server.getCollection.get({Categories: "Popular"})
                    }
                }


            })

            .state('tab.feed-giveaway-details', {
                url: '/feed/giveaway/:hashTag',
                views: {
                    'tab-feed': {
                        templateUrl: 'templates/giveaway-detail.html',
                        controller: 'GiveAwayDetailCtrl'
                    }
                },
                resolve: {

                    giveaway: function (instagram,giveawayDecor,$stateParams,server,$ionicLoading,errorBox) {

                        var giveaway = giveawayDecor.getLocalGiveaway($stateParams.hashTag)
                        if(giveaway==undefined)
                        {
                            var $promise =server.getGiveaway.get({HashtagID:$stateParams.hashTag}).$promise
                            $promise.then(function(){},function(error)
                            {
                                errorBox(error.data.errorCode)
                            })
                            return $promise
                        }
                        else
                        {
                            var wrapper = {}
                            wrapper.data = []
                            wrapper.data[0] = giveaway
                           return wrapper
                        }
                    }

                }
            })


            .state('tab.joined-giveaway-details', {
                url: '/joined/giveaway/:hashTag',
                views: {
                    'tab-joined': {
                        templateUrl: 'templates/giveaway-detail.html',
                        controller: 'GiveAwayDetailCtrl'
                    }
                },
                resolve: {

                    giveaway: function (instagram,giveawayDecor,$stateParams,server,$ionicLoading,errorBox) {

                        var giveaway = giveawayDecor.getLocalGiveaway($stateParams.hashTag)
                        if(giveaway==undefined)
                        {
                            var $promise =server.getGiveaway.get({HashtagID:$stateParams.hashTag}).$promise
                            $promise.then(function(){},function(error)
                            {
                                errorBox(error.data.errorCode)
                            })
                            return $promise
                        }
                        else
                        {
                            var wrapper = {}
                            wrapper.data = []
                            wrapper.data[0] = giveaway
                            return wrapper
                        }
                    }

                }
            })
            .state('tab.giveaways-giveaway-details', {
                url: '/giveaways/giveaway/:hashTag',
                views: {
                    'tab-giveaways': {
                        templateUrl: 'templates/giveaway-detail.html',
                        controller: 'GiveAwayDetailCtrl'
                    }
                },
                resolve: {

                    giveaway: function (instagram,giveawayDecor,$stateParams,server,$ionicLoading,errorBox) {

                        var giveaway = giveawayDecor.getLocalGiveaway($stateParams.hashTag)
                        if(giveaway==undefined)
                        {
                            var $promise =server.getGiveaway.get({HashtagID:$stateParams.hashTag}).$promise
                            $promise.then(function(){},function(error)
                            {
                                errorBox(error.data.errorCode)
                            })
                            return $promise
                        }
                        else
                        {
                            var wrapper = {}
                            wrapper.data = []
                            wrapper.data[0] = giveaway
                            return wrapper
                        }
                    }

                }
            })
            .state('tab.popular-giveaway-details', {
                url: '/popular/giveaway/:hashTag',
                views: {
                    'tab-popular': {
                        templateUrl: 'templates/giveaway-detail.html',
                        controller: 'GiveAwayDetailCtrl'
                    }
                },
                resolve: {

                    giveaway: function (instagram,giveawayDecor,$stateParams,server,$ionicLoading,errorBox) {

                        var giveaway = giveawayDecor.getLocalGiveaway($stateParams.hashTag)
                        if(giveaway==undefined)
                        {
                            var $promise =server.getGiveaway.get({HashtagID:$stateParams.hashTag}).$promise
                            $promise.then(function(){},function(error)
                            {
                                errorBox(error.data.errorCode)
                            })
                            return $promise
                        }
                        else
                        {
                            var wrapper = {}
                            wrapper.data = []
                            wrapper.data[0] = giveaway
                            return wrapper
                        }
                    }

                }
            })

            .state('tab.feed-user-giveaways', {
                url: '/feed/user/:userid',
                views: {
                    'tab-feed': {
                        templateUrl: 'templates/user-feed.html',
                        controller: 'UserPostsCtrl'
                    }
                }
            })
            .state('tab.joined-user-giveaways', {
                url: '/joined/user/:userid',
                views: {
                    'tab-joined': {
                        templateUrl: 'templates/user-feed.html',
                        controller: 'UserPostsCtrl'
                    }
                }
            })
            .state('tab.giveaways-user-giveaways', {
                url: '/giveaways/user/:userid',
                views: {
                    'tab-giveaways': {
                        templateUrl: 'templates/user-feed.html',
                        controller: 'UserPostsCtrl'
                    }
                }
            })
            .state('tab.popular-user-giveaways', {
                url: '/popular/user/:userid',
                views: {
                    'tab-popular': {
                        templateUrl: 'templates/user-feed.html',
                        controller: 'UserPostsCtrl'
                    }
                }
            })


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/feed');

    });
