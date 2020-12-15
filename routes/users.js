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

// 회원가입
router.get("/join", function(req, res, next) {
  pool.getConnection((err, conn) => {
    var sess = req.session;
    
    var usersql = "select * from users"
    var addrsql = "SELECT * FROM address"
    conn.query(usersql,function (err, row) {
      if(err) { console.log(err)}
      else{
        conn.query(addrsql, function (err, row2) {
          conn.release();
          if(err) {console.log(err)}
          else{
            res.render("join", {sess:sess, checkid:row, addr:row2});
          }
        })
      }
    })
  })
});

//회원가입
router.post("/join", function(req, res) {
  pool.getConnection((err, conn) => {
    var Phone_Num = req.body.Phone_Num1 + '-' + req.body.Phone_Num2 + '-' + req.body.Phone_Num3;
    var Birthday = req.body.Birth1 + '-' + req.body.Birth2 + '-' + req.body.Birth3
    if (err) {
      console.log(err);
    } else {
      var signupsql = "SELECT * FROM users WHERE ID = ?";
      conn.query(signupsql, [req.body.userId], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          if (result.length === 0) {
            var insert =
              "INSERT INTO `users`(`ID`, `Address`, `PW`, `Name`, `Phone_Num`, `Birthday`, `Email`, `Signup_date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            conn.query(
              insert,
              [req.body.ID,
                req.body.Address,
                req.body.PW,
                req.body.Name,
                Phone_Num,
                Birthday,
                req.body.Email,
                date
              ],
              (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  var library = "insert into library (ID, Check_Num, Library_Rec, Open_Range) values (?,'0','0','1')"
                  conn.query (library, [req.body.ID], function (err, libRow) {
                    conn.release();
                    if (err) { console.log(err) }
                    else {
                      res.redirect('/users/login');
                    }
                  })
                }
              }
            );
          } else {
            res.send({ result: true });
          }
        }
      });
    }
  });
});

//로그인
router.post("/login", function(req, res, next) {
  pool.getConnection((err, conn) => {
    var sess = req.session;

    if (err) {
      console.log(err);
    } else {
      var signinsql = "SELECT * FROM users WHERE ID = ? AND PW = ?";
      conn.query(signinsql, [req.body.ID, req.body.PW], (err, result) => {
        conn.release();
        if (err) {
          console.log(err);
        } else {
          if (result.length === 0) {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
            res.write("<script> alert('서칭에러.'); history.back(); </script>");
            return;
          } else {
            sess.userid = result[0].ID, 
            sess.Club_Name = result[0].Club_Name;
            console.log("session값 로그", sess.userid)
          }
          res.redirect ('/')
        }
      });
    }
  });
});

// 로그인
router.get("/login", function(req, res, next) {
  var sess = req.session;
  res.render("login", {sess:sess});
});

