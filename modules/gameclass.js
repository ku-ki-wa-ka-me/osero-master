var moment = require('moment');
module.exports = class gamedate {
    constructor(gameid) {//ゲームの初期化処理
        this.playerA = null;
        this.playerB = null;
        this.black = null;
        this.users = [];
        this.gameid = gameid;
        this.turn = 0;
        this.start_at = moment().format('YYYY-MM-DD HH:mm:ss');
        this.ban = new Array(8);
        for (var x = 0; x < this.ban.length; x++) {
            this.ban[x] = new Array(8);
        }
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                this.ban[x][y] = 0;
            }
        }
        this.ban[3][3] = -1
        this.ban[4][3] = 1
        this.ban[3][4] = 1
        this.ban[4][4] = -1
        this.cheng_turn();
    }
    put(putx, puty) {//index.jsでたたくのはこの関数だけです。
        console.log("turn=" + this.turn)
        if (this.ban[putx][puty] == 0) {//おかれた場所にすでに別の駒があるか確認します。
            if (this.check_reverse(putx, puty) > 0) {//check_reverseは駒を置き、置けた数を返します。
                return this.cheng_turn();//returnでcheng_turnの戻り値を返しています。
            }
        }
    }

    cheng_turn() {//ターンを変更したり、駒が置けるかや、勝敗の判定をします。
        if (this.turn == 0) {
            this.turn = 1;
            return;
        }
        this.turn = this.turn * -1;//ターンを反転します。
        var ban_bak = new Array(8);//盤面のバックアップを行います。
        var check_reverse_cnt = 0;
        for (var i = 0; i < this.ban.length; i++) {
            ban_bak[i] = new Array(8);
        }
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                ban_bak[x][y] = this.ban[x][y];
            }
        }
        var white_cnt = 0;
        var black_cnt = 0;
        for (var x = 0; x < 8; x++) {//すべてのマスを確認し、黒の駒の数と白の駒の数をカウントします。
            for (var y = 0; y < 8; y++) {
                switch (this.ban[x][y]) {
                    case 0:
                        check_reverse_cnt = check_reverse_cnt + this.check_reverse(x, y);
                        for (var i = 0; i < 8; i++) {
                            for (var ii = 0; ii < 8; ii++) {
                                this.ban[i][ii] = ban_bak[i][ii];
                            }
                        }
                        break;
                    case -1:
                        white_cnt++;
                        break;
                    case 1:
                        black_cnt++;
                        break;
                }
            }
        }
        if (white_cnt + black_cnt == 64 || white_cnt == 0 || black_cnt == 0) {//勝敗がついたとき
            if (white_cnt == black_cnt) {//引き分け用
                return "引き分けです";
            } else {
                return "黒" + black_cnt + "対白" + white_cnt;//クライアントに送信するメッセージを返します
            }
        } else {
            if (check_reverse_cnt == 0) {

                switch (turn) {
                    case -1:
                        this.turn = this.turn * -1;
                        return "白の置ける場所がありません。続けて黒の番となります。";//クライアントに送信するメッセージを返します
                    case 1:
                        this.turn = this.turn * -1;
                        return "白の置ける場所がありません。続けて白の番となります。";//クライアントに送信するメッセージを返します
                }
            }
        }
    }
    check_reverse(row_index, cell_indx) {//駒が置けるか確認しつつ駒を置きます。
        var reverse_cnt = 0
        reverse_cnt = reverse_cnt + this.line_reverse(row_index, cell_indx, -1, 0) //上
        reverse_cnt = reverse_cnt + this.line_reverse(row_index, cell_indx, -1, 1) //右上
        reverse_cnt = reverse_cnt + this.line_reverse(row_index, cell_indx, 0, 1) //右
        reverse_cnt = reverse_cnt + this.line_reverse(row_index, cell_indx, 1, 1) //右下
        reverse_cnt = reverse_cnt + this.line_reverse(row_index, cell_indx, 1, 0) //下
        reverse_cnt = reverse_cnt + this.line_reverse(row_index, cell_indx, 1, -1) //左下
        reverse_cnt = reverse_cnt + this.line_reverse(row_index, cell_indx, 0, -1) //左
        reverse_cnt = reverse_cnt + this.line_reverse(row_index, cell_indx, -1, -1) //左上

        return reverse_cnt
    }
    line_reverse(row_index, cell_indx, add_x, add_y) {
        var ban_bak = new Array(8)
        for (var i = 0; i < this.ban.length; i++) {
            ban_bak[i] = new Array(8)
        }
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                ban_bak[x][y] = this.ban[x][y]
            }
        }
        var line_reverse_cnt = 0
        var turn_flg = 0
        var xx = row_index
        var yy = cell_indx

        while (true) {
            xx = xx + add_x
            yy = yy + add_y

            if (xx < 0 || xx > 7 || yy < 0 || yy > 7) {
                break;
            }

            if (this.ban[xx][yy] == 0) {
                break;
            }

            if (this.ban[xx][yy] == this.turn) {
                turn_flg = 1
                break;
            }

            this.ban[xx][yy] = this.ban[xx][yy] * -1
            line_reverse_cnt++
        }

        if (line_reverse_cnt > 0) {
            if (turn_flg == 0) {
                for (var i = 0; i < 8; i++) {
                    for (var ii = 0; ii < 8; ii++) {
                        this.ban[i][ii] = ban_bak[i][ii]
                        line_reverse_cnt = 0
                    }
                }
            } else {

                this.ban[row_index][cell_indx] = this.turn
            }
        }


        return line_reverse_cnt
    }

}
