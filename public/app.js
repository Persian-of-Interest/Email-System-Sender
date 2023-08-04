// Frontend
angular.module('ConfirmationEmailApp', [])
  .controller('EmailController', function ($scope, $http) {
    $scope.submitEmail = function () {
      const name = $scope.name;
      const email = $scope.email;
      $http.post('/api/store-email', { name, email })
        .then(function (response) {
          $scope.confirmationMessage = 'User info stored successfully';
        })
        .catch(function (error) {
          console.error('Error storing user info:', error.data.message);
        });
    };
  });