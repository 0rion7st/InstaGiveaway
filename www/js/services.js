angular.module('giveaways.services', ['ngResource'])
    .config(['$httpProvider', function ($httpProvider) {
        // Intercept POST requests, convert to standard form encoding
        $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        $httpProvider.defaults.transformRequest.unshift(function (data, headersGetter) {
            var key, result = [];
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                }
            }
            return result.join("&");
        });

    }])
.config(function($ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom')
})
    .factory('registerNotifications', ['$cordovaPush','$cordovaDevice','server','$rootScope','profile',function($cordovaPush,$cordovaDevice,server,$rootScope,profile) {
        return function()
        {
            $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
                switch(notification.event) {
                    case 'registered':
                        if (notification.regid.length > 0 ) {
                            server.updateDeviceToken.get({DeviceToken: notification.regid, OS: "Android"},function()
                            {
                                profile.deviceToken(notification.regid)
                            })
                        }
                        break;
                }
            });

            document.addEventListener("deviceready", function () {
                if(profile.deviceToken())
                    return
                var platform = $cordovaDevice.getPlatform();
                var config = {
                    "senderID": "49237053026"
                };

                if(platform=="iOS")
                {
                    config = {
                        "badge": true,
                        "sound": true,
                        "alert": true
                    }
                }

                $cordovaPush.register(config).then(function(result) {
                    //Android patch
                    if(result=="OK")
                        return;
                    console.log("result: " + result)
                    server.updateDeviceToken.get({DeviceToken: result, OS: platform},function()
                    {
                        profile.deviceToken(result)
                    })
                }, function(err) {
                    alert("Registration error: " + err)
                });

            }, false);
        }

    }])
    .factory('errorBox', function($cordovaGoogleAnalytics,$ionicLoading,profile) {
        return function(code)
        {

            if (typeof(analytics) != "undefined")
            {
                $cordovaGoogleAnalytics.trackEvent('Error', 'UIError', 'code', code);
            }
        var message = "Damn!!11"
        switch(code*1)
        {
            case -1:
                message = "You should have at least "+profile.followersNeeded+" followers."
                break;
            case -2:
                message = "No instagram app found."
                break;
            case -3:
                message = document.localize.strings['sharePostOnInstagramFirst']
                break;
            case 10:
                message = "WW not exists. Sorry :("
                break;
            case 11:
                message =  document.localize.strings['wwAlreadyExists']
                break;
            case 400:
                message = "Now such media in instagram."
                break;
        }
        message = "<h2><i class='positive ion-sad'></i></h2><br><small>"+message+"</small>"
        $ionicLoading.show({
            template:'<span style="color:white;">'+message+"</span>",
            noBackdrop:false,
            duration:2000
        });
        }
    })
