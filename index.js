console.log(a); // undefined (due to hoisting)
var a;
a = 2;
{
    var a = "2";
    a = 2 + "2"; // becomes "22"
    console.log(a); // 22
}
console.log(a); // 22
