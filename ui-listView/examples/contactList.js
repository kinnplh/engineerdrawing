var FileTreeList;
var Scope;
var Editor;
var ErrorList;
angular.module("app", ["ui-listView"])
    .controller("SampleApp", function ($scope) {
        if (ErrorList == null) {
            ErrorList = $scope;
        }
        else {
            $scope = ErrorList;
        }
        $scope.listViewOptions = {};
        $scope.search = {};
        $scope.contacts =
            [
            ]
        //console.log($scope.contacts);
        $scope.update = function(errors) {
            $scope.contacts.length = 0;
            //console.log(errors);
            for (var i=0; i<errors.length; i++) {
                console.log(errors[i].fileName)
                console.log(ErrorList);
                //console.log(ErrorList.contacts[i]);
                //console.log($scope.contacts[i]);
                var tmp = {
                    "name": ""+i+". "+errors[i].fileName,
                    "email": errors[i].errorMsg,
                    "pos":{"x":errors[i].row,"y":errors[i].col},
                    "origin": errors[i].fileName
                }
                $scope.contacts.push(tmp);
                console.log($scope.contacts);
            }
            $scope.$apply();

        }
        $scope.goToErrorLine = function(contact) {
            //console.log(pos);
            var name = contact.origin;
            for (var i=0; i<FileTreeList.tree.children.length; i++) {
                if (name == FileTreeList.tree.children[i].name) {
                    FileTreeList.select(null, FileTreeList.tree.children[i]);
                    break;
                }
            }
            //Scope.getWindow();
            //while (!window.aces) {}

            console.log("in windows ace");
            console.log(window.aces);
            if (window.aces) {
                window.aces[Scope.tabs[Scope.tabStatus.focus].id].gotoLine(contact.pos.x, contact.pos.y,true);
            }
            //console.log(Scope.tabs[Scope.tabStatus.focus].row);
            //Scope.tabs[Scope.tabStatus.focus].row = contact.pos.x;
            //Scope.tabs[Scope.tabStatus.focus].colunm = contact.pos.y;
            // console.log(Editor[Scope.tabStatus.focus].getCursorPosition());
            //Editor[Scope.tabStatus.focus].gotoLine(contact.pos.x, contact.pos.y, ture);
            //contact.pos.x;
            // Editor[Scope.tabStatus.focus].tabeditor.column = contact.pos.y;
        }
    });