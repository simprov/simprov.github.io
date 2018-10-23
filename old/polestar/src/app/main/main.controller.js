'use strict';

angular.module('polestar')
  .controller('MainCtrl', function($scope, $document, Spec, Dataset, Config, consts, Chronicle, Logger, Bookmarks, Modals, Prov) {

    $scope.Spec = Spec;
    $scope.Dataset = Dataset;
    $scope.Config = Config;
    $scope.Bookmarks = Bookmarks;
    $scope.consts = consts;
    $scope.showDevPanel = false;
    $scope.embedded = !!consts.embeddedData;
    $scope.Prov = Prov;

    // undo/redo support
    $scope.canUndo = false;
    $scope.canRedo = false;
    $scope.canExport = $scope.canUndo || $scope.canRedo;

    // bookmark
    $scope.showModal = function(modalId) {
      Modals.open(modalId);
    };

    if (Bookmarks.isSupported) {
      // load bookmarks from local storage
      Bookmarks.load();
    }

    if ($scope.embedded) {
      // use provided data and we will hide the dataset selector
      Dataset.dataset = {
        values: consts.embeddedData,
        name: 'embedded'
      };
    }

    // initialize undo after we have a dataset
    Dataset.update(Dataset.dataset).then(function() {
      Config.updateDataset(Dataset.dataset);

      if (consts.initialSpec) {
          Spec.parseSpec(consts.initialSpec);
      }

      $scope.chron = Chronicle.record('Spec.spec', $scope, true,
        ['Dataset.dataset', 'Dataset.dataschema','Dataset.stats', 'Config.config']);

      $scope.canUndoRedo = function() {
        $scope.canUndo = $scope.Prov.canUndo();
        $scope.canRedo = $scope.Prov.canRedo();
        $scope.canExport = $scope.canUndo || $scope.canRedo;
      };
      $scope.chron.addOnAdjustFunction($scope.canUndoRedo);
      $scope.chron.addOnUndoFunction($scope.canUndoRedo);
      $scope.chron.addOnRedoFunction($scope.canUndoRedo);

      $scope.chron.addOnUndoFunction(function() {
        Logger.logInteraction(Logger.actions.UNDO);
      });
      $scope.chron.addOnRedoFunction(function() {
        Logger.logInteraction(Logger.actions.REDO);
      });

      angular.element($document).on('keydown', function(e) {
        if (e.keyCode === 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
          $scope.Prov.undo();
          $scope.$digest();
          return false;
        } else if (e.keyCode === 'Y'.charCodeAt(0) && (e.ctrlKey || e.metaKey)) {
          $scope.Prov.redo();
          $scope.$digest();
          return false;
        } else if (e.keyCode === 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && e.shiftKey) {
          $scope.Prov.redo();
          $scope.$digest();
          return false;
        }
      });
    });
  });