.factory('localNotificationInterceptor', ['$cordovaLocalNotification',function($cordovaLocalNotification) {
    var localNotificationInterceptor = {
        request: function(config) {
            if(config.params !=undefined && (config.params.command == "SUBMIT_GIVEAWAY" || config.params.command == "JOIN_GIVEAWAY"))
            {
                config.notification = config.params.command
                config.ExpirationTimestamp =  config.params.ExpirationTimestamp
                if(config.params.command == "JOIN_GIVEAWAY")
                {
                    delete config.params.ExpirationTimestamp
                }
            }


            return config;
        },
        response: function(response) {

            if(response.config.notification!=undefined)
            {
                var uid = Math.floor(Math.random()*10000)
                if(response.config.notification == "SUBMIT_GIVEAWAY")
                {
                    $cordovaLocalNotification.add({
                        id: uid,
                        title: "Winner has been chosen!",
                        text: "Your Wanna Win finished.",
                        at: new Date(response.config.ExpirationTimestamp*1000),
                        badge:1
                    },function () {
                        console.log('callback for adding background notification');
                    });
                }
                else if(response.config.notification == "JOIN_GIVEAWAY")
                {
                    $cordovaLocalNotification.add({
                        id: uid,
                        title: "Winner has been chosen!",
                        text: "Wanna Win finished.",
                        at: new Date(response.config.ExpirationTimestamp*1000),
                        badge:1
                    },function () {
                        console.log('callback for adding background notification');
                    });
                }
            }

            return response;
        }
    };
    return localNotificationInterceptor;
}])
    .factory('updatedInterseptor', ['profile',function(profile) {
        var updatedInterseptor = {
            request: function(config) {
                if(config.params !=undefined)
                {
                    config.command = config.params.command
                }
                return config;
            },
            response: function(response) {

                if(response.config.url == "https://api.instagram.com/v1/users/self/feed")
                {
                    var now = Math.floor((new Date()).getTime()/1000)
                    for(var i in response.data.data)
                    {
                        if(response.data.data[i].caption && profile.getLatestTime()*1<response.data.data[i].caption.created_time*1)
                        {
                            response.data.data[i].new=true
                        }
                    }

                }
                else if(response.config.command!=undefined)
                {
                    if(response.config.command == "GET_USER_INFO")
                    {
                        var now = Math.floor((new Date()).getTime()/1000)
                        if(!profile.getLatestTime())
                            profile.getLatestTime(Math.floor((new Date()).getTime()/1000))

                        response.data.data.newsMy = 0
                        response.data.data.newsJoin = 0
                        for(var index in response.data.data.giveaways)
                        {
                            var timeStamp = response.data.data.giveaways[index].expiration_timestamp*1
                            if(profile.getLatestTime()*1<timeStamp && timeStamp<now)
                            {
                                response.data.data.newsMy++
                                response.data.data.giveaways[index].showFinished = true
                            }
                        }

                        for(var index in response.data.data.participating)
                        {
                            var timeStamp = response.data.data.participating[index].expiration_timestamp
                            if(profile.getLatestTime()<timeStamp && timeStamp<now)
                            {
                                response.data.data.newsJoin++
                                response.data.data.participating[index].showFinished = true
                            }
                        }

                        setTimeout((function(date) {return function() {
                            profile.getLatestTime(date)
                        }})(Math.floor((new Date()).getTime() / 1000)),10000)
                    }
                }

                return response;
            }
        };
        return updatedInterseptor;
    }])
.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('localNotificationInterceptor');
        $httpProvider.interceptors.push('updatedInterseptor');
}])

//<editor-fold  desc="server">
    .factory('server', function ($resource, profile) {
       //var server_endpoint = "mock/"
       var server_endpoint = "http://107.20.138.124/GiveAway_dev/main_commander.php"
        return {
            getGiveaway: $resource(server_endpoint/*+"GET_GIVEAWAY"*/,{command:'GET_GIVEAWAY',InstagramID:profile.instagram_id(),AccessToken:profile.access_token()}),
            getUserInfo: $resource(server_endpoint/*+"GET_USER_INFO"*/,{command:'GET_USER_INFO',InstagramID:profile.instagram_id(),AccessToken:profile.access_token(),InstagramUsername:profile.instagram_username(),InstagramAvatar:profile.instagram_avatar()}),
            submitGiveaway: $resource(server_endpoint/*+"SUBMIT_GIVEAWAY"*/,{command:'SUBMIT_GIVEAWAY',InstagramID:profile.instagram_id(),AccessToken:profile.access_token()}),
            joinGiveaway: $resource(server_endpoint/*+"JOIN_GIVEAWAY"*/,{command:'JOIN_GIVEAWAY',InstagramID:profile.instagram_id(),AccessToken:profile.access_token()}),
            updateDeviceToken: $resource(server_endpoint/*+"UPDATE_DEVICE_TOKEN"*/,{command:'UPDATE_DEVICE_TOKEN',InstagramID:profile.instagram_id(),AccessToken:profile.access_token()}),
            getCollection: $resource(server_endpoint/*+"JOIN_GIVEAWAY"*/,{command:'GET_GIVEAWAYS_IN_CATEGORIES',InstagramID:profile.instagram_id(),AccessToken:profile.access_token()})

        }
    })
//</editor-fold>

//<editor-fold  desc="instagram">
    .factory('instagram', function ($resource, profile) {
        var instagram = "https://api.instagram.com/v1"
        var server = {}
        function initServer()
        {
            server.users = $resource(instagram+"/users/:user/:action/:type",{access_token:profile.access_token()}),
            server.media = $resource(instagram+"/media/:action/:type",{access_token:profile.access_token()}),
            server.hashes = $resource(instagram+"/tags/:tag/:action/:type",{access_token:profile.access_token()}),
            server.follow = $resource(instagram+"/users/:userId/relationship",{access_token:profile.access_token()}),
            server.logout = $resource("https://instagram.com/accounts/logout/",{}),
            server.reinit = function()
                {
                    initServer()
                }


        }
        initServer()
        return server
    })
