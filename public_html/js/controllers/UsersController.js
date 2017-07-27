angular.module("MetronicApp").controller("UsersController", [
  "$rootScope",
  "$scope",
  "$filter",
  "$q",
  "CommonService",
  "EnumService",
  "$timeout",
  "$state",
  "AngularFire",
  "DTOptionsBuilder",
  "DTColumnDefBuilder",
  "SessionService",
  function(
    $rootScope,
    $scope,
    $filter,
    $q,
    cmnSvc,
    enumSvc,
    $timeout,
    $state,
    angularFire,
    DTOptionsBuilder,
    DTColumnDefBuilder,
    sessionSvc
  ) {
    $scope.user = {};
    $scope.cmnSvc = cmnSvc;
    $scope.user = {};
    $scope.users = [];
    $scope.sites = [];
    $scope.modalMode = "";
    $scope.dtInstance = {};
    $scope.types = enumSvc.getMenuTypes();
    $scope.authObj = angularFire.getAuth();
    $scope.authUser = sessionSvc.get("user_auth");
    $scope.currentStateUrl = $state.current.url;
    $scope.item = {};

    var storageRef = firebase.storage().ref();
    $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType(
      "full_numbers"
    );
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0),
      DTColumnDefBuilder.newColumnDef(1),
      DTColumnDefBuilder.newColumnDef(2),
      DTColumnDefBuilder.newColumnDef(3),
      DTColumnDefBuilder.newColumnDef(4),
      DTColumnDefBuilder.newColumnDef(5),
      DTColumnDefBuilder.newColumnDef(6).notSortable()
    ];

    $scope.reloadDataTable = function() {
      $scope.dtInstance.rerender();
    };

    $scope.loadSites = function() {
      cmnSvc.showLoading();
      return $q(function(resolve, reject) {
        angularFire.getRef("sites").once(
          "value",
          function(snapshot) {
            var list = [];
            snapshot.forEach(function(data, ind) {
              var obj = {};
              obj.id = data.key;
              obj.name = data.val().name;
              obj.description = data.val().description;
              list.push(obj);
            });
            resolve(list);
          },
          function(error) {
            reject(error.message);
          }
        );
      });
    };

    $scope
      .loadSites()
      .then(function(resp) {
        $scope.sites = resp;
      })
      .catch(function(error) {
        cmnSvc.showAlert("alert", error);
      });

    $scope.searchByLocation = function() {
      console.log($scope.site.id);
      angularFire
        .getRef("users")
        .child("foodtruck")
        .orderByChild("site_id")
        .equalTo($scope.site.id)
        .once(
          "value",
          function(snapshot) {
            catPromises = [];
            console.log("snapshot val:", snapshot.val());
            snapshot.forEach(function(data) {
              var user = {};
              user = data.val();
              user.id = data.key;

              var promise = new Promise(function(resolve, reject) {
                if (!cmnSvc.isEmpty(data.val().category_id)) {
                  angularFire
                    .getRef("categories")
                    .child(data.val().category_id)
                    .once("value")
                    .then(function(catSnapshot) {
                      var category = {};
                      category = catSnapshot.val();
                      category.id = catSnapshot.key;
                      user.category = category;
                      resolve(user);
                    })
                    .catch(function(error) {
                      reject(error);
                    });
                } else {
                  resolve(user);
                }
              });

              catPromises.push(promise);
            });

            $q
              .all(catPromises)
              .then(function(responses) {
                cmnSvc.hideLoading();

                $scope.users = responses;
                console.log("Users:", $scope.users);
              })
              .catch(function(error) {
                cmnSvc.showAlert(
                  "alert",
                  "Error during load users [" + error + "]"
                );
              });
          },
          function(error) {
            console.log(error);
          }
        );
    };

    $scope.loadUsers = function(state) {
      if (state === "/users/foodtruck") {
        cmnSvc.showLoading();
        angularFire.getRef("users").child("foodtruck").once("value").then(
          function(snapshot) {
            catPromises = [];

            snapshot.forEach(function(data) {
              var user = {};
              user = data.val();
              user.id = data.key;

              var promise = new Promise(function(resolve, reject) {
                if (!cmnSvc.isEmpty(data.val().category_id)) {
                  angularFire
                    .getRef("categories")
                    .child(data.val().category_id)
                    .once("value")
                    .then(function(catSnapshot) {
                      var category = {};
                      category = catSnapshot.val();
                      category.id = catSnapshot.key;
                      user.category = category;
                      resolve(user);
                    })
                    .catch(function(error) {
                      reject(error);
                    });
                } else {
                  resolve(user);
                }
              });

              catPromises.push(promise);
            });

            $q
              .all(catPromises)
              .then(function(responses) {
                cmnSvc.hideLoading();

                $scope.users = responses;
                // console.log("Users:", $scope.users);
              })
              .catch(function(error) {
                cmnSvc.showAlert(
                  "alert",
                  "Error during load users [" + error + "]"
                );
              });
          },
          function(error) {
            cmnSvc.showAlert(
              "alert",
              "Error during load users [" + error + "]"
            );
          }
        );
      } else if (state === "/users/public") {
      } else {
      }
    };

    $scope.loadUsers($scope.currentStateUrl);

    $scope.clearModal = function() {
      $scope.modalMode = "ADD";
      $scope.category = {};
    };

    $scope.giveStar = function(item) {
      $scope.modalMode = "EDIT";
      if (!cmnSvc.isEmptyObject(item)) {
        $scope.user = angular.copy(item);
        !cmnSvc.isEmpty($scope.user.star)
          ? ($scope.item.rate = $scope.user.star)
          : "";
        $("#starModal").modal("show");
      } else {
        cmnSvc.showAlert("alert", "Type is required!");
      }
    };

    $scope.editStatus = function(item) {
      $scope.modalMode = "EDIT";
      if (!cmnSvc.isEmptyObject(item)) {
        $scope.user = angular.copy(item);
        $("#updateModal").modal("show");
      } else {
        cmnSvc.showAlert("alert", "Type is required!");
      }
    };

    $scope.updateStar = function(form) {
      if (!cmnSvc.isEmpty($scope.item.rate)) {
        cmnSvc.showLoading();
        angularFire
          .getRef("users")
          .child("foodtruck")
          .child($scope.user.id)
          .update({ star: $scope.item.rate })
          .then(function(snapshot) {
            cmnSvc.hideLoading();
            $("#starModal").modal("hide");
            $timeout(function() {
              $state.transitionTo(
                $state.current,
                {},
                {
                  reload: true,
                  inherit: false,
                  notify: true
                }
              );
            }, 200);
            cmnSvc.showAlert("alert", "Star has been successfully updated");
          })
          .catch(function(error) {
            $("#starModal").modal("hide");
            cmnSvc.showAlert(
              "alert",
              "Error during update star [" + error.message + "]"
            );
          });
      } else {
        $("#starModal").modal("hide");
        cmnSvc.showAlert("alert", "Star is required!");
      }
    };

    $scope.updateStatus = function(form) {
      if (!cmnSvc.isEmpty($scope.item.rate)) {
        cmnSvc.showLoading();
        angularFire
          .getRef("users")
          .child("foodtruck")
          .child($scope.user.id)
          .update({ status: $scope.user.status })
          .then(function(snapshot) {
            cmnSvc.hideLoading();
            $("#updateModal").modal("hide");
            $timeout(function() {
              $state.transitionTo(
                $state.current,
                {},
                {
                  reload: true,
                  inherit: false,
                  notify: true
                }
              );
            }, 200);
            cmnSvc.showAlert("alert", "Status has been successfully updated");
          })
          .catch(function(error) {
            $("#updateModal").modal("hide");
            cmnSvc.showAlert(
              "alert",
              "Error during update star [" + error.message + "]"
            );
          });
      } else {
        $("#updateModal").modal("hide");
        cmnSvc.showAlert("alert", "Star is required!");
      }
    };
  }
]);
