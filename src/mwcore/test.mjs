import { BrickBuilder as builder, ConstBrick, VarBrick, ArrayBrick, ArrayFunctionBrick, MapBrick, MapFunctionBrick } from "./mwcore.mjs";

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