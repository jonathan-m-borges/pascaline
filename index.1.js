var RADIAN = Math.PI * 2 / 360;

var Context = {
    canvas: null,
    context: null,
    objects: [],
    frames: 50,
    width: 1000,
    heigh: 500,
    playing: false,

    create: function (id) {

        this.canvas = document.getElementById(id);
        var that = this;
        this.canvas.addEventListener('click', function (evt) {
            that.click(evt);
        });
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.context = this.canvas.getContext("2d");
        return this.context;
    },

    add: function (object) {
        this.objects.push(object);
    },

    render: function () {
        this.context.clearRect(0, 0, this.width, this.height);
        this.objects.forEach(function (object) {
            object.render(Context.context);
        });
    },

    play: function () {
        var that = this;
        this.playing = true;
        var call = function () {
            if (that.playing) {
                that.render();
                setTimeout(call, that.frames);
            }

        }
        call();
    },

    stop: function () {
        this.playing = false;
    },

    click: function (evt) {
        var rect = this.canvas.getBoundingClientRect();
        var pos = {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
        console.log(pos);
        this.objects.forEach(function (item) {
            if (item.click)
                item.click(pos);
        })
    }
};

var Engrenagem = function (options) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 200;
    this.height = options.height || 200;
    this.base = options.base || 10;
    this.image = new Image();
    this.image.src = 'base' + this.base + '.png';
    this.position = 0;
    this.angle = 0;
}
Engrenagem.prototype = {
    rotate: function (angle, ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(angle)
        ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
    },
    render: function (ctx) {
        var angle = this.position * 360 / this.base;
        if (this.angle < angle)
            this.angle += 360 / this.base / 10;
        if (this.angle > angle)
            this.angle -= 360 / this.base / 10;
        this.rotate(this.angle * RADIAN, ctx);
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.restore();
    },
    add: function () {
        this.position++;
    },
    sub: function () {
        this.position--;
    }
}

var Digito = function (options) {
    this.x = (options.x || 0) + 100;
    this.y = (options.y || 0) + 100;
    this.position = 0;
    this.base = options.base || 10;
    this.eng1 = new Engrenagem({ x: this.x, y: this.y, base: this.base });
    this.eng2 = new Engrenagem({ x: this.x - 100, y: this.y - 100, base: this.base });
    this.digitoLeft = options.digitoLeft;
}
Digito.prototype = {
    render: function (ctx) {
        this.eng1.render(ctx);
        this.eng2.render(ctx);
        ctx.font = "50px Arial red";
        var pos = this.position;
        pos = pos < 0
            ? (this.base + (pos % this.base)) % this.base
            : pos % this.base;
        ctx.fillText('- ' + pos + ' +', this.x + 60, this.y + 250);
    },
    add: function () {
        this.eng1.add();
        this.eng2.sub();
        this.position = this.eng1.position;
        if (this.digitoLeft && this.position % this.base == 0) {
            this.digitoLeft.add();
        }
    },
    sub: function () {
        this.eng1.sub();
        this.eng2.add();
        this.position = this.eng1.position;
        if (this.digitoLeft && (this.position % this.base == 9 || this.position % this.base == -1)) {
            this.digitoLeft.sub();
        }
    },
    click: function (evt) {
        var x = evt.x - this.x;
        var y = evt.y - this.y;
        if (Math.abs(x - 69) <= 15 && Math.abs(y - 237) <= 15) {
            this.sub();
        }
        if (Math.abs(x - 141) <= 15 && Math.abs(y - 231) <= 15) {
            this.add();
        }
    }
}


$(document).ready(function () {
    //Inicialize
    Context.create("canvas");
    Context.add(new Digito({ x: 50, y: 50 }));
    Context.add(new Digito({ x: 250, y: 50, digitoLeft: Context.objects[0] }));
    Context.add(new Digito({ x: 450, y: 50, digitoLeft: Context.objects[1] }));
    Context.add(new Digito({ x: 650, y: 50, digitoLeft: Context.objects[2] }));

    Context.play();


});