//마이페이지
router.get("/mypage", function (req, res, next) {
  pool.getConnection((err, conn) =>{
    var sess = req.session;

    var usersql = "SELECT * from users,library WHERE users.ID = library.ID AND users.ID = ? "
    var badgesql = "select * from bookking where ID=? AND Month=?"
    var ingsql = "SELECT count(Follow_ID) as Follow_ID FROM `follow` WHERE Follow_ID = ?"
    var lowsql = "SELECT count(ID) as ID FROM `follow` WHERE ID = ?"
    var monsql = "SELECT DISTINCT(Month) FROM `bookamount` WHERE ID = ? ORDER BY Month DESC"
    var amoutsql = `SELECT * FROM bookamount WHERE ID = ? AND Month = '${yyyy+'-'+mm}'`

    conn.query(usersql,[sess.userid], function (err, row) {
      if(err) {console.log(err)}
      else{
        conn.query(badgesql,[sess.userid, yyyy+"-"+mm], function (err, row2) {
          if(err) { console.log(err) }
          else{
            conn.query(ingsql,[sess.userid], function (err, row3) {
              if(err) { console.log(err) }
              else{
                conn.query(lowsql,[sess.userid], function (err, row4) {
                  if(err) { console.log(err) }
                  else{
                    conn.query(monsql,[sess.userid],function (err, row6) {
                      if(err) {console.log(err)}
                      else{
                        conn.query(amoutsql,[sess.userid],function (err, row7) {
                          conn.release();
                          if(err) { console.log(err)}
                          else{
                            res.render("mypage", {sess:sess, user:row, badge:row2, wing:row3, wers:row4, Mon:row6, amount:row7})
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
})

//마이페이지 검색
router.get("/amount/", function (req, res, next) {
  pool.getConnection((err, conn) => {
    var sess = req.session
    var usersql = "SELECT * from users,library WHERE users.ID = library.ID AND users.ID = ? "
    var badgesql = "select * from bookking where ID=? AND Month=?"
    var ingsql = "SELECT count(Follow_ID) as Follow_ID FROM `follow` WHERE Follow_ID = ?"
    var lowsql = "SELECT count(ID) as ID FROM `follow` WHERE ID = ?"
    var monsql = "SELECT DISTINCT(Month) FROM `bookamount` WHERE ID = ? ORDER BY Month DESC"
    var amoutsql = `SELECT * FROM bookamount WHERE ID = ? AND Month = '${req.query.searchWhat}'`

    conn.query(usersql,[sess.userid], function (err, row) {
      if(err) {console.log(err)}
      else{
        conn.query(badgesql,[sess.userid, yyyy+"-"+mm], function (err, row2) {
          if(err) { console.log(err) }
          else{
            conn.query(ingsql,[sess.userid], function (err, row3) {
              if(err) { console.log(err) }
              else{
                conn.query(lowsql,[sess.userid], function (err, row4) {
                  if(err) { console.log(err) }
                  else{
                    conn.query(monsql,[sess.userid],function (err, row6) {
                      if(err) {console.log(err)}
                      else{
                        conn.query(amoutsql,[sess.userid], function (err, row7) {
                          conn.release();
                          if(err) { console.log(err)}
                          else{
                            res.render("mypage", {sess:sess, user:row, badge:row2, wing:row3, wers:row4, Mon:row6, amount:row7})
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
})

//공개범위 전체 공개
router.get("/range/open", function (req, res, next) {
  pool.getConnection((err, conn) =>{
    var sess = req.session;
    var updatesql = "UPDATE library SET Open_Range = 1 WHERE ID = ?"

    conn.query(updatesql,[sess.userid], function (err, row) {
      conn.release();
      res.redirect("/users/mypage");
    })
  })
})

//공개범위 비공개
router.get("/range/close", function (req, res, next) {
  pool.getConnection((err, conn) =>{
    var sess = req.session;
    var updatesql = "UPDATE library SET Open_Range = 0 WHERE ID = ?"

    conn.query(updatesql,[sess.userid], function (err, row) {
      conn.release();
      res.redirect("/users/mypage");
    })
  })
})

// 마이페이지 수정페이지
router.get("/update", function (req, res, next) {
  pool.getConnection((err, conn) => {
    var sess = req.session;
    var usersql = "select * from users where ID =?"
    var addrsql = "SELECT * FROM address"

    conn.query(usersql,[sess.userid], function (err, row) {
      if(err) { console.log(err)}
      else{
        conn.query(addrsql, function (err, row2) {
          conn.release();
          res.render("update", {sess:sess, user:row, addr: row2})
        })
      }
    })
  })
})

// 마이페이지 수정완료
router.post("/update", function(req, res, next) {
  pool.getConnection((err, conn) => {
    var sess = req.session;
    var updatesql = "UPDATE users SET Address = ?, PW = ?, Name = ?,Phone_Num = ?,Birthday = ? ,Email = ? WHERE ID = ?";
    if(req.body.Address == '선택' || req.body.PW == '' || req.body.Name == '' || req.body.Phone_Num == '' || req.body.Birthday == '' || req.body.Email == ''){
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
      res.write("<script> alert('모두 입력하세요.'); history.back(); </script>"); 
    } else{
      conn.query(updatesql, [req.body.Address, req.body.PW, req.body.Name, req.body.Phone_Num, req.body.Birthday, req.body.Email, sess.userid], function (err, row) {
        conn.release();
        if(err) {console.log(err)}
        else{
          res.redirect("/users/mypage");
        }
      })
    }
  });
});

// 서재추천
router.get("/showMemberRecommend", function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {console.log(err)}
    else {
      var sess = req.session;
      var selectsql = "select *, count(bookking.ID) as kingCount from users, bookking where users.ID=bookking.ID group by bookking.ID order by kingCount desc"
      
      conn.query (selectsql, function (err, kingrow) {
        conn.release();
        if (err) {console.log(err)}
        else {
          res.render("showMemberRecommend", {sess:sess, kingList:kingrow, selectKing:null})
        }
      })
    }
  })
})

// router.get("/search", function(req, res, next) {
//   pool.getConnection ((err, conn) => {
//     res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
//     res.write("<script> alert('서칭에러.'); history.back(); </script>");
//     return;
//       })
// });

router.get("/search/", function(req, res, next) {
  pool.getConnection ((err, conn) => {
      var sess = req.session;
      console.log(req.query);
      //var genresql = "SELECT * FROM `genre`"
      //var likesql = `select * from likes where ${req.query.searchWhat} like '%${req.query.searchKey}%'`
      //var getsql = `select * from librarybook, book, library where librarybook.ID=library.ID AND librarybook.ISBN=book.ISBN AND ${req.query.searchWhat} like '%${req.query.searchKey}%'`
      var checksql = `SELECT * FROM book, librarybook, library WHERE book.ISBN=librarybook.ISBN AND librarybook.ID=library.ID AND book.${req.query.searchWhat} like '%${req.query.searchKey}%' GROUP BY library.ID ORDER BY library.Check_Num desc`
      var selectsql = "select *, count(bookking.ID) as kingCount from users, bookking where users.ID=bookking.ID group by bookking.ID order by kingCount desc"
      
      if (req.query.searchWhat == 'Title') {
        if(req.query.searchKey == '' && req.query.searchWhat == 'Title'){
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
          res.write("<script> alert('검색어를 입력하세요.'); history.back(); </script>"); 
        } else{
          conn.query (checksql, function (err, checkrow) {
            if (err) {console.log(err)}
            else {
              conn.query (selectsql, function (err, kingrow) {
                conn.release();
                if (err) {console.log(err)}
                else {
                  console.log("킹리스트확인", kingrow[0].kingCount)
                  res.render("showMemberRecommend", {sess:sess, kingList:checkrow, chk:null, selectKing:kingrow});
                }
              })
            }
          })
        }
      } else if (req.query.searchWhat == 'Genre_Name') {
        if(req.query.searchKey == '' && req.query.searchWhat == 'Genre_Name'){
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8;" });
          res.write("<script> alert('검색어를 입력하세요.'); history.back(); </script>"); 
        } else{
          var gensql = `SELECT *, count(ID) as count FROM bookking where ${req.query.searchWhat} like '%${req.query.searchKey}%' GROUP BY ID ORDER BY count desc`
          conn.query (gensql, function (err, checkrow) {
            if (err) {console.log(err)}
            else {
              console.log("검색 확인3333333333", req.query.searchWhat)
              conn.query (selectsql, function (err, kingrow) {
                conn.release();
                if (err) {console.log(err)}
                else {
                  console.log("검색 확인444444444444", req.query.searchWhat)
                  console.log("킹리스트확인", kingrow)
                  res.render("showMemberRecommend", {sess:sess, kingList:checkrow, selectKing:kingrow, chk:true});
                }
              })
            }
          })
        }
      }
  })
});

//팔로우
router.get("/showMemberFollower", function (req, res, next) {
  pool.getConnection((err, conn) => {
    var sess = req.session;
    var werssql = "SELECT *, count(bookking.ID) as kingCount FROM follow,users,bookking WHERE Follow_ID = ? AND follow.ID = users.ID AND users.ID = bookking.ID group by bookking.ID order by kingCount desc"
    
    conn.query(werssql,[sess.userid],function (err, row) {
      conn.release();
      if(err) { console.log(err)}
      else{
        res.render("showMemberFollower", {sess:sess, wers:row})
      }
    })
  })
})

//팔로잉
router.get("/showMemberFollowing", function (req, res, next) {
  pool.getConnection((err, conn) => {
    var sess = req.session;
    var ingsql = "select *, count(bookking.ID) as kingCount from users, bookking, follow where users.ID=bookking.ID AND users.ID = follow.Follow_ID AND follow.ID = ? group by bookking.ID order by kingCount desc "
    
    conn.query(ingsql,[sess.userid], function (err, row) {
      conn.release();
      if(err) { console.log(err) }
      else{
        console.log(row);
        res.render("showMemberFollowing", {sess:sess, wing:row})
      }
    })
  })
})

module.exports = router;
