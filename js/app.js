// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('miticasFitness', ['ionic', 'miticasFitness.controllers', 'miticasFitness.services','ngCordova','ngCookies'])

.run(function($ionicPlatform,$rootScope,$state,GCMRegistrationService, StatusHandler) {
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
	
//	 // Disable BACK button on home
//	$ionicPlatform.registerBackButtonAction(function (event) {
//    if($state.current.name=="appLog.home"){
//      navigator.app.exitApp();
//    }
//    else {
//      navigator.app.backHistory();
//    }
//  }, 100);
	
	var alreadyRegistered = false;

    StatusHandler.loading();

    document.addEventListener("online", function() {
        StatusHandler.online();
        registerOnGCM();
    }, false);

    document.addEventListener("offline", function() {
        alreadyRegistered = false;
        StatusHandler.offline();
    }, false);

    function isOnline() {
        return navigator.network.connection.type !== Connection.NONE;
    }

    function registerOnGCM() {
        if (!alreadyRegistered) {
            alreadyRegistered = true;
			console.log(alreadyRegistered);
            GCMRegistrationService.registerOnGCM();
        }
    }

    if (isOnline()) {
        StatusHandler.online();
        registerOnGCM();
    } else {
        StatusHandler.offline();
    }
	
//				"senderID": "986090601276", /* Google developers project number */


  });
  $rootScope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams){
        console.log("stateChangeStart");
        console.log(event);
        console.log(toState);
        console.log(toParams);
        console.log(fromState);
        console.log(fromParams);
    }
  );
  $rootScope.$on('$stateNotFound', 
    function(){
        console.log("$stateNotFound");
    }
  );
  $rootScope.$on('$stateChangeSuccess', 
    function(event, toState, toParams, fromState, fromParams){
        console.log("stateChangeSuccess");
        console.log(event);
        console.log(toState);
        console.log(toParams);
        console.log(fromState);
        console.log(fromParams);
    }
  );
  $rootScope.$on('$stateChangeError', 
    function(){
        console.log("stateChangeError  ");
    }
  );
    
 /* $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        //llamamos a checkStatus, el cual lo hemos definido en la factoria auth
        //la cuál hemos inyectado en la acción run de la aplicación
        //le paso el nombre del estado al que voy para verificar la seguridad
        console.log(toParams);
        console.log(fromParams);
        event.preventDefault();
        auth.checkStatus(toState.name);
        
        
    });*/
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('appNoLog', {
    url: "/appNoLog",
    abstract: true,
    templateUrl: "templates/estados/noLog.html"    
  })
  .state('appLog', {
    url: "/appLog",
    abstract: true,
    templateUrl: "templates/estados/log.html",
    controller: "AppCtrl",
	resolve: {
	  dataInicial: function(sessionService){
		console.log('asdasd');
		var data = {
		  nombre: sessionService.get('nombre'),
		  avatar: sessionService.get('avatar'),
		  mail :sessionService.get('mail')
		};
		
		  //console.log(d.format("yyyy-mm-dd"));
		return data;
	  }
  }
  })
  .state('appNoLog.register', {
    url: "/register",
    views: {      
      'Home': {
        templateUrl: "templates/noLog/register.html"
      }
      
    }
  })
  .state('appLog.home', {
    url: "/home",
    views: {
      'menuContent': {
        templateUrl: "templates/log/home.html",
        controller: "HomeCtrl",
        resolve: {
            dataInicial: function(ResumenDiario){
			  console.log('asdasd');
			  Date.prototype.yyyymmdd = function() {
				var yyyy = this.getFullYear().toString();
				var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
				var dd  = this.getDate().toString();
				return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
			  };

			  var d = new Date();
                //console.log(d.format("yyyy-mm-dd"));
              return ResumenDiario.getDataByDate(d.yyyymmdd());
            }
        }
      }
    }
  })
  .state('appLog.actividades', {
    url: "/actividades/:fecha",
    views: {
      'menuContent': {
        templateUrl: "templates/log/actividades.html",
        controller: "ActividadesCtrl",
        resolve: {
            dataInicial: function(Actividades,$stateParams){
                return Actividades.getDataByDate($stateParams.fecha);
            },
			consejoInicial: function(){
			  return null;
			}
        }
      }
    }
  })
  .state('appLog.buscarActividades', {
    url: "/buscarActividades/:dataInicial",
    views: {
      'menuContent': {
        templateUrl: "templates/log/buscar-actividades.html",
        controller: "ActividadesCtrl",
        resolve: {
            dataInicial: function($stateParams){
                return $stateParams.dataInicial;
            },
			consejoInicial: function(Consejos){ 
				return Consejos.getConsejoActividad();
			}
		}        
      }
    }
  })
  .state('appLog.agregarActividades', {
    url: "/agregarActividades",
    views: {
      'menuContent': {
        templateUrl: "templates/log/agregar-actividades.html",
        controller: "ActividadesCtrl"
        
      }
    }
  })
  .state('appLog.actividad', {
    url: "/actividad/:fecha/:activity",
    views: {
      'menuContent': {
        templateUrl: "templates/log/agregar-actividades.html",
        controller: "ActividadCtrl",
		resolve: {
		  dataActividad: function($stateParams){
                return angular.fromJson($stateParams.activity);
            } 
		}
      }
    }
  })
  .state('appLog.comidas', {
    url: "/comidas/:fecha",
    views: {
      'menuContent': {
        templateUrl: "templates/log/comidas.html",
        controller: "ComidasCtrl",
        resolve: {
            dataInicial: function(Comidas,$stateParams){
                return Comidas.getDataByDate($stateParams.fecha);
            }
        }
      }
    }
  })
  .state('appLog.buscarComidas', {
    url: "/buscarComidas/:dataInicial",
    views: {
      'menuContent': {
        templateUrl: "templates/log/buscar-comidas.html",
        controller: "ComidasCtrl",
        resolve: {
            dataInicial: function($stateParams){
                return $stateParams.dataInicial;
            }
		}        
      }
    }
  })
  .state('appLog.agregarComidas', {
    url: "/agregarComidas",
    views: {
      'menuContent': {
        templateUrl: "templates/log/agregar-comidas.html",
        controller: "ComidasCtrl"
        
      }
    }
  })
  .state('appLog.comida', {
    url: "/comida/:fecha/:comida",
    views: {
      'menuContent': {
        templateUrl: "templates/log/agregar-comidas.html",
        controller: "ComidaCtrl",
		resolve: {
		  dataComida: function($stateParams){
                return angular.fromJson($stateParams.comida);
            } 
		}
      }
    }
  })
  .state('appLog.semanal', {
    url: "/semanal",
    views: {
      'menuContent': {
        templateUrl: "templates/log/semanal.html",
        controller: "SemanalCtrl"
      }
    }
  })  
  .state('appLog.mensual', {
    url: "/mensual",
    views: {
      'menuContent': {
        templateUrl: "templates/log/mensual.html",
        controller: "MensualCtrl"
      }
    }
  })
  .state('appLog.editar', {
    url: "/editar",
    views: {
      'menuContent': {
        templateUrl: "templates/log/editar.html",
        controller: "EditarCtrl"
      }
    }
  })
  .state('appLog.medidas', {
    url: "/medidas",
    views: {
      'menuContent': {
        templateUrl: "templates/log/medidas.html",
        controller: "MedidasCtrl"
      }
    }
  })
  .state('appLog.search', {
    url: "/search",
    views: {
      'menuContent': {
        templateUrl: "templates/search.html"
      }
    }
  })
  .state('appNoLog.init', {
    url: "/init",
    views: {      
      'Home': {
        templateUrl: "templates/noLog/init.html",
        controller: "InitCtrl"
      }
      
    }
  })
  .state('appNoLog.login', {
    url: "/login",
    views: {      
      'Home': {
        templateUrl: "templates/noLog/login.html",
        controller: "LoginCtrl"
      }
      
    }
  })
  .state('appNoLog.recuperar', {
    url: "/recuperar",
    views: {      
      'Home': {
        templateUrl: "templates/noLog/recuperar.html",
        controller: "RecuperarCtrl"
      }
      
    }
  })
  .state('appNoLog.welcome', {
    url: "/login",
    views: {      
      'Home': {
        templateUrl: "templates/noLog/welcome.html",
        controller: "WelcomeCtrl"
      }
      
    }
  })
  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html"
      }
    }
  })
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent': {
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: "/playlists/:playlistId",
    views: {
      'menuContent': {
        templateUrl: "templates/playlist.html",
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/appNoLog/init');
});
