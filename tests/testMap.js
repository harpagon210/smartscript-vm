// test file
class test {
    constructor() {
        this.a = 'i am a test';
    }

    meth() {
        print(this.a);
    }
}

let inst = new test();

let t = {
    'key1': 'value1', 
    key2: inst,
    8: 'fsdf'
};

let k = new Map();
k.set('key3', 'value3');
k.set('key4', 'value4');
let g = t.get(8);

print(t.key2);
print(k.key3);
print(g);
t.key2.meth();