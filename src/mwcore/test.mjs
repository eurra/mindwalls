import { Var, Const, ArrayFunction, ObjectFunction } from "./mwcore.mjs";

let suma = ArrayFunction((...nums) => nums.reduce(
    (sum, curr) => sum + curr, 0
));

suma.addParam(Const(1));
suma.addParam(Const(2));

console.log(suma.getOutput());

let num = Var();
num.setVal(5);
suma.addParam(num);

console.log(suma.getOutput());

num.setVal(2);
console.log(suma.getOutput());