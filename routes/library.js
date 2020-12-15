var express = require("express");
var router = express.Router();
var pool = require("../config/dbconfig");
var multer = require("multer");

var date = new Date();
// date.setDate(date.getDate());
var dd = date.getDate();
var mm = date.getMonth() + 1;
var yyyy = date.getFullYear();
var date = yyyy + "-" + mm + "-" + dd;

//파일 저장위치와 파일이름 설정
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //파일이 이미지 파일이면
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
            console.log("이미지 파일이네요")
            cb(null, './public/img')
        }
    },
    //파일이름 설정
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }

})

//파일 업로드 모듈
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cd) {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
            cd(null, true);
        } else {
            cd(null, false);
        }
    }
})

//파일 업로드 및 디비에 위치 저장
router.post('/boardFile', upload.single('boardFile'), function (req, res) {
    console.log('filename:' + req.file)
    if (req.file == undefined) {
        res.send('<script type="text/javascript">alert("올바른 이미지 파일을 첨부 해주세요");history.back();</script>');

    } else {
        console.log("post")
        console.log(req.file)
        console.log(req.file.path)
        console.log(upload)
        console.log(upload.storage.getFilename)



        var asd = req.file.path.split('\\');
        asd.splice(0, 1);
        var path = asd.join('\\');

        //파일 위치를 mysql 서버에 저장
        connection.query('insert into book (Cover) values (?)', [path], function () {
            res.redirect('/');

        });
    }

});


