var express = require("express");
var router = express.Router();
var pool = require("../config/dbconfig");

var date = new Date();
// date.setDate(date.getDate());
var dd = date.getDate();
var mm = date.getMonth() + 1;
var yyyy = date.getFullYear();
var date = yyyy + "-" + mm + "-" + dd;

router.post("/bookList", function (req, res, next) {
    pool.getConnection((err, conn) => {
        console.log("aadsfasdf", req.body)
        var sess = req.session
        if (err) { console.log(err) }
        else {
            if (req.body.bookSearch == null) {
                var sql = `select * from book`
                conn.query(sql, function (err, row1) {
                    conn.release();
                    if (err) { console.log(err) }
                    else {
                        res.redirect("/book/bookList");
                    }
                })
            }
            else {
                var getBooksql = `select * from book where Title like '%${req.body.bookSearch}%'`
                conn.query(getBooksql, function (err, bookListRow) {
                    conn.release();
                    if (err) { console.log(err) }
                    else {
                        res.redirect("/book/bookList/" + req.body.bookSearch);
                    }
                })
            }
        }
    })
})


router.get("/bookList/", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        var asd = req.query.searchWhat;
        console.log(req.query);
        var getbook = `select * from book where ${req.query.searchWhat} like '%${req.query.searchKey}%'`
        var searchsql = `select * from book`
        if(req.query.searchWhat == undefined && req.query.searchKey == undefined){
           var booksql = "SELECT * FROM `book`"
           conn.query(booksql, function (err, row) {
               res.render("bookList", {sess:sess, bookrow: row})
           })
        } else{
            conn.query(getbook, function (err, row) {
                conn.release()
                if (err) { console.log(err) }
                else {
                    console.log("로우 확인", row)
                    res.render("bookList", { sess: sess, bookrow: row });
                }
            })
        }
    })
});

router.get("/bookList/:bookName", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log("북리스트겟 들어옴");
        console.log(req.params);
        var searchsql = `select * from book where Title like '%${req.params.bookName}%'`
        conn.query(searchsql, function (err, row) {
            conn.release()
            console.log("북서치 확인", req.params.bookName)
            res.render("bookList", { sess: sess, bookrow: row });
        })
    })
});


router.get("/bookDetail/:ISBN", function (req, res, next) {
    pool.getConnection((err, conn) => {
        if (err) { console.log(err) }
        else {
            var sess = req.session;
            var detailsql = "select * from book where ISBN=?"
            var reviewsql = "select * from review where ISBN=?"
            var starsql = "SELECT *, AVG(Star) as starAvg from librarybook where ISBN=? GROUP BY ISBN"

            conn.query(detailsql, [req.params.ISBN], function (err, detailRow) {
                if (err) { console.log(err) }
                else {
                    conn.query(reviewsql, [req.params.ISBN], function (err, reivewRow) {
                        if (err) { console.log(err) }
                        else {
                            conn.query(starsql, [req.params.ISBN], function (err, starRow) {
                                conn.release()
                                if (err) { console.log(err) }
                                else {
                                    console.log("date값 확인", detailRow)
                                    console.log("스타확인", starRow)
                                    res.render("bookDetail", { sess: sess, bookDetail: detailRow, review: reivewRow, star: starRow });
                                }
                            })
                        }
                    })

                }
            })
        }
    })
})

