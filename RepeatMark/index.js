// index.js

// StdName 数组存放学生姓名
var StdName = ["王浩硕","孙洋","邰梦娇","赵心怡","朱健省","魏佳如","朱家田","李佳琪",
"贺文达","张明钰","孙新雨","王相俊","孙新泽","田浩雪","吴晓倩","王玉星",
"孙玉喆","王如雪","马熙国","严晨旭","邰欣然","李晓灵","马姝婷","肖兴杨",
"马秀栎","王俊豪","李晓婷","刘向荣","吴庆钰","孙新钰","于承荣","朱弘洁",
"候心悦","穆成玉","王月飞","孙新航","吴若辰"];

// Std2Name, Std3Name 数组存放名字为两个字和三个字的姓名
var Std2Name = [],Std3Name = [];
// i 用于循环所有数组元素，j 用于循环两字的，h 用于循环三字的
for(var i = 0, j = 0, h = 0; i < StdName.length; i++){
	//根据数组元素中字符串的长度判断名字是几个字
	// 将姓名数组的第i个元素给两个字数组的第j个元素
	if(StdName[i].length == 2){
		Std2Name[j] = StdName[i];
		j++;
	}
	// 将姓名数组的第i个元素给三个字数组的第h个元素
	if(StdName[i].length == 3){
		Std3Name[h] = StdName[i];
		h++;
	}
}

//获取学生姓名显示区域id StdNameArea
var StdNameArea = document.getElementById("StdNameArea");
//传入数据以及id
// k用于循环两个字数组，给名字加上id
for(var k = 0; k < Std2Name.length; k++)
	StdNameArea.innerHTML += "<span id = \"name" + k + "\">" + Std2Name[k] + "</span><br />";
// l用于循环三个字数组，给名字加上id
for(var l = 0; l < Std3Name.length; l++){
	var m = k + l;
	StdNameArea.innerHTML += "<span id = \"name" + m + "\">" + Std3Name[l] + "</span><br />";
}
/*********************************
NameNum[]数组存放原始重复姓名的下标
Repeat2Name[]数组存放两字重复的下标
Repeat3Name[]数组存放三字重复的下标
k用于循环原始重复名字的下标
o分别用于循环两字重复和三字重复的下标
*********************************/
var Data, NameNum = [], Repeat2Num = [], Repeat3Num = [], k = 0, o = 0;

// DataInput 输入框，Data字符串存放输入框的数据
var DataInput = document.getElementById("DataInput");

//RunF 标记重复值 按键
function RunF(){
	Data = DataInput.value;
	DataInput.value = "";
	// 遍历两个字姓名是否重合
	// i循环两字名字的数组
	// j循环传入的数据Data
	for(var i = 0 ; i < Std2Name.length; i++){
		for(var j = 0; j < Data.length; j++){
			if(Std2Name[i] == Data.substr(j,2)){
				NameNum[k] = i;
				Repeat2Num[o] = j;
				k++;
				o++;
			}
		}
	}
	o = 0;
	// 遍历三个字姓名是否重合
	// m循环三字名字的数组
	// n循环传入的数据Data
	for(var m = 0; m < Std3Name.length; m++){
		for(var n = 0; n < Data.length; n++){
			if(Std3Name[m] == Data.substr(n,3)){
				NameNum[k] = Std2Name.length + m;
				Repeat3Num[o] = n;
				k++;
				o++;
			}
		}
	}

	// 将原始数据class改为flag
	// l用于循环原始重复名字下标的数组
	// StdRepeatNameId用于存放拼接的id
	for(var l = 0; l < NameNum.length; l++){
		var StdRepeatNameId = "name" + NameNum[l];
		var NameId = document.getElementById(StdRepeatNameId);
		NameId.className = "flag";
	}

	// 获取重复区域div的id
	var RepeatArea = document.getElementById("RepeatArea");
	//falg0 标志传入数据Data是否有重复 false没有 ture 有
	//falg2 标志两字名字是否有重复 false没有 ture 有
	//falg3 标志三字名字是否有重复 false没有 ture 有
	var flag0 = false, flag2 = false, flag3 = false;
	for(var p = 0; p < Data.length; p++){
		for(var q = 0; q < Repeat2Num.length; q++){
			if( p == Repeat2Num[q] && flag0 == false){
				RepeatArea.innerHTML += "<br \/><span class = \"flag\">" + Data.substr(p,2) +"<\/span>";
				p = p + 2;
				falg0 = true;
				flag2 = true;
				break;
			}
		}
		for(var r = 0; r < Repeat3Num.length; r++){
			if( p == Repeat3Num[r]  && flag0 == false){
				RepeatArea.innerHTML += "<br \/><span class = \"flag\">" + Data.substr(p,3) +"<\/span>";
				p = p + 3;
				falg0 = true;
				flag3 = true;
				break;
			}
		}
		if(flag0 == false){
			RepeatArea.innerHTML += Data.substr(p,1);
		}
		flag0 = false;
		flag2 = false;
		flag3 = false;
	}

	// 获取flag的类名，添加背景颜色
	var flag = document.getElementsByClassName("flag");
	for(var s = 0; s < flag.length; s++){
		flag[s].style.cssText += "background-color: pink;";
	}
}

function InputResetF(){
	DataInput.value = "";
}

function RepeatResetF(){
	var flag = document.getElementsByClassName("flag");
	for(var s = 0; s < flag.length; s++){
		flag[s].style.cssText = "";
	}
	document.getElementById("RepeatArea").innerHTML = "";
}









/*
//传入div1数据 学生姓名
var div1 = document.getElementById("div1");

var Std2Name = ["名一","名二","名三"];
var Std3Name = ["姓名一","姓名二","姓名三","姓名四","姓名五"];

for (var i = 0, j = 0; i + j < Std2Name.length + Std3Name.length;){
	if(i < Std2Name.length){
		div1.innerHTML += "<span id=name" + i + ">" + Std2Name[i] + "<br/>" + "</span>";
		i++;
	}else if(j <= Std3Name.length){
		var h = i + j;
		div1.innerHTML += "<span id=name" + h + ">" + Std3Name[j] + "<br/>" + "</span>";
		j++;
	}
	
}

//变量btn1承接按钮btn1的id
var btn1 = document.getElementById("btn1");
var text1 = document.getElementById("text1");
var div2 = document.getElementById("div2");
var Data2;

// 函数btnf1相应按钮btn1点击操作 执行对比重复值
function btnf1(){
	// 输入函数体
	Data2 = text1.value;
	


	text1.value = "";
}

// 函数btnf2相应按钮btn2点击操作 执行对比重复值
function btnf2(){
	// 输入函数体
	text1.value = "";
}

// 函数btnf3相应按钮btn3点击操作 执行对比重复值
function btnf3(){
	// 输入函数体
	div2.innerHTML = "";
}
*/
