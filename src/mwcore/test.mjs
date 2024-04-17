import * as mw from "./mindwalls.mjs";
import { dataMod, outputMod, cacheMod, arrayFuncMod } from "./coreMods.mjs";

mw.mods.register('suma', function(builder) {
    builder.loadWithArgs(arrayFuncMod, 
        (...nums) => nums.reduce((sum, curr) => sum + curr, 0)
    );
});

let loader = mw.loader().
    setDefault(dataMod).    
    setDefault(cacheMod).
    setDefault(outputMod);

let pow_ = loader.make.ref().setName('ref1');
let num3_ = loader.make.ref().setName('ref2');
let num4_ = loader.make.ref().setName('ref3');

let _suma = loader.make.suma().setName('suma').
    append(loader.make.const(1)).
    append(loader.make.const(2));

console.log(_suma.print()); // 3

_suma.append( 
    num3_.linkTo(loader.make.var(4).setName('var 1'))
);

console.log(num3_.print()); // 4
console.log(_suma.print()); // 7

num3_.getLink().setValue(8);
console.log(num3_.print());
console.log(_suma.print());

pow_.linkTo(
    loader.make.mapFunc(
        ({ base, exp }) => Math.pow(base, exp)
    ).
    setProp('base', loader.make.const(2)).
    setProp('exp', num4_.linkTo(loader.make.var(8)))
);

console.log('pow:' + pow_.print());

num4_.getLink().setValue(10);
console.log('pow:' + pow_.print());