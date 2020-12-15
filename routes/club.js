var express = require("express");
var router = express.Router();
var pool = require("../config/dbconfig");

var date = new Date();
// date.setDate(date.getDate());
var dd = date.getDate();
var mm = date.getMonth() + 1;
var yyyy = date.getFullYear();
var date = yyyy + "-" + mm + "-" + dd;

// 클럽리스트 호출
router.get("/clubList", function(req, res, next) {
    pool.getConnection ((err, conn) => {
        var sess = req.session;
        var clubsql = "SELECT * FROM `bookclublist`"
        var genresql = "SELECT * FROM `genre`"

        conn.query(clubsql, function (err, row) {
            if(err){ console.log(err)}
            else{
                conn.query(genresql, function (err, row2) {
                    conn.release()
                    if(err) { console.log(err) }
                    else{
                        res.render("clubList", {sess:sess, clubname:row, genre:row2});
                    }
                })
            }
        })
    })
});

// 클럽 검색
router.get("/search/", function(req, res, next) {
    pool.getConnection ((err, conn) => {
        var sess = req.session;
        console.log(req.query);
        var genresql = "SELECT * FROM `genre`"
        var getclub = `select * from bookclublist where ${req.query.searchWhat} like '%${req.query.searchKey}%'`
        conn.query(getclub, function (err, row) {
            if (err) {console.log(err)}
            else {
                conn.query (genresql, function (err, row2) {
                    conn.release()
                    if (err) {console.log(err)}
                    else {
                        res.render("clubList", {sess:sess, clubname:row, genre:row2});
                    }
                })
            }
        })
    })
});

//독서클럽 요청
router.post("/requset", function (req, res, next) {
    pool.getConnection((err, conn) =>{
        var sess = req.session;
        var reqins = "INSERT INTO bookclubrequset(ID, Genre_Name, Requset_Title, Requset_Reason, Requset_Date) VALUES (?,?,?,?,?)"

        conn.query(reqins,[sess.userid, req.body.Genre_Name, req.body.title, req.body.reason, date], function (err, row) {
            conn.release()
            if(err) { console.log(err) }
            else{
                res.send(`<script> alert("독서클럽 요청이 완료되었습니다."); location.href='/club/clubList'; </script>`)
            }
        })
    })
})

// 해당 클럽으로 이동
router.get("/:Club_Name", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;

        var usersql = "select * from users where id = ?"        
        var clubsql = "SELECT * FROM bookclublist WHERE Club_Name = ?"
        var listsql = "SELECT * FROM bookclubpost WHERE Club_Name = ?"
        
        conn.query(usersql,[sess.userid], function (err, row3) {
            conn.query(clubsql, [req.params.Club_Name], function (err, row) {
                if(err){ console.log(err)}
                else{
                    conn.query(listsql,[req.params.Club_Name], function (err, row2) {
                        conn.release()
                        if(err){ console.log(err)}
                        else{
                            res.render('club', {sess:sess, clubname:row, clubpost:row2, users:row3})
                        }
                    })
                }
            })
        })
    })
})

// 클럽 가입
router.get("/:Club_Name/join", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;

        var userup = "UPDATE users SET Club_Name = ? WHERE ID = ?"
        var clubup = "UPDATE `bookclublist` SET User_Num=(select count(ID) as User_Num from users where Club_Name = ?)"

        if(sess.userid == null){
            res.send(`<script> alert("로그인이 필요합니다."); location.href='/users/login'; </script>`)
        } else{
            conn.query(userup,[req.params.Club_Name, sess.userid], function (err, row) {
                if(err) { console.log(err) }
                else{
                    conn.query(clubup,[req.params.Club_Name], function (err, row2) {
                        conn.release()
                        if(err) {console.log(err)}
                        else{
                            res.redirect('/club/'+ req.params.Club_Name)
                        }
                    })
                }
            })
        }
    })
})

// 클럽 탈퇴
router.get("/:Club_Name/Withdrawal", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;

        var userup = "UPDATE users SET Club_Name = NULL WHERE ID = ?"
        var clubup = "UPDATE `bookclublist` SET User_Num=(select count(ID) as User_Num from users where Club_Name = ?) where Club_Name = ?"

        conn.query(userup,[sess.userid], function (err, row) {
            if(err) { console.log(err) }
            else{
                conn.query(clubup,[req.params.Club_Name, req.params.Club_Name], function (err, row2) {
                    conn.release()
                    if(err) {console.log(err)}
                    else{
                        res.send(`<script> alert("탈퇴가 완료되었습니다."); location.href='/club/${req.params.Club_Name}'; </script>`)
                    }
                })
            }
        })
    })
})

// 해당 클럽 글 작성이동
router.get("/:Club_Name/post", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req. session;

        var sql="SELECT * FROM bookclublist WHERE Club_Name = ?"
        conn.query(sql,[req.params.Club_Name], function (err, row) {
            conn.release()
            if(err){ console.log(err) }
            else{
                res.render('post', {sess:sess, clubname:row})
            }
        })
    })
})

// 해당 클럽 글 작성완료
router.post("/:Club_Name/post", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req. session;

        var postsql = `INSERT INTO bookclubpost(Club_Name, Post_Title, Post_Con, Write_Date) VALUES ('${req.params.Club_Name}',?,?,'${date}')`;

        conn.query(postsql,[req.body.title, req.body.content], function (err, row) {
            conn.release()
            if(err){ console.log(err)}
            else{
                res.redirect("/club/"+req.params.Club_Name);
            }
        })
    })
})

// 해당 클럽 게시글 조회
router.get("/:Club_Name/:Post_Num", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req. session;

        var detailsql= `SELECT * FROM bookclubpost WHERE Post_Num = '${req.params.Post_Num}'`
        var commentsql = `SELECT * FROM bookclubcomment WHERE Post_Num = '${req.params.Post_Num}'`
        var usersql = `select * from users where ID = '${sess.userid}'`

        if(sess.userid == null){
            res.send(`<script> alert("로그인을 해야 볼 수 있습니다."); location.href='/club/${req.params.Club_Name}'; </script>`)
        } else{
            conn.query(detailsql, function (err, row) {
                if(err){ console.log(err) }
                else{
                    conn.query(commentsql, function (err, row2) {
                        if(err) {console.log(err)}
                        else{
                            conn.query(usersql, function (err, row3) {
                                conn.release()
                                if(err) { console.log(err)}
                                else{
                                    res.render('postDetail', {sess:sess, detail:row, comm:row2, users:row3})
                                }
                            })
                        }                    
                    })
                }
            })
        }
    })
})

// 클럽 게시글 댓글 전송
router.post("/:Club_Name/:Post_Num/comment", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req. session;

        var postsql = `INSERT INTO bookclubcomment(ID, Post_Num, Comment_Con, Write_Date) VALUES ('${sess.userid}','${req.params.Post_Num}',?,'${date}')`;

        conn.query(postsql,[req.body.comment], function (err, row) {
            conn.release()
            if(err){ console.log(err)}
            else{
                res.redirect("/club/"+req.params.Club_Name+"/"+req.params.Post_Num);
            }
        })
    })
})

// 댓글 삭제
router.get("/:Club_Name/:Post_Num/drop", function (req, res, next) {
    pool.getConnection((err, conn) =>{
        var sess = req.session;

        var dropsql = "DELETE FROM bookclubcomment WHERE ID = ?"

        conn.query(dropsql,[sess.userid], function (err, row) {
            conn.release()
            res.redirect("/club/"+req.params.Club_Name+"/"+req.params.Post_Num);
        })
    })
})

module.exports = router;
