//javascript singleton module pattern
var utils = (function() {

    //private interface
    //Declare your private members and functions here

    // caller ID is statically assigned by .NET API provider
    var CALLER_ID = '7daa046f-0b15-4343-8715-b9bbd76a0231';

    // map ID, statically assigned or??
    var MAP_ID = '12';
    var SERVER_URL = "http://demo.stolpjaktens.se/RESTService/FriskaService.ashx?";
    var NET_OPERATION_GET_USER_DATA = "GetUserData";

    var notTakenSticks;
    var takenSticks;
    var pendingSticks;

    function createURL(operation, xml) {
        return SERVER_URL + operation + "=" + window.btoa(xml);
    }
    //Asserts we have some sticks to work with.
    function assertSticksAvailable(taken, notTaken) {
        //If we don't have any sticks (taken or not taken) we will fail.
        if (typeof taken == "undefined" && typeof notTaken == "undefined") {
            throw NO_STICKS_EXCEPTION;
        }
    }




    return { // public interface

        assertDefined: function(value) {
            if (typeof value == "undefined") {
                throw utils.getCacheKeyNullException();
            }
        },
        decodeHTML: function(value) {
            return value.replace(/&apos;/g, "'")
                .replace(/&quot;/g, '"')
                .replace(/&gt;/g, '>')
                .replace(/&lt;/g, '<')
                .replace(/&amp;/g, '&');
        },
        encodeHTML: function(value) {
            return value.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        },
        complexAndUndefinedToEmptyString: function(what) {
            var retVal = "";
            if (typeof what != "undefined" && what.toString() != "[object Object]") {
                retVal = what;
            }
            return retVal;
        },
        setLastknownPosition: function(map) {
            try {
                var lat = e.latlng.lat,
                    lng = e.latlng.lng;
                var lastKnownZoomPosition = new Object();
                lastKnownZoomPosition.latitude = map.getCenter().lat;
                lastKnownZoomPosition.longitude = map.getCenter().lng;

                lastKnownZoomPosition.zoom = map.getZoom();
                localStorage.setItem(getZoomPositionKey(), JSON.stringify(lastKnownZoomPosition));
            } catch (err) {
                //Not a big deal
            }
            return JSON.parse(localStorage.getItem(getZoomPositionKey()));



        },
        getCredentialsXml: function() {

            return "<cre><cid>" + this.getCallerId() + "</cid><un>" + cache.get(cache.KEY_USERNAME) + "</un><pwd>" + cache.get(cache.KEY_PASSWORD) + "</pwd><mid>" + this.getMapId() + "</mid></cre>";
        },
        /**
         * Return the xml for adding one control 
         * 
         */
        getAddControlXml: function(id, code) {
            return "<ctrls><ctrl><cid>" + id + "</cid><cc>" + code + "</cc></ctrl></ctrls>";
        },
        getNetOperationGetUserData: function() {
            return NET_OPERATION_GET_USER_DATA;
        },
        getCallerId: function() {
            return CALLER_ID;
        },
        updateUserData: function(xmlData) {
            var json = $.xml2json(xmlData);
            //console.log(json);
            var notTaken = json.ntc.cc;
            var taken = json.tc.cc;
            assertSticksAvailable(taken, notTaken);
            cache.setJSONData(cache.KEY_TAKEN_STICKS_JSON, taken);
            cache.setJSONData(cache.KEY_NOT_TAKEN_STICKS_JSON, notTaken);
        },
        getMapId: function() {
            return MAP_ID;
        },
        getCacheKeyNullException: function() {
            //TODO, example, using get operation could replace message text to
            //allow multiple langues in errors.
            return CACHE_KEY_NULL_EXCEPTION;
        },

        // -- Sticks operations --
        // Class to represent a row in the stick  grid
        Stick: function(number, id, description, code) {
            var self = this;
            self.number = number;
            self.id = id;
            self.description = description;
            self.code = code;
            //TODO hack until we have coordinates from server.
            self.latitude = 59.37 + Math.random() / 20;
            self.longitude = 13.43 + Math.random() / 7;

        },
        StickHash: function(obj) {
            this.length = 0;
            this.items = {};
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    this.items[p] = obj[p];
                    this.length++;
                }
            }

            this.setItem = function(key, value) {
                var previous = undefined;
                if (this.hasItem(key)) {
                    previous = this.items[key];
                } else {
                    this.length++;
                }
                this.items[key] = value;
                return previous;
            }

            this.getItem = function(key) {
                return this.hasItem(key) ? this.items[key] : undefined;
            }

            this.hasItem = function(key) {
                return this.items.hasOwnProperty(key);
            }

            this.removeItem = function(key) {
                if (this.hasItem(key)) {
                    previous = this.items[key];
                    this.length--;
                    delete this.items[key];
                    return previous;
                } else {
                    return undefined;
                }
            }

            this.keys = function() {
                var keys = [];
                for (var k in this.items) {
                    if (this.hasItem(k)) {
                        keys.push(k);
                    }
                }
                return keys;
            }

            this.values = function() {
                var values = [];
                for (var k in this.items) {
                    if (this.hasItem(k)) {
                        values.push(this.items[k]);
                    }
                }
                return values;
            }

            this.each = function(fn) {
                for (var k in this.items) {
                    if (this.hasItem(k)) {
                        fn(k, this.items[k]);
                    }
                }
            }

            this.clear = function() {
                this.items = {}
                this.length = 0;
            }
        },
        getTakenSticks: function() {
            if (typeof takenSticks == "undefined") {
                takenSticks = this.getSticks(cache.KEY_TAKEN_STICKS_JSON);
            }
            return takenSticks;
        },
        getNotTakenSticks: function() {
            if (typeof notTakenSticks == "undefined") {
                notTakenSticks = this.getSticks(cache.KEY_NOT_TAKEN_STICKS_JSON);
            }
            return notTakenSticks;
        },
        warning: function(msg) {
            //        navigator.notification.alert(msg, null, ":(", "OK");
            return noty({
                layout: 'center',
                type: 'warning',
                text: msg,
                closeWith: ["button", "click"],
                buttons: [{
                    addClass: 'btn btn-primary',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                    }
                }]
            });
            //toastr.warning(msg);
        },
        error: function(msg) {
            //        navigator.notification.alert(msg, null, ";(", "OK");
            return noty({
                layout: 'center',
                type: 'error',
                text: msg,
                closeWith: ["button", "click"],
                buttons: [{
                    addClass: 'btn btn-primary',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                    }
                }]
            });
        },
        success: function(msg) {
            return noty({
                layout: 'center',
                type: 'notification',
                text: msg,
                buttons: [{
                    addClass: 'btn btn-primary',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                    }
                }]
            });;
        },
        successHref: function(msg, href) {
            return noty({
                layout: 'center',
                type: 'notification',
                text: msg,
                buttons: [{
                    addClass: 'btn btn-primary',
                    text: 'Kulturinfo',
                    onClick: function($noty) {
                        $noty.close();
                        window.location.href = href;
                    }
                }, {
                    addClass: 'btn btn-primary',
                    text: 'Ok',
                    onClick: function($noty) {
                        $noty.close();
                    }
                }]
            });;
        },
        serverSpinner: function(msg, show) {
            return noty({
                killer: 'true',
                layout: 'center',
                type: 'warning',
                text: msg,
                callback: {
                    onShow: show
                }
            });
        },

        logDebug: function(msg) {
            console.log(msg);
        },
        logout: function() {
            //Save some data that can be handy to keep until next login session
            var currentMap = getCurrentMap();
            var language = localStorage.getItem(getLanguageKey());
            var filter = getFilter()
            var cluster = getMarkerCluster();
            localStorage.clear(); //For security reasons (stored passwords) we really log user out.
            try {
                localStorage.setItem(getLanguageKey(), language);
                localStorage.setItem(getCurrentMapKey(), JSON.stringify(currentMap));
                localStorage.setItem(getFilterOnKey(), filter);
                localStorage.setItem(getMarkerClusterOnKey(), cluster);
            } catch (err) {
                console.log(err);
            } finally {
                window.location.href = '#user/login';
            }
        },



        getPendingSticks: function() {
            var pendingSticks;
            try {
                pendingSticks = JSON.parse(localStorage.getItem(getPendingSticksKey()));
                //console.log('We got: ' + pendingSticks);
            } catch (err) {
                console.log("Error is: " + err);
            }
            if (pendingSticks == null) {
                pendingSticks = [];
            }
            if (Object.prototype.toString.call(pendingSticks) != '[object Array]') {
                var tmp = new Array();
                tmp.push(pendingSticks);
                pendingSticks = tmp;
            }
            //console.log('We got: ' + pendingSticks);
            return pendingSticks;

        },
        toArray: function(maybeArray) {
            if (Object.prototype.toString.call(maybeArray) != '[object Array]') {
                var tmp = new Array();
                tmp.push(maybeArray);
                maybeArray = tmp;
            }
            return maybeArray;
        },
        formatDate: function(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var seconds = date.getSeconds();
            seconds = seconds < 10 ? '0' + seconds : seconds;
            var strTime = hours + ':' + minutes + ':' + seconds;
            var month = parseInt(date.getMonth()) + 1;
            month = month < 10 ? '0' + month : month;
            return date.getFullYear() + '-' + month + '-' + date.getDate() + ' ' + strTime;
        },
        // -- QR scan operations --
        QRData: function(id, code) {
            this.id = id;
            this.code = code;
        },
        decodeQRText: function(qrText) {
            //Remove all non-digits, leaving only digits left
            var id = qrText.replace(/\D/g, "");
            //Remove all digits, leaving "the rest"
            var code = qrText.replace(/[0-9]/g, "");
            //console.log("complete: " + qrText + "id: " + id + " code: " + code);
            return new this.QRData(id, code);
        },

        updateStorageAfterRegistration: function(attemptedRegistration) {


            if (attemptedRegistration.success === false) {
                var pendingSticks = this.getPendingSticks();
                pendingSticks.push(attemptedRegistration);
                localStorage.setItem(getPendingSticksKey(), JSON.stringify(pendingSticks));
                //OFFLINE scenario
                //TODO, add to a list of pending registrations and let online checker trigger
                // re-posting of these when back online.
            } else {
                //ONLINE, success scenario

                //First update user data structure
                var user = JSON.parse(localStorage.getItem(getUserKey()));
                var takenSticks;
                try {
                    takenSticks = JSON.parse(localStorage.getItem(getUserKey())).tc.cc;
                } catch (err) {
                    console.log("Error is: " + err);
                    takenSticks = [];
                }
                if (Object.prototype.toString.call(takenSticks) != '[object Array]') {
                    var tmp = new Array();
                    tmp[0] = takenSticks;
                    takenSticks = tmp;
                }
                takenSticks.push(attemptedRegistration);
                user.tc.cc = takenSticks;

                localStorage.setItem(getUserKey(), JSON.stringify(user));
                //Next update the sticks structure
                var sticks = JSON.parse(localStorage.getItem(getSticksKey()));
                for (var i = 0; i < sticks.length; i++) {
                    if (sticks[i].id == attemptedRegistration.id) {
                        sticks[i].taken = true;
                        break;
                    }

                }
                localStorage.setItem(getSticksKey(), JSON.stringify(sticks));
            }


        },
        postCourseResult: function () {

          var attemptedRegistration = new CourseControlsRegistration(getCourseProgress().takenSticks);
          var netResult = net.addCourseControls(getNetCredentials(), attemptedRegistration);
          var done = false;
          if (netResult.success && netResult.result.finishedok == 1 ) {
              done = true;
          }
          var id = setInterval(doPost, 5000);
          function doPost() {
            if (done == true) {
              clearInterval(id);
              clearCourseProgress();
            } else {
                var netResult = net.addCourseControls(getNetCredentials(), attemptedRegistration);
                if (netResult.success && netResult.result.finishedok == 1 ) {
                  done = true;
                  clearCourseProgress();
                }
            }
          }
        },
        scanCourse: function(callback) {
            QRScanner.scan(displayContents);

            function displayContents(err, text){
              if(err){
                // an error occurred, or the scan was canceled (error code `6`)
                alert("err: " + err);
              } else {
                // The scan completed, display the contents of the QR code:
                alert("text: " + text);
              }
            }
            QRScanner.show();
        },
        scanCourseOld: function(callback) {

            var debug = false;
            if (debug) {

                var next = getNextCourseControl();
                next.timestamp = Date.now();
                next.registrationdate = utils.formatDate(new Date(next.timestamp));
                var progress = getCourseProgress();
                progress.takenSticks.push(next);
                setCourseProgress(progress);
                if (next.ig == 1) {

                    try {
                        var elapsedTime = Date.now() - getCourseProgress().takenSticks[0].timestamp;
                        var seconds = parseInt((elapsedTime / 1000) % 60);
                        var minutes = parseInt(((elapsedTime / (1000*60)) % 60));
                        var hours   = parseInt(((elapsedTime / (1000*60*60)) % 24));

                        if (hours < 9) {
                            hours = '0' + hours;
                        }
                        if (minutes < 9) {
                            minutes = '0' + minutes;
                        }
                        if (seconds < 9) {
                            seconds = '0' + seconds;
                        }
                        var timeString = hours + ':' + minutes + ':' + seconds;
                        utils.postCourseResult();
                        utils.success(I18n.t('views.map.marker.registercoursegoal') + '\n' + timeString);
                    } catch (err) {
                        alert(err)
                    }
                }
                return;

            }
            var self = this;
            self.callback = callback;
            //alert(JSON.stringify(getNextCourseControl()));
            cordova.plugins.barcodeScanner.scan(function(result) {
                if (result.cancelled) {
                    // Scanning was cancelled, do nothing.
                    alert("cancelled: " + result);
                } else {
                    var nextCourseControl = getNextCourseControl();

                    var data = self.decodeQRText(result.text);
                    if (data.id == nextCourseControl.mi) {

                        if (nextCourseControl.is == 1) {
                            self.success(I18n.t('views.map.marker.registercoursestart'));
                        } else if (nextCourseControl.ig == 1) {
                            var elapsedTime = Date.now() - getCourseProgress().takenSticks[0].timestamp;
                            var seconds = parseInt((elapsedTime / 1000) % 60);
                            var minutes = parseInt(((elapsedTime / (1000*60)) % 60));
                            var hours   = parseInt(((elapsedTime / (1000*60*60)) % 24));

                            if (hours < 9) {
                                hours = '0' + hours;
                            }
                            if (minutes < 9) {
                                minutes = '0' + minutes;
                            }
                            if (seconds < 9) {
                                seconds = '0' + seconds;
                            }
                            var timeString = hours + ':' + minutes + ':' + seconds;
                            utils.postCourseResult();
                            utils.success(I18n.t('views.map.marker.registercoursegoal') + '\n' + timeString);
                        } else {
                            self.success(I18n.t('views.map.marker.registersuccess'));
                        }

                        try {
                            nextCourseControl.timestamp = Date.now();
                            nextCourseControl.registrationdate = utils.formatDate(new Date(nextCourseControl.timestamp));
                            var progress = getCourseProgress();
                            progress.takenSticks.push(nextCourseControl);
                            setCourseProgress(progress);
                        } catch (err) {
                            self.error(I18n.t('views.map.marker.registerfail'));
                        }
                    }else {
                        self.error(I18n.t('views.map.marker.registerfail'));
                    }
                    if (self.callback != null) {
                        self.callback.render();
                    }
                }
            }, function(error) {
                alert("error" + error);//console.log("Scanning failed: ", error);
            });
        },
        scan: function(callback) {
            var self = this;
            self.callback = callback;

            cordova.plugins.barcodeScanner.scan(function(result) {

                if (result.cancelled) {
                    // Scanning was cancelled, do nothing.
                } else {
                    var data = self.decodeQRText(result.text);
                    var sticks = JSON.parse(localStorage.getItem(getSticksKey()));
                    var foundScannedStick = false;
                    for (var i = 0; i < sticks.length; i++) {
                        if (sticks[i].number == data.id) {
                            foundScannedStick = true;
                            var attempedRegistration = new ControlRegistration(sticks[i].id, data.code);
                            var key = getLastAttemptedRegistrationKey();
                            var result = net.addControl(getNetCredentials(), attempedRegistration);

                            if (!result.success) {
                                if (result.alreadyTaken == true) {
                                    self.warning(I18n.t('views.map.marker.registerduplicate'));
                                } else {
                                    if (net.isOnline() == false) {
                                        attempedRegistration.success = false;
                                        localStorage.setItem(key, JSON.stringify(attempedRegistration));
                                        self.updateStorageAfterRegistration(attempedRegistration);
                                        self.warning(I18n.t('views.map.marker.registerfailoffline'));
                                    } else {
                                        self.error(I18n.t('views.map.marker.registerfail'));
                                    }
                                }
                            } else {
                                sticks[i].taken = true;
                                localStorage.setItem(getSelectedMarkerKey(), JSON.stringify(sticks[i]));
                                localStorage.setItem(getSticksKey(), JSON.stringify(sticks));
                                attempedRegistration.success = true;
                                localStorage.setItem(key, JSON.stringify(attempedRegistration));
                                self.updateStorageAfterRegistration(attempedRegistration);
                                if (typeof sticks[i].culture != "undefined") {
                                    self.successHref(I18n.t('views.map.marker.registersuccess'), "#/maps/" + getCurrentMapId() + "/" + sticks[i].number);
                                } else {
                                    self.success(I18n.t('views.map.marker.registersuccess'));
                                }
                                break;
                            }
                        }
                    }
                    if (foundScannedStick == false) {
                        self.error(I18n.t('views.map.marker.registerfail'));
                    }
                    if (self.callback != null) {
                        self.callback.render();
                    }
                }


            }, function(error) {
                alert("error2 " + error);//console.log("Scanning failed: ", error);
            });
        }



    };
})();