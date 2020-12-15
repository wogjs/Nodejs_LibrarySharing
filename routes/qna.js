var express = require("express");
var router = express.Router();
var pool = require("../config/dbconfig");

var date = new Date();
// date.setDate(date.getDate());
var dd = date.getDate();
var mm = date.getMonth() + 1;
var yyyy = date.getFullYear();
var date = yyyy + "-" + mm + "-" + dd;

/* GET users listing. */

// 질문리스트 뛰우기
router.get("/qnaList/:ISBN", function(req, res, next) {
    pool.getConnection((err, conn) => {
        if(err){
            console.log(err);            
        } else{
            var sess = req.session;
            var sql = `select * from que_code where ISBN = ${req.params.ISBN}`
        
            conn.query(sql, function(err, row){
                conn.release();
                res.render("qna", {sess:sess, qna : row});
            })
        }
    }) 
  });

module.exports = router;
