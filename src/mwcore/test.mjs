import { BrickBuilder as builder, ConstBrick, VarBrick, ArrayBrick, ArrayFunctionBrick, MapBrick, MapFunctionBrick } from "./mwcore.mjs";

function proto() {
    let pow_ = mw.make.ref();
    let num3_ = mw.make.ref();
    let num4_ = mw.make.ref();

    let _suma = mw.make.
        arrayFunc(
            (...nums) => nums.reduce((sum, curr) => sum + curr, 0)
        ).
        append(mw.make.const(1)).
        append(mw.make.const(2));

    console.log(
        mw.for(suma).append(
            mw.link(num3_).to(mw.create.var(4))
        )
    );

    mw.for(num3_).set(8);
    console.log(_suma);

    console.log(
        mw.link(pow_).to(
            mw.create.mapFunc(
                ({ base, exp }) => Math.pow(base, exp)
            ).
            setProp('base', mw.create.const(2)).
            setProp('exp', mw.link(num4_).to(mw.create.var(8)))
        )
    );

    mw.for(num4_).set(10);
    console.log(pow_);
}

let suma = builder().require(ArrayFunctionBrick,
    (...nums) => nums.reduce((sum, curr) => sum + curr, 0)
).ready();

suma.append(builder().require(ConstBrick, 1).ready());
suma.append(builder().require(ConstBrick, 2).ready());
console.log(suma.getResult());

let num3 = builder().require(VarBrick, 4).ready();
suma.append(num3);
console.log(suma.getResult());

num3.setValue(8);
console.log(suma.getResult());

let pow = builder().require(MapFunctionBrick,
    ({ base, exp }) => Math.pow(base, exp)
).ready();

let num4 = builder().require(VarBrick, 8).ready();
pow.setProp('base', builder().require(ConstBrick, 2).ready());
pow.setProp('exp', num4);
console.log(pow.getResult());

num4.setValue(10);
console.log(pow.getResult());

/*
let num1 = ConstBrick(builder(), 1).ready();
let num2 = ConstBrick(builder(), 2).ready();*/