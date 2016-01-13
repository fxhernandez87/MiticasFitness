angular.module('miticasFitness.controllers', [])
.controller('InitCtrl', function($state, sessionService,$ionicLoading) {  
  
  $ionicLoading.show({
	template: '<div style="text-align:center;"><ion-spinner icon="android"></ion-spinner><br/>Iniciando<div>'
  }); 
  
  /* si ya tiene una sesion creada lo mandamos directo al home */
  if (sessionService.get("id_usuario") !== null){
	$ionicLoading.hide();
    $state.go("appLog.home");
  }else{
	$ionicLoading.hide();
	//$state.go("appNoLog.login");
	$state.go("appNoLog.welcome");
  }  
  
})
.controller('LoginCtrl', function($rootScope, $scope, $state, sessionService, auth, $cordovaToast,$ionicLoading,GCMRegistrationService) {  
  $ionicLoading.hide();
  /* si ya tiene una sesion creada lo mandamos directo al home */
  if (sessionService.get("id_usuario") !== null){
    $state.go("appLog.home");
  }
  
  $scope.usuario = {
      mail : null,
      pass : null
  };
  // Form data for the login modal
  $scope.doLogin = function(){
      auth.login($scope.usuario.mail,$scope.usuario.pass);
  };
  
  $rootScope.$on("login.successful",function(){
	  //GCMRegistrationService.registerOnGCM();
      $state.go("appLog.home");
  });
  
  $rootScope.$on("login.failed",function(){
      $cordovaToast.showShortBottom(
        "Hubo un error al autentificarse"
      );
  });
  
  
  // Create the login modal that we will use later
  
})
.controller('WelcomeCtrl', function($rootScope, $scope, $state, sessionService, auth, $cordovaToast,$ionicLoading) {  
  $ionicLoading.hide();
  /* si ya tiene una sesion creada lo mandamos directo al home */
  if (sessionService.get("id_usuario") !== null){
    $state.go("appLog.home");
  }
  
  $scope.usuario = {
      mail : null,
      pass : null
  };
  // Form data for the login modal
  $scope.doLogin = function(){
      auth.login($scope.usuario.mail,$scope.usuario.pass);
  };
  
  $rootScope.$on("login.successful",function(){
      $state.go("appLog.home");
  });
  
  $rootScope.$on("login.failed",function(){
      $cordovaToast.showShortBottom(
        "Hubo un error al autentificarse"
      );
  });
  
  
  // Create the login modal that we will use later
  
})
.controller('HomeCtrl', function($ionicLoading,$ionicHistory,$scope, dataInicial,NotificationService, ResumenDiario, $ionicActionSheet, $state, sessionService, $document) {
    $ionicHistory.clearHistory();
	$ionicLoading.hide();
    
    $scope.data = dataInicial;
	
    console.log(dataInicial);
    $scope.test = function(date){
		console.log(date);
        ResumenDiario.getDataByDate(date).then(function(items){
		  console.log($scope.data);
		  $scope.data.data = $scope.data.data.concat(items.data);
		  $scope.data.fecha_siguiente = items.fecha_siguiente;
		  $scope.$broadcast('scroll.infiniteScrollComplete');
		  
		});   
    } ;
    
    /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  
    /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroupDays = function(group) {
	console.log(group.isTitle);
	if (!group.isTitle){
	  $scope.shownDayGroup = null;
	}else {
	  if ($scope.isGroupDaysShown(group)) {
		$scope.shownDayGroup = null;
      } else {
	    $scope.shownDayGroup = group;
	  }
	}
  };
  $scope.isGroupDaysShown = function(group) {
    return $scope.shownDayGroup === group;
  };
  
  /* Para Checkear si hay data en la fecha */
  $scope.isThereData = function(bool){	
	return (bool===false) ? true : false;
  };
  
  /* Para Checkear si es el titulo del array */
  $scope.isDataTitle = function(bool){	
	return bool;
  };
  
  $scope.isThereNoData = function(bool){	
	return bool;
  };
  
  // Triggered on a button click, or some other target
 $scope.show = function(fecha) {

   // Show the action sheet
   $ionicActionSheet.show({
        buttons: [
          { text: 'Actividades <i class="icon icomoon-actividad"></i>' },
          { text: 'Comidas <i class="icon icomoon-comida"></i>' },
          { text: 'Estado de Animo <i class="icon ion-android-happy"></i>' }
        ],
        //destructiveText: 'Delete',
        cancelText: 'Volver',
        cssClass: 'menuInf',
        cancel: function() {
             $ionicActionSheet.hide();
           },
        buttonClicked: function(index) {
            switch(index){
                case 0: 
					sessionService.persist('activityDate',fecha);
                    $state.go("appLog.actividades",{fecha:fecha});
                    break;
                case 1: 
					sessionService.persist('activityDate',fecha);
                    $state.go("appLog.comidas",{fecha:fecha});
                    break;
                default:
                    console.log(index);
            }            
            return true;
        }
   });
  
 };
 
 $scope.sendNotification = function() {
	  NotificationService.sendNotification();
  };
    
})
.controller('ActividadesCtrl', function(dataInicial, consejoInicial, Actividades, $scope, $state, $stateParams, $ionicHistory, $ionicPlatform,returnToState,$document) {
	console.log($state);
	console.log($stateParams);
	
	$ionicPlatform.onHardwareBackButton(function(event) {
		event.preventDefault();
		event.stopPropagation();
		console.log('going back now yall');
		$ionicHistory.goBack();
		
	});
	
	$scope.hideAdvice = function(){
	  console.log(angular.element(document.querySelector('#consejo')));
	  angular.element(document.querySelector('#consejo')).css('display','none');
	};
	$scope.showAdvice = function(){
	  console.log(angular.element(document.querySelector('#consejo')));
	  angular.element(document.querySelector('#consejo')).css('display','block');
	};

    $scope.data = dataInicial;
	$scope.searchInput = '';
	$scope.activities = [];	
	$scope.activityDate = $stateParams.fecha;
	$scope.consejo = consejoInicial;
    
    $scope.borrarActividad = function(actividad_id){
        Actividades.borrarActividad(actividad_id);
    };
	
	$scope.agregarActividades = function(){
		$state.go('appLog.buscarActividades',{dataInicial: $scope.data});               
    };
	
	$scope.agegarActividad = function(actividad_id){
	  Actividades.getActividad(actividad_id).then(
		function(result){
		  $state.go('appLog.actividad',{fecha: $scope.activityDate, activity: angular.toJson(result)});		  
		}
	  );	  
	};
    
    $scope.buscarDato = function(text){
		console.log(text);
        return Actividades.buscarDato(text).then(function(result){
		  console.log(result);
		  $scope.activities = result;
		},function(){
		  $scope.activities = [];
		});
    };
	
	$scope.volver = function(){
	  returnToState('appLog.home');
	}
    
})
.controller('ActividadCtrl', function($scope, $state, dataActividad, Actividades, $stateParams,goBackMany) {
  console.log($stateParams);
  $scope.activity = dataActividad;  
  $scope.hrActividad = '';
  $scope.minActividad = '';
  
  $scope.addActivity = function(hr,min){
	console.log(hr);
	console.log(min);
	console.log($stateParams.fecha);
	console.log($scope.minActividad);
	var activityTime = min + (hr*60);
	Actividades.addActividad($scope.activity.id, activityTime).then(
	  function(data){
		console.log(data);
//		$scope.$state = $state;
//		$scope.$watch('$state.$current.locals.globals.randomValue', function (randomValue) {
//		  $scope.random = randomValue;
//		});
		goBackMany(2);
		//$state.go("appLog.actividades",{fecha:data.fecha},{ reload: true });
	  },
	  function(b){console.log(b)}
	);
  }
})
.controller('ComidasCtrl', function(dataInicial, Comidas, $scope, $state, $stateParams, $timeout) {
	console.log($state);
	console.log($stateParams);
    $scope.data = dataInicial;
	$scope.searchInput = '';
	$scope.comidas = [];		
    
    $scope.borrarComida = function(comida_id){
        Comidas.borrarActividad(comida_id).then(function(data){
		  $state.go("appLog.comidas",{fecha:data.fecha});
		});
    };
	
	$scope.agregarComidas = function(){
		$state.go('appLog.buscarComidas',{dataInicial: $scope.data});               
    };
	
	$scope.agegarComida = function(comida_id){
	  Comidas.getComida(comida_id).then(
		function(result){
		  $state.go('appLog.comida',{comida: angular.toJson(result)});		  
		}
	  );	  
	};
    
    $scope.buscarDato = function(text){
		console.log(text);
        return Comidas.buscarDato(text).then(function(result){
		  console.log(result);
		  $scope.comidas = result;
		},function(){
		  $scope.comidas = [];
		});
    };
    
})
.controller('ComidaCtrl', function($scope, $state, dataComida, Comidas, $stateParams) {
  console.log($stateParams);
  $scope.comida = dataComida;  
  $scope.porcion = '';
  $scope.periodo = '';
  $scope.cantidad = '';
  
  
  $scope.addComida = function(cant,id_meta,periodo){
	console.log(cant);
	console.log(id_meta);
	console.log(periodo);
	console.log($stateParams.fecha);
	
	//var activityTime = min + (hr*60);
	Comidas.addComida($scope.comida.id, id_meta, cant, periodo).then(
	  function(data){
		console.log(data);
		$state.go("appLog.comidas",{fecha:data.fecha});
	  },
	  function(b){console.log(b)}
	);
  }
})
.controller('SemanalCtrl', function($ionicHistory,$scope, $ionicModal, $timeout) {
  
  $scope.items = [{	  
            nombre: 'Balance general',
            icon: 'mitikas-oro',
            days: [ {clase: 'bgVerde'},{ clase: 'bgVerde' },{ clase: 'bgVerde' },{ clase: 'bgVerde' }]	
    },{	  
            nombre: 'Actividad Física',
            icon: 'actividad',
            days: [ {clase: 'bgVerde'},{ clase: 'bgAmarillo' },{ clase: 'bgAmarillo' },{ clase: 'bgRojo' }]	
    },{	  
            nombre: 'Balance Energético',
            icon: 'energetico',
            days: [ {clase: 'bgVerde'},{ clase: 'bgAmarillo' },{ clase: 'bgAmarillo' },{ clase: 'bgRojo' }]	
    },{	  
            nombre: 'Distribución de Macronutrientes',
            icon: 'macronutrientes',
            days: [ {clase: 'bgVerde'},{ clase: 'bgAmarillo' },{ clase: 'bgAmarillo' },{ clase: 'bgRojo' }]	
    },{	  
            nombre: 'Alimentos Clave',
            icon: 'alimento',
            days: [ {clase: 'bgVerde'},{ clase: 'bgAmarillo' },{ clase: 'bgAmarillo' },{ clase: 'bgRojo' }]	
    },{	  
            nombre: 'Horas de Sueño',
            icon: 'sueno',
            days: [ {clase: 'bgVerde'},{ clase: 'bgAmarillo' },{ clase: 'bgAmarillo' },{ clase: 'bgRojo' }]	
    },{	  
            nombre: 'Agua Consumida',
            icon: 'agua',
            days: [ {clase: 'bgVerde'},{ clase: 'bgAmarillo' },{ clase: 'bgAmarillo' },{ clase: 'bgRojo' }]	
    },{	  
            nombre: 'Índice de Actividad',
            icon: 'actividad',





            days: [ {clase: 'bgVerde'},{ clase: 'bgAmarillo' },{ clase: 'bgAmarillo' },{ clase: 'bgRojo' }]	
    }];
    
})
.controller('MensualCtrl', function($ionicHistory,$scope, $ionicModal, $timeout) {
    
})
.controller('EditarCtrl', function($ionicHistory,$scope, $ionicModal, $timeout) {
    
})
.controller('MedidasCtrl', function($ionicHistory,$scope, $ionicModal, $timeout) {
    
})
.controller('RecuperarCtrl', function($ionicHistory,$scope, $ionicModal, $timeout) {
    
})
.controller('AppCtrl', function($rootScope, $scope, $state, auth, sessionService, $timeout,dataInicial) {
  
  $scope.usuario = dataInicial;
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  /* si no tiene una sesion creada lo mandamos directo al login */
  if (sessionService.get("id_usuario") === null){
    $state.go("appNoLog.login");
  }
  // Form data for the login modal
  $scope.loginData = {};
  
  $scope.logout = function(){
      auth.logout();      
  };
  
  $rootScope.$on("logout.successful",function(){
      $state.go("appNoLog.login");
  });

  // Create the login modal that we will use later
  
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