router.get("/library/:ID", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session
        if (err) { console.log(err) }
        else {
            var getlibrarysql = `select * from library, librarybook where library.ID=librarybook.ID AND library.ID=?`
            var getbooksql = "select * from book, librarybook where book.ISBN=librarybook.ISBN AND librarybook.ID=?"
            var updateCheck = "update library set Check_Num = Check_Num+1 where ID=?"
            var sql = "select review.ISBN, review.Con from review left outer join librarybook on review.ID=librarybook.ID where librarybook.ID=?"
            // var badgesql = "select *, COUNT(Reading_King_Badge) as badge from bookking where ID=? GROUP BY ID"
            var badgesql = "select * from bookking where ID=? AND Month=?"
            var likesql = "SELECT * FROM `follow` WHERE Follow_ID = ? AND ID = ?"
            var selectID = "select * from library where ID=?"

            conn.query(getlibrarysql, [req.params.ID], function (err, libraryListRow) {
                if (err) { console.log(err) }
                else {
                    conn.query(getbooksql, [req.params.ID], function (err, getbookRow) {
                        if (err) { console.log(err) }
                        else {
                            conn.query(updateCheck, [req.params.ID], function (err, updateRow) {
                                
                                if (err) { console.log(err) }
                                else {
                                    conn.query(sql, [req.params.ID], function (err, row) {
                                        if (err) { console.log(err) }
                                        else {
                                            conn.query(badgesql, [req.params.ID, yyyy + '-' + mm], function (err, badgerow) {
                                                if (err) { console.log(err) }
                                                else {
                                                    conn.query(likesql, [req.params.ID, sess.userid], function (err, row1) {
                                                        conn.query (selectID, [req.params.ID], function (err, rowID) {
                                                            conn.release();
                                                            if (err) {console.log(err)}
                                                            else {
                                                                res.render("library", { bookList: libraryListRow, sess: sess, libraryRow: getbookRow, reviewList: row, badge: badgerow, like: row1, library:rowID })
                                                            }
                                                        })
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

//팔로웅~
router.post("/Follow/", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        
        if (req.query.follow == 'low') {
            var delsql = "DELETE FROM follow WHERE ID = ?"
            conn.query(delsql, [sess.userid], function (err, row) {
                conn.release();
                if(err) { console.log(err) }
                else{
                    res.redirect('/library/library/'+req.query.id);
                }
            })
        } else {
            var inssql = "INSERT INTO follow(Follow_ID, ID) VALUES (?,?)"
            conn.query(inssql,[req.query.id, sess.userid], function (err, row) {
                conn.release();
                if(err) { console.log(err) }
                else{
                    res.redirect('/library/library/'+req.query.id);
                }
            })
        }
    })
})

//좋아용~
router.post("/Like/", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
                
        if (req.query.like == 'like') {
            var reviewsql = "SELECT * FROM `review` WHERE ID = ? AND ISBN = ?"
            var delsql = "DELETE FROM `likes` WHERE Review_Code = ? AND ID = ?"
            conn.query(reviewsql,[req.query.id, req.query.ISBN], function (err, row) {
                if(err) { console.log(err) }
                else{
                    conn.query(delsql, [row[0].Review_Code, sess.userid], function (err, row1) {
                        conn.release();
                        if(err) { console.log(err) }
                        else{
                            res.redirect('/library/myBookDetail/?ID='+req.query.id+"&ISBN="+req.query.ISBN);
                        }
                    })
                }
            })
        } else {
            var reviewsql = "SELECT * FROM `review` WHERE ID = ? AND ISBN = ?"
            var inssql = "INSERT INTO likes(Review_Code, ID) VALUES (?,?)"
            conn.query(reviewsql,[req.query.id, req.query.ISBN], function (err, row) {
                if(err) { console.log(err) }
                else{
                    conn.query(inssql,[row[0].Review_Code, sess.userid], function (err, row1) {
                        conn.release();
                        if(err) { console.log(err) }
                        else{
                            res.redirect('/library/myBookDetail/?ID='+req.query.id+"&ISBN="+req.query.ISBN);
                        }
                    })
                }
            })
        }
    })
})
// router.get ("/showMemberLibrary/:ID", function (req, res, next) {
//     pool.getConnection ((err, conn) => {
//         var sess = req.session
//         if (err) { console.log(err) }
//         else {
//             var getlibrarysql = `select * from library, librarybook where library.ID=librarybook.ID AND library.ID=?`
//             var getbooksql = "select * from book, librarybook where book.ISBN=librarybook.ISBN AND librarybook.ID=?"
//             var updateCheck = "update library set Check_Num = Check_Num+1 where ID=?"
//             var sql = "select review.ISBN, review.Con from review left outer join librarybook on review.ID=librarybook.ID where librarybook.ID=?"
//             conn.query (getlibrarysql, [req.params.ID], function (err, libraryListRow) {
//                 if (err) { console.log(err) }
//                 else {
//                     conn.query (getbooksql, [req.params.ID], function (err, getbookRow) {
//                         if (err) {console.log(err)}
//                         else {
//                             conn.query (updateCheck, [req.params.ID], function (err, updateRow) {
//                                 conn.release();
//                                 if (err) { console.log (err) }
//                                 else {
//                                     conn.query (sql, [req.params.ID], function (err, row) {
//                                         if (err) {console.log(err)}
//                                         else {
//                                                 console.log("레프트조인한거 확인",row)
//                                                 res.render("library", {bookList : libraryListRow, sess: sess, libraryRow:getbookRow, reviewList:row})
//                                         }
//                                     })
//                                 }
//                             })
//                         }
//                     })
//                 }
//             })
//         }
//     })
// })

// 서재 도서 삭제
router.get("/myLibraryDelete", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session
        if (err) { console.log(err) }
        else {
            var getlibrarysql = `select * from library, librarybook where library.ID=librarybook.ID AND library.ID=?`
            var getbooksql = "select * from book, librarybook where book.ISBN=librarybook.ISBN AND librarybook.ID=?"
            var sql = "select review.ISBN, review.Con from review left outer join librarybook on review.ID=librarybook.ID where librarybook.ID=?"
            conn.query(getlibrarysql, [sess.userid], function (err, libraryListRow) {
                if (err) { console.log(err) }
                else {
                    conn.query(getbooksql, [sess.userid], function (err, getbookRow) {
                        conn.release();
                        if (err) { console.log(err) }
                        else {
                            res.render("myLibraryDelete", { bookList: libraryListRow, sess: sess, libraryRow: getbookRow })
                        }
                    })
                }
            })
        }
    })
})

//서재 도서 삭제
router.post("/myLibraryDelete", function (req, res, next) {
    console.log("일로옴!!")
    pool.getConnection((err, conn) => {
        var sess = req.session
        if (err) { console.log(err) }
        else {
            console.log("알이큐점바이", req.body.deleteBooks)
            var deletesql = "delete from librarybook where ID=? AND ISBN=?"
            console.log(req.body.deleteBooks.length)
            if (req.body.deleteBooks[1] == null) {
                conn.query(deletesql, [sess.userid, req.body.deleteBooks[0]], function (err, row) {
                    conn.release();
                    if (err) { console.log(err) }
                    else {
                        console.log("한개일때")
                    }
                })
            } else {
                for (var i = 0; i < req.body.deleteBooks.length; i++) {
                    conn.query(deletesql, [sess.userid, req.body.deleteBooks[i]], function (err, row) {
                        conn.release();
                        if (err) { console.log(err) }
                        else {
                            console.log("여러개일때")
                        }
                    })
                }
            }
            res.redirect('/library/library/' + sess.userid)
        }
    })
})

// router.post ("/library/:ID", function (req, res, next) {
//     pool.getConnection ((err, conn) => {
//         var sess = session
//         if (err) { console.log(err) }
//         else {
//             var Review = "select * from Review where ID=? AND ISBN=?"
//             var 
//         }
//     })
// })

// 도서 상세
router.get("/myBookDetail", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log(req.query.ID, req.query.ISBN);

        if (err) { console.log(err) }
        else {
            var reviewsql = "select * from review where ID=? AND ISBN=?"
            var getlibrarysql = `select * from book, librarybook where book.ISBN=librarybook.ISBN AND librarybook.ID=? AND book.ISBN=?`
            var commentsql = "select * from comment where Review_Code=?"
            var starsql = "SELECT star as starAvg from librarybook where ISBN=?"
            var likesql = "SELECT * FROM `likes` WHERE Review_Code = ? AND ID = ?"
            var sumsql = "SELECT count(Review_Code) as count FROM likes WHERE Review_Code = ?"

            conn.query(getlibrarysql, [req.query.ID, req.query.ISBN], function (err, getRow) {
                if (err) { console.log(err) }
                else {
                    conn.query(reviewsql, [req.query.ID, req.query.ISBN], function (err, revRow) {
                        if (err) { console.log(err) }
                        else {
                            if (revRow.length == 0) {
                                conn.query(starsql, [req.query.ISBN], function (err, row4) {
                                    conn.release();
                                    if (err) { console.log(err) }
                                    else {
                                        res.render("myBookDetail", { bookDetail: getRow, sess: sess, check: false, star: row4})
                                    }
                                })
                            }
                            else {
                                conn.query(commentsql, [revRow[0].Review_Code], function (err, commentrow) {
                                    if (err) { console.log(err) }
                                    else {
                                        conn.query(starsql, [req.query.ISBN], function (err, row4) {
                                            if (err) { console.log(err) }
                                            else {
                                                conn.query(likesql,[revRow[0].Review_Code, sess.userid], function (err, row) {
                                                    if(err) { console.log(err)}
                                                    else{
                                                        conn.query(sumsql,[revRow[0].Review_Code], function (err, row2) {
                                                            conn.release();
                                                            if(err) { console.log(err)}
                                                            else{
                                                                res.render("myBookDetail", { bookDetail: getRow, sess: sess, reviewRow: revRow, commentrow: commentrow, check: true, star: row4, like:row, SSum : row2 })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    })
})

router.post("/myBookDetail/comment", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log("북디테일코멘트쿼리확인", req.query.ID)
        var selectcomment = "select * from review where ID=? AND ISBN=?"
        var commentsql = "insert into comment (Review_Code, ID, Comment_Con, Write_Date) values (?,?,?,?)"

        conn.query(selectcomment, [req.query.ID, req.query.ISBN], function (err, row) {
            if (err) { console.log(err) }
            else {
                conn.query(commentsql, [row[0].Review_Code, sess.userid, req.body.Comment_Con, date, null, null], function (err, starRow) {
                    conn.release();
                    if (err) { console.log(err) }
                    else {
                        res.redirect('/library/myBookDetail/' + '?ID=' + req.query.ID + '&ISBN=' + req.query.ISBN);
                    }
                })
            }
        })
    })
});

router.get("/myBookInsert", function (req, res, next) {
    pool.getConnection((err, conn) => {
        if (err) { console.log(err) }
        else {
            var sess = req.session;
            var gerne = "select * from genre"
            conn.query(gerne, function (err, row) {
                conn.release();
                if (err) { console.log(err) }
                else {
                    res.render("myBookInsert", { sess: sess, genreList: row })
                }
            })
        }
    })
})

// router.post('/story_insert', upload.single('fileupload'), function (req, res, next) {
//     var val = req.session;
//     var body = req.body
//     var asd = req.file.path.split('\\');
//     asd.splice(0, 1);
//     var path = asd.join('\\');
//     var story = "insert into story (storyName, storyImg, storyInfo, sellerId, productNum) values (?, ?, ?, ?, ?)"
//     con.query(story, [body.storyName, path, body.storyInfo, val.sellerId, body.productNum], function (err, row) {
//       if (err) {
//         res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
//         res.write("<script> alert('실패하였습니다..'); history.back(); </script>");
//       }
//       else {
//         res.redirect("/story/story_board");
//       }
//     });
//   });

router.post("/myBookInsert", upload.single('boardFile'), function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;

        var asd = req.file.path.split('\\');
        asd.splice(0, 1);
        var path = asd.join('\\');

        var Publication_Date = req.body.txtBirth1 + '-' + req.body.txtBirth2 + '-' + req.body.txtBirth3;
        var selectsql = "select * book where ISBN=?"
        var insertbook = "insert into librarybook (ID, ISBN, Star, Book_Register_Date) values (?,?,?,?)"
        var booksql = "insert into book (ISBN, Genre_Name, Title, Cover, Author, Translator, Publisher, Publication_Date) values (?,?,?,?,?,?,?,?)"
        console.log("바디값확인", req.body)

        conn.query (selectsql, [req.body.ISBN], function (err, row) {
            if (err) {console.log(err)}
            else {
                if (row.length == 0) {
                    conn.query(booksql, [req.body.ISBN, req.body.Genre_Name, req.body.Title, path, req.body.Author, req.body.Translator, req.body.Publisher, Publication_Date], function (err, bookRow) {
                        conn.release();
                        if (err) {
                            console.log(err)
                            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                            res.write("<script> alert('책 추가 실패입니다 다시 시도해주세요.'); history.back(); </script>");
                        }
                        else {
                            conn.query(insertbook, [sess.userid, req.body.ISBN, req.body.star, date], function (err, row) {
                                if (err) { console.log(err) }
                                else {
                                    res.redirect('/library/library/' + sess.userid);
                                }
                            })
                        }
                    })
                }
                else {
                    conn.query(insertbook, [sess.userid, req.body.ISBN, req.body.star, date], function (err, row) {
                        conn.release();
                        if (err) {
                            console.log(err)
                            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
                            res.write("<script> alert('서재에 있는 책입니다.'); history.back(); </script>");
                        }
                        else {
                            res.redirect('/library/library/' + sess.userid);
                        }
                    })
                }
            }
        })
    })
});

router.get("/myReviewUpdate", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log("wwwww", req.query.ID);
        var selectupdate = "select * from review where ID=? AND ISBN=?"
        conn.query(selectupdate, [req.query.ID, req.query.ISBN], function (err, row) {
            conn.release();
            if (err) { console.log(err) }
            else {
                res.render("myReviewUpdate", { sess: sess, reviewRow: row });
            }
        })
    })
});

router.post("/myReviewUpdate", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log("xxxx", req.query.ID)
        var updatesql = "update review set Con=?, Strapline=? where ID=? AND ISBN=?"
        var starupdate = "update librarybook set Star=? where ID=? AND ISBN=?"
        conn.query(updatesql, [req.body.Con, req.body.Strapline, req.query.ID, req.query.ISBN], function (err, row) {
            if (err) { console.log(err) }
            else {
                console.log("스타타타타타ㅏ타타타", req.body.star)
                conn.query(starupdate, [req.body.star, req.query.ID, req.query.ISBN], function (err, starRow) {
                    conn.release();
                    if (err) { console.log(err) }
                    else {
                        res.redirect('/library/library/' + req.query.ID);
                    }
                })
            }
        })
    })
});

router.get("/myReviewWrite", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log(req.query.ID, req.query.ISBN);

        if (err) { console.log(err) }
        else {
            var sql = "select * from book where ISBN=?"
            var getlibrarysql = `select * from library, librarybook where library.ID=librarybook.ID AND library.ID=? AND ISBN=?`
            conn.query(getlibrarysql, [req.query.ID, req.query.ISBN], function (err, getRow) {
                if (err) { console.log(err) }
                else {
                    conn.query(sql, [req.query.ISBN], function (err, row2) {
                        conn.release();
                        if (err) {console.log(err)}
                        else {
                            res.render("myReviewWrite", { reviewRow: getRow, sess: sess, bookrow:row2 })
                        }
                    })
                }
            })
        }
    })
})

router.post("/myReviewWrite", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log(req.query.ID, req.query.ISBN);
        if (err) { console.log(err) }
        else {
            var getlibrarysql = `select * from library, librarybook where library.ID=librarybook.ID AND library.ID=? AND ISBN=?`
            var writesql = "insert into review (ID, ISBN, Con, Write_Date, Strapline) values (?,?,?,?,?)"
            var starupdate = "update librarybook set Star=? where ID=? AND ISBN=?"
            conn.query(writesql, [req.query.ID, req.query.ISBN, req.body.Con, date, req.body.Strapline], function (err, getRow) {
                if (err) { console.log(err) }
                else {
                    conn.query(starupdate, [req.body.Star, req.query.ID, req.query.ISBN], function (err, updateRow) {
                        conn.release();
                        if (err) { console.log(err) }
                        else {
                            res.redirect('/library/library/' + req.query.ID)
                        }
                    })
                }
            })
        }
    })
})

router.get("/myLibrary", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log(req.query.ID, req.query.ISBN);

        if (err) { console.log(err) }
        else {
            var getlibrarysql = `select * from library, librarybook where library.ID=librarybook.ID AND library.ID=? AND ISBN=?`
            conn.query(getlibrarysql, [req.query.ID, req.query.ISBN], function (err, getRow) {
                conn.release();
                if (err) { console.log(err) }
                else {
                    res.render("myLibrary", { bookList: getRow, sess: sess })
                }
            })
        }
    })
})

router.get("/myReviewDetail/", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        console.log(req.query.ID, req.query.ISBN);

        if (err) { console.log(err) }
        else {
            var getlibrarysql = `select * from library, librarybook where library.ID=librarybook.ID AND library.ID=? AND ISBN=?`
            conn.query(getlibrarysql, [req.query.ID, req.query.ISBN], function (err, getRow) {
                conn.release();
                if (err) { console.log(err) }
                else {
                    res.render("myReviewDetail", { bookList: getRow, sess: sess })
                }
            })
        }
    })
})

router.post("/review/:ID/:ISBN", function (req, res, next) {
    pool.getConnection((err, conn) => {
        var sess = req.session;
        if (err) { console.log(err) }
        else {
            var insertReview = `insert into review (ID, ISBN, Con, Write_Date, Strapline) values (?,?,?,?,?)`
            var updateStar = "update librarybook set Star = ? where ID=? AND ISBN=?"
            conn.query(insertReview, [sess.userid, req.params.ISBN, req.body.Con, date, req.body.Strapline], function (err, insertRow) {
                conn.release();
                if (err) { console.log(err) }
                else {
                    conn.query(updateStar, [req.body.Star, sess.userid, req.params.ISBN], function (err, updateRow) {
                        conn.release();
                        if (err) { console.log(err) }
                        else {
                            console.log("1111111111111")
                            // res.redirect ('/library')
                        }
                    })
                }
            })
            if (likes != NULL) {
                var select = "select * from review where ID=? AND ISBN=?"
                var insertLike = "insert into Likes (Review_Code, ID) values (?,?,?)"
                var updateLikes = "update review set Likes_Num = Likes_Num+1 where Review_Code=?"
                conn.query(select, [req.params.ID, req.params.ISBN], function (err, selectRow) {
                    if (err) { console.log(err) }
                    else {
                        conn.query(insertLike, [selectRow[0].Review_Code, sess.userid], function (err, insertLikeRow) {
                            if (err) { console.log(err) }
                            else {
                                conn.query(updateLikes, [select[0].Review_Code], function (err, updateRow) {
                                    conn.release();
                                    if (err) { console.log(err) }
                                    else {
                                        console.log("222222222222222")
                                    }
                                })
                            }
                        })
                    }
                })
            }
            res.redirect('/library')
        }
    })
})

module.exports = router;