//</editor-fold>

//<editor-fold  desc="profile">
    .factory('profile', function () {
        return {
            joiningWW:function (value) {

                if (value != undefined) {
                    console.log("joiningWW: SET")
                    window.localStorage.setItem("joiningWW", JSON.stringify(value))
                }
                else
                {
                    console.log("joiningWW: GET")
                    return JSON.parse(window.localStorage.getItem("joiningWW")) || false
                }

            },

            followersNeeded : 1,
            eula:function (value) {

                if (value != undefined) {
                    console.log("eula: SET")
                    window.localStorage.setItem("eula", value)
                }
                else {
                    console.log("eula: GET")
                    return window.localStorage.getItem("eula") || true //@TODO: Find out if we need it false
                }

            },
            deviceToken:function (value) {

                if (value != undefined) {
                    console.log("deviceToken: SET")
                    window.localStorage.setItem("deviceToken", value)
                }
                else {
                    console.log("deviceToken: GET")
                    return window.localStorage.getItem("deviceToken") || false
                }

            },
            getLatestTime: function (value) {

                if (value != undefined) {
                    window.localStorage.setItem("getLatestTime", value)
                }
                else {
                    return window.localStorage.getItem("getLatestTime") || false
                }

            },
            access_token: function (value) {

                if (value != undefined) {
                    window.localStorage.setItem("access_token", value)
                }
                else {
                    return window.localStorage.getItem("access_token") || false
                }

            },
            instagram_id: function (value) {
                if (value != undefined) {
                    window.localStorage.setItem("instagram_id", value)
                }
                else {
                    return window.localStorage.getItem("instagram_id") || false
                }

            },
            instagram_username: function (value) {
                if (value != undefined) {
                    window.localStorage.setItem("instagram_username", value)
                }
                else {
                    return window.localStorage.getItem("instagram_username") || false
                }

            },
            instagram_avatar: function (value) {
                if (value != undefined) {
                    console.log("instagram_avatar: SET")
                    window.localStorage.setItem("instagram_avatar", value)
                }
                else {
                    console.log("instagram_avatar: GET")
                    return window.localStorage.getItem("instagram_avatar") || false
                }

            },
            logout: function()
            {
                window.localStorage.removeItem("access_token")
                window.localStorage.removeItem("instagram_id")
                window.localStorage.removeItem("instagram_username")
                window.localStorage.removeItem("instagram_avatar")
            },
            valid: function()
            {
                var instagram_id = window.localStorage.getItem("instagram_id") || false
                var access_token = window.localStorage.getItem("access_token") || false
                return (instagram_id!=false & access_token!=false)
            }
        }
    })
//</editor-fold>



//<editor-fold  desc="previewStorage">

    .factory('previewStorage', function () {

        function decodeBase64Image(dataString) {

            var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }


            var byteCharacters = atob(matches[2]);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var BINARY_ARR = byteArray.buffer;


            return BINARY_ARR;
        }

        return {

            setPreview: function (hashTag, imageData, success, error) {
                //console.log("setPreview: Init")

                if (!DEBUG) {
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                        //console.log("setPreview: Got filesystem")
                        fileSystem.root.getFile("giveaway_" + hashTag + ".igo", {create: true, exclusive: false}, function (fileEntry) {
                            //console.log("setPreview: Got fileEntry")
                            var fileURI = "giveaway_" + hashTag + ".igo"
                            fileEntry.createWriter(function (writer) {
                                //console.log("setPreview: Writer created")
                                writer.onwriteend = function (evt) {

                                    if (success != undefined) {
                                        //console.log("setPreview: Image saved " + fileURI)
                                        success(fileURI)
                                    }
                                }
                                writer.write(decodeBase64Image(imageData));

                            }, error)
                        }, error);
                    }, error);
                }
                else {
                    success("noImage.jpg")
                }

            },
            deletePreview: function (secretID) {
                if (!DEBUG) {
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                        //console.log("setPreview: Got filesystem")
                        fileSystem.root.getFile("giveaway_" + secretID + ".igo", {create: false, exclusive: false}, function (fileEntry) {
                            //console.log("deletePreview: Got fileEntry")
                            var fileURI = "giveaway_" + secretID + ".igo"
                            fileEntry.remove(function () {
                                //console.log(fileURI+" delete successfully")
                            }, function () {
                                //console.log(fileURI+" delete error")
                            })
                        });
                    });
                }
            }

        }
    })

