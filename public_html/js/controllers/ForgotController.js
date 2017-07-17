angular.module('MetronicApp').controller('ForgotController',
        ['$rootScope', '$scope', 'CommonService', '$timeout', '$state', 'AngularFire',
            function ($rootScope, $scope, cmnSvc, $timeout, $state, angularFire) {

                $scope.user = {};
                $scope.cmnSvc = cmnSvc;
                $scope.authObj = angularFire.getAuth();

                $scope.back = function () {
                    $state.go('welcome', {}, {reload: true});
                };

                $scope.resetPassword = function (form) {
                    if (!form.$invalid) {
                        if (!cmnSvc.isEmpty(form.email.$error.email) && form.email.$error.email) {
                            cmnSvc.showAlert('<i class="icon ion-android-alert"></i> Ralat', 'E-mel tidak sah');
                            return;
                        }
                        if (!form.$valid) {
                            cmnSvc.showAlert('<i class="icon ion-android-alert"></i> Ralat', 'Sila masukkan E-mel untuk pengesahan');
                        } else {
                            cmnSvc.showAlert('<i class="icon ion-ios-checkmark-outline"></i> Ralat', 'E-mel Untuk Pembetulan Kata Laluan telah berjaya dihantar');
                            $scope.authObj.$sendPasswordResetEmail($scope.user.email, function () {
//                            cmnSvc.showAlert('<i class="icon ion-ios-checkmark-outline"></i> Ralat', 'Email Untuk Pembetulan Kata Laluan telah berjaya dihantar');
                            }).catch(function (err) {
                                cmnSvc.showAlert('<i class="icon ion-android-alert"></i> Ralat', err);
                            });
                        }
                    }
                };

            }]);