router.post("/bookDetail/:ISBN", function (req, res, next) {
    pool.getConnection((err, conn) => {
        console.log(req.body);

        var sess = req.session;
        if (err) { console.log(err) }
        else {
            var selectsql = "select * from book where ISBN=?"
            var librarybook = "insert into librarybook (ID, ISBN, Book_Register_Date) values (?,?,?)"
            var insertAmount = "insert into bookamount (Month, ID, Genre_Name, Reading_Book_Amount) values (?,?,?,?)"
            var updateAmount = "update bookamount set Reading_Book_Amount = Reading_Book_Amount + 1 where ID=?"
            conn.query(librarybook, [sess.userid, req.params.ISBN, date], function (err, insertRow) {
                console.log("라이브러리 인설트")
                if (err) {
                    if (sess.userid == null) {
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                        res.write("<script> alert('로그인해주세요.'); history.back(); </script>");
                    } else {
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                        res.write("<script> alert('서재에 있는 책입니다.'); history.back(); </script>");
                    }
                    console.log(err)
                }
                else {
                    console.log('들어왔다');
                    conn.query(selectsql, [req.params.ISBN], function (err, selectRow) {
                        console.log('11111111111111111111', selectRow);
                        if (err) { console.log(err) }
                        else {
                            conn.query(insertAmount, [yyyy + '-' + mm, sess.userid, selectRow[0].Genre_Name, 1], function (err, insertRow) {
                                if (err) {
                                    conn.query(updateAmount, [sess.userid], function (err, updateRow) {
                                        conn.release();
                                        if (err) { console.log(err) }
                                        else {
                                            res.redirect('/')
                                        }
                                    })
                                }
                                else {
                                    conn.release();
                                    res.redirect('/')
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.get("/qna/:ISBN", function (req, res, next) {
    console.log("sadasdasdasdasd")
    pool.getConnection((err, conn) => {
        if (err) { console.log(err) }
        else {
            var sess = req.session;
            var qnaList = "select * from que_code where ISBN=?"
            var booksql = "select * from book where ISBN=?"
            conn.query(qnaList, [req.params.ISBN], function (err, qnaListRow) {
                if (err) { console.log(err) }
                else {
                    conn.query(booksql, [req.params.ISBN], function (err, row) {
                        conn.release()
                        if (err) { console.log(err) }
                        else {
                            res.render("qna", { sess: sess, qnaList: qnaListRow, bookList: row })
                        }
                    })
                }
            })
        }
    })
})

router.get("/qnaWrite/:ISBN", function (req, res, next) {
    pool.getConnection((err, conn) => {
        if (err) { console.log(err) }
        else {
            var sess = req.session;
            var qnaWritesql = "select * from book where ISBN = ?"
            console.log("ISBN", req.params.ISBN)
            conn.query(qnaWritesql, [req.params.ISBN], function (err, qnaWriteRow) {
                conn.release()
                if (err) { console.log(err) }
                else {
                    console.log(qnaWriteRow);
                    res.render("qnaWrite", { sess: sess, qnaWrite: qnaWriteRow })
                }
            })
        }
    })
})


router.post("/qnaWrite/:ISBN", function (req, res, next) {
    pool.getConnection((err, conn) => {
        if (err) { console.log(err) }
        else {
            var sess = req.session;
            var writesql = "insert into que_code (ID, ISBN, Que_Title, Que_Content, Write_Date) values (?,?,?,?,?)"
            conn.query(writesql, [sess.userid, req.params.ISBN, req.body.Que_Title, req.body.Que_Content, date], function (err, qnaRow) {
                conn.release()
                if (err) { console.log(err) }
                else {
                    console.log("큐엔에이라이트 확인")
                    res.redirect("/book/qna/" + req.params.ISBN)
                }
            })
        }
    })
})

router.get("/answerList/:Que_Code", function (req, res, next) {
    pool.getConnection((err, conn) => {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        if (err) { console.log(err) }
        else {
            var sess = req.session;
            var selectqna = "select * from que_code where Que_Code =?"
            var answersql = "select * from que_code, answer where que_code.Que_Code=answer.Que_Code AND que_code.Que_Code=?"
            conn.query(selectqna, [req.params.Que_Code], function (err, selectRow) {
                if (err) { console.log(err) }
                else {
                    conn.query(answersql, [req.params.Que_Code], function (err, answerRow) {
                        conn.release()
                        if (err) { console.log(err) }
                        else {
                            console.log(answerRow);
                            res.render("answerList", { sess: sess, answerList: answerRow, queList: selectRow })
                        }
                    })
                }
            })
        }
    })
})

router.get("/answerWrite/:Que_Code", function (req, res, next) {
    pool.getConnection((err, conn) => {
        console.log("답변작성 겟")
        if (err) { console.log(err) }
        else {
            var sess = req.session;
            var answerget = "select * from que_code where Que_Code=?"
            conn.query(answerget, [req.params.Que_Code], function (err, answerRow) {
                conn.release()
                if (err) { console.log(err) }
                else {
                    res.render("answerWrite", { sess: sess, answerWrite: answerRow })
                }
            })
        }
    })
})

router.post("/answerWrite/:Que_Code", function (req, res, next) {
    pool.getConnection((err, conn) => {
        if (err) { console.log(err) }
        else {
            var sess = req.session;
            var answerWritesql = "insert into answer (Que_Code, ID, Answer_Title, Answer_Con, Write_Date) values (?,?,?,?,?)"
            if (sess == NULL) {
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                res.write("<script> alert('로그인 해주세요.'); history.back(); </script>");
            }
            conn.query(answerWritesql, [req.params.Que_Code, sess.userid, req.body.Answer_Title, req.body.Answer_Con, date], function (err, answerRow) {
                conn.release()
                if (err) {
                    console.log(err)
                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                    res.write("<script> alert('이미 답변을 달았습니다.'); history.back(); </script>");
                }
                else {
                    res.redirect("/book/answerList/" + req.params.Que_Code)
                }
            })
        }
    })
})

module.exports = router;