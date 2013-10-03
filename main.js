//Initialize function
var init = function () {
    // TODO:: Do your initialization job
	 console.log("init() called");
	 //创建数据库
	 onDeviceReady();
	// listItem();
	 
};
$(document).ready(init);

const DBname = "lists";
const DBversion = "1.0";
const DBdisname = "listDB";
const DBsize = 4000000;

//插入数据
function saveNote(tx){
	var content = $("#shedule").val();
	var date = $("#date").val();
	
	if(content == '' || date == '') {alert("所填内容不能为空！");return;}
	//var randomid = randomUUID();
	
	//tx.executeSql('INSERT INTO list1 (content,date) VALUES("'+content+'","'+date+'")');
	tx.executeSql('INSERT INTO list1 (content,date,isdone) VALUES ("'+content+'","'+date+'",0)',[],function(tx,results){
			//alert("the insertid:"+results.insertId);
		
		var time = getTodayDate();
		if(date == time){
			var id = results.insertId;
			var string = '<li id="today_'+id+'"><a href="#all_content" data-rel="popup" onclick="getContent('+id+');" data-inline="true" data-transition="pop">'+content+'</a></li>';
			$("#sch_list").prepend(string);
			freshList("sch_list");
		};
		$("#dialog").dialog('close');
	},errorDB);

}
//---------插入操作
function InsertData(){
	var db = window.openDatabase(DBname,DBversion,DBdisname,DBsize);
	db.transaction(saveNote,errorDB);
}
function saveSuccess(tx){
	;
	//tx.executeSql("");
	//TODO
}

function freshList(id){
	var theid = "#"+id;
	$(theid).listview("refresh");
}

//生成主键
function randomUUID(){
	var s = [],itoh = '0123456789ABCDEF';
	for(var i = 0;i<32;i++) s[i] = Math.floor(Math.random()*0x10);
	s[14] = 4;
	s[19] = (s[19] & 0x3) | 0x8;
	
	for (var i=0;i<8;i++) s[i] = itoh[s[i]];
	
	return s.join('');
}

//创建数据库
function onDeviceReady(){
	// console.log("device");
    var db = window.openDatabase(DBname,DBversion,DBdisname,DBsize);
    db.transaction(creatDB,errorDB,successDB);
}
//创建表
function creatDB(tx){
	//tx.executeSql("DROP TABLE IF EXISTS list1");
	//tx.executeSql("DELETE FROM list1");
	tx.executeSql('CREATE TABLE IF NOT EXISTS list1 (id INTEGER PRIMARY KEY AUTOINCREMENT,content text,date varchar,isdone INTEGER)');
	//tx.executeSql("INSERT INTO list1(id,content,date) VALUES (1,'THIS IS A TEST','2013-9-29')");
}
//错误操作
function errorDB(err){
	console.log("Error processing SQL: "+err.code);
}
//表创建成功之后的操作
function successDB(){
	console.log("success");
}

//--------查询操作
function listItem(){
    var db = window.openDatabase(DBname,DBversion,DBdisname,DBsize);
    db.transaction(queryDB,errorDB);
  //  console.log("listitem");
}
//查询语句
function queryDB(tx){
	tx.executeSql("SELECT * FROM list1 order by date desc,id desc ",[],createItem,errorDB);
}

function createItem(tx,results){
	var len = results.rows.length;
	//console.log("lisitem len "+len);
	for(var i = 0;i<len;i++){
		var content = results.rows.item(i).content;
		var id = results.rows.item(i).id;
		var isdone = results.rows.item(i).isdone;
		var style = isdone==1?"data-theme='b' data-icon='check'":'';
		var string = '<li id="all_'+id+'" '+style+'><a href="#all_content_p" data-rel="popup" onclick="getContent('+id+');" class="ui-link-inherit">'+content+' ['+results.rows.item(i).date+']</a></li>';
		$("#all_list").append(string);
	};
	freshList("all_list");
	
}

//-----查询当日的计划
function todayItem(){
	var db = window.openDatabase(DBname,DBversion,DBdisname,DBsize);
	db.transaction(queryTDB,errorDB);
}

function getTodayDate(){
	var mydate = new Date();
	var year = mydate.getFullYear();
	var m = mydate.getMonth()+1;
	var month = m<10?'0'+m:m;
	var d = mydate.getDate();
	var day = d<10?'0'+d:d;
	var time = year+'-'+month+'-'+day;
	return time;
}

function queryTDB(tx){
//	var time = new Date().toLocaleDateString();
//	var d = time.replace(/年/,'-');
//	console.log(d);
	var time = getTodayDate();
	//console.log(time);
	tx.executeSql("SELECT * FROM list1 WHERE date='"+time+"' order by id desc",[],creatTodayItem,errorDB);
}
function creatTodayItem(tx,results){
	var len = results.rows.length;
	console.log(len);
	for(var i = 0;i<len;i++){
		var content = results.rows.item(i).content;
		var id = results.rows.item(i).id;
		var isdone = results.rows.item(i).isdone;
		var style = isdone==1?"data-theme='b' data-icon='check'":'';
		var string = '<li id="today_'+id+'" '+style+'><a href="#all_content" data-rel="popup" onclick="getContent('+id+');" data-inline="true" data-transition="pop">'+content+'</a></li>';
		$("#sch_list").append(string);
	};
	freshList("sch_list");
}
function getContent(id){
	var db = window.openDatabase(DBname,DBversion,DBdisname,DBsize);
//	console.log("pramater:id:"+id);
	db.transaction(function(tx){	
	//	console.log("getContent:id"+id);
		tx.executeSql("SELECT content,isdone FROM list1 WHERE id="+id,[],function(tx,results){
			var con = results.rows.item(0).content;
			var isdone = results.rows.item(0).isdone;
			if(isdone==1){
				$("#all_com").addClass("ui-disabled");
				$("#today_com").addClass("ui-disabled");
			}else{
				$("#all_com").removeClass("ui-disabled");
				$("#today_com").removeClass("ui-disabled");
			}
		//	console.log("getContent:content:"+con);
			$(".detail_content").text(con).attr("tagid",id);		
		},errorDB);	
	},errorDB);
}

//删除计划
function deleteItem(){
	var id = $(".detail_content").attr("tagid");
	var db = window.openDatabase(DBname,DBversion,DBdisname,DBsize);
	db.transaction(function(tx){
		tx.executeSql("DELETE FROM list1 WHERE id="+id);		
	},errorDB,function(){
		$("#all_content").popup('close');
		$("#all_content_p").popup('close');
		var listid = "#all_"+id;
		var toid = "#today_"+id;
		$(listid).remove();
		$(toid).remove();
	});	
}
//完成计划
function completeTask(){
	var id = $(".detail_content").attr("tagid");
	var db = window.openDatabase(DBname,DBversion,DBdisname,DBsize);
	db.transaction(function(tx){
		tx.executeSql("UPDATE list1 set isdone=1 where id="+id);
	},errorDB,function(){
		$("#all_content").popup('close');
		$("#all_content_p").popup('close');
		var listid = "#all_"+id;
		var toid = "#today_"+id;
		$(listid).removeClass('ui-btn-up-a').addClass('ui-btn-up-b');
		$(toid).removeClass('ui-btn-up-a').addClass('ui-btn-up-b');
	});
}


;







