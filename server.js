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

//메인페이지로 가는 기능
app.get("/",function(req,res){
    //메인페이지로 이동하면 화면에 send메세지 보여줌
    res.send("메인페이지 접속완료");
});

// /postinsert페이지로 이동
app.get("/postinsert",function(req,res){
    // ejs파일인 board_insert.ejs를 보여줌
    res.render("board_insert");
});

// /postadd는 input이 있는 ejs파일의 form action 즉 input값을 보내주는 경로
app.post("/postadd",function(req,res){
    //디비에 있는 컬렉션 ex4_count에서 find()함수를 이용해서 찾음
    //프로퍼티name의 값이 '게시물갯수'인 것을 찾아서 다음 함수를 실행함
    db.collection("ex4_count").findOne({name:"게시물갯수"},function(err,result){
        //컬렉션 ex4_insert에 아래 객체를 넣어준다.
        db.collection("ex4_insert").insertOne({
            //ex4_insert 프로퍼티 brdid에 컬렉션 ex4_count의 프로퍼티 totalCount + 1을 넣어줌(1부터 시작하기 위함)
            //result는 45번줄 참고
            brdid: result.totalCount + 1,
            //컬렉션 프로퍼티 brdtitle/brdcontext에 board_insert.ejs의 인풋태그에서 적은 값을 넣어줌
            brdtitle: req.body.brdtitle,
            brdcontext: req.body.brdtxt
        },function(err,result){
            //위 기능을 수행했다면 컬렉션 ex4_count에서 수정(update)시켜줌 -> 프로퍼티name의 값이 '게시물갯수'일 경우
            //$inc는 숫자하나씩 증가시켜줌 이를 이용하여 totalCount를 1씩 증가시켜줌  
            db.collection("ex4_count").updateOne({name:"게시물갯수"},{$inc:{totalCount:1}},function(err,result){
                // res.redirect("/postinsert");
                // 위 모든 기능 완료 시 아래 send메세지로 보여줌
                res.send("데이터삽입 및 토탈카운트 수정완료");
            });
        });
    })//ex4_insert 콜렉션에는 totalCount값에 들어간 숫자값을 게시글 번호로 부여함
     //ex4_count 콜렉션을 찾아서 그 안에 totalCount 값을 1증가
});

// /postlist주소로 접속을 하면
app.get("/postlist",function(req,res){
    //콜렉션 ex4_insert에 들어있는 것을 전부 찾는다. -> 배열형태로(반복문을 사용할 수 있도록)
    db.collection("ex4_insert").find().toArray(function(err,result){
        // board_list.ejs파일에 위에서 찾은 결과를 프로퍼티 postitem을 생성하여 그 프로퍼티에 넣어준다
        res.render("board_list",{postitem: result});


        // res.sendFile(__dirname + "/test.html");
        // 내가 지정한 파일을 응답해서 사용자한테 보여준다.

        // res.redirect("/")
        // 사용자한테 이 주소로 강제이동
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