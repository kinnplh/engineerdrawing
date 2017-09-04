/**
 * Created by kinnplh on 11/25/16.
 */
var should = require('should');
var mocha = require('mocha');
var project = require('../dataBase/model/project');
var supertest = require('supertest');
var app = require("../app");
var request = supertest(app);


describe("testIndex", function () {
    it('should response 500 when project name reused', function (done) {
        request
            .post('/createProject')
            .type('json')
            .send({
                projectName: "testProjectName",
                topEntity: "testTopEntity",
                inputFile: "testInputFile.vhd",
                projectType: 0,
                userId: "5806ed22df0634c9c649d586"
            })
            .expect(500)
            .end(function (err, res) {
                //console.log(res);
                res.text.should.equal("The project name has been used!");
                done(err);
            });
    });
    it('should create and delete project successfully', function (done) {
        request
            .post('/createProject')
            .type('json')
            .send({
                projectName: "unusedProjectName",
                topEntity: "testTopEntity",
                inputFile: "testInputFile.vhd",
                projectType: 0,
                userId: "5806ed22df0634c9c649d586"
            })
            .expect(200)
            .end(function (err, res) {
                //console.log(res.text);
                var newPrjId = JSON.parse(res.text).projectId;
                //console.log(newPrjId);
                request.get('/deleteProject').query({
                    projectId: newPrjId,
                    userId: "5806ed22df0634c9c649d586"
                }).expect(302).end(function (err, res) {
                    res.text.should.equal("Found. Redirecting to /");
                    done(err);
                });
            });
    });
});