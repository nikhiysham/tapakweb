angular.module("MetronicApp").controller("SignUpController", [
  "$rootScope",
  "$scope",
  "$timeout",
  "$firebaseObject",
  "$state",
  "CommonService",
  "EnumService",
  "AngularFire",
  function(
    $rootScope,
    $scope,
    $timeout,
    $firebaseObject,
    $state,
    cmnSvc,
    enumSvc,
    angularFire
  ) {
    $scope.cmnSvc = cmnSvc;
    $scope.user = {
      name: "Muhammad Ali Bin Safal",
      email: "ali@gmail.com",
      username: "ali",
      password: "password",
      confirmPassword: "password"
    };
    $scope.term = {};
    $scope.districts = [];
    $scope.states = enumSvc.getStates();
    $scope.authObj = angularFire.getAuth();

    $scope.loadDistrict = function(code) {
      $scope.districts = enumSvc.getDistrict(code);
    };

    $scope.submit = function(form) {
      if (!form.$invalid) {
        cmnSvc.showLoading();
        $scope.authObj
          .$createUserWithEmailAndPassword(
            $scope.user.email,
            $scope.user.password
          )
          .then(
            function(result) {
              // Add name and default dp to the Autherisation table
              result
                .updateProfile({
                  displayName: $scope.user.name,
                  photoURL: "default_dp"
                })
                .then(
                  function() {
                    // Create users table to store additional info
                    angularFire.getRef("admin").child(result.uid).set({
                      name: $scope.user.name,
                      created_date: new Date().toString(),
                      updated_date: ""
                    }, function(err) {
                      if (err) {
                        cmnSvc.hideLoading();
                        var errorMsg = err.message;
                        cmnSvc.showAlert("alert", errorMsg);
                      } else {
                        sessionSvc.set("user_auth", result);
                        sessionSvc.set("login", "manual");
                        cmnSvc.hideLoading();
                        cmnSvc.showAlert(
                          "alert",
                          "Tahniah, pendaftaran telah berjaya. Sila tunggu..."
                        );
                      }
                    });
                  },
                  function(err) {
                    cmnSvc.hideLoading();
                    var errorMsg = err.message;
                    cmnSvc.showAlert("alert", errorMsg);
                  }
                );
            },
            function(err) {
              cmnSvc.hideLoading();
              var errorCode = err.code;
              var errorMsg = err.message;

              if (errorCode === "auth/weak-password") {
                cmnSvc.showAlert("alert", "Kata Laluan anda lemah!");
              } else if (errorCode === "auth/email-already-in-use") {
                cmnSvc.showAlert(
                  "alert",
                  "Email ini telah wujud dalam rekod kami!"
                );
              } else {
                cmnSvc.showAlert("alert", errorMsg);
              }
            }
          );
      } else {
        cmnSvc.showAlert("alert", "Sila isi ruangan mandatori");
      }
    };
  }
]);
