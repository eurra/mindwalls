import * as mw from "./mindwalls.mjs";
import * as bm from "./basicMods.mjs";

const mods = {
    suma: () => ({
        require: [[bm.arrayFunc, (...nums) => nums.reduce((sum, curr) => sum + curr, 0)]]
    }),
    pow: () => ({
        require: [[bm.mapFunc, ({ base, exp }) => Math.pow(base, exp)]]
    })
}

let mwi = mw.instance().setDefault(
    bm.data/*, basicMods.cache*/, bm.output
);

let pow_ = mwi.make(bm.ref).setName('ref1');
let num3_ = mwi.make(bm.ref).setName('ref2');
let num4_ = mwi.make(bm.ref).setName('ref3');

let _suma = mwi.make(mods.suma).setName('suma').
    append(mwi.make(bm._const, 1)).
    append(mwi.make(bm._const, 2));

console.log(_suma.print()); // 3

_suma.append( 
    num3_.linkTo(mwi.make(bm._var, 4).setName('var 1'))
);

console.log(num3_.print()); // 4
console.log(_suma.print()); // 7

num3_.getLink().setValue(8);
console.log(num3_.print());
console.log(_suma.print());

pow_.linkTo(
    mwi.make(mods.pow).
        setProp('base', mwi.make(bm._const, 2)).
        setProp('exp', num4_.linkTo(mwi.make(bm._var, 8)))
);

console.log('pow:' + pow_.print());

num4_.getLink().setValue(10);
console.log('pow:' + pow_.print());