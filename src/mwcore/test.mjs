import { Var, Const, ArrayFunction, ObjectFunction } from "./mwcore.mjs";

let suma = ArrayFunction((...nums) => nums.reduce(
    (sum, curr) => sum + curr, 0
));

suma.addParam(Const(1));
suma.addParam(Const(2));

console.log(suma.getOutput());