const express = require("express");
const MongoClient = require("mongodb").MongoClient;
//데이터베이스의 데이터 입력, 출력을 위한 함수명령어 불러들이는 작업
const app = express();
const port = 8080;

//ejs 태그를 사용하기 위한 세팅
app.set("view engine","ejs");
//사용자가 입력한 데이터값을 주소로 통해서 전달되는 것을 변환(parsing)
app.use(express.urlencoded({extended: true}));
//css/img/js(정적인 파일)사용하려면 이 코드를 작성!
app.use(express.static('public'));

//데이터베이스 연결작업
let db; //데이터베이스 연결을 위한 변수세팅(변수의 이름은 자유롭게 지어도 됨)
MongoClient.connect("mongodb+srv://admin:qwer1234@testdb.qmmqvc3.mongodb.net/?retryWrites=true&w=majority",function(err,result){
    //에러가 발생했을경우 메세지 출력(선택사항)
    if(err){ return console.log(err); }

    //위에서 만든 db변수에 최종연결 ()안에는 mongodb atlas 사이트에서 생성한 데이터베이스 이름
    db = result.db("testdb");

    //db연결이 제대로 되었다면 서버실행
    app.listen(port,function(){
        console.log("서버연결 성공");
    });
});

app.get("/",function(req,res){
    res.send("메인페이지 접속완료");
});

app.get("/postinsert",function(req,res){
    res.render("board_insert");
});

app.post("/postadd",function(req,res){
    db.collection("ex4_count").findOne({name:"게시물갯수"},function(err,result){
        db.collection("ex4_insert").insertOne({
            brdid: result.totalCount + 1,
            brdtitle: req.body.brdtitle,
            brdcontext: req.body.brdtxt
        },function(err,result){
            db.collection("ex4_count").updateOne({name:"게시물갯수"},{$inc:{totalCount:1}},function(err,result){
                // res.redirect("/postinsert");
                res.send("데이터삽입 및 토탈카운트 수정완료");
            });
        });
    })//ex4_insert 콜렉션에는 totalCount값에 들어간 숫자값을 게시글 번호로 부여함
     //ex4_count 콜렉션을 찾아서 그 안에 totalCount 값을 1증가
});

app.get("/postlist",function(req,res){
    db.collection("ex4_insert").find().toArray(function(err,result){
        res.render("board_list",{postitem: result});
    });
});

app.get("/postupdateview",function(req,res){
    //데이터베이스 ex4_insert 콜렉션에서 게시글 번호들 가지고 와서
    //board_updateview.ejs파일에 데이터 전달! -> <select><option></option></select>생성
    db.collection("ex4_insert").find().toArray(function(err,result){
        res.render("board_updateview",{postitem: result});
    });
});

//데이터 수정작업 명령어 update()
app.post("/postupdateresult",function(req,res){
    db.collection("ex4_insert").update({
        //수정할 항목
        brdid: Number(req.body.updatenumber)
    },{
        //변경할 값
        $set: {
            brdtitle: req.body.updatetitle,
            brdcontext: req.body.updatetxt
        }
    },function(err,result){
        res.send("데이터 수정완료");
    });
});