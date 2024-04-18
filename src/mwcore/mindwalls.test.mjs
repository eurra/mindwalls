import { instance, output, _const, _var, ref, arrayFunc, mapFunc } from "./mindwalls.mjs";

const suma = () => ({
    require: [[arrayFunc, (...nums) => nums.reduce((sum, curr) => sum + curr, 0)]]
});

const pow = () => ({
    require: [[mapFunc, ({ base, exp }) => Math.pow(base, exp)]]
});

let mw = instance().setDefault(output);

let pow_ = mw.make(ref).setName('ref1');
let num3_ = mw.make(ref).setName('ref2');
let num4_ = mw.make(ref).setName('ref3');

let _suma = mw.make(suma).setName('suma').
    append(mw.make(_const, 1)).
    append(mw.make(_const, 2));

describe('aaa', function () {
    test('increments the current number by 1', () => {
        expect(increment(0, 10)).toBe(1)
    })
});

console.log(_suma.print()); // 3

_suma.append( 
    num3_.linkTo(mw.make(_var, 4).setName('var 1'))
);

console.log(num3_.print()); // 4
console.log(_suma.print()); // 7

num3_.getLink().setValue(8);
console.log(num3_.print()); // 8
console.log(_suma.print()); // 11

pow_.linkTo(
    mw.make(pow).
        setProp('base', mw.make(_const, 2)).
        setProp('exp', num4_.linkTo(mw.make(_var, 8)))
);

console.log('pow:' + pow_.print()); // 256

num4_.getLink().setValue(10);
console.log('pow:' + pow_.print()); // 1024