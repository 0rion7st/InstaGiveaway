angular.module('giveaways.controllers', [])

    .controller('RootCtrl', function($scope,$ionicLoading,profile,instagram, errorBox, $location,$ionicModal,$cordovaOauth,$cordovaInstagram,$cordovaGoogleAnalytics,$state,registerNotifications,$cordovaDevice,$rootScope,$cordovaEmailComposer,$ionicSideMenuDelegate,giveawayDecor,previewStorage,$ionicSlideBoxDelegate,server,$cordovaImagePicker,$cordovaActionSheet,$timeout,$ionicPopover,$cordovaGlobalization ) {
        $scope.c={}
        $scope.c.followersNeeded = profile.followersNeeded
        $scope.c.refreshTimeStamp=-1
        $scope.c.refreshPeriod=30
        $scope.c.localize = document.localize
        registerNotifications()

        // get the language and change it if needed
        document.addEventListener("deviceready", function () {
            $cordovaGlobalization.getPreferredLanguage().then(
                function(result) {
                    document.selectLanguage(result.value)
                },
                function(error) {
                });

        }, false);

        document.addEventListener("deviceready", function () {
            $cordovaGoogleAnalytics.startTrackerWithId('UA-61254051-1');
        }, false);

        angular.element(document).find('head').append('<style type="text/css">.giveaway.finished:before{content: "' + $scope.c.localize.strings["labelFinished"] +'" !important;}</style>');
        angular.element(document).find('head').append('<style type="text/css">.giveaway.owner:before{content: "' + $scope.c.localize.strings["labelMyWW"] +'" !important;}</style>');
        angular.element(document).find('head').append('<style type="text/css">.giveaway.new:before{content: "' + $scope.c.localize.strings["labelNew"] +'" !important;}</style>');
        angular.element(document).find('head').append('<style type="text/css">.giveaway.no-winner:before{content: "' + $scope.c.localize.strings["labelNoWinner"] +'" !important;}</style>');
        angular.element(document).find('head').append('<style type="text/css">.giveaway.participating:before{content: "' + $scope.c.localize.strings["labelJoined"] +'" !important;}</style>');

        // reload google maps with correct language. In case it's english we already loaded it in index.html
        var short_lang = (document.getLanguage() == 'ru') ? 'ru' : 'en';
        if (short_lang != 'en')
        {
            var googleApiJSLink = "https://maps.googleapis.com/maps/api/js?libraries=places&language=" + short_lang;
            var script = document.createElement('script');
            script.setAttribute('src', googleApiJSLink);
            angular.element(document).find('head').append(script);
        }

        // wa for ionic and google autocomplete service
        $scope.DisableTap = function(){
            var container = document.getElementsByClassName('pac-container');
            // disable ionic data tab
            angular.element(container).attr('data-tap-disabled', 'true');
            // leave input field if google-address-entry is selected
            angular.element(container).on("click", function(){
                document.getElementById('searchBar').blur();
            });
        };

        $scope.c.toggleRight = function() {
            $ionicSideMenuDelegate.toggleRight();
        };

        $scope.c.showLoading = function () {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios"></ion-spinner>'

            });
        };
        $scope.c.getDesc = function(text)
        {
            if(text==undefined)
                return ""
            if(text.split('Wanna win?').length>1)
                return text.split('Wanna win?')[0]

            return text
        }
        $scope.c.openAbout = function()
        {
            $ionicModal.fromTemplateUrl('templates/about.html', {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: true,
                hardwareBackButtonClose:true
            }).then(function(modal)
            {
                $scope.c.about = modal
                $scope.c.about.show()


                $scope.c.about.close= function()
                {
                    $scope.c.about.remove()
                }
            })
        }

        $scope.c.pushState = function(state,href)
        {
            location.href=state
            setTimeout(function()
            {
                location.href=$scope.$eval('"'+href+'"',$scope)
            },100)
        }