//</editor-fold>

//<editor-fold  desc="giveawayDecor">
    /*
        Iterates over 2 groups of giveaways, decoretes selected post with info from on of 2 groups
     */
    .factory('giveawayDecor', function () {
        var __myGiveaways = []
        var __participatingGiveaways = []
        var __participatingHashtags = []
        var __myGiveawaysHashtags = []
        function getHashtags(giveawayList)
        {
            var hashtags = new Array()
            for(var ind in giveawayList)
            {
                hashtags.push(giveawayList[ind].hashtag)
            }
            return hashtags.sort()
        }

        function intersectionHashes(a, b)
        {
            var ai=0, bi=0;
            var result = new Array();

            while( ai < a.length && bi < b.length )
            {
                if      (a[ai] < b[bi] ){ ai++; }
                else if (a[ai] > b[bi] ){ bi++; }
                else /* they're equal */
                {
                    result.push(a[ai]);
                    ai++;
                    bi++;
                }
            }

            return result;
        }

        function getGiveawayByHashTag(hashtag)
        {
            return function (giveaway)
            {

                    return giveaway.hashtag == hashtag

            }
        }
        return {
            setMyGiveaways: function(myGiveaways,participatingGiveaways)
            {
                __myGiveaways = myGiveaways
                __myGiveawaysHashtags = getHashtags(myGiveaways)

                __participatingGiveaways = participatingGiveaways
                __participatingHashtags = getHashtags(participatingGiveaways)
            },
            getLocalGiveaway: function(hashTag)
            {
                var giveaway = undefined
                var inMyGiveawaysHashtags = intersectionHashes([hashTag], __myGiveawaysHashtags)
                if(inMyGiveawaysHashtags.length>0)
                {
                    giveaway =__myGiveaways.filter(getGiveawayByHashTag(inMyGiveawaysHashtags[0]))[0]
                    giveaway.type = "owner"
                }

                var inParticipatingGiveawaysHashtags = intersectionHashes([hashTag], __participatingHashtags)
                if(inParticipatingGiveawaysHashtags.length>0)
                {
                    giveaway =__participatingGiveaways.filter(getGiveawayByHashTag(inParticipatingGiveawaysHashtags[0]))[0]
                    giveaway.type = "participating"
                }
                return giveaway
            },
            generateHashTag : function(days,userId)
            {
                var expire = (new Date()).getTime()+days*1000*60*60*24;
                var concat = parseInt(expire + "" + userId.toString().slice(-3));

                return "ww"+concat.toString(36)
            },
            getType: function(post)
            {

                var inMyGiveawaysHashtags = intersectionHashes(post.tags.sort(), __myGiveawaysHashtags)
                if(inMyGiveawaysHashtags.length>0)
                {
                    return "owner"
                }

                var inParticipatingGiveawaysHashtags = intersectionHashes(post.tags.sort(), __participatingHashtags)
                if(inParticipatingGiveawaysHashtags.length>0)
                {
                    return "participating"
                }
                return "unjoined";
            },
            decoratePost: function (post) {

                var inMyGiveawaysHashtags = intersectionHashes(post.tags.sort(), __myGiveawaysHashtags)
                if(inMyGiveawaysHashtags.length>0)
                {
                    post.giveaway =__myGiveaways.filter(getGiveawayByHashTag(inMyGiveawaysHashtags[0]))[0]
                    post.giveaway.type = "owner"
                }

                var inParticipatingGiveawaysHashtags = intersectionHashes(post.tags.sort(), __participatingHashtags)
                if(inParticipatingGiveawaysHashtags.length>0)
                {
                    post.giveaway =__participatingGiveaways.filter(getGiveawayByHashTag(inParticipatingGiveawaysHashtags[0]))[0]
                    post.giveaway.type = "participating"
                }
                return post


            },
            filterPosts: function(post)
            {
                /*
                Dump logic to validate post of Giveaway
                 */
                function coreValidation(hashtag)
                {
                    return hashtag.substr(0, 2).toLowerCase()=="ww" &&  hashtag.length==12
                }
                if(post.tags.length==0)
                {
                    return false
                }
                else if(post.tags.filter(coreValidation).length>0)
                {
                    return post.tags.filter(coreValidation)[0]
                }
                return false
            }
        }
    })
//</editor-fold>

