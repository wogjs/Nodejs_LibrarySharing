var express = require('express');
var router = express.Router();
var pool = require('../config/dbconfig');

var date = new Date();
// date.setDate(date.getDate());
var dd = date.getDate();
var mm = date.getMonth() + 1;
var yyyy = date.getFullYear();
var date = yyyy + '-' + mm + '-' + dd;

var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bookdb',
});

conn.connect();

// var kingsql = `SELECT Genre_Name,MAX(Reading_Book_Amount) as maxCount FROM bookamount WHERE Month = '${yyyy+"-"+mm}' GROUP BY Genre_Name`
// var selectsql = "SELECT * FROM `bookamount` WHERE Genre_Name = ? AND Reading_Book_Amount = ?"
// var sql3 = "SELECT COUNT(ID)+1 AS Reading_King_Badge FROM `bookking` WHERE ID = ?"
// var kingupdate = "INSERT INTO bookking(ID, Genre_Name, Month, Reading_Book_Amount, Reading_King_Badge) VALUES (?,?,?,?,?)"
// var kingsql = `SELECT * FROM bookking WHERE Month = '${yyyy+"-"+mm}'`

// if(dd == 16){
//   conn.query(kingsql, function (err, row1) {
//     if(err) { console.log(err) }
//     else{
//       for(var i=0; i < row1.length; i++){
//         conn.query(selectsql,[row1[i].Genre_Name, row1[i].maxCount], function (err, row2) {
//           if(err) { console.log(err)}
//           else{
//             conn.query(sql3,[row2[0].ID], function (err, row3) {
//               if(err) { console.log(err)}
//               else{
//                 conn.query(kingupdate,[row2[0].ID, row2[0].Genre_Name, row2[0].Month, row2[0].Reading_Book_Amount, row3[0].Reading_King_Badge], function (err, row4) {
//                 if(err) {}
//                 else{
//                   }
//                 })
//               }
//             })
//           }
//         })
//       }
//     }
//   })
// }

var usersql = 'SELECT * FROM `users`';
var sumsql =
  'SELECT COUNT(ID)+1 AS Reading_King_Badge FROM `bookking` WHERE ID = ?';
var selectsql = `SELECT *, bookMax from (SELECT Genre_Name, MAX(Reading_Book_Amount) as bookMAX FROM bookamount WHERE Month = '${
  yyyy + '-' + mm
}' GROUP BY Genre_Name) x INNER JOIN bookamount on x.bookMax = bookamount.Reading_Book_Amount and x.Genre_Name = bookamount.Genre_Name where bookamount.ID in (select ID from review GROUP BY ID HAVING COUNT(ID) > 1)`;
var kingupdate =
  'INSERT INTO bookking(ID, Genre_Name, Month, Reading_Book_Amount, Reading_King_Badge) VALUES (?,?,?,?,?)';
var kingsql =
  "UPDATE `bookclublist` SET `ID`= ? WHERE Club_Create_Date = '2019-12-14' AND Genre_Name = ?";

if (dd == 1) {
  conn.query(usersql, function (err, row1) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < row1.length; i++) {
        j = 0;
        conn.query(sumsql, [row1[i].ID], function (err, row2) {
          if (err) {
            console.log(err);
          } else {
            conn.query(selectsql, function (err, row3) {
              // conn.release()
              if (err) {
                console.log(err);
              } else {
                conn.query(
                  kingupdate,
                  [
                    row3[j].ID,
                    row3[j].Genre_Name,
                    row3[j].Month,
                    row3[j].Reading_Book_Amount,
                    row2[0].Reading_King_Badge,
                  ],
                  function (err, row4) {
                    if (err) {
                    } else {
                    }
                  }
                );
                conn.query(kingsql, [row3[j].ID, row3[j].Genre_Name], function (
                  err,
                  row5
                ) {
                  if (err) {
                  } else {
                  }
                });
                j++;
                console.log(row1.length);
                console.log(j);

                if (j == row3.length) {
                  j = 0;
                }
              }
            });
          }
        });
      }
    }
  });
}

