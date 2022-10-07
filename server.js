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
    db.collection("ex4_insert").insertOne({
        title: req.body.brdtitle,
        context: req.body.brdtxt
    },function(err,result){
        //데이터베이스 작업끝나고 실행할 기능
        res.redirect("/");
        //원하는 경로로 요청해서 페이지 이동!
        //redirect("/") <-- 메인  redirect("/postinsert") <-- 글쓰기 페이지
    });
});

app.get("/postlist",function(req,res){
    db.collection("ex4_insert").find().toArray(function(err,result){
        res.render("board_list",{postitem: result});
    });
});

app.get("/postupdateview",function(req,res){
    res.render("board_updateview");
});

//데이터 수정작업 명령어 update()
app.post("/postupdateresult",function(req,res){
    db.collection("ex4_insert").update({
        //수정할 항목
        context: "쓰자22"
    },{
        //변경할 값
        $set: {context: "쓰고봤더니"}
    },function(err,result){
        res.send("데이터 수정완료");
    });
});