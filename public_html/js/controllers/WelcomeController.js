angular.module('MetronicApp').controller('WelcomeController',
        ['$rootScope', '$scope', '$timeout', '$state', 'CommonService', 'SessionService', 'AngularFire',
            function ($rootScope, $scope, $timeout, $state, cmnSvc, sessionSvc, angularFire) {

                $scope.cmnSvc = cmnSvc;
                $scope.user = {};
                $scope.authObj = angularFire.getAuth();

                $scope.login = function (form) {
                    if (!form.$invalid) {
                        cmnSvc.showLoading();
                        $scope.authObj.$signInWithEmailAndPassword($scope.user.email, $scope.user.password)
                                .then(function (firebaseUser) {
                                    cmnSvc.hideLoading();
                                    sessionSvc.set('user_auth', firebaseUser);
                                    sessionSvc.set('login', 'manual');
                                    $state.go('dashboard', {}, {reload:true});
                                }, function (err) {
                                    cmnSvc.hideLoading();
                                    form.$submitted = false;
                                    if (!cmnSvc.isEmpty(err.code)) {
                                        switch (err.code) {
                                            case 'auth/user-not-found':
                                                cmnSvc.showAlert('alert', 'Maaf, email ini tiada dalam rekod kami!');
                                                break;
                                            case 'auth/wrong-password':
                                                cmnSvc.showAlert('alert', 'Password tidak sah!');
                                                break;
                                            default:
                                                cmnSvc.showAlert('alert', 'Maaf, email ini tiada dalam rekod kami!');
                                        }
                                    }
                                });
                    } 
                };
                
            }]);