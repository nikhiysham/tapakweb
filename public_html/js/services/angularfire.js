MetronicApp.factory('AngularFire',
        ['$rootScope', '$firebaseObject', '$firebaseAuth', '$firebaseArray', 
            function ($rootScope, $firebaseObject, $firebaseAuth, $firebaseArray) {

                var src = {
                    getRef: function (ref) {
                        return firebase.database().ref(ref);
                    },
                    getObject: function (ref, uid) {
                        var obj = $firebaseObject(ref.child(uid));
                        return obj.$loaded()
                                .then(function (data) {
                                    return data;
                                })
                                .catch(function (error) {
                                });
                    },
                    getAuth: function () {
                        return $firebaseAuth();
                    },
                    signOut: function () {
//                        console.log('sign out...:', $firebaseAuth);
                        return $firebaseAuth().$signOut();
                    }
                };

                return src;
            }]);