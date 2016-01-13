angular.module('miticasFitness.services', [])
  .constant('API_BASE_END_POINT','http://fxhernandez.com.ar/sitios/entrenate/aplicacion/mobile/api')
  .constant('SERVER_URL','http://fxhernandez.com.ar/sitios/entrenate/aplicacion')
  .constant('SENDER_ID','986090601276')
  .constant('GCM_API_KEY','AIzaSyCs9Z14w-KS0_HyXxX9ClXsV1puMlB925Y')
.service('sessionService', ['$cookieStore', function ($cookieStore) {
    var localStoreAvailable = typeof (Storage) !== "undefined";
    console.log(localStoreAvailable);
    this.store = function (name, details) {
        if (localStoreAvailable) {
            if (angular.isUndefined(details)) {
                details = null;
            } else if (angular.isObject(details) || angular.isArray(details) || angular.isNumber(+details || details)) {
                details = angular.toJson(details);
            };
            sessionStorage.setItem(name, details);
        } else {
            $cookieStore.put(name, details);
        };
    };

    this.persist = function(name, details) {
        console.log(details);
        if (localStoreAvailable) {
            if (angular.isUndefined(details)) {
                details = null;
            } else if (angular.isObject(details) || angular.isArray(details) || angular.isNumber(+details || details)) {
                details = angular.toJson(details);
            };
            localStorage.setItem(name, details);
        } else {
            $cookieStore.put(name, details);
        }
    };

    this.get = function (name) {        
        if (localStoreAvailable) {
            return getItem(name);
        } else {
            return $cookieStore.get(name);
        }
    };

    this.destroy = function (name) {
        if (localStoreAvailable) {
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
        } else {
            $cookieStore.remove(name);
        };
    };

    var getItem = function (name) {
        var data;
        var localData = localStorage.getItem(name);
        var sessionData = sessionStorage.getItem(name);

        if (sessionData) {
            data = sessionData;
        } else if (localData) {
            data = localData;
        } else {
            return null;
        }

        if (data === '[object Object]') { return null; };
        if (!data.length || data === 'null') { return null; };
        console.log(data);
        if (data.charAt(0) === "{" || data.charAt(0) === "[" || angular.isNumber(data)) {
            return angular.fromJson(data);
        };

        return data;
    };

    return this;
}])
.factory("auth", function($rootScope,sessionService,$state,$location,$http,GCMRegistrationService,API_BASE_END_POINT,SERVER_URL)
{
    var api_url = "http://www.fxhernandez.com.ar/sitios/entrenate/aplicacion/mobile/api/";
    
    return{
        login : function(mail, password)
        {            
            var config = {
                method: 'POST',
                url: API_BASE_END_POINT+'/login.php',        
                data: { mail: mail, pass: password },
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
            };
            //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
            $http(config)
                .success(function(res){
                    if (res.success){
						console.log(res.data);
                        sessionService.persist('mail',res.data.mail);
                        sessionService.persist('edad',res.data.edad);
                        sessionService.persist('nombre',res.data.nombre);
                        sessionService.persist('id_usuario',res.data.id_usuario);
                        sessionService.persist('avatar',SERVER_URL + '/img/avatars/' + res.data.url_avatar);
                        console.log(res.data);
                        console.log(sessionService.get('id_usuario'));
						GCMRegistrationService.registerOnGCM();
                        $rootScope.$broadcast('login.successful');
                    }else{
                        $rootScope.$broadcast('login.failed');
                    }
                }).error(function(error){
                    console.warn(error);
                    $rootScope.$broadcast('login.failed');
                });
            
            //mandamos a la home
            
            //$state.go('appLog.search');
        },
        logout : function()
        {
            //al hacer logout eliminamos la session
            sessionService.destroy("mail"),
            sessionService.destroy("nombre"),
            sessionService.destroy("edad"),            
            GCMRegistrationService.unRegisterOnGCM(sessionService.get("id_usuario"));
			sessionService.destroy("id_usuario"),
            //si tenemos cookies, las eliminamos  con $cookieStore.remove
            //$cookieStore.remove("password");
            //mandamos al login
            $rootScope.$broadcast('logout.successful');
             //$state.go('appNoLog.login');
        },
        checkStatus : function($url_path)
        {
            
            console.log($url_path);
            var user = sessionService.get("id_usuario");
            console.log(typeof(sessionService.get("id_usuario")));
            //creamos un array con las rutas que queremos controlar
            var rutasPrivadas = ["appLog.search"];
            var rutasDeslog = ["appNoLog.login","appNoLog.register"];
            console.log(rutasPrivadas);
            console.log(this.in_array($url_path,rutasPrivadas) + " && " + user);
            if(this.in_array($url_path,rutasPrivadas) && sessionService.get("id_usuario") == null)
            {
                console.log("asdasd");
                $state.go('appNoLog.login',{nocheck:1});
            }
            //en el caso de que intente acceder al login y ya haya iniciado sesión lo mandamos a la home
            if(this.in_array("appNoLog.login",rutasDeslog) && sessionService.get("id_usuario") != null)
            {
                console.log("zxcasd");
                $state.go('appLog.search');
            }
            
            console.log("no hace nada");
        },
        in_array : function(needle, haystack)
        {
            var key = '';
            for(key in haystack)
            {
                if(haystack[key] == needle)
                {
                    return true;
                }
            }
            return false;
        }
    }
})
.service('goBackMany',function($ionicHistory){
  return function(depth){
    // get the right history stack based on the current view
    var historyId = $ionicHistory.currentHistoryId();
    var history = $ionicHistory.viewHistory().histories[historyId];
    // set the view 'depth' back in the stack as the back view
    var targetViewIndex = history.stack.length - 1 - depth;
    $ionicHistory.backView(history.stack[targetViewIndex]);
    // navigate to it
	console.log(history.stack[targetViewIndex]);
    $ionicHistory.goBack();
  }
})
.service('returnToState', function($ionicHistory){
  return function(stateName){
    var historyId = $ionicHistory.currentHistoryId();
    var history = $ionicHistory.viewHistory().histories[historyId];
    for (var i = history.stack.length - 1; i >= 0; i--){
      if (history.stack[i].stateName == stateName){
        $ionicHistory.backView(history.stack[i]);
        $ionicHistory.goBack();
      }
    }
  }
})
.factory('ResumenDiario',function($http,sessionService,$q,API_BASE_END_POINT){
    var self = this;
    var api_url = "http://www.fxhernandez.com.ar/sitios/entrenate/aplicacion/mobile/api/";
    
    self.getDataByDate = function(fecha){
        
        var q = $q.defer();
        var user_id = sessionService.get('id_usuario');
        console.log(parseInt(user_id,10));
        console.log("pancho");
        var config = {
            method: 'POST',
            url: API_BASE_END_POINT+'/getDataSemana.php',        
            data: { 
                ft: fecha,
                id_usuario: user_id
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
            .success(function(res){
                if (res.success){
                    
                    q.resolve(res.data);
                    
                    
                }
            }).error(function(error){
                q.reject(error);
                console.warn(error);                
            });
        return q.promise;
    };
    
    return self;
})
.factory('Actividades',function($http,sessionService,$q,API_BASE_END_POINT){
    var self = this;
    var api_url = "http://www.fxhernandez.com.ar/sitios/entrenate/aplicacion/mobile/api/actividades/";
    
    self.getDataByDate = function(fecha){
        
        var q = $q.defer();
        var user_id = sessionService.get('id_usuario');
        console.log(parseInt(user_id,10));
        console.log("pancho");
        var config = {
            method: 'POST',
            url: API_BASE_END_POINT+'/actividades/getListActividades.php',        
            data: { 
                ft: fecha,
                id_usuario: user_id
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
            .success(function(res){
                if (res.success){
                    
                    q.resolve(res.data);
                    
                    
                }
            }).error(function(error){
                q.reject(error);
                console.warn(error);                
            });
        return q.promise;
    };
    self.getActividad = function(id){
        
        var q = $q.defer();
        
        var config = {
            method: 'POST',
            url: API_BASE_END_POINT+'/actividades/getActividad.php',        
            data: { 
                id_actividad: id
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
		  .success(function(res){
			if (res.success){
			  q.resolve(res.data);
			}
		  }).error(function(error){
			q.reject(error);
			console.warn(error);                
		  });
        return q.promise;
    };
    self.addActividad = function(id, minutes){
        
        var q = $q.defer();
		
		var user_id = sessionService.get('id_usuario');
		var activityDate = sessionService.get('activityDate');
		console.log(activityDate);
        
        var config = {
            method: 'POST',
            url:API_BASE_END_POINT+'/actividades/addActividad.php',        
            data: { 
				id_usuario: user_id,
				id_actividad: id,
				ft: activityDate,
                minutes: minutes
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
		  .success(function(res){
			if (res.success){
			  q.resolve(res.data);
			}
		  }).error(function(error){
			q.reject(error);
			console.warn(error);                
		  });
        return q.promise;
    };
    self.borrarActividad = function(id){
        
        var q = $q.defer();
        var user_id = sessionService.get('id_usuario');
        console.log(parseInt(user_id,10));
        console.log("pancho");
        var config = {
            method: 'POST',
            url: API_BASE_END_POINT+'/actividades/deleteActividad.php',        
            data: {                 
                id_usuario: user_id,
                id: id
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
            .success(function(res){
                if (res.success){                    
                    q.resolve(res.data);
                }else{
                    q.reject(res);
                }
            }).error(function(error){
                q.reject(error);                
            });
        return q.promise;
    };
    self.buscarDato = function(text){
        
        var q = $q.defer();
        var user_id = sessionService.get('id_usuario');
		var user_age = sessionService.get('edad');
        console.log(parseInt(user_id,10));
        console.log(parseInt(user_age,10));
        var config = {
            method: 'POST',
            url: API_BASE_END_POINT+'/actividades/buscar_datos.php',        
            data: {                 
                id_usuario: user_id,
				tabla: 'actividades',
				edad: user_age,
                termino: text
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
            .success(function(res){
                if (res.success){                    
                    q.resolve(res.data);
                }else{
                    q.reject(res);
                }
            }).error(function(error){
                q.reject(error);                
            });
        return q.promise;
    };
    
    return self;
})
.factory('Consejos',function($http,$q,API_BASE_END_POINT){
    var self = this;    
    
    self.getConsejoActividad = function(){
        
        var q = $q.defer();
        //var user_id = sessionService.get('id_usuario');
        //console.log(parseInt(user_id,10));
        console.log("pancho");
        var config = {
            method: 'POST',
            url: API_BASE_END_POINT+'/consejos/getConsejo.php',        
            data: {                 
                type: 'actividad'
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
            .success(function(res){
                if (res.success){
                    console.log(res.data);
                    q.resolve(res.data);
                    
                    
                }
            }).error(function(error){
                q.reject(error);
                console.warn(error);                
            });
        return q.promise;
    };
    
    return self;
})
.factory('Comidas',function($http,sessionService,$q,API_BASE_END_POINT){
    var self = this;
    var api_url = "http://www.fxhernandez.com.ar/sitios/entrenate/aplicacion/mobile/api/comidas/";
    
    self.getDataByDate = function(fecha){
        
        var q = $q.defer();
        var user_id = sessionService.get('id_usuario');
        console.log(parseInt(user_id,10));
        console.log("pancho");
        var config = {
            method: 'POST',
            url: API_BASE_END_POINT+'/comidas/getListComidas.php',        
            data: { 
                ft: fecha,
                id_usuario: user_id
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
            .success(function(res){
                if (res.success){
                    
                    q.resolve(res.data);
                    
                    
                }
            }).error(function(error){
                q.reject(error);
                console.warn(error);                
            });
        return q.promise;
    };
    self.getComida = function(id){
        
        var q = $q.defer();
        
        var config = {
            method: 'POST',
            url: api_url+'getComida.php',        
            data: { 
                id_comida: id
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
		  .success(function(res){
			if (res.success){
			  q.resolve(res.data);
			}
		  }).error(function(error){
			q.reject(error);
			console.warn(error);                
		  });
        return q.promise;
    };
    self.addComida = function(id, id_meta, cant, periodo){
        
        var q = $q.defer();
		
		var user_id = sessionService.get('id_usuario');
		var activityDate = sessionService.get('activityDate');
		console.log(activityDate);
        
        var config = {
            method: 'POST',
            url: api_url+'addComida.php',        
            data: { 
				id_usuario: user_id,
				id_comida: id,
				id_comida_meta: id_meta,
				fecha: activityDate,
                cant: cant,
                periodo: periodo
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
		  .success(function(res){
			if (res.success){
			  q.resolve(res.data);
			}
		  }).error(function(error){
			q.reject(error);
			console.warn(error);                
		  });
        return q.promise;
    };
    self.borrarComida = function(id){
        
        var q = $q.defer();
        var user_id = sessionService.get('id_usuario');
        console.log(parseInt(user_id,10));
        console.log("pancho");
        var config = {
            method: 'POST',
            url: api_url+'deleteComida.php',        
            data: {                 
                id_usuario: user_id,
                id: id
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
            .success(function(res){
                if (res.success){                    
                    q.resolve(res.data);
                }else{
                    q.reject(res);
                }
            }).error(function(error){
                q.reject(error);                
            });
        return q.promise;
    };
    self.buscarDato = function(text){
        
        var q = $q.defer();
        var user_id = sessionService.get('id_usuario');
		var user_age = sessionService.get('edad');
        console.log(parseInt(user_id,10));
        console.log(parseInt(user_age,10));
        var config = {
            method: 'POST',
            url: api_url+'buscar_datos.php',        
            data: {                 
                id_usuario: user_id,
				tabla: 'comidas',
				edad: user_age,
                termino: text
            },
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}           
        };
        //llamamos a login.php para verificar usuario y contraseña y guardar variables de sesion
        $http(config)
            .success(function(res){
                if (res.success){                    
                    q.resolve(res.data);
                }else{
                    q.reject(res);
                }
            }).error(function(error){
                q.reject(error);                
            });
        return q.promise;
    };
    
    return self;
})
.factory('NotificationService', function($http, $ionicPopup, StatusHandler, sessionService, API_BASE_END_POINT) {

    var deviceRegistrationId;
    function registerOn3rdPartyServer(registrationId) {
        deviceRegistrationId = registrationId;
		var user_id = sessionService.get('id_usuario');
        try {
            $http({
                method: 'POST',
                url: API_BASE_END_POINT + '/notifications/register.php', /* See /www/js/configuration.js */
                data: {
				  registrationId: registrationId,
				  user_id: parseInt(user_id,10)
				  },
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                }
            }).success(function() {
                StatusHandler.readyForNotifications();
            }).error(function(e) {
                StatusHandler.notReadyForNotifications();
            });
        } catch (e) {
            alert('http error ' + e);
        }
    }
	
	function unRegisterOn3rdPartyServer(user_id) {
        
		var registrationId = sessionService.get('registration_id');
		
        try {
            $http({
                method: 'POST',
                url: API_BASE_END_POINT + '/notifications/unregister.php', /* See /www/js/configuration.js */
                data: {				  
				  user_id: parseInt(user_id,10),
				  registration_id: registrationId
				  },
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                }
            }).success(function() {
			  StatusHandler.notReadyForNotifications();                
            }).error(function(e) {
			  StatusHandler.readyForNotifications();
                
            });
        } catch (e) {
            alert('http error ' + e);
        }
    }

    function showNotificationPopup(e) {
        var appStatus = 'Background';
        if (e.foreground) {
            appStatus = 'Foreground';
        } else if (e.coldstart) {
            appStatus = 'Coldstart';
        }
        $ionicPopup.alert({
            title: e.payload.title,
            subTitle: appStatus,
            template: e.payload.message
        });
    }

    function sendNotification() {
        $http({
            method: 'POST',
            url: API_BASE_END_POINT + '/notifications/send.php', /* See /www/js/configuration.js */
            data: {
                "badge": 1,
                "title": "Congratulations!!!",
                "message": "Your notification was successfully sent by Google Cloud Messaging and your 3rd party server!!!",
                "registrationIdsToSend": [deviceRegistrationId]
            },
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function() {
            //TODO!!!
        }).error(function(e) {
            alert("Error sending notification " + e);
        });
    }
  
    return {
        handleNotification: function(e) {
			console.log(e);
            switch (e.event) {
                case 'registered':
                    if (e.regid.length > 0) {
						sessionService.persist('registration_id',e.regid);
                        registerOn3rdPartyServer(e.regid);
                    }
                    break;

                case 'message':
                    showNotificationPopup(e);
                    break;

                case 'error':
                    alert('GCM error = ' + e.msg);
                    break;

                default:
                    alert('An unknown GCM event has occurred');
                    break;
            }

        },
        sendNotification: sendNotification,
		unRegisterOn3rdPartyServer: unRegisterOn3rdPartyServer
    };

})
.factory('GCMRegistrationService', function(SENDER_ID,NotificationService) {
	console.log(window);
	console.log(navigator);
    var pushNotification = window.plugins.pushNotification;
    var isAndroidDevice = function() {
        var platform = device.platform;
        return platform === 'android' || platform === 'Android';
    };

    return {
		isAndroidDevice: isAndroidDevice,
        registerOnGCM: function() {
            if (isAndroidDevice()) {
                pushNotification.register(function(result) {
                    console.log(result);
                }, function() {
                    alert('Error registering device on GCM ');
                }, {
                    "senderID": SENDER_ID, /* Your Google Developers Console Project Number. See /www/js/configuration.js  */
                    "ecb": "onNotificationGCMEvent" /* index.html function name*/
                });
            } else {
                alert('Your device platform is not Android!!!');
            }

        },
		unRegisterOnGCM: function(user_id) {
            if (isAndroidDevice()) {
                pushNotification.unregister(function(result) {
				  NotificationService.unRegisterOn3rdPartyServer(user_id);
                    console.log(result);
                }, function() {
                    alert('Error registering device on GCM ');
                });
            } else {
                alert('Your device platform is not Android!!!');
            }

        }
    };
})
.factory('StatusHandler', function($rootScope, $ionicPopup) {
    var ICON_LOADING = 'ion-loading-b';
    var ICON_OK = 'ion-checkmark-circled balanced';
    var ICON_ERROR = 'ion-close-circled assertive';
    var loading = function() {
        $rootScope.status = {
            'style': 'stable',
            'text': 'LOADING...',
            'networkicon': ICON_LOADING,
            'thirddpartyservericon': ICON_LOADING,
            'button': {
                'disabled': 'disabled',
                'style': 'button-light'
            }
        };
    };

    var online = function() {
        $rootScope.status = {
            'style': 'calm',
            'text': 'ONLINE',
            'networkicon': ICON_OK,
            'thirddpartyservericon': ICON_LOADING,
            'disabled': 'false',
            'button': {
                'disabled': 'disabled',
                'style': 'button-light'
            }
        };
    };

    var offline = function() {
        $rootScope.$apply(function() {
            $rootScope.status = {
                'style': 'assertive',
                'text': 'OFFLINE',
                'networkicon': ICON_ERROR,
                'thirddpartyservericon': ICON_ERROR,
                'disabled': 'false',
                'button': {
                    'disabled': 'disabled',
                    'style': 'button-light'
                }
            };
        });
    };

    var readyForNotifications = function() {
        $rootScope.status = {
            'style': 'balanced',
            'text': 'READY FOR NOTIFICATIONS',
            'networkicon': ICON_OK,
            'thirddpartyservericon': ICON_OK,
            'disabled': 'false',
            'button': {
                'disabled': 'button-positive'
            }
        };
    };

    var notReadyForNotifications = function() {
        $rootScope.status = {
            'style': 'assertive',
            'text': '3rd PARTY SERVER ERROR',
            'networkicon': ICON_OK,
            'thirddpartyservericon': ICON_ERROR,
            'disabled': 'false',
            'button': {
                'disabled': 'disabled',
                'style': 'button-light'
            }
        };
        $ionicPopup.alert({
            title: 'ERROR!!!',
            subTitle: 'Unable to connect to 3rd party server',
            template: 'Unable to connecto to 3rd party server.<br/>Please, review your server connection.<br/>See /www/js/configuration.js file'
        });
    };

    return {
        loading: loading,
        online: online,
        offline: offline,
        readyForNotifications: readyForNotifications,
        notReadyForNotifications: notReadyForNotifications
    };

})
.factory('DBA', function($cordovaSQLite, $q, $ionicPlatform) {
  var self = this;
 
  // Handle query's and potential errors
  self.query = function (query, parameters) {
    parameters = parameters || [];
    var q = $q.defer();    
    $ionicPlatform.ready(function () {
      $cordovaSQLite.execute(db, query, parameters)
        .then(function (result) {            
          q.resolve(result);
        }, function (error) {          
          q.reject(error);
        });
    });
    return q.promise;
  }

  /* Return error message in a defferred object*/
  self.sendError = function (message) {
    var q = $q.defer();
    q.reject(message);    
    return q.promise;
  }
 
  // Proces a result set
  self.getAll = function(result) {
    var output = [];
    var q = $q.defer()
 
    for (var i = 0; i < result.rows.length; i++) {
      output.push(result.rows.item(i));
    }
    
    q.resolve(output);    
    return q.promise;
  }
 
  // Proces a single result
  self.getById = function(result) {
    var output = null;
    output = angular.copy(result.rows.item(0));
    return output;
  }
 
  return self;
})
.factory('Logs', function($cordovaSQLite, $q, DBA) {
  var self = this;
 
  self.all = function() {
    return DBA.query("SELECT * FROM log")
      .then(function(result){      
        return DBA.getAll(result);
      });
  }
  
  self.allForExport = function() {
    var q = $q.defer();

    DBA.query("SELECT * FROM log")
      .then(function(data){      
        var records = "";
        records += "--log\r\n";   
        for(var i = 0; i< data.rows.length; i++){                                
            records += "('" + data.rows.item(i).fecha_entrada + "',";
            records += "'" + data.rows.item(i).fecha_salida + "',";
            records += data.rows.item(i).estado + ",";
            records += data.rows.item(i).vela + ",";
            records += "'" + data.rows.item(i).nombre + "',";
            records += "'" + data.rows.item(i).club + "',";
            records += "'" + data.rows.item(i).clase + "'" ;
            records += "),\r\n";                          
        }
        q.resolve(records); 
    });

    return q.promise;
  };
 
  self.get = function(vela) {
    var parameters = [vela];
    return DBA.query("SELECT * FROM log_vw WHERE vela = (?)", parameters)
      .then(function(result) {
        return DBA.getById(result);
      });
  }

  self.getByVelaAndState = function(vela,estado) {
      var parameters = [vela,estado];
      return DBA.query("SELECT * FROM log WHERE vela = (?) and estado = (?)", parameters)
        .then(function(result) {
          return DBA.getById(result);
        });
    }
 
  self.add = function(log) {

    var parameters = [0,log.vela,log.nombre,log.club,log.clase];
    /* valido que no este al momento de agregarlo, para evitar duplicados */
    return self.getByVelaAndState(log.vela,0).then(
        function(result){
            /* si result no trae nada, puede continuar con el proceso de insertion*/
            if (result === undefined){
                return DBA.query("INSERT INTO log (fecha_entrada,estado,vela,nombre,club,clase) VALUES (current_timestamp,?,?,?,?,?)", parameters);
            }else{
                return DBA.sendError("Ya se hizo checkout del participante");
            }
        }
    );
  }
 
  self.remove = function(log) {
    var parameters = [log.id];
    return DBA.query("DELETE FROM log WHERE id = (?)", parameters);
  }
 
  self.update = function(log) {
    var parameters = [1, log.vela];
    return DBA.query("UPDATE log SET fecha_salida = current_timestamp, estado = ? WHERE vela = ? and estado = 0", parameters);
  }
 
  return self;
})
.factory('Config', function(DBA, $rootScope) {    
  var self = this;
 
  self.all = function() {
    return DBA.query("SELECT * FROM options")
      .then(function(result){      
        return DBA.getAll(result);
      });
  }
 
  self.get = function(meta) {
    var parameters = [meta];
    return DBA.query("SELECT * FROM options WHERE meta_name = (?)", parameters)
      .then(function(result) {
        return DBA.getById(result);
      });
  } 
   
  self.remove = function(meta) {
    var parameters = [meta];
    return DBA.query("DELETE FROM options WHERE meta_name = (?)", parameters);
  };
 
  self.update = function(meta,value) {
    var parameters = [value,meta];
    return DBA.query("UPDATE options SET bool_value = (?) WHERE meta_name = (?) ", parameters)
            .then(function(result){
                $rootScope.$broadcast('securityCheck.change',result);
            });
  };
 
  return self;
    
})
.factory('Messages', function($ionicPopup) {
  // Might use a resource here that returns a JSON array

  return {
    alert: function(title,template,okType,cssClass,okText) {
        title = (title == '' || title == undefined) ? 'Alerta' : title;
        cssClass = (cssClass == '' || cssClass == undefined) ? 'balanced-popup' : cssClass;
        okText = (okText == '' || okText == undefined) ? 'Aceptar' : okText;
        okType = (okType == '' || okType == undefined) ? 'button-balanced' : okType;
        template = (template == '' || template == undefined) ? '' : template;
        
        $ionicPopup.alert({
                title: title,
                cssClass: cssClass,
                okText: okText,
                okType: okType,
                template: template
            });
    },
    confirm: function(title,template,cssClass,okText,okType,cancelText,cancelType) {
        title = (title == '' || title == undefined) ? 'Alerta' : title;
        cssClass = (cssClass == '' || cssClass == undefined) ? 'balanced-popup' : cssClass;
        okText = (okText == '' || okText == undefined) ? 'Aceptar' : okText;
        okType = (okType == '' || okType == undefined) ? 'button-balanced' : okType;
        cancelText = (cancelText == '' || cancelText == undefined) ? 'Cancelar' : cancelText;
        cancelType = (cancelType == '' || cancelType == undefined) ? 'button-assertive' : cancelType;
        template = (template == '' || template == undefined) ? '' : template;
        
        return $ionicPopup.confirm({
                title: title,
                cssClass: cssClass,
                okText: okText,
                okType: okType,
                cancelText: cancelText,
                cancelType: cancelType,
                template: template
            });
    }
    
  };
})
.factory('Seguridad', function(DBA, $q) {
  // Might use a resource here that returns a JSON array
  var self = this;
  // Some fake testing data
  
    self.get = function(pVela,pEstado) {
        var parameters = [pVela,pEstado];
        return DBA.query("SELECT * FROM seguridad WHERE vela = (?) and estado = (?)", parameters)
            .then(function(result){                    
                return DBA.getAll(result);
            });
    }; 
    
    self.all = function() {
        return DBA.query("SELECT * FROM seguridad")
          .then(function(result){          
            return DBA.getAll(result);
          });
    };
    
 
    
    self.allForExport = function() {
        var q = $q.defer();
        
        DBA.query("SELECT * FROM seguridad ")
          .then(function(data){          
            var records = "";
            records += "--seguridad\r\n";   
            for(var i = 0; i< data.rows.length; i++){                                
                records += "(" + data.rows.item(i).estado + ",";
                records += data.rows.item(i).vela + ",";
                records += "'" + data.rows.item(i).item + "'";
                records += "),\r\n";                          
            }
            q.resolve(records); 
        });
             
        return q.promise;
    };
    
    return self;
})
.factory('Items_seguridad', function(DBA,$filter) {
    var self = this;
    var ItemsSeguridad = [{
        id: 1,
        selected: true,
        nombre: "Salvavidas"
    },{
        id: 2,
        selected: true,
        nombre: "Silbato"
    },{
        id: 3,
        selected: true,
        nombre: "Flotadores"
    },{
        id: 4,
        selected: true,
        nombre: "Orza"
    },{
        id: 5,
        selected: true,
        nombre: "Timon"
    },{
        id: 6,
        selected: true,
        nombre: "Achicadores"
    },{
        id: 7,
        selected: true,
        nombre: "Mastil"
    },{
        id: 8,
        selected: true,
        nombre: "Boza"
    },{
        id: 9,
        selected: true,
        nombre: "Pata de Gallo"
    },{
        id: 10,
        selected: true,
        nombre: "Remo"
    }];
    
    self.all = function() {
      return ItemsSeguridad;
    };
    self.get = function(ItemId,value){
        for (var i = 0; i < ItemsSeguridad.length; i++) {
            if (ItemsSeguridad[i].id === parseInt(ItemId)) {          
                ItemsSeguridad[i].selected = value;
            }
        }
    };
    
    /* resetea los items de seguridad, lose deja todos checkeados */
    self.reset = function (){
        for (var i = 0; i < ItemsSeguridad.length; i++) {
            ItemsSeguridad[i].selected = true;            
        }
    };
    
    /* inserta en la tabla "seguridad", con el numero de vela, el estado, y el item, no checkeado */
    self.add = function(pVela,pEstado){
        
        /* limpiamos para la vela y el estado, los items que hayan tenido cargados */
        DBA.query("DELETE FROM seguridad WHERE vela = ? and estado = ?",[pVela,pEstado]);
        /* filtro items NO seleccionados y los inserto en la tabla */
        var query = "INSERT INTO seguridad (vela,estado,item) VALUES (?,?,?)";
        var itemsToInsert = $filter('filter')(ItemsSeguridad, {selected: false});
        for (var i = 0; i < itemsToInsert.length; i++){
            DBA.query(query,[pVela,pEstado,itemsToInsert[i].nombre]);
        }        
    };
    
    return self;
    
})
;
