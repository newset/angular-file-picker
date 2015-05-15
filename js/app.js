angular.module('app', ['angularFileUpload', 'ngCookies', 'ui.bootstrap'])
	.run(['$templateCache', function ($templateCache) {
		var list = '<div class="wrapper">'+
				    '<div class="row">'+
				        '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2-4 m-b" ng-repeat="file in files">'+
				            '<div class="item" ng-class="{'+"'"+'bg-light'+"'"+':is_disabled(file.id)}">'+
				                '<div class="pos-rlt">'+
				                    '<div class="top">'+
				                        '<span class="m-l-sm m-t-sm" ng-show="is_check(file)"><i class="fa fa-check-circle-o text-success"></i></span>'+
				                    '</div>'+
				                    '<a class="" href="" ng-click="pick(file)" ng-disabled="is_check(file)">'+
				                        '<img ng-src="{{file.url}}" alt="" class="img-full r r-2x">'+
				                    '</a>'+
				                '</div>'+
				            '</div>'+
				        '</div>'+
				    '</div>'+
				'</div>',
			upload = '<div class="col bg-light b-r bg-auto m-b">'+
				  '<div class="wrapper-md">'+
				    '<input type="file" nv-file-select="" uploader="uploader" multiple  />'+
				  '</div>'+
				'</div>'+
				'<div class="col">'+
				  '<div class="">'+
				  	'<table class="table bg-white-only b-a table-fixed">'+
				      '<thead>'+
				          '<tr>'+
				              '<th width="30%">文件名</th>'+
				              '<th ng-show="uploader.isHTML5">大小</th>'+
				              '<th ng-show="uploader.isHTML5">进度</th>'+
				              '<th>状态</th>'+
				              '<th>操作</th>'+
				          '</tr>'+
				      '</thead>'+
				      '<tbody>'+
				          '<tr ng-repeat="item in uploader.queue">'+
				              '<td nowrap><strong>{{ item.file.name }}</strong></td>'+
				              '<td ng-show="uploader.isHTML5" nowrap>{{ item.file.size/1024/1024|number:2 }} MB</td>'+
				              '<td ng-show="uploader.isHTML5">'+
				                  '<div class="progress progress-sm m-b-none m-t-xs">'+
				                      '<div class="progress-bar bg-info" role="progressbar" ng-style="{'+"'"+'width'+"'"+': item.progress + '+"'"+'%'+"'"+' }"></div>'+
				                  '</div>'+
				              '</td>'+
				              '<td class="text-center">'+
				                  '<span ng-show="item.isSuccess" class="text-success"><i class="glyphicon glyphicon-ok"></i></span>'+
				                  '<span ng-show="item.isCancel" class="text-warning"><i class="glyphicon glyphicon-ban-circle"></i></span>'+
				                  '<span ng-show="item.isError" class="text-danger"><i class="glyphicon glyphicon-remove"></i></span>'+
				              '</td>'+
				              '<td nowrap>'+
				                  '<button type="button" class="btn btn-default btn-xs" ng-click="item.upload()" ng-disabled="item.isReady || item.isUploading || item.isSuccess">'+
				                      '<i class="fa fa-arrow-circle-up"></i>'+
				                  '</button>'+
				                  '<button type="button" class="btn btn-default btn-xs" ng-click="check(item)">'+
				                      '<i class="fa fa-check"></i>'+
				                  '</button>'+
				                  '<button type="button" class="btn btn-default btn-xs" ng-click="item.remove()">'+
				                      '<i class="fa fa-remove"></i>'+
				                  '</button>'+
				              '</td>'+
				          '</tr>'+
				      '</tbody>'+
					'</table>'+
					'<div>'+
				      '<div>'+
				        '<p>进度:</p>'+
				        '<div class="progress bg-light dker" style="">'+
				            '<div class="progress-bar progress-bar-striped bg-info" role="progressbar" ng-style="{'+"'"+'width'+"'"+': item.progress + '+"'"+'%'+"'"+' }"></div>'+
				        '</div>'+
				      '</div>'+
				      '<button type="button" class="btn btn-addon btn-success" ng-click="uploader.uploadAll()" ng-disabled="!uploader.getNotUploadedItems().length">'+
				        '<i class="fa fa-arrow-circle-o-up"></i> 上传所有'+
				      '</button>'+
				      '<button type="button" class="btn btn-addon btn-warning" ng-click="uploader.cancelAll()" ng-disabled="!uploader.isUploading">'+
				        '<i class="fa fa-ban"></i> 取消所有'+
				      '</button>'+
				      '<button type="button" class="btn btn-addon btn-danger" ng-click="uploader.clearQueue()" ng-disabled="!uploader.queue.length">'+
				          '<i class="fa fa-trash-o"></i> 移除所有'+
				      '</button>'+
				  '</div>'+
				'</div>'+
			'</div>';

		$templateCache.put('_uploader/__list.html', list);
		$templateCache.put('_uploader/__upload.html', upload);

	}])
	.directive('filePicker', [function () {
	    return {
	        restrict: 'AE',
	        require: ['^ngController', 'ngModel'],
	        scope : {
	            'addFile' : '&',
	            'fileDisabled' : '=',
	            'fileSelect' : '&',
	            'uploadPath' : '=',
	            'dataPath' : '='
	        },
	        controller : ['$scope', 'FileUploader', '$cookies', '$rootScope', '$http', function($scope, FileUploader, $cookies, $rootScope, $http) {
	            var uploadPath = $scope.uploadPath || 'upload.php',
	            	dataPath = $scope.dataPath || 'data/files.json';

	            $scope.uploader = new FileUploader({
	                url: uploadPath,
	                headers : {
	                    'X-XSRF-TOKEN' : $cookies['XSRF-TOKEN']
	                }
	            });
	            
	            /**
	             * 处理选取事件
	             */
	            $scope.files = $http.get(dataPath).success(function(data){
	            	console.log($scope.files = data);
	            });
	            
	            /**
	             * 单个上传完成
	             */
	            
	            $scope.uploader.onCompleteItem = function(file, data){
	                file.result = data.file;
	                $scope.files.push(data.file);
	            }
	            
	            /**
	             * 处理上传完成事件
	             */
	            $scope.uploader.onCompleteAll = function(){
	                
	            }

	            /**
	             * file event
	             */
	            var send_event = function(file){
	                // 查看当前id 是否存在
	                var id = file.id;
	                if ($scope.fileDisabled.indexOf(id) == -1) {
	                    // 设置已选数据
	                    $rootScope.$emit('filePicked', file); 
	                    $scope.fileDisabled.push(file.id);
	                }else{
	                    $rootScope.$emit('removeFile', id);
	                    $scope.fileDisabled.splice($scope.fileDisabled.indexOf(id), 1);
	                };
	            }

	            /**
	             * 选择上传文件
	             * @param  {[type]} file [description]
	             * @return {[type]}      [description]
	             */

	            $scope.is_disabled = function(id){
	                return false;
	                //$scope.fileDisabled.indexOf(id) != -1;
	            }

	            $scope.check =function(obj){
	                if (obj.result) {
	                    $scope.pick(obj.result);
	                };
	            }

	            $scope.pick = function(obj){
	                $scope.fileSelect({'file' : {
	                    name : obj.name,
	                    id : obj.id,
	                    filename : obj.filename,
	                    url : obj.url
	                }});
	            }
	        }],
	        template : "<tabset class='tab-container'>"+
	                      "<tab heading='本地上传'>"+
	                        "<div ng-include src="+'"'+"'_uploader/__upload.html'"+'"'+"></div>"+
	                      "</tab>"+
	                      "<tab>"+
	                        "<tab-heading>"+
	                           "图片空间"+
	                        "</tab-heading>"+
	                        "<div ng-include src="+'"'+"'_uploader/__list.html'"+'"'+"></div>"+
	                      "</tab>"+
	                    "</tabset>",
	        link: function (scope, elm, attr, ctrls) {
	            var ctrl = ctrls[0],
	                ngModel = ctrls[1];

	            scope.is_check = function(file){
	                var exist = false,
	                    images = ngModel.$viewValue;
	                for(one in images){
	                    if(file.id == images[one].id){
	                        exist = true;
	                        break;
	                    }
	                }
	                return exist;
	            }
	        }
	    };
	}])
	.controller('Home', ['$scope', function ($scope) {
		$scope.images = [];

		$scope.process = function(file){
			$scope.images.push(file);
		}
	}])