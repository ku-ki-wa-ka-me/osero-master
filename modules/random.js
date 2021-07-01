module.exports = function () {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    var numbers = '0123456789';
    var string = letters + letters.toUpperCase() + numbers;
    var len = 4;
    var temp = '';
    for (var i = 0; i < len; i++) {
        temp += string.charAt(Math.floor(Math.random() * string.length));
    }
    return temp;
}