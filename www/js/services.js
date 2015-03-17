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

.factory('timestampMarker', ['$cordovaLocalNotification',function($cordovaLocalNotification) {
    var timestampMarker = {
        request: function(config) {
            if(config.params !=undefined && (config.params.command == "SUBMIT_GIVEAWAY" || config.params.command == "JOIN_GIVEAWAY"))
            {
                config.notification = config.params.command
                config.ExpirationTimestamp =  config.params.ExpirationTimestamp
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
                        title: "Choose winner!",
                        text: "Your giveaway came to an end.",
                        at: new Date(response.config.ExpirationTimestamp*1000),
                        badge:1
                    }).then(function () {
                        console.log('callback for adding background notification');
                    });
                }
                else if(response.config.notification == "JOIN_GIVEAWAY")
                {
                  //@TODO: Findout expiration time
                }
            }

            return response;
        }
    };
    return timestampMarker;
}])
.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('timestampMarker');
}])

//<editor-fold  desc="server">
    .factory('server', function ($resource, profile) {
       var server_endpoint = "mock/"
       //var server_endpoint = "http://107.20.138.124/GiveAway/main_commander.php"
        return {
            getGiveaway: $resource(server_endpoint+"GET_GIVEAWAY",{command:'GET_GIVEAWAY',InstagramID:profile.instagram_id(),AccessToken:profile.access_token(),InstagramUsername:profile.instagram_username(),InstagramAvatar:profile.instagram_avatar()}),
            getUserInfo: $resource(server_endpoint+"GET_USER_INFO",{command:'GET_USER_INFO',InstagramID:profile.instagram_id(),AccessToken:profile.access_token(),InstagramUsername:profile.instagram_username(),InstagramAvatar:profile.instagram_avatar()}),
            submitGiveaway: $resource(server_endpoint+"SUBMIT_GIVEAWAY",{command:'SUBMIT_GIVEAWAY',InstagramID:profile.instagram_id(),AccessToken:profile.access_token(),InstagramUsername:profile.instagram_username(),InstagramAvatar:profile.instagram_avatar()}),
            joinGiveaway: $resource(server_endpoint+"JOIN_GIVEAWAY",{command:'JOIN_GIVEAWAY',InstagramID:profile.instagram_id(),AccessToken:profile.access_token(),InstagramUsername:profile.instagram_username(),InstagramAvatar:profile.instagram_avatar()})

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
            server.logout = $resource(instagram+"/accounts/logout/",{}),
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
            access_token: function (value) {

                if (value != undefined) {
                    console.log("access_token: SET")
                    window.localStorage.setItem("access_token", value)
                }
                else {
                    console.log("access_token: GET")
                    return window.localStorage.getItem("access_token") || false
                }

            },
            instagram_id: function (value) {
                if (value != undefined) {
                    console.log("instagram_id: SET")
                    window.localStorage.setItem("instagram_id", value)
                }
                else {
                    console.log("instagram_id: GET")
                    return window.localStorage.getItem("instagram_id") || false
                }

            },
            instagram_username: function (value) {
                if (value != undefined) {
                    console.log("instagram_username: SET")
                    window.localStorage.setItem("instagram_username", value)
                }
                else {
                    console.log("instagram_username: GET")
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
            generateHashTag : function()
            {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for( var i=0; i < 6; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return "ga"+text
            },
            decoratePost: function (post, myGiveaways,participatingGiveaways) {

                /*
                * On demand calculation
                * */
                if(myGiveaways.length != __myGiveaways.length)
                {
                    __myGiveaways = myGiveaways
                    __myGiveawaysHashtags = getHashtags(myGiveaways)
                }

                if(participatingGiveaways.length != __participatingGiveaways.length)
                {
                    __participatingGiveaways = participatingGiveaways
                    __participatingHashtags = getHashtags(participatingGiveaways)
                }

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
                    return true
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