/* GET home page. */
router.get('/', function (req, res, next) {
  var sess = req.session;
  var arr = new Array();
  pool.getConnection((err, conn) => {
    var sql = 'SELECT * FROM book rand';
    var sql2 = 'SELECT * FROM book ORDER BY RAND() LIMIT 4';
    var bookking =
      'select *, bookking.Genre_Name as gen_Name, bookking.Reading_Book_Amount as rbAmount from bookking, users, BookAmount where users.ID=bookking.ID AND Bookking.ID=BookAmount.ID AND Bookking.Month=? GROUP BY bookking.Genre_Name ORDER BY bookking.Reading_Book_Amount desc';
    // var sq4 = "SELECT *,COUNT(ID) as cid FROM review WHERE '2019-12-01' < Write_Date AND Write_Date < '2019-12-31' GROUP by id HAVING cid>=5"
    // var kingsql = `SELECT Genre_Name,MAX(Reading_Book_Amount) as maxCount FROM bookamount WHERE Month = '${yyyy+"-"+mm}' GROUP BY Genre_Name`
    // var selectsql = "SELECT * FROM `bookamount` WHERE Genre_Name = ? AND Reading_Book_Amount = ?"
    // var sql3 = "SELECT COUNT(ID)+1 AS Reading_King_Badge FROM `bookking` WHERE ID = ?"
    // var kingupdate = "INSERT INTO bookking(ID, Genre_Name, Month, Reading_Book_Amount, Reading_King_Badge) VALUES (?,?,?,?,?)"

    // if(dd == 16){
    //   conn.query(kingsql, function (err, row1) {
    //     if(err) { console.log(err) }
    //     else{
    //       for(var i=0; i < row1.length; i++){
    //         conn.query(selectsql,[row1[i].Genre_Name, row1[i].maxCount], function (err, row2) {
    //           if(err) { console.log(err)}
    //           else{
    //             console.log("row2 확인",row2);
    //             conn.query(sql3,[row2[0].ID], function (err, row3) {
    //               if(err) { console.log(err)}
    //               else{
    //                 conn.query(kingupdate,[row2[0].ID, row2[0].Genre_Name, row2[0].Month, row2[0].Reading_Book_Amount, row3[0].Reading_King_Badge], function (err, row4) {
    //                 if(err) {}
    //                 else{
    //                   }
    //                 })
    //               }
    //             })
    //           }
    //         })
    //       }
    //     }
    //   })
    // }

    conn.query(sql2, function (err, row) {
      if (err) {
        console.log(err);
      } else {
        conn.query(bookking, [yyyy + '-' + mm], function (err, row2) {
          conn.release();
          if (err) {
            console.log(err);
          } else {
            res.render('index', { sess: sess, book: row, king: row2 });
          }
        });
      }
    });
  });
});

router.post('/', function (req, res, next) {
  pool.getConnection((err, conn) => {
    if (err) {
      console.log(err);
    } else {
      var sess = req.session;
      var body = req.body;
      var sql = `select * from book where Title like '%${body.Search}%'`;
      conn.query(sql, [body.Search], function (err, row) {
        conn.release();
        if (err) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8;' });
          res.write("<script> alert('서칭에러.'); history.back(); </script>");
          return;
        } else {
          sess.bookSerch = body.bookSerch;
          res.render('index', { book: row, sess: sess });
        }
      });
    }
  });
});

// var usersql = "SELECT * FROM users"
// var countsql = "SELECT Genre_Name, COUNT(book.Genre_Name) as Reading_Book_Amount FROM librarybook, book WHERE book.ISBN = librarybook.ISBN AND ID = ? GROUP BY Genre_Name"
// var amountsql = `UPDATE bookamount SET Month=${yyyy + '-' + mm}, ID= ?, Genre_Name = ? , Reading_Book_Amount = ?`

router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.clearCookie('userid');
  res.clearCookie('Club_Name');
  res.redirect('/');
});

router.get('/userstxt', function (req, res, next) {
  res.render('usertxt', {});
});

module.exports = router;
