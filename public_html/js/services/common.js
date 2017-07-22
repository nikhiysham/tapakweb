MetronicApp.factory("CommonService", [
  "$rootScope",
  "$state",
  "ngDialog",
  function($rootScope, $state, ngDialog) {
    var src = {
      redirect: function(route) {
        $state.go(route, {}, { reload: true });
      },
      isEmpty: function(data) {
        if (
          data === null ||
          data === undefined ||
          data === "" ||
          data === NaN
        ) {
          return true;
        } else {
          return false;
        }
      },
      isEmptyObject: function(obj) {
        if (obj !== undefined && obj !== null && obj !== "") {
          var found = false;
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              found = true;
            }
          }
          if (found) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      isEmptyArray: function(arr) {
        if (
          arr === undefined ||
          arr === null ||
          arr === "" ||
          arr.length === 0
        ) {
          return true;
        } else {
          return false;
        }
      },
      showAlert: function(id, msg) {
        ngDialog.open({
          template: id,
          controller: [
            "$scope",
            function($scope) {
              $scope.msg = msg;

              $scope.closeThisDialog = function() {
                ngDialog.close();
              };
            }
          ]
        });
      },
      showLoading: function() {
        $.blockUI({
          message:
            '<div><img src="./../img/loading-dots.gif" style="height:150px"/><div><div style="color:white"> Please wait...</div>'
        });
      },
      hideLoading: function() {
        $.unblockUI();
      },
      setFormSubmitted: function(form) {
        form.$submitted = false;
      }
    };

    return src;
  }
]);
