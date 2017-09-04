/**
 * Created by kinnplh on 11/25/16.
 */
var express = require('express');
var should = require('should');
var fs = require('fs');
var mocha = require('mocha');
var project = require('../dataBase/model/project');
var homework = require('../dataBase/model/homework');
var session = require('supertest-session');
var app = require("../app");
var request = session(app);
describe('testEditor', function () {
   it("testLogin and redirect to a project view", function (done) {
       request.post('/login').send({
           userName: "test",
           password: "test"
       }).expect(302).end(function (err, res) {
           request.get('/project').query({
               projectId: "5837fc81655e9b21d67d0f0f"
           }).expect(200).end(function (err, res) {
               done(err);
           });
       });
   });

   it("test file upload", function (done) {
       request.post('/file/uploadFile')
           .attach("inputFile","../public/files/testUploadFile.txt")
           .expect(200).end(function (err, res) {
            console.log(res.text);
            JSON.parse(res.text).status.should.equal("success");
            // check whether it has really be uploaded
            var fileList = fs.readdirSync("/home/kinnplh/projectFile/5837fc81655e9b21d67d0f0f");
           (fileList.indexOf("testUploadFile.txt") == -1).should.not.be.ok();
            done(err);
       });
   });

   it("test file rename", function(done){
       request.post("/file/uploadEditor")
           .send({
               text: "It has been modified according to the editor!",
               filePath: "/home/kinnplh/projectFile/5837fc81655e9b21d67d0f0f/testUploadFile.txt",
               name: "testRenameFile.txt",
               projectId: "5837fc81655e9b21d67d0f0f"
           })
           .expect(200)
           .end(function (err, res) {
               var fileList = fs.readdirSync("/home/kinnplh/projectFile/5837fc81655e9b21d67d0f0f");
               (fileList.indexOf("testUploadFile.txt") == -1).should.be.ok();
               (fileList.indexOf("testRenameFile.txt") == -1).should.not.be.ok();
               var fileContent = fs.readFileSync("/home/kinnplh/projectFile/5837fc81655e9b21d67d0f0f/testRenameFile.txt", "utf8");
               (fileContent == "It has been modified according to the editor!").should.be.ok();
               done(err);
           });
    });

    it("test getFileContent", function (done) {
        request.post('/editor/getFileContent')
            .send({
                path: "/home/kinnplh/projectFile/5837fc81655e9b21d67d0f0f/testRenameFile.txt",
                projectId: "5837fc81655e9b21d67d0f0f"
            })
            .expect(200)
            .end(function (err, res) {
                (JSON.parse(res.text).content == "It has been modified according to the editor!").should.be.ok();
                done(err);
            });
    });



    it("test file delete",function (done) {
        request.post("/editor/deleteFile")
            .send({
                filePath: "/home/kinnplh/projectFile/5837fc81655e9b21d67d0f0f/testRenameFile.txt",
                projectId: "5837fc81655e9b21d67d0f0f"
            })
            .expect(200)
            .end(function (err, res) {
                var fileList = fs.readdirSync("/home/kinnplh/projectFile/5837fc81655e9b21d67d0f0f");
                (fileList.indexOf("testRenameFile.txt") == -1).should.be.ok();
                done(err);
            });
    });

    it("test change project setting", function (done) {
        request.post("/project/projectSettingChange")
            .send({
                topEntityName: "topEntityNameAfterChanged",
                inputFile: "inputFileNameAfterChanged.vhd",
                projectId: "5837fc81655e9b21d67d0f0f"
            })
            .type('form')
            .expect(200)
            .end(function (err, res) {
                (JSON.parse(res.text).status == "success").should.be.ok();
                done(err);
            });
    });

});