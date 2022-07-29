
window.onload = function () {
        
    //011
    document.getElementById("b011").addEventListener("click", function () {
        window.open("https://wwa.lanzous.com/b0b2yu6mb");
    });   
    //021
    document.getElementById("b021").addEventListener("click", function () {
        window.open("https://wwa.lanzous.com/b0b2yu6pe");
    });   
    //031
    document.getElementById("b031").addEventListener("click", function () {
        window.open("https://wwa.lanzous.com/b0b2yu6qf");
    });

    //121
    document.getElementById("b121").addEventListener("click", function () {
        // window.open("https://www.baidu.com/");
        alert("建设中，尚未收录");
    });
    document.getElementById("b122").addEventListener("click", function () {
        alert("建设中，尚未收录");
    });

    //移动端点击菜单
    document.getElementById("menu").addEventListener("click", function () {
        if (getComputedStyle(navbar, null).display == "none") {
            document.getElementById("navbar").style.display = "block";
        } else {
            document.getElementById("navbar").style.display = "none";
        }
    });

    //导航栏被点击时隐藏
    document.getElementById("navbar").addEventListener("click", function () {
        if (getComputedStyle(menu, null).display == "block")
            document.getElementById("navbar").style.display = "none";
    });
}