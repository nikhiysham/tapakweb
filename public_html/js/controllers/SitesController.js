angular.module("MetronicApp").controller("SitesController", [
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
    $scope.site = {};
    $scope.sites = [];
    $scope.categories = [];
    $scope.modalMode = "";
    $scope.dtInstance = {};
    $scope.types = enumSvc.getMenuTypes();
    $scope.authObj = angularFire.getAuth();
    $scope.authUser = sessionSvc.get("user_auth");
    var storageRef = firebase.storage().ref();

    $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType(
      "full_numbers"
    );
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0),
      DTColumnDefBuilder.newColumnDef(1),
      DTColumnDefBuilder.newColumnDef(2),
      DTColumnDefBuilder.newColumnDef(3).notSortable()
    ];

    $scope.reloadDataTable = function() {
      $scope.dtInstance.rerender();
    };

    $scope.loadSites = function() {
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
            console.log(error);
          }
        );
      });
    };

    $scope
      .loadSites()
      .then(function(resp) {
        $scope.sites = resp;
        // console.log($scope.sites);
      })
      .catch(function(error) {
        cmnSvc.showAlert("alert", error);
      });

    $scope.clearSites = function() {
      $scope.modalMode = "ADD";
      $scope.site = {};
    };

    $scope.edit = function(item) {
      $scope.modalMode = "EDIT";
      if (!cmnSvc.isEmptyObject(item)) {
        $scope.site = angular.copy(item);
        $("#addModal").modal("show");
      } else {
        cmnSvc.showAlert("alert", "Type is required!");
      }
    };

    $scope.delete = function(item) {
      // console.log(item);
      if (!cmnSvc.isEmptyObject(item)) {
        cmnSvc.showLoading();
        angularFire.getRef("sites").child(item.id).remove(function(error) {
          cmnSvc.hideLoading();
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
          if (error) {
            cmnSvc.showAlert(
              "alert",
              "Error delete " + item.name + " : " + JSON.stringify(error)
            );
          } else {
            cmnSvc.showAlert(
              "alert",
              "Site " + item.name + " has been successfully deleted"
            );
          }
        });
      }
    };

    $scope.submit = function(form) {
      if (!form.$invalid) {
        if ($scope.modalMode === "ADD") {
          cmnSvc.showLoading();
          var obj = angular.copy($scope.site);
          angularFire.getRef("sites").push().set(obj, function(error) {
            $("#addModal").modal("hide");
            cmnSvc.hideLoading();
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
            if (error) {
              cmnSvc.showAlert("alert", error.message);
            } else {
              cmnSvc.showAlert(
                "alert",
                "Site " + obj.name + " has been successfully added"
              );
              $scope.slot = {};
              form.$submitted = false;
            }
          });
        } else {
          if (!cmnSvc.isEmpty($scope.site.id)) {
            var obj = angular.copy($scope.site);
            cmnSvc.showLoading();
            angularFire
              .getRef("sites")
              .child($scope.site.id)
              .update({
                name: obj.name,
                description: obj.description
              })
              .then(function() {
                $("#addModal").modal("hide");
                cmnSvc.hideLoading();
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
                cmnSvc.showAlert(
                  "alert",
                  "Site " + obj.name + " has been successfully updated"
                );
              })
              .catch(function(error) {
                cmnSvc.showAlert(
                  "alert",
                  "Error update  :" + JSON.stringify(error)
                );
              });
          } else {
            cmnSvc.showAlert("alert", "Site Id is required!");
          }
        }
      }
    };
  }
]);