//        $scope.c.openBoost = function(event,giveaway) {
//
//            $ionicPopover.fromTemplateUrl('templates/boost.html', {
//                scope: $scope
//            }).then(function(popover) {
//                $scope.giveaway = giveaway
//                $scope.c.boost = popover
//                $scope.c.boost.show(event)
//
//            });
//        };
//
//        $scope.c.buyBoost = function(giveaway)
//        {
//            $scope.c.showLoading()
//            $timeout(function()
//            {
//                $scope.c.hideLoading()
//
//                $ionicLoading.show({
//                    template:' <h1 class="animated flip"><i class="icon ion-ios-bolt energized"></i></h1>',
//                    noBackdrop:false,
//                    duration:1000
//                });
//
//
//                giveaway.boost=2
//                $scope.c.boost.hide()
//            },1000)
//
//        }
        $scope.c.notifyErr = errorBox
        $scope.c.hideLoading = function () {
            $ionicLoading.hide();
        };


        $scope.c.showLike = function () {
            $ionicLoading.show({
                template: '<h1><i class="icon ion-ios-heart" style="font-size:30px;"></i></h1>'
            });
        };
        $scope.c.hideLike = function () {
            $ionicLoading.hide();
        };
        $scope.c.logout = function()
        {
            $scope.c.showLoading()
            $cordovaGoogleAnalytics.trackEvent('Logout', 'Logout');
            instagram.logout.get({},function()
            {
                $scope.c.hideLoading()
                profile.logout()
                location.href = "#/tab/feed"
                location.reload()
            })

        }
        $scope.c.complexSorting = function(a,b) {
            if(b.showFinished==true)
                return 10000

            if(a.showFinished==true)
                return -10000
            return b.creation_timestamp - a.creation_timestamp
        }
        $scope.c.openEULA = function()
        {
            $ionicModal.fromTemplateUrl('templates/eula.html', {
                scope: $scope,
                animation: 'slide-in-up',
                backdropClickToClose: true,
                hardwareBackButtonClose: false
            }).then(function (modal) {
                $scope.c.eula = modal
                $scope.c.eula.show()
                $scope.c.eula.close = function()
                {
                    profile.eula(true)
                    $scope.c.eula.remove()
                }
            })
        }
        $scope.c.getUserInfo = function(callback,force)
        {
            force = force || false
            if(!profile.valid())
                return

            if(!profile.eula())
                $scope.c.openEULA()
            if(((new Date()).getTime()/1000-$scope.c.refreshTimeStamp)<$scope.c.refreshPeriod && !force)
            {
                if(callback)
                    callback()
            }
            else
            {
                $scope.c.userInstagram = instagram.users.get({user:"self"},function()
                {

                    $scope.c.userInfo = server.getUserInfo.get({},function()
                    {

                        document.addEventListener("deviceready", function () {
                            $cordovaGoogleAnalytics.setUserId(profile.instagram_id())
                        }, false);

                        var joining = profile.joiningWW()

                        if(joining != false && $scope.c.submit == undefined)
                        {
                            $scope.c.submit_giveaway(joining.media, joining.hash,joining.expire)
                        }

                        $scope.c.refreshTimeStamp = (new Date()).getTime()/1000
                        $scope.c.userInfo.data.giveaways.sort($scope.c.complexSorting)
                        $scope.c.userInfo.data.participating.sort($scope.c.complexSorting)

                        giveawayDecor.setMyGiveaways($scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)

                        if($scope.c.userInfo.data.giveaways.length>1)
                        {

                            $scope.reposts = 0
                            $scope.c.userInfo.data.giveaways.filter(function(a){$scope.reposts +=a.participants.totalCount*1; return true;})

                        }
                        else if($scope.c.userInfo.data.giveaways.length==1)
                            $scope.reposts = $scope.c.userInfo.data.giveaways[0].participants.totalCount*1
                        else
                            $scope.reposts = 0

                        $scope.wins = $scope.c.userInfo.data.participating.filter(function(a){ return a.winner_id==$scope.c.userInstagram.data.id}).length


                        if(callback)
                        {
                            callback()
                        }
                    },function(error)
                    {
                        $scope.c.notifyErr(error.data.errorCode)
                    })
                },function(error)
                {
                    if(error.data.error_type=="OAuthAccessTokenException" && profile.valid())
                    {
                        $scope.c.logout()
                    }
                    else if(!profile.valid())
                    {

                    }
                    else
                    {
                        $scope.c.notifyErr(error.data.code || error.data.meta.code )
                    }
                })
            }

        }

        /*document.addEventListener("resume", (function($scope){

         return function()
         {
         setTimeout($scope.c.getUserInfo,0)
         }

         })($scope), false);*/

        $scope.c.chooseOtherWinner = function(giveawayImageSrc,giveAwayHashTag, giveAwayMediaId, giveAwayAuthor)
        {
            var device = $cordovaDevice.getDevice();

            var cordova = $cordovaDevice.getCordova();

            var model = $cordovaDevice.getModel();

            var platform = $cordovaDevice.getPlatform();

            var uuid = $cordovaDevice.getUUID();

            var version = $cordovaDevice.getVersion();

            $cordovaGoogleAnalytics.trackEvent('OtherWinner', 'Opened', giveAwayHashTag);
            var email = {
                to: 'wannawin.help@gmail.com',
                subject: 'WannaWin #'+giveAwayHashTag+' want to choose other winner',
                body: "Hi there!<br> <i>Please type why you need to choose random winner again</i><br>" +
                    "<b>WannaWin:</b> <img style='width:100%;' src='"+giveawayImageSrc+"' /><br>"+
                    "<b>WannaWin mediaId:</b> "+giveAwayMediaId+"<br>"+
                    "<b>WannaWin author:</b> "+giveAwayAuthor+"<br>"+
                    "<b>Sender cordova:</b> "+cordova+"<br>"+
                    "<b>Sender model:</b> "+model+"<br>"+
                    "<b>Sender platform:</b> "+platform+"<br>"+
                    "<b>Sender uuid:</b> "+uuid+"<br>"+
                    "<b>Sender version:</b> "+version+"<br>"+
                    "<small>"+(new Date())+"</small></small>",
                isHtml: true
            };

            $cordovaEmailComposer.open(email).then(null, function () {
                $cordovaGoogleAnalytics.trackEvent('Report', 'Send', giveAwayHashTag);
            });
        }

        $scope.c.help = function()
        {

            $cordovaGoogleAnalytics.trackEvent('Help', 'Opened');
            var email = {
                to: 'wannawin.help@gmail.com',
                subject: 'Help request from '+$scope.c.userInstagram.data.username,
                body: "<small>"+(new Date())+"</small></small>",
                isHtml: true
            };

            $cordovaEmailComposer.open(email).then(null, function () {
                $cordovaGoogleAnalytics.trackEvent('Report', 'Send', giveAwayHashTag);
            });
        }

        $scope.c.report = function(giveawayImageSrc,giveAwayHashTag, giveAwayMediaId, giveAwayAuthor)
        {
            var device = $cordovaDevice.getDevice();

            var cordova = $cordovaDevice.getCordova();

            var model = $cordovaDevice.getModel();

            var platform = $cordovaDevice.getPlatform();

            var uuid = $cordovaDevice.getUUID();

            var version = $cordovaDevice.getVersion();

            $cordovaGoogleAnalytics.trackEvent('Report', 'Opened', giveAwayHashTag);
            var email = {
                to: 'wannawin.help@gmail.com',
                subject: 'WannaWin #'+giveAwayHashTag+' issue',
                body: "Hi there!<br> <b>Issue:</b><br><i>Type here...</i><br><br><small>Technical info(please do not delete it):<br>" +
                    "<b>WannaWin:</b> <img style='width:100%;' src='"+giveawayImageSrc+"' /><br>"+
                    "<b>WannaWin mediaId:</b> "+giveAwayMediaId+"<br>"+
                    "<b>WannaWin author:</b> "+giveAwayAuthor+"<br>"+
                    "<b>Sender cordova:</b> "+cordova+"<br>"+
                    "<b>Sender model:</b> "+model+"<br>"+
                    "<b>Sender platform:</b> "+platform+"<br>"+
                    "<b>Sender uuid:</b> "+uuid+"<br>"+
                    "<b>Sender version:</b> "+version+"<br>"+
                    "<small>"+(new Date())+"</small></small>",
                isHtml: true
            };

            $cordovaEmailComposer.open(email).then(null, function () {
                $cordovaGoogleAnalytics.trackEvent('Report', 'Send', giveAwayHashTag);
            });
        }
        $scope.c.submit_giveaway = function(media_id, hashtag,joinExpire)
        {
            if($scope.c.userInstagram.data.counts.followed_by<$scope.c.followersNeeded)
            {
                $scope.c.notifyErr(-1)
                return
            }
            $scope.c.submit={}
            $scope.c.submit.ribbon=1
            $scope.c.submit.isLangEn=true
            $scope.c.submit.lang="en"
            $scope.c.submit.geotypeWorld = true
            $scope.c.submit.geotypeCountry = false
            $scope.c.submit.geotypePlace = false
            $scope.c.submit.geotypeCountryName = ""
            $scope.c.submit.geotypeCountryNameLocalized = ""
            $scope.c.submit.geotypePlaceName = ""
            $scope.c.submit.ruCaption = "Участвуй через приложение Wanna Win. Установи на @ww_iphone или @ww_android";
            $scope.c.submit.enCaption = "Wanna win? Install WannaWin app on @ww_iphone or @ww_android";
            function touchStart(e){
                var canvas=document.getElementById("giveaway_canvas");
                var touchobj = e.changedTouches[0]
                canvas.start = {x: parseInt(touchobj.clientX),y: parseInt(touchobj.clientY)}

                e.preventDefault()
            }

            function touchMove(e){
                var canvas=document.getElementById("giveaway_canvas");
                var touchobj = e.changedTouches[0] // reference first touch point for this event
                var r = $scope.c.submit.selectedImage.width/$scope.c.submit.selectedImage.height
                var width= 640
                var height = 640
                if(r>1)
                {
                    width = width*r
                }
                else
                {
                    height = height/r
                }
                canvas.dist = {x: parseInt(touchobj.clientX) - canvas.start.x,y: parseInt(touchobj.clientY) - canvas.start.y}
                var finalX = canvas.offset.x + canvas.dist.x
                var finalY = canvas.offset.y + canvas.dist.y
                if(finalX>0)
                {
                    canvas.dist.x = 0
                    canvas.offset.x = 0
                }

                if(finalY>0)
                {
                    canvas.dist.y = 0
                    canvas.offset.y = 0
                }

                if(finalX+width<640)
                {
                    canvas.dist.x = 0
                    canvas.offset.x =640 - width
                }

                if(finalY+height<640)
                {
                    canvas.dist.y = 0
                    canvas.offset.y = 640 - height
                }


                reDraw()
                e.preventDefault()
            }

            function touchEnd (e){
                var canvas=document.getElementById("giveaway_canvas");
                var touchobj = e.changedTouches[0] // reference first touch point for this event
                canvas.offset = {x:  canvas.offset.x + canvas.dist.x ,y: canvas.offset.y + canvas.dist.y }
                canvas.dist = {x: 0, y: 0}
                e.preventDefault()
            }

            function reDraw(final)
            {
                final = final || false
                var canvas=document.getElementById("giveaway_canvas");
                var ctx=canvas.getContext("2d");
                var r = $scope.c.submit.selectedImage.width/$scope.c.submit.selectedImage.height
                if(r>1)
                {
                    ctx.drawImage($scope.c.submit.selectedImage,canvas.dist.x+canvas.offset.x,canvas.dist.y+canvas.offset.y, 640*r, 640);
                }
                else
                {
                    ctx.drawImage($scope.c.submit.selectedImage,canvas.dist.x+canvas.offset.x,canvas.dist.y+canvas.offset.y, 640,640/r);
                }
                if($scope.c.submit.type=="new" && !final)
                {
                    ctx.drawImage($scope.c.submit.cropFrame,0,0 ,$scope.c.submit.cropFrame.width, $scope.c.submit.cropFrame.height);
                }

                if($scope.c.submit.type=="new" ) {
                    ctx.drawImage($scope.c.submit.selectedRibon, 0, 0, $scope.c.submit.selectedRibon.width, $scope.c.submit.selectedRibon.height)
                }
            }
            $scope.c.submit.changeGeotype = function(type)
            {
                if (type == "world")
                {
                    $scope.c.submit.geotypeWorld = true
                    $scope.c.submit.geotypeCountry = false
                    $scope.c.submit.geotypePlace = false
                }
                if (type == "country")
                {
                    $scope.c.submit.geotypeWorld = false
                    $scope.c.submit.geotypeCountry = true
                    $scope.c.submit.geotypePlace = false
                }
                if (type == "place")
                {
                    $scope.c.submit.geotypeWorld = false
                    $scope.c.submit.geotypeCountry = false
                    $scope.c.submit.geotypePlace = true
                }
            }
            $scope.c.submit.fillCanvas = function()
            {
                var canvas=document.getElementById("giveaway_canvas");
                if(canvas.start==undefined) {
                    canvas.start ={x:0,y:0}
                    canvas.dist = {x: 0, y: 0}
                    canvas.offset = {x:0,y:0}
                }
                if($scope.c.submit.type=="new")
                {
                    canvas.removeEventListener('touchstart',touchStart)
                    canvas.removeEventListener('touchmove',touchMove)
                    canvas.removeEventListener('touchend',touchEnd)
                    canvas.addEventListener('touchstart',touchStart)
                    canvas.addEventListener('touchmove',touchMove)
                    canvas.addEventListener('touchend',touchEnd)
                    canvas.className = "animated fadeOut";

                    if($scope.c.submit.cropFrame ==undefined)
                    {
                        var crop = new Image()
                        crop.onload=function()
                        {
                            $scope.c.submit.cropFrame = crop
                        }
                        crop.src= "img/cropFrame.png"
                    }
                }

                var ctx=canvas.getContext("2d");
                ctx.imageSmoothingEnabled = true;

                canvas.width=640
                canvas.height=640
                ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
                var img = new Image()
                img.onload=function()
                {
                    $scope.c.submit.selectedImage = img
                    if($scope.c.submit.type=="new")
                    {
                        var ribbon = new Image()
                        ribbon.onload=function()
                        {
                            $scope.c.submit.selectedRibon = ribbon
                            reDraw()
                            canvas.className = "animated fadeIn";
                        }
                        ribbon.src="img/ribbons/ribbon_0"+$scope.c.submit.ribbon+"_"+$scope.c.submit.lang+".png"
                    }
                    else
                    {
                        reDraw()
                    }
                    canvas.className = "animated fadeIn";
                }
                img.src= $scope.c.submit.imageUrl


            }

            $scope.c.submit.setRibbon = function(ribbonId)
            {
                if($scope.c.submit.ribbon!=ribbonId)
                {
                    $scope.c.submit.ribbon=ribbonId
                    $scope.c.submit.fillCanvas()
                }
            }

            $scope.c.submit.changeLang = function()
            {
                $scope.c.submit.lang=($scope.c.submit.isLangEn)?"en":"ru";
                $scope.c.submit.fillCanvas()
            }

            $scope.c.submit.share = function()
            {
                var desc = ""
                document.addEventListener("resume", $scope.c.submit.checkPost, false);
                if($scope.c.submit.type=="join")
                {
                    $scope.c.submit.imagedata = document.getElementById("giveaway_canvas").toDataURL("image/jpeg")
                    desc+=$scope.c.localize.strings['repostOf']+$scope.c.submit.author.username +"\n"

                    if(!profile.joiningWW())
                    {
                        instagram.media.save({action:$scope.c.submit.media_id,type:'likes'},{},function()
                        {
                            $scope.c.submit.liked=true
                            instagram.follow.save({userId:$scope.c.submit.author.id},{action:"follow"},function()
                            {
                                $scope.c.submit.join()
                            },function(error)
                            {
                                $scope.c.hideLoading()
                                $scope.c.notifyErr(error.data.code || error.data.meta.code )
                            })
                        },function(error)
                        {
                            $scope.c.hideLoading()
                            $scope.c.notifyErr(error.data.code || error.data.meta.code )
                        })
                        profile.joiningWW({hash:$scope.c.submit.hashtag,expire:$scope.c.submit.expire,media:$scope.c.submit.media_id})
                    }
                }
                else
                {
                    $scope.c.submit.create();
                    // add location tag of WW
                    var locationText = "";
                    if ($scope.c.submit.geotypeWorld)
                    {
                        locationText = ""; // in case of worldwide just don't mention it
                    }
                    else
                    {
                        if ($scope.c.submit.geotypeCountry)
                        {
                            locationText = $scope.c.localize.strings['geotypeCountryComment'] + $scope.c.submit.geotypeCountryNameLocalized + '\n';
                        }
                        else
                        {
                            if ($scope.c.submit.geotypePlace)
                            {
                                locationText = $scope.c.localize.strings['geotypePlaceComment'] + $scope.c.submit.geotypePlaceName + '\n';
                            }
                        }
                    }
                    desc += $scope.c.submit.comment + '\n\n' + locationText;
                }

                if($scope.c.submit.post!=undefined)
                {
                    desc += $scope.c.getDesc($scope.c.submit.post.data.caption.text) + '\n\n';
                }

                var langCaption = ($scope.c.submit.isLangEn)?$scope.c.submit.enCaption:$scope.c.submit.ruCaption
                var caption  = desc + langCaption + '\n #' + $scope.c.submit.hashtag

                console.log(caption)

                $cordovaInstagram.share(
                    {image:$scope.c.submit.imagedata,
                        caption:caption}
                ).then(function() {
                        $scope.shareClicked = true
                    }, function(err) {
                        $scope.c.notifyErr(-2)
                    });
            }
            $scope.c.submit.doneClose = function()
            {
                $scope.c.showLoading()
                if($scope.c.submit.type=="join")
                {
                    $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Join:Submit:Done','hashtag',$scope.c.submit.hashtag);

                }
                else
                {
                    $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Create:Submit:Done','hashtag',$scope.c.submit.hashtag);

                }
                 server.getGiveaway.get({HashtagID:$scope.c.submit.hashtag}).$promise.then(
                    function(giveaway)
                    {
                        $scope.c.getUserInfo(function()
                        {
                            $scope.c.hideLoading()
                            $scope.c.submit.close()
                            if($scope.c.submit.type=="join")
                            {
                                $scope.c.refreshTimeStamp = (new Date()).getTime()/1000
                                $scope.c.userInfo.data.giveaways.sort($scope.c.complexSorting)
                                $scope.c.userInfo.data.participating.sort($scope.c.complexSorting)
                                giveawayDecor.setMyGiveaways($scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                                profile.joiningWW(false)
                                $scope.c.pushState("#/tab/joined","#/tab/joined/giveaway/"+$scope.c.submit.hashtag)

                            }
                            else
                            {
                                $scope.c.pushState("#/tab/giveaways","#/tab/giveaways/giveaway/"+$scope.c.submit.hashtag)
                            }


                        },true)
                    }
                    ,function(error)
                    {
                        $scope.c.hideLoading()
                        $scope.c.notifyErr(error.data.errorCode)
                        $ionicHistory.goBack()
                    })



            }
            $scope.c.submit.create = function()
            {
                var options = {HashtagID:$scope.c.submit.hashtag}
                $scope.c.submit.expire = $scope.c.submit.days*86400+Math.floor((new Date()).getTime()/1000)
                $scope.c.showLoading()
                $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Create:Submit','hashtag',$scope.c.submit.hashtag);
                options.ExpirationTimestamp=$scope.c.submit.expire
                if ($scope.c.submit.geotypeWorld)
                {
                    options.Geotype = "World"
                }
                else
                {
                    if ($scope.c.submit.geotypeCountry)
                    {
                        options.Geotype = "Country"
                        options.CountryName = $scope.c.submit.geotypeCountryName
                    }
                    else
                    {
                        if ($scope.c.submit.geotypePlace)
                        {
                            options.Geotype = "Place"
                            options.PlaceName = $scope.c.submit.geotypePlaceName
                        }
                    }
                }

                $scope.c.userInfo = server.submitGiveaway.get(options,function(data)
                {
                    $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Create:Submit:Success','hashtag',$scope.c.submit.hashtag);
                    $scope.c.hideLoading()
                    $scope.$apply()
                },function(error)
                {
                    $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Create:Submit:Error','error',error.data.errorCode);
                    $scope.c.hideLoading()
                    $scope.c.notifyErr(error.data.errorCode)
                })
            }

            $scope.c.submit.join = function()
            {
                var options = {GiveawayMediaID:$scope.c.submit.media_id,HashtagID:$scope.c.submit.hashtag}
                $scope.c.showLoading()
                options.ExpirationTimestamp=$scope.c.submit.expire
                $scope.c.userInfo = server.joinGiveaway.get(options,function()
                {
                    $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Join:Submit:Success','hashtag',$scope.c.submit.hashtag);
                    $scope.c.hideLoading()
                    $scope.$apply()
                },function(error)
                {
                    $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Join:Submit:Error','error',error.data.errorCode);
                    $scope.c.hideLoading()
                    $scope.c.notifyErr(error.data.errorCode)
                })

            }



            $scope.c.submit.checkPost =  (function($scope){

                    return function()
                    {
                        $scope.c.showLoading()
                        document.removeEventListener("resume", $scope.c.submit.checkPost, false);
                        instagram.users.get({user:"self",action:"media",type:"recent"}, function(data)
                        {
                            var foundMatches = data.data.filter(function(post) {return post.caption!=undefined && post.caption.from.id==profile.instagram_id()}).filter(function(post){return post.tags.indexOf($scope.c.submit.hashtag.toLocaleLowerCase())!=-1}).length
                            $scope.c.hideLoading()
                            if(foundMatches>0)
                            {
                                $scope.c.submit.done = true
                                if($scope.c.submit.media_id==undefined)
                                {
                                    $scope.c.submit.media_id = data.data[0].id
                                }
                                $scope.c.submit.doneClose()
                            }
                            else
                            {
                                $scope.c.notifyErr(-3)
                            }
                        })
                    }
                })($scope)

            $scope.c.submit.showModal = function(callback)
            {
                $scope.shareClicked = true
                $scope.c.submit.days = 7
                $scope.c.submit.comment = ""
                $ionicModal.fromTemplateUrl('templates/create-giveaway.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    backdropClickToClose: true,
                    hardwareBackButtonClose: false
                }).then(function (modal) {
                    $scope.c.submit.modal = modal
                    $ionicSlideBoxDelegate.enableSlide(false)
                    $scope.c.submit.active_slide = 0
                    $scope.c.submit.close = function () {
                        profile.joiningWW(false)
                        $scope.c.submit.modal.remove()
                    };

                    $scope.c.submit.nextStep = function() {
                        $ionicSlideBoxDelegate.next();
                        if($scope.c.submit.active_slide==0)
                        {
                            reDraw(true)
                            $scope.c.submit.imagedata = document.getElementById("giveaway_canvas").toDataURL("image/jpeg")
                            $scope.c.submit.hashtag = giveawayDecor.generateHashTag($scope.c.submit.days,profile.instagram_id())

                        }
                        else if($scope.c.submit.active_slide==2)
                        {
                            $scope.c.submit.checkPost()
                        }
                        console.log($ionicSlideBoxDelegate.currentIndex())
                    }
                    $scope.c.submit.modal.show()
                    $scope.c.submit.fillCanvas()

                })
            }
            $scope.c.submit.selectImage = function()
            {
                var canvas=document.getElementById("giveaway_canvas");
                if(canvas!=null)
                {
                    canvas.start ={x:0,y:0}
                    canvas.dist = {x: 0, y: 0}
                    canvas.offset = {x:0,y:0}
                }

                // FOR DEBUG START

                //$cordovaImagePicker.getPictures({
                //    maximumImagesCount: 1,
                //    width: 640,
                //    quality: 100
                //}).then(function (results) {
                //        //No image selected
                //        if(results.length==0)
                //            return
                //        $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Create:ImageSelect');
                //        $scope.c.submit.imageUrl =  results[0]
                //        $scope.c.submit.type='new'
                //        if($scope.c.submit.modal == undefined)
                //            $scope.c.submit.showModal()
                //        else
                //            $scope.c.submit.fillCanvas()
                //
                //    }, function(error) {
                //        // error getting photos
                //});

                // FOR DEBUG END
                // Uncomment above code and comment this code:
                //$scope.c.submit.imageUrl = "img/image_02.png"
                //$scope.c.submit.type='new'
                //if($scope.c.submit.modal == undefined)
                //    $scope.c.submit.showModal()
                //else
                //    $scope.c.submit.fillCanvas()

                $scope.c.submit.imageUrl = "img/image_02.png"
                $scope.c.submit.type='new'
                if($scope.c.submit.modal == undefined)
                    $scope.c.submit.showModal()
                else
                    $scope.c.submit.fillCanvas()
            }
            if(media_id==undefined)
            {
                $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Create');

                // FOR DEBUG START

                // Show the action sheet
                //$cordovaActionSheet.show({
                //    buttonLabels: [
                //        $scope.c.localize.strings['chooseExistinPhoto']
                //    ],
                //    title: $scope.c.localize.strings['selectWWSquareImage'],
                //    addCancelButtonWithLabel: $scope.c.localize.strings['cancel'],
                //    androidEnableCancelButton : true,
                //    winphoneEnableCancelButton : true
                //}).then(function(btnIndex) {
                //    if(btnIndex!=2)
                //    {
                //        $scope.c.submit.selectImage()
                //    }
                //});

                // FOR DEBUG END
                // Uncomment above code and comment this code:
                //$scope.c.submit.selectImage()
                $scope.c.submit.selectImage()

            }else
            {
                $cordovaGoogleAnalytics.trackEvent('WannaWin', 'Join','hashtag',hashtag);
                $scope.c.showLoading()
                $scope.c.submit.media_id = media_id
                $scope.c.submit.hashtag = hashtag
                $scope.c.submit.type='join'
                $scope.c.submit.expire = joinExpire
                $scope.c.submit.post = instagram.media.get({action: $scope.c.submit.media_id}, function (data) {

                    $scope.c.hideLoading()
                    $scope.c.submit.imageUrl = data.data.images.standard_resolution.url
                    $scope.c.submit.author = data.data.user
                    $scope.c.submit.showModal()
                })
            }

        }



        if(!profile.valid())
        {
            if($location.search().access_token!=undefined)
            {

                profile.access_token($location.search().access_token)
                profile.instagram_id($location.search().access_token.split('.')[0])
                instagram.reinit()
                instagram.users.get({user:"self"},function(data)
                {
                    profile.instagram_avatar(data.data.profile_picture)
                    profile.instagram_username(data.data.username)
                    location.href = "#/tab/feed"
                    location.reload()
                })


            }
            else
            {

                $ionicModal.fromTemplateUrl('instagram_login', {
                    scope: $scope,
                    animation: 'slide-in-up',
                    backdropClickToClose: false,
                    hardwareBackButtonClose:false
                }).then(function(modal)
                {
                    $scope.c.login_modal = modal
                    $scope.c.login_modal.show()


                    $scope.c.login_modal.login = function()
                    {
                        $cordovaOauth.instagram("d9da9ac6196344e1b93442fe846eabef",["likes","comments","relationships"]).then(function(result) {
                            profile.access_token(result.access_token)
                            profile.instagram_id(result.access_token.split('.')[0])
                            instagram.reinit()
                            instagram.follow.save({userId:1836256177},{action:"follow"},function()
                            {
                                instagram.users.get({user:"self"},function(data)
                                {
                                    profile.instagram_avatar(data.data.profile_picture)
                                    profile.instagram_username(data.data.username)
                                    $scope.c.login_modal.remove()
                                    location.href = "#/tab/feed"
                                    location.reload()
                                })
                            })


                        }, function(error) {

                        });
                    }


                })

            }
        }



    })
    .controller('FeedCtrl', function($scope,$stateParams,profile,server,instagram,$timeout,$ionicScrollDelegate,giveawayDecor,$cordovaGoogleAnalytics) {

        document.addEventListener("deviceready", function () {
            $cordovaGoogleAnalytics.trackView('Feed');
        }, false);

        // Disable for now, because it causes infinite loading
//        document.addEventListener("resume", (function($scope){
//
//            return function()
//            {
//                setTimeout(function()
//                {
//                    $scope.c.getUserInfo(function()
//                    {
//                        $scope.fillFeed()
//                    },true)
//                },0)
//            }
//
//        })($scope), false);

        $scope.loadMoreTimes=0
        $scope.clearSearch = function()
        {
            $scope.searchQuery = undefined
        }
        $scope.doRefresh = function()
        {
            $scope.c.getUserInfo(function()
            {
                $scope.fillFeed()
            },true)
        }
        $scope.loadMore = function()
        {
            $cordovaGoogleAnalytics.trackView('Feed','LoadMore','times',$scope.loadMoreTimes);
            if($scope.feed==undefined || $scope.feed.data==undefined || $scope.next_max_id==undefined || $scope.layout!="posts")
            {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            else
            {
                if($scope.loadMoreTimes>100)
                {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    return
                }

                var results = instagram.users.get({user:"self",action:"feed",max_id:$scope.next_max_id}).$promise;
                results.then(function(data) {
                    if (data.data.length < 0) {
                        $scope.loadMoreTimes = 100
                    }
                    else {
                        $scope.loadMoreTimes++
                    }
                    $scope.next_max_id = data.pagination.next_max_id
                    data.data = data.data.filter(giveawayDecor.filterPosts)
                    console.log("124")
                    data.data.map(function (post) {
                        var fileredPost = giveawayDecor.decoratePost(post)
                        post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                        post.giveaway = post.giveaway || {}
                        post.giveaway.new = post.new
                        $scope.c.userInfo.data.newsFeed += (post.new || 0) * 1
                    })
                    $scope.feed.data = $scope.feed.data.concat(data.data.filter($scope.uniqueHashtags));


                }).finally(function() {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
            }
        }
        $scope.addAdditional = function()
        {
            for(var index in $scope.c.userInfo.data.additional)
            {
                var giveaway = $scope.c.userInfo.data.additional[index]
                if($scope.showedTags.indexOf(giveaway.hashtag)==-1) {
                    instagram.media.get({action: giveaway.media_id}, (function (giveaway) {
                        return function (data) {

                            if ($scope.showedTags.indexOf(giveaway.hashtag) == -1) {
                                $scope.showedTags.push(giveaway.hashtag)
                                data.data.giveaway = giveaway
                                data.data.giveaway.type = giveawayDecor.getType(data.data)
                                data.data.giveawayHashtag = giveaway.hashtag
                                data.data.giveaway.new = (data.data.caption && profile.getLatestTime()*1<data.data.caption.created_time*1)
                                $scope.feed.data.push(data.data)
                                $scope.c.userInfo.data.newsFeed +=(data.data.caption && profile.getLatestTime()*1<data.data.caption.created_time*1)*1
                            }
                        }
                    })(giveaway))
                }
            }
        }

        $scope.uniqueHashtags = function(post)
        {
            if($scope.showedTags.indexOf(post.giveawayHashtag)==-1)
            {
                $scope.showedTags.push(post.giveawayHashtag)
                return true
            }
            return false
        }
        $scope.fillFeed = function()
        {
            $scope.c.userInfo.data.newsFeed = 0
            $scope.showedTags = []
            if($scope.searchQuery==undefined || $scope.searchQuery=="")
            {
                $scope.layout = "posts"
                var results = instagram.users.get({user:"self",action:"feed"}).$promise;
                results.then(function(data)
                {
                    $scope.next_max_id = data.pagination.next_max_id
                    data.data=data.data.filter(giveawayDecor.filterPosts)
                    data.data.map(function(post)
                    {
                        var fileredPost =  giveawayDecor.decoratePost(post)
                        post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                        post.giveaway = post.giveaway || {}
                        post.giveaway.new = post.new
                        $scope.c.userInfo.data.newsFeed +=(post.new || 0)*1
                    })
                    $scope.feed={}
                    $scope.feed.data = data.data.filter($scope.uniqueHashtags)
                    $scope.addAdditional()
                    $ionicScrollDelegate.scrollTop(0)
                    $scope.c.hideLoading()

                },function()
                {
                    $scope.feed = undefined
                    $scope.c.hideLoading()
                }).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete')
                })
            }
            else if($scope.searchQuery.indexOf("http")!=-1)
            {
                $scope.layout = "posts"
                var postShortCode = /\/p\/([^\/]+)\/?/g;
                var match = postShortCode.exec($scope.searchQuery);
                if(match !=undefined && match[1] !=undefined)
                {
                    var results =  instagram.media.get({action:"shortcode",type:match[1]}).$promise;
                    results.then(function(data)
                    {
                        data.data=[data.data]
                        data.data=data.data.filter(giveawayDecor.filterPosts)
                        data.data.map(function(post)
                        {
                            var fileredPost =  giveawayDecor.decoratePost(post)
                            post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                        })
                        $scope.feed = data
                        $ionicScrollDelegate.scrollTop(0)
                        $scope.c.hideLoading()

                    },function()
                    {
                        $scope.feed = undefined
                        $scope.c.hideLoading()
                    }).finally(function() {
                        $scope.$broadcast('scroll.refreshComplete')
                    })
                }
                else
                {
                    $scope.feed = undefined
                    $scope.c.hideLoading()
                }
            }
            else if($scope.searchQuery.indexOf("#")!=-1)
            {
                $scope.layout = "posts"
                var results =  instagram.hashes.get({tag:$scope.searchQuery.split("#")[1],action:"media",type:"recent"}).$promise;
                results.then(function(data)
                {
                    data.data=data.data.filter(giveawayDecor.filterPosts)
                    data.data.map(function(post)
                    {
                        var fileredPost =  giveawayDecor.decoratePost(post)
                        post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                    })
                    $scope.feed = data
                    $ionicScrollDelegate.scrollTop(0)
                    $scope.c.hideLoading()

                },function()
                {
                    $scope.feed = undefined
                    $scope.c.hideLoading()
                }).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete')
                })
            }
            else
            {
                var query = $scope.searchQuery
                if($scope.searchQuery.indexOf("@")!=-1)
                    query = $scope.searchQuery.split("@")[1]

                var results =  instagram.users.get({user:"search",q:query}).$promise;
                results.then(function(data)
                {

                    $scope.feed = data

                    $scope.layout = "users"
                    $ionicScrollDelegate.scrollTop(0)
                    $scope.c.hideLoading()
                },function()
                {
                    $scope.feed = undefined
                    $scope.c.hideLoading()
                }).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete')
                })
            }
        }

        $scope.c.getUserInfo(function()
        {
            $scope.$watch("searchQuery",function(){
                $timeout.cancel($scope.delayedSearch)
                $scope.delayedSearch  = $timeout(function()
                {
                    if(profile.valid())
                    {
                        $scope.feed=undefined
                        $scope.c.showLoading()
                        $scope.fillFeed()
                    }
                },1000)
            })
        },false)

    })

    .controller('JoinedCtrl', function($scope,$stateParams,instagram,giveawayDecor,$timeout,$cordovaGoogleAnalytics ) {
        $cordovaGoogleAnalytics.trackView('Joined');
        $scope.layout = "posts"
        $scope.lazyTimout = 0
        $scope.c.showLoading()
        $scope.refreshJoin = function()
        {

            $scope.quantity = $scope.c.userInfo.data.participating
            for(var index in $scope.c.userInfo.data.participating)
            {
                instagram.media.get({action:$scope.c.userInfo.data.participating[index].media_id},(function(index) { return function(data)
                {
                    $scope.participating =$scope.participating || []
                    var fileredPost =  giveawayDecor.decoratePost(data.data)
                    data.data.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)

                    $scope.participating[index]=(data.data)
                }})(index))
            }
        }
        $scope.c.getUserInfo(function()
        {
            $scope.c.hideLoading()
            $scope.$watch("c.userInfo.data.participating",function()
            {
                if($scope.c.userInfo !=undefined && $scope.c.userInfo.data !=undefined && $scope.c.userInfo.data.participating.length!=0 && $scope.c.userInfo.data.participating!=$scope.quantity)
                {
                    $timeout.cancel($scope.lazyTimout)
                    $scope.lazyTimeout = $timeout($scope.refreshJoin,500)
                }
            },true)
        },false)




    })

    .controller('GiveAwayDetailCtrl', function($scope,server, $stateParams,giveaway,instagram,giveawayDecor,$ionicHistory,$interval,$cordovaGoogleAnalytics,$timeout,$ionicLoading ) {
        $cordovaGoogleAnalytics.trackView('Details');
        $scope.c.showLoading()
        $scope.loadingFadeIn = true
        $scope.refreshing = false
        $scope.showImg =function(src)
        {
            $ionicLoading.show({
                template: '<img src="'+src+'" style="width:100%;"  ng-click = hideImg() />',
                hideOnStateChange:true,
                scope:$scope

            });
        }
        $scope.hideImg =function(src)
        {
            $ionicLoading.hide();
        }
        $scope.refreshGiveaway = function()
        {
            if($scope.post==undefined || $scope.refreshing)
                return
            $scope.refreshing = true
            instagram.media.get({action:$scope.post.giveaway.media_id},function(post)
            {
                server.getGiveaway.get({HashtagID:$scope.post.giveaway.hashtag}).$promise.then(
                    function(giveaway)
                    {
                        $scope.refreshing = false
                        $scope.post = post.data
                        $scope.post.caption.text = $scope.c.getDesc($scope.post.caption.text)
                        $scope.post.giveaway=giveaway.data[0]
                        $scope.c.hideLoading()
                        $scope.loadingFadeIn = true
                        $scope.post.giveaway.type=giveawayDecor.getType($scope.post)
                        $scope.$broadcast('scroll.refreshComplete');
                    }
                    ,function(error)
                    {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.c.notifyErr(error.data.errorCode)
                        $ionicHistory.goBack()
                    })
            } ,function(error)
            {
                $scope.c.hideLoading()
                $scope.c.notifyErr(error.data.code || error.data.meta.code )
                $ionicHistory.goBack()
            })
        }
        $scope.loadGiveaway = function()
        {

            if(!$scope.loadingFadeIn)
            {
                $scope.$broadcast('scroll.refreshComplete');
                return
            }
            else
            {
                $scope.loadingFadeIn = false
            }
            $scope.c.getUserInfo(function()
            {

                $scope.initTimer = function()
                {
                    $scope.timeNow = (new Date()).getTime()/1000
                    var interval = $interval(function(){
                        $scope.timeNow = (new Date()).getTime()/1000

                        if($scope.post.giveaway.status=='active' && $scope.timeNow>$scope.post.giveaway.expiration_timestamp)
                        {
                            $scope.refreshGiveaway()
                        }
                    },1000)
                }
                $scope.initTimer()
                $scope.$broadcast('scroll.refreshComplete');
                instagram.media.get({action:giveaway.data[0].media_id},function(post)
                {
                    $scope.post = post.data
                    $scope.post.caption.text = $scope.c.getDesc($scope.post.caption.text)
                    $scope.post.giveaway=giveaway.data[0]
                    var img = new Image()
                    img.onload=function()
                    {
                        $scope.$apply(function()
                        {
                            $scope.c.hideLoading()
                            $scope.loadingFadeIn = true
                        })
                    }
                    img.src=$scope.post.images.standard_resolution.url
                } ,function(error)
                {
                    $scope.c.hideLoading()
                    $scope.c.notifyErr(error.data.code || error.data.meta.code )
                    $ionicHistory.goBack()
                })
            },false)

        }
        $scope.$watch("c.userInfo.data",function(){

            if($scope.c.userInfo !=undefined && $scope.c.userInfo.data !=undefined)
            {
                $timeout.cancel($scope.lazyTimeout)
                $scope.lazyTimeout =  $timeout($scope.refreshGiveaway,200)
            }
        },true)
        $scope.loadGiveaway()

        $scope.likePost = function()
        {
            if($scope.post.user_has_liked == true)
                return

            $scope.c.showLike();
            instagram.media.save({action:$scope.post.id,type:'likes'},{},function()
            {
                $scope.c.hideLike()
                $scope.post.user_has_liked = true
                $scope.post.likes.count++
            })
        }

    })

    .controller('MyGiveawaysCtrl', function($scope,instagram,giveawayDecor,$timeout,$cordovaGoogleAnalytics) {


        $cordovaGoogleAnalytics.trackView('Created');
        $scope.layout = "posts"
        $scope.lazyTimeout = 0
        $scope.c.showLoading()
        $scope.quantity = 0
        $scope.refreshMyWW = function()
        {
            $scope.quantity=$scope.c.userInfo.data.giveaways
            for(var index in $scope.c.userInfo.data.giveaways)
            {

                instagram.media.get({action:$scope.c.userInfo.data.giveaways[index].media_id},(function(index) { return function(data)
                {
                    $scope.giveaways =$scope.giveaways || []
                    var fileredPost =  giveawayDecor.decoratePost(data.data,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                    data.data.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)

                    $scope.giveaways[index] = (data.data)
                }})(index))
            }
        }
        $scope.c.getUserInfo(function()
        {
            $scope.c.hideLoading()
            $scope.$watch("c.userInfo.data.giveaways",function(){
                if($scope.c.userInfo !=undefined && $scope.c.userInfo.data !=undefined && $scope.c.userInfo.data.giveaways.length!=0 && $scope.quantity!=$scope.c.userInfo.data.giveaways)
                {
                    $timeout.cancel($scope.lazyTimeout)
                    $scope.lazyTimeout =  $timeout($scope.refreshMyWW,500)
                }
            },true)

        },false)

    })
    .controller('UserPostsCtrl', function($scope,$stateParams,instagram, $ionicScrollDelegate,$location,giveawayDecor,$cordovaGoogleAnalytics) {

        $cordovaGoogleAnalytics.trackView('UserFeed');
        $scope.layout="posts"
        $scope.c.showLoading()
        $scope.tab=$location.$$url.split("/")[2]
        $scope.c.getUserInfo(function()
        {


            var results = instagram.users.get({user:$stateParams.userid,action:"media",type:"recent"}).$promise
            results.then(function(data)
            {
                if(data.data.length==0)
                {
                    $scope.user = undefined
                    $scope.feed={}
                    $scope.feed.data=[]
                    $scope.c.hideLoading()
                    return
                }
                $scope.user = data.data[0].user
                data.data=data.data.filter(giveawayDecor.filterPosts)
                data.data.map(function(post)
                {
                    var fileredPost =  giveawayDecor.decoratePost(post,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                    post.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)
                })
                $scope.feed = data

                $ionicScrollDelegate.scrollTop(0)
                $scope.c.hideLoading()
            },function()
            {
                $scope.feed = undefined
                $scope.c.hideLoading()
            })
        },false)
    })
    .controller('CollectionCtrl', function($scope,collection,instagram,$ionicHistory ,giveawayDecor,$cordovaGoogleAnalytics ) {

        $cordovaGoogleAnalytics.trackView('Collection');
        $scope.c.showLoading()
        $scope.loadingFadeIn=false
        $scope.layout="posts"
        $scope.giveaways = []
        $scope.c.getUserInfo(function()
        {
            collection.$promise.then(function()
            {
                $scope.c.hideLoading()
                $scope.c.loadingFadeIn=true
                for(var key in collection.data)
                {
                    $scope.collectionName = key
                    $scope.$apply()
                    for(var index in collection.data[key])
                    {

                        var giveaway = collection.data[key][index]
                        instagram.media.get({action:giveaway.media_id},(function(index) { return function(data)
                        {
                            $scope.giveaways =$scope.giveaways || []
                            var fileredPost =  giveawayDecor.decoratePost(data.data,$scope.c.userInfo.data.giveaways,$scope.c.userInfo.data.participating)
                            data.data.giveawayHashtag = giveawayDecor.filterPosts(fileredPost)

                            $scope.giveaways[index]=(data.data)
                        }})(index),function(error)
                        {
                            //$scope.c.notifyErr(error.data.code || error.data.meta.code )
                        })
                    }

                    if(!collection.data[key].length)
                        $scope.giveaways =$scope.giveaways || []
                }
            },function(error)
            {
                $scope.c.hideLoading()
                $scope.c.notifyErr(error.data.errorCode)
                $ionicHistory.goBack()
            })
        },false)
    })

