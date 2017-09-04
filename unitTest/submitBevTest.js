var express = require('express');
var should = require('should');
var fs = require('fs');
var mocha = require('mocha');
var project = require('../dataBase/model/project');
var homework = require('../dataBase/model/homework');
var session = require('supertest-session');
var app = require("../app");
var request = session(app);

describe('test submit', function () {
    it("test into submit list", function (done) {
        request.get('/submit')
            .query({projectId: "5837fc81655e9b21d67d0f0f"})
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });

    it("test into submit detail", function (done) {
        request.get('/submit/detail')
            .query({submitId: "5837ae61138a5a417c282a98"})
            .expect(200)
            .end(function (err, res) {
                done(err);
            });
    });

    it("test download simulation result", function (done) {
       request.get('/download/kkk')
           .query({submitId: "5837ae61138a5a417c282a98"})
           .expect(200)
           .end(function (err, res) {
               (res.header["content-disposition"] == 'attachment; filename="dump.vcd"').should.be.ok();
               done(err);
           });
    });

    it("test download all files", function (done) {
        request.get('/download/kkk')
            .query({submitIdForFile: "5837ae61138a5a417c282a98"})
            .expect(200)
            .end(function (err, res) {
                (res.header["content-disposition"] == 'attachment; filename="all.zip"').should.be.ok();
                done(err);
            });
    });
});